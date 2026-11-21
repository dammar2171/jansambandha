/**
 * Database seed script.
 *
 * Fills every collection with example data and prints ready-to-use JWT tokens
 * (and the citizen login) so you can test the API in Postman immediately.
 *
 * Run:   npm run seed
 * Needs: MongoDB running at the URI from your .env (DATABASE_* / HOST).
 *
 * WARNING: this clears the seeded collections before inserting.
 */
import mongoose from 'mongoose';
import config from './config/config.js';
import { generateAccessToken } from './utils/jwt.js';

import User from './models/User.js';
import Ward from './models/Ward.js';
import Department from './models/Department.js';
import ProjectProposal from './models/ProjectProposal.js';
import Project from './models/Project.js';
import ProjectUpdate from './models/ProjectUpadates.js';
import ProjectInspection from './models/ProjectInspect.js';
import ProjectApproval from './models/ProjectApproval.js';
import ProjectFeedback from './models/ProjectFeedback.js';
import Complaint from './models/Complaints.js';
import AuditLog from './models/AuditLog.js';

import {
  ROLES,
  ACCOUNT_STATUS,
  PROPOSAL_STATUS,
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
  UPDATE_STATUS,
  QUALITY_STATUS,
  APPROVAL_ACTION,
  APPROVAL_DECISION,
  FEEDBACK_REACTION,
  MODERATION_STATUS,
  COMPLAINT_STATUS,
} from './constants/index.js';

const PLAIN_PASSWORD = 'Password@123';
const FISCAL_YEAR = '2081/82';

const oid = () => new mongoose.Types.ObjectId();
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// Pre-generated ids so every reference lines up regardless of insert order
const ids = {
  municipality: oid(),
  ward1: oid(),
  ward2: oid(),
  dept1: oid(),
  dept2: oid(),
  cao: oid(),
  generalAdmin: oid(),
  wardChair: oid(),
  deptUser: oid(),
  contractor: oid(),
  citizen: oid(),
  proposal1: oid(),
  proposal2: oid(),
  project1: oid(),
  update1: oid(),
  inspection1: oid(),
  approval1: oid(),
  feedback1: oid(),
  complaint1: oid(),
  audit1: oid(),
};

