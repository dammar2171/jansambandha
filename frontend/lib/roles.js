export const ROLES = [
  {
    id: 'citizen',
    label: 'Citizen',
    hint: 'View & give feedback',
    icon: 'user',
    home: '/citizen',
    demoName: 'Ram Sharma',
  },
  {
    id: 'ward-chair',
    label: 'Ward Chair',
    hint: 'Propose projects',
    icon: 'pin',
    home: '/ward-chair',
    demoName: 'Ward 4 Chairperson',
  },
  {
    id: 'department',
    label: 'Department',
    hint: 'Inspect & verify',
    icon: 'clip',
    home: '/department',
    demoName: 'Water Supply Department',
  },
  {
    id: 'general-admin',
    label: 'General Admin',
    hint: 'Review & delegate',
    icon: 'file',
    home: '/general-admin',
    demoName: 'General Admin',
  },
  {
    id: 'cao',
    label: 'CAO',
    hint: 'Approve & manage',
    icon: 'shield',
    home: '/cao',
    demoName: 'Chief Administrative Officer',
  },
  {
    id: 'contractor',
    label: 'Contractor',
    hint: 'Report progress',
    icon: 'upload',
    home: '/contractor',
    demoName: 'Contractor',
  },
];

export const getRole = (id) => ROLES.find((r) => r.id === id);

// Backend role values -> frontend role ids used for navigation/session
const BACKEND_ROLE_TO_ID = {
  citizen: 'citizen',
  ward: 'ward-chair',
  department: 'department',
  generalAdmin: 'general-admin',
  cao: 'cao',
  contractor: 'contractor',
};

export const roleIdFromBackend = (role) =>
  BACKEND_ROLE_TO_ID[role] ?? 'citizen';
