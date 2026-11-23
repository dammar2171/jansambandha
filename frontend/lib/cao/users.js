// Map a backend user into the shape the CAO user directory expects.

const ROLE_LABEL = {
  citizen: 'Citizen',
  ward: 'Ward Chair',
  department: 'Department',
  generalAdmin: 'General Admin',
  cao: 'CAO',
  contractor: 'Contractor',
};

const STATUS_LABEL = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const scopeOf = (u) => {
  if (u.role === 'ward' || u.role === 'citizen') {
    return u.wardId?.wardNumber != null
      ? `Ward ${u.wardId.wardNumber}`
      : 'Ward';
  }
  if (u.role === 'department') return u.departmentId?.name ?? 'Department';
  if (u.role === 'contractor') return 'Assigned projects';
  return 'Municipality';
};

// Roles the CAO can create (citizens self-register) and their backend values.
export const OFFICIAL_ROLES = [
  'Ward Chair',
  'Department',
  'General Admin',
  'CAO',
  'Contractor',
];

export const roleToBackend = {
  'Ward Chair': 'ward',
  Department: 'department',
  'General Admin': 'generalAdmin',
  CAO: 'cao',
  Contractor: 'contractor',
};

export function mapUser(u) {
  return {
    id: u._id,
    name: u.fullName,
    email: u.email,
    role: ROLE_LABEL[u.role] ?? u.role,
    scope: scopeOf(u),
    status: STATUS_LABEL[u.accountStatus] ?? u.accountStatus,
    last: '\u2014',
  };
}
