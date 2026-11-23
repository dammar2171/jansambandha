'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  proposals,
  projects,
  users,
  departments,
  audit,
  money,
} from '../../../lib/cao/data';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getToken } from '@/lib/session';
import { api } from '@/lib/api';
import { officialSchema } from '@/lib/schemas';
import { mapApproval, mapCaoProposal } from '@/lib/cao/proposals';
import { OFFICIAL_ROLES, mapUser, roleToBackend } from '@/lib/cao/users';
import { mapCaoProject } from '@/lib/cao/projects';
import { mapAuditLog } from '@/lib/cao/audit';
import {
  PageHead,
  Panel,
  Stat,
  Status,
  Table,
  Btn,
  Field,
  Modal,
  useNotice,
  Progress,
} from './ui';

export function DashboardPage() {
  const [projectList, setProjectList] = useState([]);
  const [proposalList, setProposalList] = useState([]);

  // Load real projects and proposals for the overview; fall back to the sample
  // figures when the backend is unreachable so the dashboard is never blank.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getProjects(token)
      .then((d) => {
        if (Array.isArray(d) && d.length) setProjectList(d.map(mapCaoProject));
      })
      .catch(() => {});
    api
      .getProposals(token)
      .then((d) => {
        if (Array.isArray(d) && d.length)
          setProposalList(d.map(mapCaoProposal));
      })
      .catch(() => {});
  }, []);

  const totalProjects = projectList.length;
  const awaiting = proposalList.filter(
    (p) => p.status === 'Awaiting CAO',
  ).length;
  const totalBudget = projectList.reduce((a, p) => a + (p.budget || 0), 0);
  const atRisk = projectList.filter(
    (p) => p.status === 'Delayed' || p.reported - p.verified >= 15,
  ).length;
  const queue = proposalList.length ? proposalList : proposals;

  return (
    <>
      <PageHead
        eyebrow='Municipal overview'
        title='Good morning, Kamala'
        description='A consolidated view of annual planning, project delivery and municipal administration.'
        action={
          <Btn kind='secondary' onClick={() => window.print()}>
            Export overview
          </Btn>
        }
      />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Stat
          label='Total projects · FY 2083/84'
          value={totalProjects ? String(totalProjects) : '28'}
          detail='Across the municipality'
        />
        <Stat
          label='Awaiting administrative action'
          value={proposalList.length ? String(awaiting) : '3'}
          change={awaiting ? 'Needs attention' : undefined}
          detail='Proposals pending a CAO decision'
        />
        <Stat
          label='Approved municipal budget'
          value={projectList.length ? money(totalBudget) : 'NPR 84.6M'}
          detail='Sum of approved project budgets'
        />
        <Stat
          label='Projects with delivery risk'
          value={projectList.length ? String(atRisk) : '4'}
          detail='Delayed or verified gap \u2265 15 points'
        />
      </div>
      <div className='mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]'>
        <Panel
          title='Priority proposal queue'
          sub='Ranked using citizen need and feasibility evidence'
          action={
            <Link
              className='text-xs font-semibold text-[#245d8d]'
              href='/cao/project-approvals'
            >
              Open approvals →
            </Link>
          }
        >
          <Table
            heads={['Project / Ward', 'Priority', 'Budget estimate', 'Status']}
          >
            {queue.slice(0, 3).map((p) => (
              <tr key={p.id}>
                <td className='py-3 pr-4'>
                  <Link
                    href={`/cao/project-approvals/${p.id}`}
                    className='font-semibold text-slate-800 hover:text-blue-700'
                  >
                    {p.title}
                  </Link>
                  <div className='mt-1 text-xs text-slate-400'>
                    {p.ward} · {p.id}
                  </div>
                </td>
                <td>
                  <span className='font-semibold text-slate-800'>
                    {p.score}/100
                  </span>
                  <div className='mt-1 h-1 w-20 rounded bg-slate-100'>
                    <div
                      className='h-1 rounded bg-[#477ca8]'
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </td>
                <td className='whitespace-nowrap'>{money(p.budget)}</td>
                <td>
                  <Status>{p.status}</Status>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title='Needs attention' sub='Items requiring CAO follow-up'>
          <div className='space-y-4'>
            <div className='border-l-2 border-amber-400 pl-3'>
              <div className='text-sm font-semibold'>
                Progress verification gap · 17 points
              </div>
              <p className='mt-1 text-xs leading-5 text-slate-500'>
                Ward 4 Drinking Water Supply: contractor reports 75%, department
                verified 58%.
              </p>
              <Link
                href='/cao/projects/PRJ-2083-014'
                className='mt-1 inline-block text-xs font-semibold text-blue-700'
              >
                Review project →
              </Link>
            </div>
            <div className='border-l-2 border-red-400 pl-3'>
              <div className='text-sm font-semibold'>One account suspended</div>
              <p className='mt-1 text-xs leading-5 text-slate-500'>
                Kailash Construction account is suspended. Confirm
                assigned-project access.
              </p>
              <Link
                href='/cao/users'
                className='mt-1 inline-block text-xs font-semibold text-blue-700'
              >
                Manage users →
              </Link>
            </div>
            <div className='border-l-2 border-blue-400 pl-3'>
              <div className='text-sm font-semibold'>
                Delegation expires soon
              </div>
              <p className='mt-1 text-xs leading-5 text-slate-500'>
                General Admin approval delegation ends on 25 Nov 2026.
              </p>
              <Link
                href='/cao/delegations'
                className='mt-1 inline-block text-xs font-semibold text-blue-700'
              >
                Review authority →
              </Link>
            </div>
          </div>
        </Panel>
      </div>
      <div className='mt-5 grid gap-5 xl:grid-cols-2'>
        <Panel
          title='Project delivery snapshot'
          sub='Department-verified physical progress'
        >
          <div className='space-y-5'>
            {projects.slice(0, 3).map((p) => (
              <div key={p.id}>
                <div className='mb-2 flex justify-between gap-3 text-xs'>
                  <span className='font-medium text-slate-700'>{p.title}</span>
                  <span className='text-slate-500'>{p.verified}% verified</span>
                </div>
                <Progress value={p.verified} />
                <div className='mt-1.5 text-[12px] text-slate-400'>
                  Contractor reported {p.reported}% · {p.ward}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title='Ward development needs'
          sub='Illustrative demand and planning signals'
        >
          <div className='space-y-4'>
            {[
              ['Ward 4', 'Water supply', 91, 128],
              ['Ward 2', 'Road access', 78, 86],
              ['Ward 7', 'Public space', 62, 34],
              ['Ward 1', 'Health services', 57, 29],
            ].map((x) => (
              <div
                key={x[0]}
                className='grid grid-cols-[58px_1fr_36px] items-center gap-3 text-xs'
              >
                <span className='font-semibold'>{x[0]}</span>
                <div>
                  <div className='mb-1 flex justify-between text-slate-600'>
                    <span>{x[1]}</span>
                    <span>{x[3]} requests</span>
                  </div>
                  <Progress value={x[2]} />
                </div>
                <span className='text-right font-semibold'>{x[2]}</span>
              </div>
            ))}
          </div>
          <p className='mt-4 text-[12px] text-slate-400'>
            Priority score is indicative and uses the proposal weighting model,
            not a substitute for statutory approval.
          </p>
        </Panel>
      </div>
    </>
  );
}

export function ApprovalsPage() {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState(proposals);

  // Load real proposals; keep mock data if the backend is unreachable.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getProposals(token)
      .then((list) => {
        if (Array.isArray(list) && list.length)
          setItems(list.map(mapCaoProposal));
      })
      .catch(() => {});
  }, []);

  const rows = items.filter((p) => filter === 'All' || p.status === filter);
  return (
    <>
      <PageHead
        eyebrow='Annual planning'
        title='Project approvals'
        description='Review ward proposals, verify Assembly decisions and record the administrative approval action.'
      />
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex gap-2'>
          {['All', 'Awaiting CAO', 'Returned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-2 text-xs font-medium ${filter === f ? 'bg-[#173e63] text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className='text-xs text-slate-500'>
          {rows.length} proposals shown · FY 2083/84
        </span>
      </div>
      <Panel
        title='Proposal queue'
        sub='Administrative decision is separate from the Municipal Executive Assembly decision'
      >
        <Table
          heads={[
            'Proposal',
            'Priority score',
            'Assembly decision',
            'Estimated budget',
            'Submitted',
            'Action',
          ]}
        >
          {rows.map((p) => (
            <tr key={p.id}>
              <td className='py-4 pr-4'>
                <div className='font-semibold text-slate-800'>{p.title}</div>
                <div className='mt-1 text-xs text-slate-400'>
                  {p.id} · {p.ward} · {p.category}
                </div>
                <div className='mt-2'>
                  <Status>{p.status}</Status>
                </div>
              </td>
              <td>
                <span className='font-semibold'>{p.score}/100</span>
                <div className='mt-1 w-20'>
                  <Progress value={p.score} />
                </div>
              </td>
              <td>
                <div className='font-medium'>{p.assembly}</div>
                <div className='mt-1 text-xs text-slate-400'>{p.meeting}</div>
              </td>
              <td className='whitespace-nowrap font-medium'>
                {money(p.budget)}
              </td>
              <td className='whitespace-nowrap text-slate-500'>
                {p.submitted}
              </td>
              <td>
                <Link
                  href={`/cao/project-approvals/${p.id}`}
                  className='whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-[#174b7a] hover:bg-slate-50'
                >
                  Review proposal
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
      <div className='mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900'>
        <b>Authority check:</b> General Admin may record administrative approval
        only when a valid CAO delegation exists for{' '}
        <code>approve_assembly_projects</code> and the action date falls within
        its validity period. The demo UI displays this rule; enforce it again in
        the backend.
      </div>
    </>
  );
}

export function ApprovalDetail({ id }) {
  const [p, setP] = useState(null);
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState('');
  const [saving, setSaving] = useState(false);

  const loadHistory = (token) =>
    api
      .getProposalHistory(token, id)
      .then((list) =>
        setHistory(Array.isArray(list) ? list.map(mapApproval) : []),
      )
      .catch(() => {});

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    api
      .getProposal(token, id)
      .then((data) => setP(mapCaoProposal(data)))
      .catch(() => {});
    api
      .getProposalHistory(token, id)
      .then((list) =>
        setHistory(Array.isArray(list) ? list.map(mapApproval) : []),
      )
      .catch(() => {});
  }, [id]);

  async function decide(kind) {
    const token = getToken();
    const decision =
      kind === 'approve'
        ? 'APPROVED'
        : kind === 'return'
          ? 'RETURNED'
          : 'REJECTED';
    // The backend requires a reason for every decision; default the approval.
    const note =
      reason.trim() || (kind === 'approve' ? 'Administratively approved' : '');
    if (!note || saving) return;
    setSaving(true);
    try {
      await api.decideProposal(token, id, decision, note);
      setDone(
        kind === 'approve'
          ? 'Administratively approved'
          : kind === 'return'
            ? 'Returned'
            : 'Rejected',
      );
      setModal('');
      setReason('');
      loadHistory(token);
    } catch {
      setModal('');
    } finally {
      setSaving(false);
    }
  }

  if (!p) {
    return (
      <PageHead
        eyebrow='Project approvals / Proposal detail'
        title='Loading proposal'
        description={id}
      />
    );
  }

  return (
    <>
      <PageHead
        eyebrow='Project approvals / Proposal detail'
        title={p.title}
        description={`${p.id} · ${p.ward} · Submitted ${p.submitted}`}
        action={
          <Link
            href='/cao/project-approvals'
            className='text-xs font-semibold text-blue-700'
          >
            ← Back to queue
          </Link>
        }
      />
      <div className='grid gap-5 xl:grid-cols-[1.55fr_1fr]'>
        <div className='space-y-5'>
          <Panel title='Proposal overview' sub='Submitted by Ward Chairperson'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='text-xs text-slate-400'>Category</div>
                <div className='mt-1 text-sm font-medium'>{p.category}</div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>
                  Affected population
                </div>
                <div className='mt-1 text-sm font-medium'>
                  {p.affected.toLocaleString()} citizens
                </div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Citizen demand</div>
                <div className='mt-1 text-sm font-medium'>
                  {p.demand} related requests
                </div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Estimated budget</div>
                <div className='mt-1 text-sm font-medium'>
                  {money(p.budget)}
                </div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Priority score</div>
                <div className='mt-1 text-xl font-semibold'>{p.score}/100</div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>
                  Responsible department
                </div>
                <div className='mt-1 text-sm font-medium'>{p.department}</div>
              </div>
            </div>
          </Panel>
          <Panel
            title='Department technical review'
            sub={`Reviewed by ${p.reviewer}`}
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='text-sm font-semibold'>{p.review}</div>
                <p className='mt-1 text-xs leading-5 text-slate-500'>
                  Technical feasibility review is recorded separately from the
                  administrative approval.
                </p>
              </div>
              <Status>Reviewed</Status>
            </div>
          </Panel>
          <Panel
            title='Municipal Executive Assembly decision'
            sub='Required decision record before administrative approval'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='text-xs text-slate-400'>Decision number</div>
                <div className='mt-1 text-sm font-semibold'>{p.assembly}</div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Meeting date</div>
                <div className='mt-1 text-sm font-medium'>{p.meeting}</div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Decision</div>
                <div className='mt-1'>
                  <Status>
                    {p.assembly === 'Pending' ? 'Pending' : 'Finalized'}
                  </Status>
                </div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Conditions</div>
                <div className='mt-1 text-sm'>{p.conditions}</div>
              </div>
            </div>
          </Panel>
        </div>
        <div className='space-y-5'>
          <Panel
            title='Administrative decision'
            sub='Action by Chief Administrative Officer'
          >
            <div className='rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600'>
              Administrative approval records the authorized action after the
              Assembly decision. It does not replace the Assembly resolution.
            </div>
            <div className='mt-4 space-y-3'>
              <div className='flex justify-between text-xs'>
                <span className='text-slate-500'>Acting authority</span>
                <b>Chief Administrative Officer</b>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-slate-500'>Delegation reference</span>
                <b>Not applicable</b>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-slate-500'>Current status</span>
                <Status>{done || p.status}</Status>
              </div>
            </div>
            <div className='mt-5 grid gap-2'>
              <Btn onClick={() => setModal('approve')}>
                Approve administratively
              </Btn>
              <Btn kind='secondary' onClick={() => setModal('return')}>
                Return for correction
              </Btn>
              <Btn kind='danger' onClick={() => setModal('reject')}>
                Reject proposal
              </Btn>
            </div>
          </Panel>
          <Panel title='Decision history'>
            <div className='space-y-4 text-xs'>
              <div className='border-l-2 border-blue-300 pl-3'>
                <b>Submitted to CAO</b>
                <div className='mt-1 text-slate-400'>
                  {p.submitted} · Ward Chairperson
                </div>
              </div>
              {history.length ? (
                history.map((h) => (
                  <div
                    key={h.id}
                    className='border-l-2 border-emerald-300 pl-3'
                  >
                    <b>{h.label}</b>
                    <div className='mt-1 text-slate-400'>
                      {h.when}
                      {h.remarks ? ` · ${h.remarks}` : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className='border-l-2 border-slate-200 pl-3'>
                  <b>Administrative action pending</b>
                  <div className='mt-1 text-slate-400'>
                    Awaiting CAO decision
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
      {modal && (
        <Modal
          title={
            modal === 'approve'
              ? 'Confirm administrative approval'
              : modal === 'return'
                ? 'Return proposal for correction'
                : 'Reject proposal'
          }
          onClose={() => setModal('')}
        >
          <p className='mb-4 text-sm text-slate-600'>
            {modal === 'approve'
              ? 'Confirm that the Assembly decision and required supporting records have been checked.'
              : modal === 'return'
                ? 'A written reason is required so the Ward Chairperson can revise and resubmit.'
                : 'Record a clear reason for rejection. This action will remain in the decision history.'}
          </p>
          <Field label={modal === 'approve' ? 'Approval note' : 'Reason'}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={
                modal === 'approve'
                  ? 'Optional administrative note'
                  : 'Enter a specific reason...'
              }
              className='w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500'
            />
          </Field>
          <div className='mt-4 flex justify-end gap-2'>
            <Btn kind='secondary' onClick={() => setModal('')}>
              Cancel
            </Btn>
            <Btn onClick={() => decide(modal)}>
              {saving
                ? 'Saving\u2026'
                : modal === 'approve'
                  ? 'Confirm approval'
                  : modal === 'return'
                    ? 'Return proposal'
                    : 'Confirm rejection'}
            </Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

export function ProjectsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [items, setItems] = useState(projects);

  // Load real projects; keep mock data if the backend is unreachable.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getProjects(token)
      .then((list) => {
        if (Array.isArray(list) && list.length)
          setItems(list.map(mapCaoProject));
      })
      .catch(() => {});
  }, []);

  const rows = items.filter(
    (p) =>
      (status === 'All' || p.status === status) &&
      `${p.title} ${p.id} ${p.ward}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow='Implementation oversight'
        title='All municipal projects'
        description='Monitor approved budgets, assignments, contractor-reported progress and department-verified delivery.'
      />
      <div className='mb-4 flex flex-wrap gap-2'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search project, ID or ward'
          className='w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
        >
          <option>All</option>
          <option>Ongoing</option>
          <option>Planning</option>
          <option>Completed</option>
        </select>
      </div>
      <Panel
        title='Project register'
        sub={`${rows.length} records · Financial amounts in NPR`}
      >
        <Table
          heads={[
            'Project',
            'Assignment',
            'Status',
            'Approved budget',
            'Progress (reported / verified)',
            'Details',
          ]}
        >
          {rows.map((p) => (
            <tr key={p.id}>
              <td className='py-4 pr-3'>
                <b>{p.title}</b>
                <div className='mt-1 text-xs text-slate-400'>
                  {p.id} · {p.ward}
                </div>
              </td>
              <td>
                <div className='text-xs'>{p.department}</div>
                <div className='mt-1 text-xs text-slate-400'>
                  {p.contractor}
                </div>
              </td>
              <td>
                <Status>{p.status}</Status>
              </td>
              <td className='whitespace-nowrap'>{money(p.approved)}</td>
              <td className='min-w-[190px]'>
                <div className='flex justify-between text-xs'>
                  <span>
                    {p.reported}% / {p.verified}%
                  </span>
                  <span
                    className={
                      p.reported - p.verified >= 10
                        ? 'font-semibold text-amber-700'
                        : 'text-slate-400'
                    }
                  >
                    {p.reported - p.verified > 0
                      ? `${p.reported - p.verified} pt gap`
                      : '—'}
                  </span>
                </div>
                <div className='mt-2'>
                  <Progress value={p.verified} />
                </div>
              </td>
              <td>
                <Link
                  href={`/cao/projects/${p.id}`}
                  className='text-xs font-semibold text-blue-700'
                >
                  View record →
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
export function ProjectDetail({ id }) {
  const [p, setP] = useState(null);

  // Load the real project so a direct link works.
  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    api
      .getProject(token, id)
      .then((data) => setP(mapCaoProject(data)))
      .catch(() => {});
  }, [id]);

  if (!p) {
    return (
      <PageHead
        eyebrow='All projects / Project record'
        title='Loading project'
        description={id}
      />
    );
  }

  return (
    <>
      <PageHead
        eyebrow='All projects / Project record'
        title={p.title}
        description={`${p.id} · ${p.ward} · ${p.status}`}
        action={
          <Link
            href='/cao/projects'
            className='text-xs font-semibold text-blue-700'
          >
            ← Back to projects
          </Link>
        }
      />
      <div className='grid gap-5 xl:grid-cols-3'>
        <div className='space-y-5 xl:col-span-2'>
          <Panel
            title='Implementation progress'
            sub='Contractor report and department verification are separate records'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-md border border-slate-200 p-4'>
                <div className='text-xs text-slate-500'>
                  Contractor reported
                </div>
                <div className='mt-2 text-3xl font-semibold'>{p.reported}%</div>
                <div className='mt-3'>
                  <Progress value={p.reported} />
                </div>
              </div>
              <div className='rounded-md border border-slate-200 p-4'>
                <div className='text-xs text-slate-500'>
                  Department verified
                </div>
                <div className='mt-2 text-3xl font-semibold'>{p.verified}%</div>
                <div className='mt-3'>
                  <Progress value={p.verified} />
                </div>
              </div>
            </div>
            <div className='mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-900'>
              Progress difference:{' '}
              <b>{p.reported - p.verified} percentage points</b>.{' '}
              {p.reported - p.verified >= 10
                ? 'Flag for investigation and review inspection observations.'
                : 'No material variance indicated in this sample.'}
            </div>
          </Panel>
          <Panel title='Inspection record'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='text-xs text-slate-400'>Quality assessment</div>
                <div className='mt-1'>
                  <Status>{p.quality}</Status>
                </div>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Last inspection</div>
                <div className='mt-1 text-sm'>21 Nov 2026</div>
              </div>
              <div className='sm:col-span-2'>
                <div className='text-xs text-slate-400'>Observation</div>
                <p className='mt-1 text-sm leading-6'>
                  Pipe depth below specification in two sections. Contractor
                  response: re-lay the two sections by Friday.
                </p>
              </div>
            </div>
          </Panel>
        </div>
        <div className='space-y-5'>
          <Panel title='Budget position'>
            <div className='space-y-4 text-sm'>
              {[
                ['Estimated', p.budget],
                ['Approved', p.approved],
                ['Contracted', p.contracted],
                ['Expenditure', p.spent],
              ].map(([k, v]) => (
                <div key={k} className='flex justify-between gap-3'>
                  <span className='text-slate-500'>{k}</span>
                  <b>{money(v)}</b>
                </div>
              ))}
            </div>
            <div className='mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400'>
              Do not treat estimated, approved, contracted and expenditure
              amounts as interchangeable.
            </div>
          </Panel>
          <Panel title='Assignment'>
            <div className='space-y-3 text-sm'>
              <div>
                <div className='text-xs text-slate-400'>Department</div>
                <b>{p.department}</b>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Contractor</div>
                <b>{p.contractor}</b>
              </div>
              <div>
                <div className='text-xs text-slate-400'>Target completion</div>
                <b>{p.due}</b>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function UsersPage() {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState(users);
  const [q, setQ] = useState('');
  const { showNotice, Notice } = useNotice();
  const [wardOptions, setWardOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const DEFAULTS = {
    name: '',
    email: '',
    password: '',
    role: 'Ward Chair',
    wardId: '',
    departmentId: '',
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(officialSchema),
    defaultValues: DEFAULTS,
  });
  const roleLabel = useWatch({ control, name: 'role' });

  async function onCreateOfficial(v) {
    const token = getToken();
    const role = roleToBackend[v.role];
    const body = {
      fullName: v.name.trim(),
      email: v.email.trim(),
      password: v.password,
      role,
    };
    if (role === 'ward') body.wardId = v.wardId;
    if (role === 'department') body.departmentId = v.departmentId;
    try {
      await api.createOfficial(token, body);
      const data = await api.getUsers(token);
      if (Array.isArray(data)) setList(data.map(mapUser));
      setModal(false);
      reset(DEFAULTS);
      showNotice('Account created.');
    } catch (err) {
      showNotice(err.message || 'Could not create account.');
    }
  }

  // Load real accounts plus ward/department options for the create form;
  // keep mock data if the backend is unreachable.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getUsers(token)
      .then((data) => {
        if (Array.isArray(data) && data.length) setList(data.map(mapUser));
      })
      .catch(() => {});
    api
      .getWards()
      .then((w) => Array.isArray(w) && setWardOptions(w))
      .catch(() => {});
    api
      .getDepartments(token)
      .then((d) => Array.isArray(d) && setDeptOptions(d))
      .catch(() => {});
  }, []);

  const filtered = list.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow='Administration'
        title='User management'
        description='Create municipal accounts, manage role scope and suspend or reactivate access with a recorded reason.'
        action={<Btn onClick={() => setModal(true)}>+ Add official</Btn>}
      />
      <div className='mb-4'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search name, email or role'
          className='w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
        />
      </div>
      <Panel
        title='Municipal user directory'
        sub={`${list.length} accounts · Six system roles`}
      >
        <Table
          heads={[
            'User',
            'Role',
            'Access scope',
            'Status',
            'Last active',
            'Action',
          ]}
        >
          {filtered.map((u) => (
            <tr key={u.email}>
              <td className='py-3'>
                <b>{u.name}</b>
                <div className='mt-1 text-xs text-slate-400'>{u.email}</div>
              </td>
              <td>{u.role}</td>
              <td className='text-slate-500'>{u.scope}</td>
              <td>
                <Status>{u.status}</Status>
              </td>
              <td className='whitespace-nowrap text-xs text-slate-500'>
                {u.last}
              </td>
              <td>
                <button
                  onClick={async () => {
                    const token = getToken();
                    const next = u.status === 'Active' ? 'SUSPENDED' : 'ACTIVE';
                    const reason = window.prompt(
                      u.status === 'Active'
                        ? 'Reason for suspension'
                        : 'Reason for reactivation',
                    );
                    if (!reason?.trim()) return;
                    try {
                      await api.setUserStatus(token, u.id, next);
                      setList((old) =>
                        old.map((x) =>
                          x.email === u.email
                            ? {
                                ...x,
                                status:
                                  next === 'SUSPENDED' ? 'Suspended' : 'Active',
                              }
                            : x,
                        ),
                      );
                      showNotice('User status updated.');
                    } catch (err) {
                      showNotice(err.message || 'Could not update status.');
                    }
                  }}
                  className='text-xs font-semibold text-blue-700'
                >
                  {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
      <div className='mt-5 grid gap-5 md:grid-cols-2'>
        <Panel title='Role access summary'>
          <div className='space-y-3 text-xs'>
            {[
              ['Citizen', 'Submit complaints, react and comment'],
              ['Ward Chair', 'Create and submit ward proposals'],
              ['Department', 'Technical review, inspection and evaluation'],
              [
                'General Admin',
                'Administrative support; delegated approval only',
              ],
              [
                'CAO',
                'Administrative approval, assignment, user and delegation management',
              ],
              ['Contractor', 'Submit progress and respond to inspections'],
            ].map((x) => (
              <div
                key={x[0]}
                className='flex justify-between gap-4 border-b border-slate-100 pb-2'
              >
                <b>{x[0]}</b>
                <span className='max-w-[65%] text-right text-slate-500'>
                  {x[1]}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title='Account governance'>
          <p className='text-xs leading-5 text-slate-600'>
            Suspension changes account status; it does not delete the user or
            erase prior activity. Record the actor, previous status, new status,
            reason and timestamp in user status history and audit logs.
          </p>
        </Panel>
      </div>
      {modal && (
        <Modal title='Create municipal account' onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit(onCreateOfficial)} noValidate>
            <div className='space-y-3'>
              <Field label='Full name'>
                <input
                  {...register('name')}
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                />
                {errors.name && (
                  <p className='mt-1.5 text-xs text-red-700'>
                    {errors.name.message}
                  </p>
                )}
              </Field>
              <Field label='Email'>
                <input
                  type='email'
                  {...register('email')}
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                />
                {errors.email && (
                  <p className='mt-1.5 text-xs text-red-700'>
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field label='Role'>
                <select
                  {...register('role')}
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                >
                  {OFFICIAL_ROLES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label='Temporary password'>
                <input
                  type='password'
                  {...register('password')}
                  placeholder='At least 8 characters'
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                />
                {errors.password && (
                  <p className='mt-1.5 text-xs text-red-700'>
                    {errors.password.message}
                  </p>
                )}
              </Field>
              {roleLabel === 'Ward Chair' && (
                <Field label='Ward'>
                  <select
                    {...register('wardId')}
                    className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                  >
                    <option value=''>Select a ward</option>
                    {wardOptions.map((w) => (
                      <option key={w._id} value={w._id}>
                        Ward {w.wardNumber} — {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.wardId && (
                    <p className='mt-1.5 text-xs text-red-700'>
                      {errors.wardId.message}
                    </p>
                  )}
                </Field>
              )}
              {roleLabel === 'Department' && (
                <Field label='Department'>
                  <select
                    {...register('departmentId')}
                    className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                  >
                    <option value=''>Select a department</option>
                    {deptOptions.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className='mt-1.5 text-xs text-red-700'>
                      {errors.departmentId.message}
                    </p>
                  )}
                </Field>
              )}
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <Btn
                kind='secondary'
                type='button'
                onClick={() => setModal(false)}
              >
                Cancel
              </Btn>
              <Btn type='submit'>
                {isSubmitting ? 'Creating\u2026' : 'Create account'}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
      <Notice />
    </>
  );
}

export function DepartmentsPage() {
  return (
    <>
      <PageHead
        eyebrow='Municipal administration'
        title='Departments'
        description='View department leadership, staffing, assigned projects and inspection workload.'
      />
      <div className='grid gap-4 sm:grid-cols-2'>
        {departments.map((d) => (
          <Panel
            key={d.name}
            title={d.name}
            sub={`Department head · ${d.head}`}
          >
            <div className='grid grid-cols-3 gap-3'>
              <div>
                <div className='text-2xl font-semibold'>{d.staff}</div>
                <div className='text-[12px] text-slate-400'>Staff</div>
              </div>
              <div>
                <div className='text-2xl font-semibold'>{d.projects}</div>
                <div className='text-[12px] text-slate-400'>Projects</div>
              </div>
              <div>
                <div className='text-2xl font-semibold'>{d.inspections}</div>
                <div className='text-[12px] text-slate-400'>Inspections</div>
              </div>
            </div>
            <div className='mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs'>
              <span className='text-slate-500'>Open review items</span>
              <b>{d.open}</b>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

export function DelegationsPage() {
  const [rows, setRows] = useState([
    {
      id: 'DEL-003',
      official: 'Ramesh Bhatta',
      scope: 'Approve Assembly projects',
      from: '20 Nov 2026',
      to: '25 Nov 2026',
      basis: 'Order no. 12/083',
      status: 'Active',
    },
  ]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    official: 'Ramesh Bhatta',
    scope: 'approve_assembly_projects',
    from: '2026-11-22',
    to: '2026-11-25',
    basis: '',
  });
  const { showNotice, Notice } = useNotice();
  return (
    <>
      <PageHead
        eyebrow='Administrative authority'
        title='Delegated authority'
        description='Record temporary authority granted by the CAO. Scope and validity must be checked for every delegated approval.'
        action={<Btn onClick={() => setOpen(true)}>+ Create delegation</Btn>}
      />
      <Panel
        title='Delegation register'
        sub='Delegations are time-bound and must have a legal basis'
      >
        <Table
          heads={[
            'Reference',
            'Delegated official',
            'Scope',
            'Valid from',
            'Valid to',
            'Legal basis',
            'Status',
            'Action',
          ]}
        >
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className='py-4 font-semibold'>{r.id}</td>
              <td>{r.official}</td>
              <td>
                <code className='text-[12px]'>{r.scope}</code>
              </td>
              <td>{r.from}</td>
              <td>{r.to}</td>
              <td>{r.basis}</td>
              <td>
                <Status>{r.status}</Status>
              </td>
              <td>
                <button
                  onClick={() => {
                    setRows(
                      rows.map((x, j) =>
                        j === i ? { ...x, status: 'Revoked' } : x,
                      ),
                    );
                    showNotice('Delegation marked revoked in mock state.');
                  }}
                  className='text-xs font-semibold text-red-700'
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
      <div className='mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900'>
        <b>Approval rule:</b> General Admin can approve an Assembly-approved
        project only if the delegation is active, the scope matches{' '}
        <code>approve_assembly_projects</code>, and the action date is between
        validFrom and validTo. Enforce this server-side.
      </div>
      {open && (
        <Modal title='Create delegation' onClose={() => setOpen(false)}>
          <div className='space-y-3'>
            <Field label='Delegated official'>
              <select
                value={f.official}
                onChange={(e) => setF({ ...f, official: e.target.value })}
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              >
                <option>Ramesh Bhatta</option>
              </select>
            </Field>
            <Field label='Permission scope'>
              <select
                value={f.scope}
                onChange={(e) => setF({ ...f, scope: e.target.value })}
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              >
                <option value='approve_assembly_projects'>
                  Approve Assembly projects
                </option>
              </select>
            </Field>
            <div className='grid grid-cols-2 gap-3'>
              <Field label='Valid from'>
                <input
                  type='date'
                  value={f.from}
                  onChange={(e) => setF({ ...f, from: e.target.value })}
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                />
              </Field>
              <Field label='Valid to'>
                <input
                  type='date'
                  value={f.to}
                  onChange={(e) => setF({ ...f, to: e.target.value })}
                  className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                />
              </Field>
            </div>
            <Field label='Legal basis / order reference'>
              <input
                value={f.basis}
                onChange={(e) => setF({ ...f, basis: e.target.value })}
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                placeholder='e.g. Order no. 12/083'
              />
            </Field>
          </div>
          <div className='mt-5 flex justify-end gap-2'>
            <Btn kind='secondary' onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn
              onClick={() => {
                if (!f.basis.trim() || f.to < f.from) return;
                setRows([
                  ...rows,
                  {
                    id: `DEL-${String(rows.length + 4).padStart(3, '0')}`,
                    official: f.official,
                    scope: f.scope,
                    from: f.from,
                    to: f.to,
                    basis: f.basis,
                    status: 'Active',
                  },
                ]);
                setOpen(false);
                showNotice('Delegation added to mock register.');
              }}
            >
              Save delegation
            </Btn>
          </div>
        </Modal>
      )}
      <Notice />
    </>
  );
}

export function ReportsPage() {
  const [period, setPeriod] = useState('2083/84');
  return (
    <>
      <PageHead
        eyebrow='Evidence and accountability'
        title='Reports'
        description='Review planning, budget and delivery indicators for municipal decision-making.'
        action={
          <Btn kind='secondary' onClick={() => window.print()}>
            Print / Save PDF
          </Btn>
        }
      />
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <label className='text-xs text-slate-500'>Fiscal year</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
        >
          <option>2083/84</option>
          <option>2082/83</option>
        </select>
        <span className='text-xs text-slate-400'>Sample data · {period}</span>
      </div>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Stat
          label='Estimated project budget'
          value='NPR 102.4M'
          detail='Current fiscal year'
        />
        <Stat
          label='Approved budget'
          value='NPR 84.6M'
          detail='82.6% of estimate'
        />
        <Stat
          label='Recorded expenditure'
          value='NPR 31.2M'
          detail='Based on project records'
        />
      </div>
      <div className='mt-5 grid gap-5 xl:grid-cols-2'>
        <Panel
          title='Priority and demand report'
          sub='Priority scoring model · total weight 100%'
        >
          <div className='space-y-3'>
            {[
              ['Problem severity', 25],
              ['Citizens affected', 20],
              ['Citizen demand and feedback', 15],
              ['Essential service / public safety', 15],
              ['Ward development gap', 10],
              ['Feasibility and readiness', 10],
              ['Municipal priority alignment', 5],
            ].map((x) => (
              <div key={x[0]}>
                <div className='mb-1 flex justify-between text-xs'>
                  <span>{x[0]}</span>
                  <b>{x[1]}%</b>
                </div>
                <Progress value={x[1] * 4} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title='Contractor vs department verification'
          sub='Variance requires evidence-based follow-up'
        >
          <Table heads={['Project', 'Reported', 'Verified', 'Gap']}>
            {projects
              .filter((p) => p.status === 'Ongoing')
              .map((p) => (
                <tr key={p.id}>
                  <td className='py-3 pr-2'>{p.title}</td>
                  <td>{p.reported}%</td>
                  <td>{p.verified}%</td>
                  <td
                    className={
                      p.reported - p.verified >= 10
                        ? 'font-semibold text-amber-700'
                        : ''
                    }
                  >
                    {p.reported - p.verified} pts
                  </td>
                </tr>
              ))}
          </Table>
        </Panel>
      </div>
      <div className='mt-5'>
        <Panel title='Available report views'>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {[
              [
                'Ward-wise planning',
                'Compare citizen demand, priority and approved projects.',
              ],
              [
                'Budget utilization',
                'Estimated, approved, contracted and expenditure amounts.',
              ],
              [
                'Department performance',
                'Inspection frequency, verification and issue resolution.',
              ],
              [
                'Contractor performance',
                'Timeliness, quality, progress variance and responses.',
              ],
              [
                'Citizen demand',
                'Complaints, project comments and community feedback.',
              ],
              [
                'Project evaluation',
                'Time, quality, financial performance and satisfaction.',
              ],
            ].map((x) => (
              <div
                key={x[0]}
                className='rounded-md border border-slate-200 p-4'
              >
                <div className='text-sm font-semibold'>{x[0]}</div>
                <p className='mt-1 text-xs leading-5 text-slate-500'>{x[1]}</p>
                <button
                  onClick={() => window.print()}
                  className='mt-3 text-xs font-semibold text-blue-700'
                >
                  Print this view →
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function AuditPage() {
  const [q, setQ] = useState('');
  const [list, setList] = useState(audit);

  // Load the real municipal audit trail; keep the sample if unreachable.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api
      .getAuditLogs(token)
      .then((data) => {
        if (Array.isArray(data) && data.length) setList(data.map(mapAuditLog));
      })
      .catch(() => {});
  }, []);

  const rows = list.filter((r) =>
    r.join(' ').toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow='Accountability'
        title='Audit logs'
        description='Read-only record of important actions across the municipality. Audit records cannot be edited or deleted from this interface.'
      />
      <div className='mb-4'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search actor, action or record ID'
          className='w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
        />
      </div>
      <Panel title='Activity history' sub='Showing most recent events first'>
        <Table
          heads={['Date and time', 'Actor', 'Action', 'Record', 'Details']}
        >
          {rows.map((r, i) => (
            <tr key={i}>
              <td className='whitespace-nowrap py-3 text-xs text-slate-500'>
                {r[0]}
              </td>
              <td className='font-medium'>{r[1]}</td>
              <td>{r[2]}</td>
              <td>
                <code className='text-xs'>{r[3]}</code>
              </td>
              <td className='text-slate-500'>{r[4]}</td>
            </tr>
          ))}
        </Table>
        <div className='mt-4 text-[12px] text-slate-400'>
          Audit schema: userId, action, entityType, entityId, oldValue,
          newValue, createdAt.
        </div>
      </Panel>
    </>
  );
}
