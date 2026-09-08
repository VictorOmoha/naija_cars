const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const router = express.Router();
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { message: 'Too many enquiries. Please try again in a few minutes.' } } }));
router.post('/', [
  body('firstName').isString().bail().trim().isLength({ min: 1, max: 80 }),
  body('lastName').isString().bail().trim().isLength({ min: 1, max: 80 }),
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).isString().bail().isLength({ max: 30 }),
  body('subject').isString().bail().trim().isLength({ min: 1, max: 150 }),
  body('message').isString().bail().trim().isLength({ min: 20, max: 5000 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: { message: 'Please check your contact details and enter a message of 20–5,000 characters.', details: errors.array() } });
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;
    const inquiry = await prisma.contactInquiry.create({ data: { firstName, lastName, email, phone: phone || null, subject, message } });
    res.status(201).json({ success: true, data: { reference: inquiry.id, message: 'Your enquiry has been saved for our support team.' } });
  } catch (error) { next(error); }
});
module.exports = router;
