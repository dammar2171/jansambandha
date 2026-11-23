import User from '../models/User.js';
import Ward from '../models/Ward.js';
import Department from '../models/Department.js';
import bcrypt from 'bcrypt';
import auditLogServices from './auditLog.services.js';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken } from '../utils/jwt.js';
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
  return User.find(filter)
    .populate('wardId', 'wardNumber name')
    .populate('departmentId', 'name')
    .sort({ createdAt: -1 });
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

    await auditLogServices.recordAudit({
      actorUserId: currentUser._id,
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user._id,
      after: { email: user.email, role: user.role },
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

  // 3. Capture the previous status for the audit trail
  const prev = await User.findOne({
    _id: targetUserId,
    municipalityId: currentUser.municipalityId,
  }).select('accountStatus');

  // 4. Update the target user, scoped to the admin's own municipality
  const user = await User.findOneAndUpdate(
    { _id: targetUserId, municipalityId: currentUser.municipalityId },
    { accountStatus },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await auditLogServices.recordAudit({
    actorUserId: currentUser._id,
    action: 'UPDATE_USER_STATUS',
    entityType: 'User',
    entityId: user._id,
    before: prev ? { accountStatus: prev.accountStatus } : null,
    after: { accountStatus },
  });

  // passwordHash is select:false, so it is never returned
  return user;
};

const loginOfficial = async (input) => {
  const { email, password } = input;

  // 1. Find the user. passwordHash is hidden by default, so select it.
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Check the password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. This login is for officials and contractors, not citizens
  if (user.role === ROLES.CITIZEN) {
    throw new AppError('This login is for officials only', 403);
  }

  // 4. Account must be active
  if (!user.isActive()) {
    throw new AppError('Account is not active', 403);
  }

  // 5. Issue a token
  const token = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

  // 6. Return a safe user (no password hash) and the token
  const safeUser = user.toObject();
  delete safeUser.passwordHash;
  return { user: safeUser, token };
};

export default {
  listUsers,
  createOfficialUser,
  updateUserStatus,
  loginOfficial,
};
