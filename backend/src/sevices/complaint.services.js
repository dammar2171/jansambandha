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
      throw new AppError('Could not generate a tracking code, please retry', 409);
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
  return Complaint.find(filter).sort({ createdAt: -1 });
};

export default { createComplaint, listComplaints };
