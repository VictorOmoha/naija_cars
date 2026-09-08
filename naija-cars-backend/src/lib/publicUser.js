// Only these profile fields may leave an account's private settings.
const publicProfileSelect = {
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  about: true,
  city: true,
  state: true,
  businessName: true,
  businessLogoUrl: true,
  verificationBadge: true,
  createdAt: true,
  updatedAt: true,
};

const publicUserSelect = {
  id: true,
  email: true,
  userType: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profile: { select: publicProfileSelect },
};

module.exports = { publicProfileSelect, publicUserSelect };
