// server/src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS, ROLES } from '../constants/index.js';
import { isValidFullName } from '../helper/validate.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
      validate: {
        validator: isValidFullName,
        message: 'Invalid full name',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    // Never returned by default. Use .select("+passwordHash") on login only.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.CITIZEN,
      index: true,
    },
    municipalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Municipality',
      required: true,
      index: true,
    },
    // Required for CITIZEN and WARD_CHAIR
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      index: true,
    },
    // Required for DEPARTMENT users
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    // Official who created the account. Empty only for self-registered citizens.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Role-based scope rules (backend-enforced data integrity)
userSchema.pre('validate', function () {
  if ([ROLES.CITIZEN, ROLES.WARD_CHAIR].includes(this.role) && !this.wardId) {
    this.invalidate('wardId', 'wardId is required for CITIZEN and WARD_CHAIR');
  }
  if (this.role === ROLES.DEPARTMENT && !this.departmentId) {
    this.invalidate(
      'departmentId',
      'departmentId is required for DEPARTMENT users',
    );
  }
  if (this.role !== ROLES.CITIZEN && !this.createdBy) {
    this.invalidate(
      'createdBy',
      'createdBy is required for non-citizen accounts',
    );
  }
});

// Helpers
userSchema.statics.hashPassword = function (plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

userSchema.methods.comparePassword = function (plainPassword) {
  // Document must be loaded with .select("+passwordHash")
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.isActive = function () {
  return this.accountStatus === ACCOUNT_STATUS.ACTIVE;
};

const User = mongoose.model('User', userSchema);
export default User;
