import auditLogServices from '../sevices/auditLog.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// CAO / General Admin: read the municipal audit trail
const listAuditLogs = asyncHandler(async (req, res) => {
  const data = await auditLogServices.listAuditLogs(req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Audit logs fetched successfully', data));
});

export default { listAuditLogs };
