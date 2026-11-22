import Department from '../models/Department.js';

// Active departments, used for lookups and filtering
const listDepartments = async () => {
  return Department.find({ isActive: true }).sort({ name: 1 });
};

export default { listDepartments };
