const prisma = require('../lib/prisma');

/**
 * Middleware: require an active subscription with available listing slots
 * Attaches req.subscription on success
 */
const requireActiveSubscription = async (req, res, next) => {
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
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'An active subscription is required to create listings. Visit the pricing page to subscribe.',
        },
      });
    }

    // Check listing count (-1 means unlimited)
    if (
      subscription.listingsLimit !== -1 &&
      subscription.listingsUsed >= subscription.listingsLimit
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'LISTING_LIMIT_REACHED',
          message: `You have used all ${subscription.listingsLimit} listings for this billing period. Upgrade your plan for more listings.`,
        },
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireActiveSubscription };
