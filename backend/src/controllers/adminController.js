const User = require('../models/User');
const InsurancePlan = require('../models/InsurancePlan');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middlewares/asyncHandler');
const { OCR_STATUSES } = require('../services/ocrService');

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPlans,
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    pendingOcr,
    processingOcr,
    completedOcr,
    failedOcr
  ] = await Promise.all([
    User.countDocuments(),
    InsurancePlan.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: 'Pending' }),
    Application.countDocuments({ status: 'Approved' }),
    Application.countDocuments({ status: 'Rejected' }),
    Application.countDocuments({ ocrStatus: OCR_STATUSES.PENDING }),
    Application.countDocuments({ ocrStatus: OCR_STATUSES.PROCESSING }),
    Application.countDocuments({ ocrStatus: OCR_STATUSES.COMPLETED }),
    Application.countDocuments({ ocrStatus: OCR_STATUSES.FAILED })
  ]);

  const monthlyApplications = await Application.aggregate([
    {
      $group: {
        _id: { $month: '$submittedAt' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const planDistribution = await Application.aggregate([
    { $group: { _id: '$planId', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'insuranceplans',
        localField: '_id',
        foreignField: '_id',
        as: 'plan'
      }
    },
    { $unwind: '$plan' },
    { $project: { _id: 0, name: '$plan.planName', count: 1 } }
  ]);

  const recentAuditLogs = await AuditLog.find().populate('performedBy', 'name email role').sort({ timestamp: -1 }).limit(10);

  res.json({
    success: true,
    metrics: {
      totalUsers,
      totalPlans,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      pendingOcr,
      processingOcr,
      completedOcr,
      failedOcr
    },
    charts: {
      monthlyApplications,
      planDistribution,
      approvalRatio: [
        { name: 'Approved', value: approvedApplications },
        { name: 'Rejected', value: rejectedApplications },
        { name: 'Pending', value: pendingApplications }
      ]
    },
    recentAuditLogs
  });
});

module.exports = {
  getDashboard
};
