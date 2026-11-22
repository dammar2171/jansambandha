import User from '../models/User.js';
import bcrypt from 'bcrypt';
import Ward from '../models/Ward.js';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken } from '../utils/jwt.js';
import { ROLES, ACCOUNT_STATUS, SALT_ROUNDS } from '../constants/index.js';

const registerCitizen = async (input) => {
  const { fullName, email, password, municipalityId, wardId } = input;

  // 1. Duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // 2. Ward must belong to the municipality
  const ward = await Ward.findOne({
    _id: wardId,
    municipalityId,
    isActive: true,
  });
  if (!ward) {
    throw new AppError('Ward does not belong to this municipality', 400);
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Create citizen. Role is forced here, never from the client.
  try {
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashedPassword,
      municipalityId,
      wardId,
      role: ROLES.CITIZEN,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });

    // 5. Return a safe user (no hash) plus a token so registration logs the citizen in
    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    const token = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    return { user: safeUser, token };
  } catch (err) {
    // Race condition: unique index on email
    if (err.code === 11000) {
      throw new AppError('Email already registered', 409);
    }
    throw err;
  }
};

const loginCitizen = async (input) => {
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

  // 3. This route is only for citizens
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('This login is for citizens only', 403);
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

const changePassword = async (userId, input) => {
  const { currentPassword, newPassword } = input;

  // 1. Load the user with the password hash (hidden by default)
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // 2. Verify the current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // 3. Hash and save the new password
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
};

export default { registerCitizen, loginCitizen, changePassword };
