import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SignInModal = () => {
  const { isSignInOpen, setIsSignInOpen, addToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      addToast('Account created successfully! Please sign in.', 'success');
      setIsSignUp(false);
    } else {
      addToast('Welcome back to Naija Cars!', 'success');
      setIsSignInOpen(false);
    }
    setFormData({ email: '', password: '', name: '', phone: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isSignInOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          onClick={() => setIsSignInOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-pearl-200
                     rounded-3xl shadow-card-hover overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsSignInOpen(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal-700
                       hover:bg-pearl-100 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-8 pb-0 text-center">
              <img
                src="/logo.png?v=3"
                alt="Naija Cars"
                className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-md"
              />
              <h2 className="font-display text-2xl font-semibold text-charcoal-800 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-charcoal-500">
                {isSignUp
                  ? 'Join Nigeria\'s #1 automotive marketplace'
                  : 'Sign in to your Naija Cars account'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required={isSignUp}
                        className="input-warm pl-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        required={isSignUp}
                        className="input-warm pl-12"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input-warm pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-charcoal-700 mb-2 font-medium uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="input-warm pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-600
                             hover:text-charcoal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-pearl-300 bg-pearl-100
                               text-naija-500 focus:ring-naija-400"
                    />
                    <span className="text-charcoal-500">Remember me</span>
                  </label>
                  <button type="button" className="text-naija-500 hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-naija-500 text-white font-semibold rounded-xl
                         shadow-button transition-all duration-300 hover:bg-naija-600"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </motion.button>

              <div className="text-center text-sm text-charcoal-500">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-naija-500 hover:underline font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignInModal;
