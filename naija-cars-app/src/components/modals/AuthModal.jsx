import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, Building2, Car, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import useAuthStore from '../../stores/authStore';

const AuthModal = () => {
  const { isSignInOpen, setIsSignInOpen, addToast } = useApp();
  const { login, register, verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify-otp'
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

  const handleClose = () => {
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
      addToast(error || 'Login failed', 'error');
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
      addToast('Registration successful! Sending verification code...', 'success');
      setMode('verify-otp');
      // Auto-send OTP (in production, this would be done by backend)
      setTimeout(() => {
        addToast('Verification code sent to your phone and email', 'info');
      }, 1000);
    } catch (err) {
      addToast(error || 'Registration failed', 'error');
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
      addToast(error || 'Invalid verification code', 'error');
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

  const switchToLogin = () => {
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
    <AnimatePresence>
      {isSignInOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal-700
                       hover:bg-pearl-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <div className="p-8 pb-0 text-center">
                  <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-charcoal-500">Sign in to your Naija Cars account</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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

                  <div className="text-center">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
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
                      <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
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
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
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
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-pearl-50 border border-pearl-200
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-naija-500
                                 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider text-center">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