export async function buildSeedData() {
  const passwordHash = await User.hashPassword(PLAIN_PASSWORD);

  const municipality = {
    _id: ids.municipality,
    name: 'Kathmandu Metropolitan City',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const wards = [
    {
      _id: ids.ward1,
      name: 'Thamel',
      wardNumber: 1,
      municipalityId: ids.municipality,
      wardChairUserId: ids.wardChair,
      isActive: true,
    },
    {
      _id: ids.ward2,
      name: 'Baneshwor',
      wardNumber: 2,
      municipalityId: ids.municipality,
      wardChairUserId: null,
      isActive: true,
    },
  ];

  const departments = [
    {
      _id: ids.dept1,
      name: 'Infrastructure Department',
      municipalityId: ids.municipality,
      headUserId: ids.deptUser,
      isActive: true,
    },
    {
      _id: ids.dept2,
      name: 'Water Supply Department',
      municipalityId: ids.municipality,
      headUserId: null,
      isActive: true,
    },
  ];

  const users = [
    {
      _id: ids.cao,
      fullName: 'Chief Administrative Officer',
      email: 'cao@example.com',
      passwordHash,
      role: ROLES.CAO,
      municipalityId: ids.municipality,
      createdBy: ids.cao, // root account, self-referenced
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
    {
      _id: ids.generalAdmin,
      fullName: 'General Admin',
      email: 'generaladmin@example.com',
      passwordHash,
      role: ROLES.GENERAL_ADMIN,
      municipalityId: ids.municipality,
      createdBy: ids.cao,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
    {
      _id: ids.wardChair,
      fullName: 'Ward Chairperson',
      email: 'wardchair@example.com',
      passwordHash,
      role: ROLES.WARD_CHAIR,
      municipalityId: ids.municipality,
      wardId: ids.ward1,
      createdBy: ids.cao,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
    {
      _id: ids.deptUser,
      fullName: 'Department Officer',
      email: 'department@example.com',
      passwordHash,
      role: ROLES.DEPARTMENT,
      municipalityId: ids.municipality,
      departmentId: ids.dept1,
      createdBy: ids.cao,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
    {
      _id: ids.contractor,
      fullName: 'Contractor User',
      email: 'contractor@example.com',
      passwordHash,
      role: ROLES.CONTRACTOR,
      municipalityId: ids.municipality,
      createdBy: ids.cao,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
    {
      _id: ids.citizen,
      fullName: 'Citizen User',
      email: 'citizen@example.com',
      passwordHash,
      role: ROLES.CITIZEN,
      municipalityId: ids.municipality,
      wardId: ids.ward1,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    },
  ];

  const proposals = [
    {
      _id: ids.proposal1,
      title: 'Road Repair in Thamel',
      description: 'Resurfacing of the main road and pothole repairs.',
      wardId: ids.ward1,
      proposedBy: ids.wardChair,
      category: 'Infrastructure',
      location: 'Thamel Marg, Ward 1',
      estimatedBudget: 500000,
      fiscalYear: FISCAL_YEAR,
      justification: 'The road is heavily damaged and unsafe for commuters.',
      status: PROPOSAL_STATUS.SUBMITTED,
      submittedAt: new Date(),
    },
    {
      _id: ids.proposal2,
      title: 'Drinking Water Pipeline',
      description: 'New pipeline to serve households in Ward 2.',
      wardId: ids.ward2,
      proposedBy: ids.citizen,
      category: 'Water Supply',
      location: 'Baneshwor, Ward 2',
      estimatedBudget: 1200000,
      fiscalYear: FISCAL_YEAR,
      justification: 'Several households currently lack a reliable water supply.',
      status: PROPOSAL_STATUS.UNDER_REVIEW,
      submittedAt: new Date(),
    },
  ];

  const projects = [
    {
      _id: ids.project1,
      proposalId: ids.proposal1,
      title: 'Road Repair in Thamel',
      description: 'Approved road resurfacing project.',
      wardId: ids.ward1,
      municipalityId: ids.municipality,
      fiscalYear: FISCAL_YEAR,
      approvedBudget: 480000,
      contractorId: ids.contractor,
      departmentId: ids.dept1,
      startDate: new Date(),
      endDate: daysFromNow(90),
      status: PROJECT_STATUS.ONGOING,
      visibility: PROJECT_VISIBILITY.PUBLIC,
    },
  ];

  const updates = [
    {
      _id: ids.update1,
      projectId: ids.project1,
      contractorId: ids.contractor,
      reportedProgress: 40,
      workDescription: 'Completed base layer and 40% of resurfacing.',
      evidenceUrls: ['https://example.com/evidence/road-1.jpg'],
      periodFrom: daysFromNow(-30),
      periodTo: new Date(),
      status: UPDATE_STATUS.SUBMITTED,
    },
  ];

  const inspections = [
    {
      _id: ids.inspection1,
      projectId: ids.project1,
      progressUpdateId: ids.update1,
      departmentId: ids.dept1,
      inspectorId: ids.deptUser,
      verifiedProgress: 38,
      qualityStatus: QUALITY_STATUS.PASS,
      observations: 'Work matches the reported progress and meets quality standards.',
      evidenceUrls: ['https://example.com/evidence/inspection-1.jpg'],
      inspectionDate: new Date(),
    },
  ];

  const approvals = [
    {
      _id: ids.approval1,
      proposalId: ids.proposal1,
      action: APPROVAL_ACTION.ASSEMBLY_DECISION,
      decision: APPROVAL_DECISION.APPROVED,
      actorUserId: ids.wardChair,
      authorityBasis: 'Ward Assembly Meeting 2081-04-01',
      remarks: 'Approved unanimously by the ward assembly.',
      decisionDate: new Date(),
    },
  ];

  const feedback = [
    {
      _id: ids.feedback1,
      projectId: ids.project1,
      userId: ids.citizen,
      reaction: FEEDBACK_REACTION.LIKE,
      comment: 'Great to see this road finally getting fixed!',
      moderationStatus: MODERATION_STATUS.VISIBLE,
    },
  ];

  const complaints = [
    {
      _id: ids.complaint1,
      trackingCode: 'CMP-2081-0001',
      citizenId: ids.citizen,
      wardId: ids.ward1,
      title: 'Streetlight not working',
      description: 'The streetlight near Thamel Marg has been off for a week.',
      category: 'Electricity',
      location: 'Thamel Marg, Ward 1',
      status: COMPLAINT_STATUS.SUBMITTED,
      assignedTo: null,
      responses: [],
    },
  ];

  const auditLogs = [
    {
      _id: ids.audit1,
      actorUserId: ids.cao,
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: ids.contractor,
      before: null,
      after: { email: 'contractor@example.com', role: ROLES.CONTRACTOR },
    },
  ];

  return {
    municipality,
    wards,
    departments,
    users,
    proposals,
    projects,
    updates,
    inspections,
    approvals,
    feedback,
    complaints,
    auditLogs,
  };
}

const printPostmanGuide = (users) => {
  const line = '='.repeat(60);
  console.log(`\n${line}`);
  console.log('POSTMAN TEST CREDENTIALS');
  console.log(line);
  console.log('Base URL: http://localhost:5000/api/v1\n');

  console.log('Citizen login  ->  POST /auth/login');
  console.log(
    `  body: { "email": "citizen@example.com", "password": "${PLAIN_PASSWORD}" }\n`,
  );

  console.log('Bearer tokens (valid 7 days)');
  console.log('  header: Authorization: Bearer <token>\n');
  for (const u of users) {
    const token = generateAccessToken(
      { id: u._id.toString(), role: u.role },
      60 * 60 * 24 * 7,
    );
    console.log(`  ${u.role.padEnd(13)} ${u.email}`);
    console.log(`  ${token}\n`);
  }
  console.log(line);
};

async function run() {
  const uri = `mongodb://${config.host}:${config.database_port}/${config.database_name}`;
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const data = await buildSeedData();

  // Clear existing data for a clean, repeatable seed
  await Promise.all([
    User.deleteMany({}),
    Ward.deleteMany({}),
    Department.deleteMany({}),
    ProjectProposal.deleteMany({}),
    Project.deleteMany({}),
    ProjectUpdate.deleteMany({}),
    ProjectInspection.deleteMany({}),
    ProjectApproval.deleteMany({}),
    ProjectFeedback.deleteMany({}),
    Complaint.deleteMany({}),
    AuditLog.deleteMany({}),
    mongoose.connection.collection('municipalities').deleteMany({}),
  ]);

  // Insert in dependency order
  await mongoose.connection
    .collection('municipalities')
    .insertOne(data.municipality);
  await Ward.create(data.wards);
  await Department.create(data.departments);
  await User.create(data.users);
  await ProjectProposal.create(data.proposals);
  await Project.create(data.projects);
  await ProjectUpdate.create(data.updates);
  await ProjectInspection.create(data.inspections);
  await ProjectApproval.create(data.approvals);
  await ProjectFeedback.create(data.feedback);
  await Complaint.create(data.complaints);
  await AuditLog.create(data.auditLogs);

  console.log('Inserted:');
  console.log(`  municipalities    1`);
  console.log(`  wards             ${data.wards.length}`);
  console.log(`  departments       ${data.departments.length}`);
  console.log(`  users             ${data.users.length}`);
  console.log(`  projectproposals  ${data.proposals.length}`);
  console.log(`  projects          ${data.projects.length}`);
  console.log(`  projectupdates    ${data.updates.length}`);
  console.log(`  projectinspections ${data.inspections.length}`);
  console.log(`  projectapprovals  ${data.approvals.length}`);
  console.log(`  projectfeedbacks  ${data.feedback.length}`);
  console.log(`  complaints        ${data.complaints.length}`);
  console.log(`  auditlogs         ${data.auditLogs.length}`);

  printPostmanGuide(data.users);

  await mongoose.disconnect();
}

// Run only when executed directly (not when imported for tests)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/seed.js')) {
  run()
    .then(() => {
      console.log('\nSeed complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nSeed failed:', err);
      process.exit(1);
    });
}
