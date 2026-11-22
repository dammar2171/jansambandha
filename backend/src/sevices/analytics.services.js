import Project from '../models/Project.js';
import ProjectProposal from '../models/ProjectProposal.js';
import Complaint from '../models/Complaints.js';
import Ward from '../models/Ward.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

const ANALYTICS_ROLES = [ROLES.CAO, ROLES.GENERAL_ADMIN];

const assertAnalyticsAccess = (user) => {
  if (!ANALYTICS_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view analytics', 403);
  }
};

// Returns { STATUS: count } for a model
const countByStatus = async (Model) => {
  const rows = await Model.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});
};

const municipalityAnalytics = async (user) => {
  assertAnalyticsAccess(user);

  const [
    projectsByStatus,
    proposalsByStatus,
    complaintsByStatus,
    projectTotal,
    proposalTotal,
    complaintTotal,
  ] = await Promise.all([
    countByStatus(Project),
    countByStatus(ProjectProposal),
    countByStatus(Complaint),
    Project.countDocuments(),
    ProjectProposal.countDocuments(),
    Complaint.countDocuments(),
  ]);

  return {
    projects: { total: projectTotal, byStatus: projectsByStatus },
    proposals: { total: proposalTotal, byStatus: proposalsByStatus },
    complaints: { total: complaintTotal, byStatus: complaintsByStatus },
  };
};

const wardAnalytics = async (user) => {
  assertAnalyticsAccess(user);

  const wards = await Ward.find({
    municipalityId: user.municipalityId,
    isActive: true,
  }).sort({ wardNumber: 1 });

  return Promise.all(
    wards.map(async (ward) => {
      const [proposals, projects, complaints] = await Promise.all([
        ProjectProposal.countDocuments({ wardId: ward._id }),
        Project.countDocuments({ wardId: ward._id }),
        Complaint.countDocuments({ wardId: ward._id }),
      ]);
      return {
        wardId: ward._id,
        wardName: ward.name,
        wardNumber: ward.wardNumber,
        proposals,
        projects,
        complaints,
      };
    }),
  );
};

export default { municipalityAnalytics, wardAnalytics };
