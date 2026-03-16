/**
 * Contact form route
 * POST /api/contact
 *
 * Accepts the contact-page form submission, validates it, and logs it.
 * When an email provider (Nodemailer / SendGrid) is configured, the
 * console.log calls below can be replaced with actual email dispatch.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const contactValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Message must be at least 20 characters'),
];

router.post('/', contactValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details: errors.array() },
    });
  }

  const { firstName, lastName, email, phone, subject, message } = req.body;

  // Log the enquiry — replace with email/CRM integration when ready
  console.log('[Contact Form]', {
    from: `${firstName} ${lastName} <${email}>`,
    phone: phone || 'not provided',
    subject,
    message,
    receivedAt: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    data: { message: "Thank you for reaching out. We'll get back to you within 24 hours." },
  });
});

module.exports = router;
