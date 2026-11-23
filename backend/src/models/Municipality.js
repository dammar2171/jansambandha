import mongoose from "mongoose";

const municipalitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Municipality name is required"],
      trim: true,
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

const Municipality = mongoose.model("Municipality", municipalitySchema);

export default Municipality;
