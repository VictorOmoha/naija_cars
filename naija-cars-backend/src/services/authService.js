const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { sendOTPEmail, sendPasswordResetEmail } = require('../lib/emailService');

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
      const err = new Error(`User with this ${field} already exists`);
      err.status = 409;
      throw err;
    }

    // Validate user type
    const validTypes = ['INDIVIDUAL_SELLER', 'DEALER', 'RENTAL_COMPANY', 'BUYER'];
    if (!validTypes.includes(userType)) {
      const err = new Error('Invalid user type');
      err.status = 400;
      throw err;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile — auto-verified, no OTP required
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phoneNumber,
        passwordHash,
        userType,
        isVerified: true,
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

    // Remove sensitive data
    delete user.passwordHash;

    // Generate tokens so user can immediately verify OTP
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
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
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    // Check if user is active
    if (!user.isActive) {
      const err = new Error('Account has been deactivated. Please contact support.');
      err.status = 403;
      throw err;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
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
        const err = new Error('Invalid refresh token');
        err.status = 401;
        throw err;
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      if (error.status) throw error;
      const err = new Error('Invalid or expired refresh token');
      err.status = 401;
      throw err;
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

    // Send verification email
    await sendOTPEmail(email, code);

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

  /**
   * Change password for authenticated user
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      const err = new Error('Current password is incorrect');
      err.status = 401;
      throw err;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Request password reset - generates a reset token
   */
  async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If an account with that email exists, a reset code has been sent.' };
    }

    // Generate 6-digit reset code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Delete any existing reset codes for this user
    await prisma.verification.deleteMany({
      where: {
        userId: user.id,
        verificationType: 'OTP_EMAIL',
        isVerified: false
      }
    });

    // Save reset code
    await prisma.verification.create({
      data: {
        userId: user.id,
        verificationType: 'OTP_EMAIL',
        code,
        expiresAt
      }
    });

    // Send password reset email
    await sendPasswordResetEmail(email, code);

    return { message: 'If an account with that email exists, a reset code has been sent.' };
  }

  /**
   * Reset password using reset code
   */
  async resetPassword(email, code, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid reset code');
    }

    const verification = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        verificationType: 'OTP_EMAIL',
        code,
        isVerified: false,
        expiresAt: { gte: new Date() }
      }
    });

    if (!verification) {
      throw new Error('Invalid or expired reset code');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and mark verification as used
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.verification.update({
        where: { id: verification.id },
        data: { isVerified: true }
      })
    ]);

    return { message: 'Password reset successful. You can now log in with your new password.' };
  }
}

module.exports = new AuthService();
