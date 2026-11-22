import crypto from 'crypto';
import CitizenSuggestion from '../models/CitizenSuggestion.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

const generateCode = () =>
  `SUG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const createSuggestion = async (user, input) => {
  // Only citizens may suggest projects
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('Only citizens can suggest projects', 403);
  }
  if (!user.wardId) {
    throw new AppError('Your account is not linked to a ward', 400);
  }

  try {
    return await CitizenSuggestion.create({
      code: generateCode(),
      citizenId: user._id,
      wardId: user.wardId,
      municipalityId: user.municipalityId,
      title: input.title,
      category: input.category,
      description: input.description,
    });
  } catch (err) {
    // Extremely unlikely code collision on the unique index
    if (err.code === 11000) {
      throw new AppError('Could not generate a reference, please retry', 409);
    }
    throw err;
  }
};

const listSuggestions = async (user) => {
  // Citizen: own; Ward Chair: their ward; CAO / General Admin: whole municipality
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
      filter = { municipalityId: user.municipalityId };
      break;
    default:
      throw new AppError('You are not allowed to view suggestions', 403);
  }

  return CitizenSuggestion.find(filter)
    .populate('citizenId', 'fullName')
    .populate('wardId', 'wardNumber name')
    .sort({ createdAt: -1 });
};

export default { createSuggestion, listSuggestions };
