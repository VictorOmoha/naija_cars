import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dialog from '../Dialog';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, Car, KeyRound, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import useAuthStore from '../../stores/authStore';
import { authAPI } from '../../services/api';

const AuthModal = () => {
  const { isSignInOpen, setIsSignInOpen, authModalInitialMode, addToast } = useApp();
  const { login, register, verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify-otp', 'forgot-password', 'reset-password'

  // Sync mode to whatever the caller requested whenever the modal opens
  useEffect(() => {
    if (isSignInOpen) {
      setMode(authModalInitialMode || 'login');
      setStep(1);
    }
  }, [isSignInOpen, authModalInitialMode]);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const resetRequest = useRef(0);
  const resetFeedback = useRef(null);

  useEffect(() => {
    if (resetError) resetFeedback.current?.focus();
  }, [resetError]);

  useEffect(() => {
    return () => { resetRequest.current += 1; };
  }, [isSignInOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  const [step, setStep] = useState(1); // For multi-step registration
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    userType: '',
    firstName: '',
    lastName: '',
  });
  const [otpCode, setOtpCode] = useState('');

  const userTypes = [
    {
      value: 'BUYER',
      label: 'Buyer',
      description: 'Looking to buy or rent a car',
      icon: User
    },
    {
      value: 'INDIVIDUAL_SELLER',
      label: 'Individual Seller',
      description: 'Selling your personal vehicle',
      icon: User
    },
    {
      value: 'DEALER',
      label: 'Car Dealer',
      description: 'Running a dealership business',
      icon: Building2
    },
    {
      value: 'RENTAL_COMPANY',
      label: 'Rental Company',
      description: 'Offering car rental services',
      icon: Car
    }
  ];

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleClose = () => {
    resetRequest.current += 1;
    setResetLoading(false);
    setIsSignInOpen(false);
    setMode('login');
    setStep(1);
    setFormData({
      email: '',
      password: '',
      phoneNumber: '',
      userType: '',
      firstName: '',
      lastName: '',
    });
    setOtpCode('');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setShowPassword(false);
    clearError();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      addToast('Welcome back to Naija Cars!', 'success');
      handleClose();
    } catch (err) {
      addToast(err?.response?.data?.error?.message || 'Login failed', 'error');
    }
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    if (!formData.userType) {
      addToast('Please select your account type', 'error');
      return;
    }
    setStep(2);
  };

  const handleRegisterStep2 = async (e) => {
    e.preventDefault();

    // Validate password
    if (formData.password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      addToast('Password must contain uppercase, lowercase, and number', 'error');
      return;
    }

    try {
      await register(formData);
      addToast('Welcome to Naija Cars! Your account is ready.', 'success');
      handleClose();
    } catch (err) {
      addToast(err?.message || 'Registration failed', 'error');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      addToast('Please enter the 6-digit code', 'error');
      return;
    }

    try {
      await verifyOTP(otpCode);
      addToast('Account verified successfully!', 'success');
      handleClose();
    } catch (err) {
      addToast(err?.message || 'Invalid verification code', 'error');
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP();
      addToast('New verification code sent', 'success');
    } catch (err) {
      addToast('Failed to resend code', 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    if (resetLoading || resendCooldown > 0) return;
    const email = resetEmail.trim();
    if (!email) {
      setResetError('Please enter your email address.');
      return;
    }
    const request = ++resetRequest.current;
    setResetError('');
    setResetLoading(true);
    try {
      await authAPI.forgotPassword(email);
      if (request !== resetRequest.current) return;
      setResetEmail(email);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setResendCooldown(60);
      setMode('reset-password');
    } catch (err) {
      if (request !== resetRequest.current) return;
      setResetError(err?.response?.data?.error?.details?.[0]?.msg
        || err?.response?.data?.error?.message || 'Could not send the reset code. Please try again.');
    } finally {
      if (request === resetRequest.current) setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetLoading) return;
    setResetError('');
    if (resetCode.length !== 6) {
      setResetError('Please enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setResetError('Password must contain an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please enter the same password in both fields.');
      return;
    }
    const request = ++resetRequest.current;
    setResetLoading(true);
    try {
      await authAPI.resetPassword({ email: resetEmail, code: resetCode, newPassword });
      if (request !== resetRequest.current) return;
      addToast('Password reset successful! You can now sign in.', 'success');
      setFormData(data => ({ ...data, email: resetEmail, password: '' }));
      setMode('login');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      clearError();
    } catch (err) {
      if (request !== resetRequest.current) return;
      setResetError(err?.response?.data?.error?.details?.[0]?.msg
        || err?.response?.data?.error?.message || 'Could not reset your password. Please try again.');
    } finally {
      if (request === resetRequest.current) setResetLoading(false);
    }
  };

  const switchToLogin = () => {
    resetRequest.current += 1;
    setResetLoading(false);
    setResetError('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setMode('login');
    setStep(1);
    clearError();
  };

  const switchToRegister = () => {
    setMode('register');
    setStep(1);
    clearError();
  };

  return (
    <Dialog open={isSignInOpen} onClose={handleClose} title="Your NaijaCars account" className="nc-auth-dialog">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <div className="p-8 pb-0 text-center">
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Welcome back
                  </h2>
                  <p className="text-charcoal-500">Sign in to your NaijaCars account</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="email"
                        name="email" aria-label="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="username"
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password" aria-label="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400
                                 hover:text-charcoal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-naija-500 to-naija-600
                             text-white rounded-xl font-medium hover:shadow-button
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setResetEmail(formData.email); setResetError(''); setShowPassword(false); clearError(); }}
                      className="text-sm text-charcoal-500 hover:text-naija-600 transition-colors"
                    >
                      Forgot your password?
                    </button>
                    <button
                      type="button"
                      onClick={switchToRegister}
                      className="text-naija-600 hover:text-naija-700 font-medium transition-colors"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === 'forgot-password' && (
              <>
                <div className="p-8 pb-0 text-center">
                  <div className="w-16 h-16 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-naija-600" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-charcoal-500">
                    Enter your email and we'll send you a reset code
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="p-8 space-y-5">
                  {resetError && (
                    <p ref={resetFeedback} role="alert" tabIndex={-1} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{resetError}</p>
                  )}
                  <div>
                    <label htmlFor="recovery-email" className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        id="recovery-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                        disabled={resetLoading}
                        autoComplete="username"
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || resendCooldown > 0}
                    className="w-full py-3 bg-gradient-to-r from-naija-500 to-naija-600
                             text-white rounded-xl font-medium hover:shadow-button
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Sending...' : resendCooldown > 0 ? `Send again in ${resendCooldown}s` : 'Send Reset Code'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="flex items-center gap-1 mx-auto text-naija-600 hover:text-naija-700 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* RESET PASSWORD MODE */}
            {mode === 'reset-password' && (
              <>
                <div className="p-8 pb-0 text-center">
                  <div className="w-16 h-16 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-naija-600" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Enter New Password
                  </h2>
                  <p className="text-charcoal-500">
                    If an account exists for <span className="font-medium break-all">{resetEmail}</span>, you will receive a reset code.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="p-8 space-y-5">
                  {resetError && (
                    <p ref={resetFeedback} role="alert" tabIndex={-1} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{resetError}</p>
                  )}
                  <div>
                    <label htmlFor="recovery-code" className="block text-xs text-charcoal-700 mb-2 font-medium text-center">
                      Reset Code
                    </label>
                    <input
                      id="recovery-code"
                      type="text"
                      value={resetCode}
                      onChange={(e) => { setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setResetError(''); }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      required
                      disabled={resetLoading}
                      aria-describedby="recovery-code-help"
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl tracking-widest font-semibold
                               bg-pearl-50 border border-pearl-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-naija-500
                               focus:border-transparent transition-all"
                    />
                    <p id="recovery-code-help" className="mt-2 text-xs text-charcoal-500">
                      Check your inbox and spam folder. Codes expire after 30 minutes. Use the most recent code.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="recovery-password" className="block text-xs text-charcoal-700 mb-2 font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        id="recovery-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                        autoComplete="new-password"
                        minLength={8}
                        disabled={resetLoading}
                        aria-describedby="recovery-password-help"
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400
                                 hover:text-charcoal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p id="recovery-password-help" className="mt-1 text-xs text-charcoal-500">
                      At least 8 characters, including uppercase, lowercase, and a number.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="recovery-confirm-password" className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        id="recovery-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                        autoComplete="new-password"
                        placeholder="Re-enter your new password"
                        required
                        disabled={resetLoading}
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || resetCode.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-naija-500 to-naija-600
                             text-white rounded-xl font-medium hover:shadow-button
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>

                  <div className="flex flex-col items-center gap-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleForgotPassword()}
                      disabled={resetLoading || resendCooldown > 0}
                      className="text-naija-600 hover:text-naija-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={() => { setResetError(''); setResetCode(''); setNewPassword(''); setConfirmPassword(''); setMode('forgot-password'); }}
                      className="text-sm text-charcoal-500 hover:text-naija-600 transition-colors disabled:opacity-50"
                    >
                      Use a different email
                    </button>
                    <button type="button" onClick={switchToLogin} className="flex items-center gap-1 text-sm text-naija-600 hover:text-naija-700 font-medium">
                      <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* REGISTER MODE - STEP 1: User Type Selection */}
            {mode === 'register' && step === 1 && (
              <>
                <div className="p-8 pb-0 text-center">
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Create Account
                  </h2>
                  <p className="text-charcoal-500">Choose your account type</p>
                </div>

                <form onSubmit={handleRegisterStep1} className="p-8 space-y-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type.value })}
                        className={`w-full p-4 border-2 rounded-xl text-left transition-all
                                  ${formData.userType === type.value
                                    ? 'border-naija-500 bg-naija-50'
                                    : 'border-pearl-200 hover:border-naija-300'
                                  }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            formData.userType === type.value
                              ? 'bg-naija-500 text-white'
                              : 'bg-pearl-100 text-charcoal-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-charcoal-800">{type.label}</div>
                            <div className="text-sm text-charcoal-500">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="submit"
                    disabled={!formData.userType}
                    className="w-full py-3 bg-gradient-to-r from-naija-500 to-naija-600
                             text-white rounded-xl font-medium hover:shadow-button
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-naija-600 hover:text-naija-700 font-medium transition-colors"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* REGISTER MODE - STEP 2: Account Details */}
            {mode === 'register' && step === 2 && (
              <>
                <div className="p-8 pb-0 text-center">
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Account Details
                  </h2>
                  <p className="text-charcoal-500">Complete your registration</p>
                </div>

                <form onSubmit={handleRegisterStep2} className="p-8 space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName" aria-label="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName" aria-label="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        className="w-full px-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="email"
                        name="email" aria-label="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="username"
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="tel"
                        name="phoneNumber" aria-label="Phone number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password" aria-label="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400
                                 hover:text-charcoal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-charcoal-500">
                      Must contain uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-pearl-100 text-charcoal-700 rounded-xl
                               font-medium hover:bg-pearl-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-naija-500 to-naija-600
                               text-white rounded-xl font-medium hover:shadow-button
                               transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* OTP VERIFICATION MODE */}
            {mode === 'verify-otp' && (
              <>
                <div className="p-8 pb-0 text-center">
                  <div className="w-16 h-16 bg-naija-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-naija-600" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Verify Your Account
                  </h2>
                  <p className="text-charcoal-500">
                    Enter the 6-digit code sent to your phone and email
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="p-8 space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium text-center">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(value);
                        clearError();
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl tracking-widest font-semibold
                               bg-pearl-50 border border-pearl-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-naija-500
                               focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-naija-500 to-naija-600
                             text-white rounded-xl font-medium hover:shadow-button
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Account'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-naija-600 hover:text-naija-700 font-medium transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </form>
              </>
            )}
    </Dialog>
  );
};

export default AuthModal;
