
import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ward name is required"],
      trim: true,
    },

    wardNumber: {
      type: Number,
      required: [true, "Ward number is required"],
      min: 1,
    },

    municipalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipality",
      required: true,
      index: true,
    },

    wardChairUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ward numbers must be unique within a municipality
wardSchema.index(
  { municipalityId: 1, wardNumber: 1 },
  { unique: true }
);

const Ward = mongoose.model("Ward", wardSchema);

export default Ward;
