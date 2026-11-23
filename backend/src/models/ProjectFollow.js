import mongoose from 'mongoose';

const projectFollowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A user follows a project at most once
projectFollowSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectFollow = mongoose.model('ProjectFollow', projectFollowSchema);

export default ProjectFollow;
