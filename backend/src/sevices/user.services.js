import User from '../models/User.js';
import Ward from '../models/Ward.js';
import Department from '../models/Department.js';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError.js';
import {
  ROLES,
  ACCOUNT_STATUS,
  SALT_ROUNDS,
  MONGODB_OBJECT_ID_REGEX,
} from '../constants/index.js';

// Only these roles may manage (list/create) user accounts
const USER_ADMIN_ROLES = [ROLES.CAO, ROLES.GENERAL_ADMIN];

const listUsers = async (currentUser, query) => {
  // 1. Only CAO and General Admin can list users
  if (!USER_ADMIN_ROLES.includes(currentUser.role)) {
    throw new AppError('You are not allowed to view users', 403);
  }

  // 2. Scope to the admin's own municipality
  const filter = { municipalityId: currentUser.municipalityId };

  // 3. Optional filters
  if (query.role) {
    if (!Object.values(ROLES).includes(query.role)) {
      throw new AppError('Invalid role', 400);
    }
    filter.role = query.role;
  }

  if (query.status) {
    if (!Object.values(ACCOUNT_STATUS).includes(query.status)) {
      throw new AppError('Invalid account status', 400);
    }
    filter.accountStatus = query.status;
  }

  if (query.wardId) {
    if (!MONGODB_OBJECT_ID_REGEX.test(query.wardId)) {
      throw new AppError('Invalid ward ID', 400);
    }
    filter.wardId = query.wardId;
  }

  if (query.departmentId) {
    if (!MONGODB_OBJECT_ID_REGEX.test(query.departmentId)) {
      throw new AppError('Invalid department ID', 400);
    }
    filter.departmentId = query.departmentId;
  }

  // 4. passwordHash is select:false, so it is never returned
  return User.find(filter).sort({ createdAt: -1 });
};

const createOfficialUser = async (currentUser, input) => {
  const { fullName, email, password, role, wardId, departmentId } = input;

  // 1. Only CAO and General Admin can create accounts
  if (!USER_ADMIN_ROLES.includes(currentUser.role)) {
    throw new AppError('You are not allowed to create accounts', 403);
  }

  // Municipality and creator always come from the authenticated admin
  const municipalityId = currentUser.municipalityId;

  // 2. Email must be unique
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // 3. A ward chair's ward must exist in this municipality
  if (role === ROLES.WARD_CHAIR) {
    const ward = await Ward.findOne({
      _id: wardId,
      municipalityId,
      isActive: true,
    });
    if (!ward) {
      throw new AppError('Ward does not belong to this municipality', 400);
    }
  }

  // 4. A department user's department must exist in this municipality
  if (role === ROLES.DEPARTMENT) {
    const department = await Department.findOne({
      _id: departmentId,
      municipalityId,
      isActive: true,
    });
    if (!department) {
      throw new AppError(
        'Department does not belong to this municipality',
        400,
      );
    }
  }

  // 5. Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 6. Create the account. municipalityId and createdBy are set by the server.
  try {
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      municipalityId,
      wardId,
      departmentId,
      createdBy: currentUser._id,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });

    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    return safeUser;
  } catch (err) {
    // Race condition on the unique email index
    if (err.code === 11000) {
      throw new AppError('Email already registered', 409);
    }
    throw err;
  }
};

const updateUserStatus = async (currentUser, targetUserId, accountStatus) => {
  // 1. Only CAO and General Admin can change account status
  if (!USER_ADMIN_ROLES.includes(currentUser.role)) {
    throw new AppError('You are not allowed to update accounts', 403);
  }

  // 2. Admins cannot change their own status (avoids self lock-out)
  if (currentUser._id.equals(targetUserId)) {
    throw new AppError('You cannot change your own account status', 400);
  }

  // 3. Update the target user, scoped to the admin's own municipality
  const user = await User.findOneAndUpdate(
    { _id: targetUserId, municipalityId: currentUser.municipalityId },
    { accountStatus },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // passwordHash is select:false, so it is never returned
  return user;
};

export default { listUsers, createOfficialUser, updateUserStatus };
