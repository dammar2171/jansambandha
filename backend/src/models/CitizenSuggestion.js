import mongoose from 'mongoose';
import { SUGGESTION_STATUS } from '../constants/index.js';
export { SUGGESTION_STATUS };

const citizenSuggestionSchema = new mongoose.Schema(
  {
    // Short human-friendly reference shown to the citizen (e.g. SUG-AB12CD)
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Citizen who proposed the idea
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The citizen's ward (derived from their account, not the client)
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      index: true,
    },

    municipalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Municipality',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Why the project is needed
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: Object.values(SUGGESTION_STATUS),
      default: SUGGESTION_STATUS.SUBMITTED,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const CitizenSuggestion = mongoose.model(
  'CitizenSuggestion',
  citizenSuggestionSchema,
);

export default CitizenSuggestion;
