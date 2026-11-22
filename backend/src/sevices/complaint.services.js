import crypto from 'crypto';
import Complaint from '../models/Complaints.js';
import Ward from '../models/Ward.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

const generateTrackingCode = () =>
  `CMP-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

const createComplaint = async (user, input) => {
  // 1. Only citizens can submit complaints
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('Only citizens can submit complaints', 403);
  }

  // 2. The selected ward must be active and in the citizen's municipality
  const ward = await Ward.findOne({
    _id: input.wardId,
    municipalityId: user.municipalityId,
    isActive: true,
  });
  if (!ward) {
    throw new AppError('Ward does not belong to your municipality', 400);
  }

  // 3. Create the complaint (status defaults to SUBMITTED)
  try {
    return await Complaint.create({
      trackingCode: generateTrackingCode(),
      citizenId: user._id,
      wardId: input.wardId,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(
        'Could not generate a tracking code, please retry',
        409,
      );
    }
    throw err;
  }
};

const listComplaints = async (user) => {
  // Citizen: own; Ward Chair: their ward; CAO / General Admin: all
  let filter;
  switch (user.role) {
    case ROLES.CITIZEN:
      filter = { citizenId: user._id };
      break;
    case ROLES.WARD_CHAIR:
      filter = { wardId: user.wardId };
      break;
    case ROLES.CAO:
    case ROLES.GENERAL_ADMIN:
      filter = {};
      break;
    default:
      throw new AppError('You are not allowed to view complaints', 403);
  }
  return Complaint.find(filter)
    .populate('citizenId', 'fullName')
    .sort({ createdAt: -1 });
};

// Who may view a complaint: owner citizen, responsible ward chair, CAO / General Admin
const canViewComplaint = (user, complaint) => {
  switch (user.role) {
    case ROLES.CAO:
    case ROLES.GENERAL_ADMIN:
      return true;
    case ROLES.WARD_CHAIR:
      return String(complaint.wardId) === String(user.wardId);
    case ROLES.CITIZEN:
      return String(complaint.citizenId) === String(user._id);
    default:
      return false;
  }
};

// Who may manage (update/respond to) a complaint: responsible ward chair, CAO / General Admin
const canManageComplaint = (user, complaint) => {
  if ([ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    return true;
  }
  if (user.role === ROLES.WARD_CHAIR) {
    return String(complaint.wardId) === String(user.wardId);
  }
  return false;
};

const getComplaintById = async (user, id) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }
  if (!canViewComplaint(user, complaint)) {
    throw new AppError('You are not allowed to view this complaint', 403);
  }
  return complaint;
};

const updateComplaintStatus = async (user, id, updates) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }
  if (!canManageComplaint(user, complaint)) {
    throw new AppError('You are not allowed to update this complaint', 403);
  }

  // status and/or assignedTo, already validated by the schema
  Object.assign(complaint, updates);
  await complaint.save();
  return complaint;
};

const addComplaintResponse = async (user, id, message) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }
  if (!canManageComplaint(user, complaint)) {
    throw new AppError('You are not allowed to respond to this complaint', 403);
  }

  complaint.responses.push({ authorId: user._id, message });
  await complaint.save();
  return complaint;
};

export default {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComplaintResponse,
};
