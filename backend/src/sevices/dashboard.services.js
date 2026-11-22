import Project from '../models/Project.js';
import ProjectProposal from '../models/ProjectProposal.js';
import Complaint from '../models/Complaints.js';
import ProjectFeedback from '../models/ProjectFeedback.js';
import ProjectUpdate from '../models/ProjectUpadates.js';
import { PROJECT_VISIBILITY, UPDATE_STATUS } from '../constants/index.js';

// Returns { STATUS: count } for a model, optionally filtered
const countByStatus = async (Model, match = {}) => {
  const rows = await Model.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});
};

const citizenDashboard = async (user) => {
  const [complaintCount, recentComplaints, publicProjects, feedbackCount] =
    await Promise.all([
      Complaint.countDocuments({ citizenId: user._id }),
      Complaint.find({ citizenId: user._id }).sort({ createdAt: -1 }).limit(5),
      Project.countDocuments({ visibility: PROJECT_VISIBILITY.PUBLIC }),
      ProjectFeedback.countDocuments({ userId: user._id }),
    ]);

  return {
    complaints: { total: complaintCount, recent: recentComplaints },
    publicProjects,
    myFeedback: feedbackCount,
  };
};

const wardDashboard = async (user) => {
  const wardId = user.wardId;
  const [proposals, complaints, projects] = await Promise.all([
    countByStatus(ProjectProposal, { wardId }),
    countByStatus(Complaint, { wardId }),
    Project.countDocuments({ wardId }),
  ]);

  return {
    proposals: { byStatus: proposals },
    complaints: { byStatus: complaints },
    projects: { total: projects },
  };
};

const departmentDashboard = async (user) => {
  const departmentId = user.departmentId;
  const projectIds = await Project.find({ departmentId }).distinct('_id');
  const [assignedProjects, pendingVerifications] = await Promise.all([
    Project.countDocuments({ departmentId }),
    ProjectUpdate.countDocuments({
      projectId: { $in: projectIds },
      status: UPDATE_STATUS.SUBMITTED,
    }),
  ]);

  return { assignedProjects, pendingVerifications };
};

const adminDashboard = async () => {
  const [projects, complaints, proposals] = await Promise.all([
    countByStatus(Project),
    countByStatus(Complaint),
    countByStatus(ProjectProposal),
  ]);

  return {
    projects: { byStatus: projects },
    complaints: { byStatus: complaints },
    proposals: { byStatus: proposals },
  };
};

const caoDashboard = async () => {
  const [proposals, projects, complaints] = await Promise.all([
    countByStatus(ProjectProposal),
    countByStatus(Project),
    Complaint.countDocuments(),
  ]);

  return {
    proposals: { byStatus: proposals },
    projects: { byStatus: projects },
    complaints: { total: complaints },
  };
};

const contractorDashboard = async (user) => {
  const [assignedProjects, updates] = await Promise.all([
    countByStatus(Project, { contractorId: user._id }),
    countByStatus(ProjectUpdate, { contractorId: user._id }),
  ]);

  return {
    assignedProjects: { byStatus: assignedProjects },
    progressUpdates: { byStatus: updates },
  };
};

export default {
  citizenDashboard,
  wardDashboard,
  departmentDashboard,
  adminDashboard,
  caoDashboard,
  contractorDashboard,
};
