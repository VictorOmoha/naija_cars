const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, phoneNumber, password, userType, firstName, lastName }) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone number';
      throw new Error(`User with this ${field} already exists`);
    }

    // Validate user type
    const validTypes = ['INDIVIDUAL_SELLER', 'DEALER', 'RENTAL_COMPANY', 'BUYER'];
    if (!validTypes.includes(userType)) {
      throw new Error('Invalid user type');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phoneNumber,
        passwordHash,
        userType,
        profile: {
          create: {
            firstName,
            lastName
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Generate OTP for verification (implement later)
    // await this.sendVerificationOTP(user.id, phoneNumber, email);

    // Remove sensitive data
    delete user.passwordHash;

    return user;
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        _count: {
          select: {
            listings: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account has been deactivated. Please contact support.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remove sensitive data
    delete user.passwordHash;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { profile: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate JWT access token (short-lived)
   */
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });
  }

  /**
   * Generate JWT refresh token (long-lived)
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            listings: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    delete user.passwordHash;
    return user;
  }

  /**
   * Send verification OTP (to be implemented with Twilio/SendGrid)
   */
  async sendVerificationOTP(userId, phoneNumber, email) {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification record
    await prisma.verification.create({
      data: {
        userId,
        verificationType: 'OTP_PHONE',
        code,
        expiresAt
      }
    });

    // TODO: Send SMS via Twilio
    console.log(`📱 SMS OTP for ${phoneNumber}: ${code}`);

    // TODO: Send Email via SendGrid
    console.log(`📧 Email OTP for ${email}: ${code}`);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(userId, code) {
    const verification = await prisma.verification.findFirst({
      where: {
        userId,
        code,
        isVerified: false,
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!verification) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark verification as complete
    await prisma.verification.update({
      where: { id: verification.id },
      data: { isVerified: true }
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true }
    });

    return { message: 'Verification successful' };
  }
}

module.exports = new AuthService();
