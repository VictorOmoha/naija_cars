const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const router = express.Router();
// Mounted behind the administrator authentication and role checks.
router.get('/', (req, res) => res.json({ success: true, data: {
  environment: process.env.NODE_ENV || 'development',
  siteName: 'NaijaCars',
  emailConfigured: Boolean((process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.SENDGRID_API_KEY),
  paymentsConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
  supportStorage: 'Database inbox',
} }));
router.get('/inquiries', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const where = req.query.resolved === 'true' ? { resolved: true } : { resolved: false };
    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20, skip: (page - 1) * 20 }),
      prisma.contactInquiry.count({ where }),
    ]);
    res.json({ success: true, data: { inquiries, pagination: { page, total, pages: Math.ceil(total / 20) } } });
  } catch (error) { next(error); }
});
router.patch('/inquiries/:id', body('resolved').isBoolean({ strict: true }), async (req, res, next) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ success: false, error: { message: 'Resolved must be a boolean.' } });
  try {
    const inquiry = await prisma.contactInquiry.update({ where: { id: req.params.id }, data: { resolved: req.body.resolved } });
    res.json({ success: true, data: { inquiry } });
  } catch (error) { next(error); }
});
module.exports = router;
