import Ward from '../models/Ward.js';

// Active wards, used for registration dropdowns and ward filtering
const listWards = async () => {
  return Ward.find({ isActive: true }).sort({ wardNumber: 1 });
};

export default { listWards };
