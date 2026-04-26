const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const paystackService = require('../services/paystackService');
const { sendSubscriptionEmail } = require('../lib/emailService');
const PLANS = require('../config/subscriptionPlans');

const router = express.Router();

/**
 * @route   GET /api/subscriptions/plans
 * @desc    List available subscription plans
 * @access  Public
 */
router.get('/plans', (req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    price: plan.priceDisplay,
    listingsLimit: plan.listingsLimit,
    features: plan.features,
  }));

  res.json({ success: true, data: { plans } });
});

/**
 * @route   GET /api/subscriptions/me
 * @desc    Get current user's active subscription
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        isActive: true,
        endDate: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.json({ success: true, data: { subscription: null } });
    }

    const plan = PLANS[subscription.planType];
    res.json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          planType: subscription.planType,
          planName: plan?.name || subscription.planType,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          listingsUsed: subscription.listingsUsed,
          listingsLimit: subscription.listingsLimit,
          listingsRemaining:
            subscription.listingsLimit === -1
              ? -1
              : subscription.listingsLimit - subscription.listingsUsed,
          autoRenew: subscription.autoRenew,
          cancelledAt: subscription.cancelledAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/subscriptions/initialize
 * @desc    Initialize a Paystack transaction for a subscription
 * @access  Private
 */
router.post(
  '/initialize',
  authenticate,
  [
    body('planType')
      .isIn(['BASIC', 'PRO', 'PREMIUM'])
      .withMessage('Invalid plan type'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() },
        });
      }

      const { planType } = req.body;
      const plan = PLANS[planType];

      if (!plan) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid plan type' },
        });
      }

      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { email: true },
      });

      const callbackUrl = `${process.env.CLIENT_URL}/subscription/callback`;

      const result = await paystackService.initializeTransaction({
        email: user.email,
        amount: plan.price,
        callbackUrl,
        metadata: {
          userId: req.user.id,
          planType,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: plan.name },
          ],
        },
      });

      res.json({
        success: true,
        data: {
          authorizationUrl: result.authorization_url,
          reference: result.reference,
          accessCode: result.access_code,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/subscriptions/verify
 * @desc    Verify a Paystack transaction and activate subscription
 * @access  Private
 */
router.get(
  '/verify',
  authenticate,
  [query('reference').notEmpty().withMessage('Reference is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', details: errors.array() },
        });
      }

      const { reference } = req.query;

      // Idempotency check
      const existingEvent = await prisma.paystackEvent.findUnique({
        where: { eventId: reference },
      });
      if (existingEvent?.processed) {
        // Already processed — return existing subscription
        const subscription = await prisma.subscription.findFirst({
          where: { paymentReference: reference },
        });
        return res.json({
          success: true,
          message: 'Subscription already activated',
          data: { subscription },
        });
      }

      // Verify with Paystack
      const txn = await paystackService.verifyTransaction(reference);

      if (txn.status !== 'success') {
        return res.status(400).json({
          success: false,
          error: { message: `Payment not successful. Status: ${txn.status}` },
        });
      }

      const { userId, planType } = txn.metadata || {};

      if (!userId || !planType) {
        return res.status(400).json({
          success: false,
          error: { message: 'Transaction metadata is missing or malformed' },
        });
      }

      // Security: ensure the transaction belongs to the authenticated user
      if (userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Transaction does not belong to this user' },
        });
      }

      const plan = PLANS[planType];
      if (!plan) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid plan in transaction metadata' },
        });
      }

      // Create subscription in a transaction
      const subscription = await prisma.$transaction(async (tx) => {
        // Deactivate any existing active subscriptions for this user
        await tx.subscription.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        });

        // Create new subscription (30 days)
        const newSub = await tx.subscription.create({
          data: {
            userId,
            planType,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            amountPaid: txn.amount / 100, // kobo to naira
            paymentReference: reference,
            paystackRef: txn.reference,
            listingsUsed: 0,
            listingsLimit: plan.listingsLimit,
          },
        });

        // Log event for idempotency
        await tx.paystackEvent.upsert({
          where: { eventId: reference },
          update: { processed: true },
          create: {
            eventId: reference,
            eventType: 'transaction.verify',
            processed: true,
            payload: JSON.stringify({ planType, amount: txn.amount }),
          },
        });

        return newSub;
      });

      // Send subscription confirmation email (non-blocking)
      const userRecord = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { email: true, profile: { select: { firstName: true } } },
      });
      if (userRecord) {
        sendSubscriptionEmail(userRecord.email, {
          firstName: userRecord.profile?.firstName,
          planName: plan.name,
          amount: subscription.amountPaid,
          endDate: subscription.endDate,
          listingsLimit: subscription.listingsLimit,
        }).catch((err) => console.error('Failed to send subscription email:', err.message));
      }

      res.json({
        success: true,
        message: 'Subscription activated successfully!',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/subscriptions/webhook
 * @desc    Handle Paystack webhooks (charge.success for renewals)
 * @access  Public (validated via HMAC signature)
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody =
      typeof req.body === 'string'
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : JSON.stringify(req.body);

    if (!paystackService.validateWebhook(rawBody, signature)) {
      return res.status(401).json({ success: false, error: { message: 'Invalid signature' } });
    }

    const event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? JSON.parse(rawBody)
      : req.body;

    const eventId = event.data?.reference || event.data?.id?.toString();

    // Idempotency
    const existing = await prisma.paystackEvent.findUnique({
      where: { eventId },
    });
    if (existing?.processed) {
      return res.sendStatus(200);
    }

    if (event.event === 'charge.success') {
      const { userId, planType } = event.data.metadata || {};

      if (userId && planType && PLANS[planType]) {
        const plan = PLANS[planType];

        await prisma.$transaction(async (tx) => {
          // Deactivate old subscriptions
          await tx.subscription.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
          });

          // Create/extend subscription
          await tx.subscription.create({
            data: {
              userId,
              planType,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              isActive: true,
              amountPaid: event.data.amount / 100,
              paymentReference: eventId,
              paystackRef: event.data.reference,
              listingsUsed: 0,
              listingsLimit: plan.listingsLimit,
            },
          });

          await tx.paystackEvent.upsert({
            where: { eventId },
            update: { processed: true },
            create: {
              eventId,
              eventType: event.event,
              processed: true,
              payload: JSON.stringify(event.data),
            },
          });
        });

        // Send confirmation email (non-blocking)
        const userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, profile: { select: { firstName: true } } },
        });
        if (userRecord) {
          sendSubscriptionEmail(userRecord.email, {
            firstName: userRecord.profile?.firstName,
            planName: plan.name,
            amount: event.data.amount / 100,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            listingsLimit: plan.listingsLimit,
          }).catch((err) => console.error('Failed to send subscription email:', err.message));
        }
      }
    }

    // Always return 200 to Paystack
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Still return 200 to prevent retries
  }
});

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel auto-renewal of current subscription
 * @access  Private
 */
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        isActive: true,
        endDate: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { message: 'No active subscription found' },
      });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled. It will remain active until ' +
        new Date(subscription.endDate).toLocaleDateString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
