// roles constants
export const CITIZEN_ROLE = "citizen";
export const CITZEN_ROLE = CITIZEN_ROLE;
export const WARD_ROLE = "ward";
export const CONTRACTOR_ROLE = "contractor";
export const DEPARTMENT_ROLE = "department";
export const GENERAL_ADMIN_ROLE = "generalAdmin";
export const CAO_ROLE = "cao";

export const ROLES = Object.freeze({
  CITIZEN: CITIZEN_ROLE,
  WARD_CHAIR: WARD_ROLE,
  CONTRACTOR: CONTRACTOR_ROLE,
  DEPARTMENT: DEPARTMENT_ROLE,
  GENERAL_ADMIN: GENERAL_ADMIN_ROLE,
  CAO: CAO_ROLE,
});


// project related constants
export const PROPOSAL_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  RETURNED: "RETURNED",
  REJECTED: "REJECTED",
  ASSEMBLY_APPROVED: "ASSEMBLY_APPROVED",
  ADMIN_APPROVED: "ADMIN_APPROVED",
});


// account related constants
export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
});