import User from '../models/User.js'
import bcrypt from "bcrypt";
import Ward from "../models/Ward.js";
import { AppError } from "../utils/AppError.js";
import { ROLES, ACCOUNT_STATUS } from "../helper/constants.js";

const SALT_ROUNDS = 12;

const registerCitizen = async (input) => {
  const { fullName, email, password, municipalityId, wardId } = input;

  // 1. Duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  // 2. Ward must belong to the municipality
  const ward = await Ward.findOne({
    _id: wardId,
    municipalityId,
    isActive: true,
  });
  if (!ward) {
    throw new AppError("Ward does not belong to this municipality", 400);
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

    // 5. Return safe object (no password hash)
    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    return safeUser;
  } catch (err) {
    // Race condition: unique index on email
    if (err.code === 11000) {
      throw new AppError("Email already registered", 409);
    }
    throw err;
  }
};

export default { registerCitizen };