'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/session';

const projects = [
  {
    id: 'PRJ-2083-014',
    name: 'Ward 4 Drinking Water Supply',
    ward: 'Ward 4',
    dept: 'Water Supply Department',
    contractor: 'Himal Build Pvt. Ltd.',
    budget: 4500000,
    spent: 1980000,
    reported: 75,
    verified: 58,
    status: 'Ongoing',
    stage: 'Pipe laying',
    due: '2083-12-30',
    priority: 91,
    comments: 18,
  },
  {
    id: 'PRJ-2083-021',
    name: 'Ward 7 Internal Road Improvement',
    ward: 'Ward 7',
    dept: 'Infrastructure Department',
    contractor: 'Seti Construction',
    budget: 6200000,
    spent: 2400000,
    reported: 46,
    verified: 42,
    status: 'Ongoing',
    stage: 'Base preparation',
    due: '2084-01-15',
    priority: 78,
    comments: 11,
  },
  {
    id: 'PRJ-2083-032',
    name: 'Community Health Post Renovation',
    ward: 'Ward 2',
    dept: 'Health Department',
    contractor: 'Kailash Builders',
    budget: 2800000,
    spent: 400000,
    reported: 22,
    verified: 18,
    status: 'Needs inspection',
    stage: 'Structural repair',
    due: '2084-02-10',
    priority: 73,
    comments: 7,
  },
  {
    id: 'PRJ-2083-039',
    name: 'Ward 3 Drainage Extension',
    ward: 'Ward 3',
    dept: 'Infrastructure Department',
    contractor: 'Mahakali Engineering',
    budget: 3100000,
    spent: 1750000,
    reported: 64,
    verified: 64,
    status: 'On track',
    stage: 'Drain installation',
    due: '2083-12-18',
    priority: 69,
    comments: 5,
  },
];
const inspections = [
  {
    id: 'INS-104',
    project: 'Ward 4 Drinking Water Supply',
    pid: 'PRJ-2083-014',
    reported: 75,
    verified: 58,
    gap: 17,
    quality: 'Needs improvement',
    date: '2083-08-12',
    observation:
      'Pipe depth below specification in two sections. Rework and submit photo evidence.',
  },
  {
    id: 'INS-101',
    project: 'Ward 7 Internal Road Improvement',
    pid: 'PRJ-2083-021',
    reported: 46,
    verified: 42,
    gap: 4,
    quality: 'Satisfactory',
    date: '2083-08-08',
    observation: 'Minor compaction issue near chainage 0+240.',
  },
  {
    id: 'INS-098',
    project: 'Community Health Post Renovation',
    pid: 'PRJ-2083-032',
    reported: 22,
    verified: 18,
    gap: 4,
    quality: 'Satisfactory',
    date: '2083-08-04',
    observation:
      'Work is progressing; verify reinforcement before concrete pour.',
  },
];
const comments = [
  {
    id: 'C-221',
    project: 'Ward 4 Drinking Water Supply',
    ward: 'Ward 4',
    citizen: 'Ram Sharma',
    text: 'Please complete the pipeline before the dry season.',
    date: '2083-08-12',
    status: 'Visible',
  },
  {
    id: 'C-219',
    project: 'Ward 7 Internal Road Improvement',
    ward: 'Ward 7',
    citizen: 'Sita Bista',
    text: 'The road near the school needs safe pedestrian access.',
    date: '2083-08-10',
    status: 'Visible',
  },
  {
    id: 'C-213',
    project: 'Community Health Post Renovation',
    ward: 'Ward 2',
    citizen: 'Bikash Joshi',
    text: 'Please publish the revised completion date.',
    date: '2083-08-06',
    status: 'Needs response',
  },
];
const money = (n) => 'NPR ' + new Intl.NumberFormat('en-IN').format(n);
const paths = {
  department: [
    ['Dashboard', '/department'],
    ['Assigned Projects', '/department/assigned-projects'],
    ['Inspections', '/department/inspections'],
    ['Progress Verification', '/department/progress-verification'],
    ['Contractor Evaluation', '/department/contractor-evaluation'],
    ['Reports', '/department/reports'],
  ],
  contractor: [
    ['Dashboard', '/contractor'],
    ['Assigned Projects', '/contractor/assigned-projects'],
    ['Submissions', '/contractor/submissions'],
    ['Observations', '/contractor/observations'],
    ['Responses', '/contractor/responses'],
    ['Profile', '/contractor/profile'],
  ],
  'general-admin': [
    ['Dashboard', '/general-admin'],
    ['Project Review', '/general-admin/project-review'],
    ['Project Management', '/general-admin/project-management'],
    ['Citizen Comments', '/general-admin/citizen-comments'],
    ['Reports', '/general-admin/reports'],
  ],
};
const configs = {
  department: {
    name: 'Department workspace',
    desc: 'Technical oversight, field inspections and evidence-based verification.',
    role: 'Department Engineer',
  },
  contractor: {
    name: 'Contractor workspace',
    desc: 'Manage assigned work, submit progress evidence and respond to inspection observations.',
    role: 'Registered Contractor',
  },
  'general-admin': {
    name: 'General Administration',
    desc: 'Coordinate administrative review, project records and citizen communication.',
    role: 'General Administrator',
  },
};
function Button({ children, onClick, kind = 'primary', disabled = false }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-40 ${kind === 'primary' ? 'bg-[#173b60] text-white hover:bg-[#214d78]' : kind === 'danger' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}
function Badge({ children }) {
  let c = String(children).toLowerCase();
  let cls =
    c.includes('improvement') || c.includes('overdue') || c.includes('reject')
      ? 'bg-amber-50 text-amber-700'
      : c.includes('track') ||
          c.includes('verified') ||
          c.includes('visible') ||
          c.includes('approved')
        ? 'bg-emerald-50 text-emerald-700'
        : c.includes('response') ||
            c.includes('inspection') ||
            c.includes('review')
          ? 'bg-blue-50 text-blue-700'
          : 'bg-slate-100 text-slate-600';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}
function Metric({ label, value, sub }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
        {label}
      </p>
      <p className='mt-2 text-2xl font-semibold tracking-tight text-slate-900'>
        {value}
      </p>
      <p className='mt-1 text-xs text-slate-500'>{sub}</p>
    </div>
  );
}
function Panel({ title, action, children }) {
  return (
    <section className='rounded-xl border border-slate-200 bg-white'>
      <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
        <h2 className='font-semibold text-slate-900'>{title}</h2>
        {action}
      </div>
      <div className='p-5'>{children}</div>
    </section>
  );
}
function Progress({ value }) {
  return (
    <div className='min-w-24'>
      <div className='mb-1 flex justify-between text-xs text-slate-500'>
        <span>{value}%</span>
      </div>
      <div className='h-1.5 rounded-full bg-slate-100'>
        <div
          className='h-1.5 rounded-full bg-[#315f87]'
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
function Table({ headers, children }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-sm'>
        <thead>
          <tr className='border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500'>
            {headers.map((h) => (
              <th key={h} className='whitespace-nowrap px-3 py-3 font-semibold'>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>{children}</tbody>
      </table>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4'>
      <div className='w-full max-w-xl rounded-2xl bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
          <h3 className='font-semibold'>{title}</h3>
          <button onClick={onClose} className='text-xl text-slate-400'>
            ×
          </button>
        </div>
        <div className='p-5'>{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className='block text-sm'>
      <span className='mb-1.5 block font-medium text-slate-700'>{label}</span>
      {children || (
        <input className='w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500' />
      )}
    </label>
  );
}
export default function RoleWorkspace({ role, section }) {
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All'),
    [modal, setModal] = useState(''),
    [toast, setToast] = useState(''),
    [records, setRecords] = useState(inspections),
    [replies, setReplies] = useState({}),
    [selected, setSelected] = useState(projects[0]),
    [submissions, setSubmissions] = useState([]);
  const router = useRouter();
  const session = useSession();
  const signOutNow = () => {
    signOut();
    router.replace('/login');
  };
  const cfg = configs[role],
    nav = paths[role],
    isDept = role === 'department',
    isCon = role === 'contractor',
    isAdmin = role === 'general-admin';
  const titleMap = {
    '': 'Dashboard',
    'assigned-projects': 'Assigned Projects',
    inspections: 'Inspections',
    'progress-verification': 'Progress Verification',
    'contractor-evaluation': 'Contractor Evaluation',
    reports: 'Reports',
    submissions: 'Progress Submissions',
    observations: 'Observations',
    responses: 'Responses',
    profile: 'Profile',
    'project-review': 'Project Review',
    'project-management': 'Project Management',
    'citizen-comments': 'Citizen Comments',
  };
  const title = titleMap[section] || 'Dashboard';
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };
  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.id.toLowerCase().includes(query.toLowerCase())) &&
          (filter === 'All' || p.status === filter),
      ),
    [query, filter],
  );
  const tableProjects = () => (
    <Panel
      title='Project register'
      action={
        <Button kind='secondary' onClick={() => setFilter('All')}>
          Clear filters
        </Button>
      }
    >
      <div className='mb-4 flex flex-wrap gap-2'>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search project or ID'
          className='min-w-52 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm'
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
        >
          <option>All</option>
          {['Ongoing', 'On track', 'Needs inspection'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <Table
        headers={[
          'Project',
          'Ward / ID',
          'Budget',
          'Reported',
          'Verified',
          'Status',
          'Action',
        ]}
      >
        {filtered.map((p) => (
          <tr key={p.id}>
            <td className='min-w-56 px-3 py-4'>
              <p className='font-semibold text-slate-800'>{p.name}</p>
              <p className='mt-1 text-xs text-slate-500'>{p.id}</p>
            </td>
            <td className='px-3 py-4 text-slate-600'>{p.ward}</td>
            <td className='whitespace-nowrap px-3 py-4'>{money(p.budget)}</td>
            <td className='px-3 py-4'>
              <Progress value={p.reported} />
            </td>
            <td className='px-3 py-4'>
              <Progress value={p.verified} />
            </td>
            <td className='px-3 py-4'>
              <Badge>{p.status}</Badge>
            </td>
            <td className='px-3 py-4'>
              <button
                onClick={() => {
                  setSelected(p);
                  setModal('project');
                }}
                className='font-semibold text-[#24557f]'
              >
                View details
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
  const projectDetail = () => (
    <Panel title={selected.name} action={<Badge>{selected.status}</Badge>}>
      <div className='grid gap-4 md:grid-cols-3'>
        <div>
          <p className='text-xs text-slate-500'>Project ID</p>
          <p className='font-semibold'>{selected.id}</p>
        </div>
        <div>
          <p className='text-xs text-slate-500'>Ward</p>
          <p className='font-semibold'>{selected.ward}</p>
        </div>
        <div>
          <p className='text-xs text-slate-500'>Responsible department</p>
          <p className='font-semibold'>{selected.dept}</p>
        </div>
      </div>
      <div className='my-5 grid gap-3 sm:grid-cols-2'>
        <Metric
          label='Approved budget'
          value={money(selected.budget)}
          sub='Approved project allocation'
        />
        <Metric
          label='Reported / verified'
          value={`${selected.reported}% / ${selected.verified}%`}
          sub={`${selected.reported - selected.verified} percentage point difference`}
        />
      </div>
      <div className='grid gap-3 md:grid-cols-2'>
        <div className='rounded-lg bg-slate-50 p-4'>
          <p className='text-xs text-slate-500'>Contractor</p>
          <p className='mt-1 font-semibold'>{selected.contractor}</p>
          <p className='mt-3 text-xs text-slate-500'>Current work stage</p>
          <p className='font-medium'>{selected.stage}</p>
        </div>
        <div className='rounded-lg bg-slate-50 p-4'>
          <p className='text-xs text-slate-500'>Expenditure to date</p>
          <p className='mt-1 font-semibold'>{money(selected.spent)}</p>
          <p className='mt-3 text-xs text-slate-500'>Target completion</p>
          <p className='font-medium'>{selected.due}</p>
        </div>
      </div>
      <div className='mt-5 flex flex-wrap gap-2'>
        <Button onClick={() => setModal('inspection')}>
          Record inspection
        </Button>
        <Button kind='secondary' onClick={() => setModal('submission')}>
          Review latest submission
        </Button>
      </div>
    </Panel>
  );
  const dashboard = () => (
    <>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {(isDept
          ? [
              ['Assigned projects', '12', 'Across 6 wards'],
              ['Inspections due', '4', 'Require field visit'],
              ['Awaiting verification', '3', 'Contractor submissions'],
              ['Quality flags', '2', 'Require follow-up'],
            ]
          : isCon
            ? [
                ['Active projects', '3', 'Current assignments'],
                ['Submissions sent', '14', 'This fiscal year'],
                ['Observations open', '2', 'Action required'],
                ['Verified progress', '58%', 'Across active work'],
              ]
            : [
                [
                  'Pending project reviews',
                  '8',
                  'Awaiting administrative action',
                ],
                ['Projects managed', '26', 'Current fiscal year'],
                ['Citizen comments', '41', '7 need response'],
                ['Returned proposals', '3', 'Awaiting resubmission'],
              ]
        ).map((x) => (
          <Metric key={x[0]} label={x[0]} value={x[1]} sub={x[2]} />
        ))}
      </div>
      <div className='mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]'>
        <Panel
          title={
            isDept
              ? 'Projects requiring attention'
              : isCon
                ? 'Your active assignments'
                : 'Administrative action queue'
          }
          action={
            <Link
              className='text-sm font-semibold text-[#24557f]'
              href={nav[1][1]}
            >
              View all
            </Link>
          }
        >
          <div className='space-y-4'>
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className='flex flex-col gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between'
              >
                <div>
                  <p className='font-semibold text-slate-800'>{p.name}</p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {p.id} · {p.ward}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge>{p.status}</Badge>
                  <button
                    onClick={() => {
                      setSelected(p);
                      setModal('project');
                    }}
                    className='text-sm font-semibold text-[#24557f]'
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title={
            isDept
              ? 'Verification variance'
              : isCon
                ? 'Latest observations'
                : 'Citizen voice'
          }
        >
          <div className='space-y-4'>
            {(isDept
              ? inspections.map((x) => [
                  x.project,
                  `${x.gap} point gap`,
                  x.quality,
                ])
              : isCon
                ? inspections
                    .slice(0, 2)
                    .map((x) => [x.project, x.observation, 'Open'])
                : comments.map((x) => [x.project, x.text, x.status])
            ).map((x, i) => (
              <div
                key={i}
                className='border-b border-slate-100 pb-3 last:border-0'
              >
                <p className='text-sm font-semibold text-slate-800'>{x[0]}</p>
                <p className='mt-1 text-sm text-slate-600'>{x[1]}</p>
                <div className='mt-2'>
                  <Badge>{x[2]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className='mt-5'>{tableProjects()}</div>
    </>
  );
  const inspectionTable = () => (
    <Panel
      title='Inspection register'
      action={
        <Button onClick={() => setModal('inspection')}>+ New inspection</Button>
      }
    >
      <Table
        headers={[
          'Inspection',
          'Project',
          'Reported',
          'Verified',
          'Gap',
          'Quality',
          'Date',
          'Action',
        ]}
      >
        {records.map((x) => (
          <tr key={x.id}>
            <td className='px-3 py-4 font-semibold'>{x.id}</td>
            <td className='min-w-48 px-3 py-4'>{x.project}</td>
            <td className='px-3 py-4'>{x.reported}%</td>
            <td className='px-3 py-4 font-semibold'>{x.verified}%</td>
            <td className='px-3 py-4'>
              <Badge>{x.gap} pts</Badge>
            </td>
            <td className='px-3 py-4'>
              <Badge>{x.quality}</Badge>
            </td>
            <td className='px-3 py-4'>{x.date}</td>
            <td className='px-3 py-4'>
              <button
                onClick={() => {
                  setSelected(
                    projects.find((p) => p.id === x.pid) || projects[0],
                  );
                  setModal('inspection-detail');
                }}
                className='font-semibold text-[#24557f]'
              >
                Review
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
  const commentsPanel = () => (
    <Panel title='Citizen comments and moderation'>
      <div className='mb-4 flex flex-wrap gap-2'>
        <input
          placeholder='Search comments, citizen or project'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='min-w-52 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm'
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='rounded-lg border border-slate-200 px-3 py-2 text-sm'
        >
          <option>All</option>
          <option>Visible</option>
          <option>Needs response</option>
        </select>
      </div>
      <div className='space-y-3'>
        {comments
          .filter(
            (c) =>
              (c.text + c.citizen + c.project)
                .toLowerCase()
                .includes(query.toLowerCase()) &&
              (filter === 'All' || c.status === filter),
          )
          .map((c) => (
            <article
              key={c.id}
              className='rounded-xl border border-slate-200 p-4'
            >
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <p className='font-semibold'>
                    {c.citizen}{' '}
                    <span className='font-normal text-slate-500'>
                      · {c.ward}
                    </span>
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {c.project} · {c.date}
                  </p>
                </div>
                <Badge>{c.status}</Badge>
              </div>
              <p className='my-3 text-sm leading-6 text-slate-700'>
                “{c.text}”
              </p>
              <textarea
                value={replies[c.id] || ''}
                onChange={(e) =>
                  setReplies((v) => ({ ...v, [c.id]: e.target.value }))
                }
                placeholder='Write an official response...'
                className='w-full rounded-lg border border-slate-200 p-3 text-sm'
              />
              <div className='mt-2 flex justify-end gap-2'>
                <Button
                  kind='secondary'
                  onClick={() => notify('Comment marked for moderation review')}
                >
                  Flag for review
                </Button>
                <Button
                  onClick={() => notify('Official reply saved in this demo')}
                  disabled={!(replies[c.id] || '').trim()}
                >
                  Post reply
                </Button>
              </div>
            </article>
          ))}
      </div>
    </Panel>
  );
  const simplePanel = (heading, sub, rows, actionLabel) => (
    <Panel
      title={heading}
      action={
        actionLabel && (
          <Button onClick={() => setModal('submission')}>{actionLabel}</Button>
        )
      }
    >
      <p className='mb-4 text-sm text-slate-500'>{sub}</p>
      <div className='space-y-3'>
        {rows.map((r, i) => (
          <div
            key={i}
            className='flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between'
          >
            <div>
              <p className='font-semibold'>{r[0]}</p>
              <p className='mt-1 text-sm text-slate-500'>{r[1]}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge>{r[2]}</Badge>
              <Button
                kind='secondary'
                onClick={() => notify('Record opened in preview')}
              >
                Open
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
  let body;
  if (!section) body = dashboard();
  else if (section === 'assigned-projects' || section === 'project-management')
    body = (
      <>
        {tableProjects()}
        {modal === 'project' && projectDetail()}
      </>
    );
  else if (section === 'inspections') body = inspectionTable();
  else if (section === 'progress-verification')
    body = (
      <>
        {simplePanel(
          'Contractor submissions awaiting verification',
          'Compare reported progress with site evidence. Verification must be recorded by an authorized department inspector.',
          inspections.map((x) => [
            x.project,
            `Contractor reports ${x.reported}% · Previous verified ${x.verified}%`,
            'Awaiting verification',
          ]),
          'Start verification',
        )}
        {inspectionTable()}
      </>
    );
  else if (section === 'contractor-evaluation')
    body = (
      <>
        <div className='grid gap-3 md:grid-cols-3'>
          <Metric
            label='Average quality score'
            value='78 / 100'
            sub='Based on recorded inspections'
          />
          <Metric
            label='On-time delivery'
            value='72%'
            sub='Current fiscal year'
          />
          <Metric
            label='Open corrective actions'
            value='3'
            sub='Across assigned contractors'
          />
        </div>
        <div className='mt-5'>
          {simplePanel(
            'Contractor performance register',
            'Evaluate delivery using documented quality, time, reporting and compliance evidence.',
            [
              [
                'Himal Build Pvt. Ltd.',
                'Water Supply · 2 inspections · 17-point reported/verified gap',
                'Needs improvement',
              ],
              [
                'Seti Construction',
                'Road Improvement · 1 inspection · minor compaction issue',
                'Satisfactory',
              ],
              [
                'Kailash Builders',
                'Health Post · 1 inspection · work progressing',
                'Satisfactory',
              ],
            ],
            'New evaluation',
          )}
        </div>
      </>
    );
  else if (section === 'submissions')
    body = (
      <>
        {simplePanel(
          'Progress submission history',
          'Submitted progress reports with work stage, expenditure, delay reason and supporting photos.',
          [
            ...submissions,
            ...[
              [
                'SUB-2083-014-04',
                'Ward 4 Drinking Water · 75% · Pipe laying',
                'Submitted',
              ],
              [
                'SUB-2083-021-03',
                'Ward 7 Road · 46% · Base preparation',
                'Verified',
              ],
              [
                'SUB-2083-032-02',
                'Health Post · 22% · Structural repair',
                'Needs correction',
              ],
            ],
          ],
          'Submit progress update',
        )}
      </>
    );
  else if (section === 'observations')
    body = simplePanel(
      'Department observations',
      'Inspection findings requiring contractor action. Read the observation and provide a corrective response.',
      inspections.map((x) => [x.project, x.observation, x.quality]),
      '',
    );
  else if (section === 'responses')
    body = simplePanel(
      'Your responses',
      'Track responses sent against department observations and corrective action requests.',
      [
        [
          'OBS-104 · Ward 4 Water',
          'Commitment: re-lay two pipe sections and attach photos by Friday',
          'Awaiting re-inspection',
        ],
        [
          'OBS-101 · Ward 7 Road',
          'Compaction corrected; test report attached',
          'Submitted',
        ],
      ],
      '',
    );
  else if (section === 'profile')
    body = (
      <Panel title='Contractor profile'>
        <div className='grid gap-4 md:grid-cols-2'>
          <Field label='Registered business name'>
            <input
              defaultValue='Himal Build Pvt. Ltd.'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
          <Field label='Registration number'>
            <input
              defaultValue='REG-KL-2080-114'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
          <Field label='Authorized representative'>
            <input
              defaultValue='Ramesh Bhandari'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
          <Field label='Contact email'>
            <input
              defaultValue='office@himalbuild.example'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
          <Field label='Phone'>
            <input
              defaultValue='+977-98XXXXXXXX'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
          <Field label='Address'>
            <input
              defaultValue='Kailali, Sudurpashchim'
              className='w-full rounded-lg border border-slate-200 px-3 py-2'
            />
          </Field>
        </div>
        <div className='mt-5 flex justify-end'>
          <Button onClick={() => notify('Profile changes saved in this demo')}>
            Save profile
          </Button>
        </div>
      </Panel>
    );
  else if (section === 'project-review')
    body = simplePanel(
      'Administrative project review',
      'Review submitted proposals, technical remarks, Assembly decision references and delegation authority. This workspace does not replace CAO-only approval.',
      [
        [
          'Ward 4 Drinking Water Supply',
          'Assembly decision MEA-2083-045 · Technical review: proceed',
          'Ready for CAO approval',
        ],
        [
          'Ward 7 Internal Road Improvement',
          'Budget breakdown requires clarification',
          'Returned',
        ],
        [
          'Community Health Post Renovation',
          'Awaiting Assembly decision record',
          'Under review',
        ],
      ],
      '',
    );
  else if (section === 'citizen-comments') body = commentsPanel();
  else if (section === 'reports')
    body = (
      <>
        <div className='grid gap-3 md:grid-cols-3'>
          <Metric
            label='Approved allocation'
            value={money(14500000)}
            sub='Current fiscal year'
          />
          <Metric
            label='Reported expenditure'
            value={money(6530000)}
            sub='Across active projects'
          />
          <Metric label='Citizen comments' value='41' sub='Across 6 wards' />
        </div>
        <div className='mt-5 grid gap-5 xl:grid-cols-2'>
          <Panel title='Project performance'>
            <div className='space-y-5'>
              {projects.map((p) => (
                <div key={p.id}>
                  <div className='mb-2 flex justify-between gap-3 text-sm'>
                    <span className='font-medium'>{p.name}</span>
                    <span className='text-slate-500'>
                      {p.verified}% verified
                    </span>
                  </div>
                  <Progress value={p.verified} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title='Priority scoring model'>
            <p className='mb-4 text-sm text-slate-500'>
              Proposal priority weights used for need-based annual planning.
            </p>
            {[
              ['Problem severity', 25],
              ['Citizens affected', 20],
              ['Citizen demand and feedback', 15],
              ['Essential service / public safety', 15],
              ['Ward development gap', 10],
              ['Feasibility and readiness', 10],
              ['Municipal priority alignment', 5],
            ].map((x) => (
              <div key={x[0]} className='mb-3'>
                <div className='mb-1 flex justify-between text-sm'>
                  <span>{x[0]}</span>
                  <b>{x[1]}%</b>
                </div>
                <div className='h-2 rounded-full bg-slate-100'>
                  <div
                    className='h-2 rounded-full bg-[#315f87]'
                    style={{ width: `${x[1] * 4}%` }}
                  />
                </div>
              </div>
            ))}
          </Panel>
        </div>
        <div className='mt-5'>{tableProjects()}</div>
        <div className='mt-4 flex justify-end'>
          <Button onClick={() => notify('Report export prepared in demo mode')}>
            Export report
          </Button>
        </div>
      </>
    );
  else body = dashboard();
  return (
    <div className='min-h-screen bg-[#f4f6f8] text-slate-800'>
      <div className='mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8'>
        <div className='mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center'>
          <div>
            <div className='mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
              <span>JanSambandha</span>
              <span>/</span>
              <span>{cfg.role}</span>
            </div>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
              {title}
            </h1>
            <p className='mt-1 max-w-2xl text-sm text-slate-500'>{cfg.desc}</p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='hidden text-right sm:block'>
              <b className='block text-sm'>{session?.name || cfg.role}</b>
              <small className='text-slate-500'>
                Kailali Municipality · FY 2083/84
              </small>
            </span>
            <div className='grid h-10 w-10 place-items-center rounded-full bg-[#dce7f0] text-sm font-bold text-[#173b60]'>
              {isDept ? 'DE' : isCon ? 'HB' : 'GA'}
            </div>
            <button
              onClick={signOutNow}
              className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className='mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1'>
          {nav.map(([label, url]) => (
            <Link
              key={url}
              href={url}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${url === `/${role}${section ? '/' + section : ''}` ? 'bg-[#173b60] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {body}
        <footer className='mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400'>
          JanSambandha · Local Government Annual Planning, Project Evaluation &
          Citizen Engagement System · Demo data
        </footer>
      </div>
      {modal && (
        <Modal
          title={
            modal === 'project'
              ? 'Project details'
              : modal === 'inspection'
                ? 'Record department inspection'
                : modal === 'submission'
                  ? 'Review progress submission'
                  : 'Inspection detail'
          }
          onClose={() => setModal('')}
        >
          {modal === 'project' ? (
            <>
              {projectDetail()}
              <div className='mt-4 flex justify-end'>
                <Button kind='secondary' onClick={() => setModal('')}>
                  Close
                </Button>
              </div>
            </>
          ) : modal === 'submission' && isCon ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setSubmissions((v) => [
                  [
                    `SUB-${2083}-${String(100 + v.length)}`,
                    `${f.get('project')} · ${f.get('progress')}% · ${f.get('stage')}`,
                    'Submitted',
                  ],
                  ...v,
                ]);
                setModal('');
                notify('Progress submission saved in local demo state');
              }}
              className='space-y-4'
            >
              <Field label='Assigned project'>
                <select
                  name='project'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                >
                  {projects.slice(0, 3).map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Reported progress (%)'>
                  <input
                    name='progress'
                    type='number'
                    min='0'
                    max='100'
                    required
                    className='w-full rounded-lg border border-slate-200 px-3 py-2'
                  />
                </Field>
                <Field label='Work stage'>
                  <input
                    name='stage'
                    required
                    placeholder='e.g. Pipe laying'
                    className='w-full rounded-lg border border-slate-200 px-3 py-2'
                  />
                </Field>
              </div>
              <Field label='Expenditure reported (NPR)'>
                <input
                  name='expenditure'
                  type='number'
                  min='0'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                />
              </Field>
              <Field label='Delay reason (if applicable)'>
                <textarea
                  name='delay'
                  rows='2'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                />
              </Field>
              <Field label='Work summary and evidence reference'>
                <textarea
                  name='summary'
                  rows='3'
                  required
                  placeholder='Describe completed work and attach evidence when connected to storage'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                />
              </Field>
              <div className='flex justify-end gap-2'>
                <Button kind='secondary' onClick={() => setModal('')}>
                  Cancel
                </Button>
                <Button>Submit progress report</Button>
              </div>
            </form>
          ) : modal === 'inspection' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                let f = new FormData(e.currentTarget),
                  reported = Number(f.get('reported')),
                  verified = Number(f.get('verified'));
                setRecords((v) => [
                  {
                    id: `INS-${105 + v.length}`,
                    project: selected.name,
                    pid: selected.id,
                    reported,
                    verified,
                    gap: reported - verified,
                    quality: f.get('quality'),
                    date: '2083-08-14',
                    observation: f.get('observation'),
                  },
                  ...v,
                ]);
                setModal('');
                notify('Inspection recorded in local demo state');
              }}
              className='space-y-4'
            >
              <Field label='Project'>
                <select
                  defaultValue={selected.id}
                  onChange={(e) =>
                    setSelected(projects.find((p) => p.id === e.target.value))
                  }
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                >
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className='grid grid-cols-2 gap-3'>
                <Field label='Contractor reported progress (%)'>
                  <input
                    name='reported'
                    type='number'
                    min='0'
                    max='100'
                    defaultValue={selected.reported}
                    required
                    className='w-full rounded-lg border border-slate-200 px-3 py-2'
                  />
                </Field>
                <Field label='Department verified progress (%)'>
                  <input
                    name='verified'
                    type='number'
                    min='0'
                    max='100'
                    defaultValue={selected.verified}
                    required
                    className='w-full rounded-lg border border-slate-200 px-3 py-2'
                  />
                </Field>
              </div>
              <Field label='Quality assessment'>
                <select
                  name='quality'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                >
                  <option>Satisfactory</option>
                  <option>Needs improvement</option>
                  <option>Non-compliant</option>
                </select>
              </Field>
              <Field label='Site observation'>
                <textarea
                  name='observation'
                  required
                  rows='3'
                  className='w-full rounded-lg border border-slate-200 px-3 py-2'
                  placeholder='Record measured work, location, evidence and corrective action...'
                />
              </Field>
              <div className='flex justify-end gap-2'>
                <Button kind='secondary' onClick={() => setModal('')}>
                  Cancel
                </Button>
                <Button>Save inspection</Button>
              </div>
            </form>
          ) : (
            <div>
              <p className='mb-4 text-sm text-slate-600'>
                {modal === 'submission'
                  ? 'Review contractor evidence, reported progress, work stage and expenditure before recording an inspection.'
                  : 'Inspection records preserve the reported-versus-verified comparison and observation history.'}
              </p>
              <div className='rounded-lg bg-slate-50 p-4 text-sm'>
                <b>{selected.name}</b>
                <p className='mt-1 text-slate-500'>
                  Reported {selected.reported}% · Department verified{' '}
                  {selected.verified}% · Difference{' '}
                  {selected.reported - selected.verified} points
                </p>
              </div>
              <div className='mt-4 flex justify-end'>
                <Button onClick={() => setModal('inspection')}>
                  Proceed to inspection
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className='fixed bottom-5 right-5 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl'>
          {toast}
        </div>
      )}
    </div>
  );
}
