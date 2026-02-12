import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Phone, MapPin, Camera, Shield, Bell, Lock, Eye, EyeOff,
  ChevronRight, Check, Star, Car, Calendar, BadgeCheck, Edit3, Save, X,
  Settings, LogOut, CreditCard, FileText, HelpCircle, Building2
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || '',
      bio: user?.profile?.bio || '',
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'verification', label: 'Verification', icon: BadgeCheck },
  ];

  const sidebarLinks = [
    { id: 'profile', label: 'Profile Settings', icon: Settings },
    { id: 'dashboard', label: 'My Dashboard', icon: Car, href: '/dashboard' },
    { id: 'favorites', label: 'Saved Cars', icon: Star, href: '/favorites' },
    { id: 'messages', label: 'Messages', icon: Mail, href: '/messages' },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateUser(data);
      addToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/');
  };

  const stats = [
    { label: 'Cars Listed', value: user?.stats?.listings || 0, icon: Car },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024', icon: Calendar },
    { label: 'Rating', value: user?.stats?.rating || '4.8', icon: Star },
    { label: 'Verified', value: user?.isVerified ? 'Yes' : 'No', icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-pearl-100 pt-28 pb-20">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-naija-600 via-naija-500 to-emerald-500 overflow-hidden">
        <div className="absolute inset-0 kente-overlay opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-32 w-48 h-48 bg-gold-400/20 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container -mt-20 relative z-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card-hover overflow-hidden mb-6"
            >
              {/* Avatar Section */}
              <div className="relative pt-8 pb-6 px-6 text-center">
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lifted mx-auto">
                    <img
                      src={avatarPreview || user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.firstName || 'User'}&background=008753&color=fff&size=128`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-naija-500 text-white rounded-xl cursor-pointer hover:bg-naija-600 transition-colors shadow-button">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>

                <h2 className="mt-4 text-xl font-display font-bold text-charcoal-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </h2>
                <p className="text-charcoal-500 text-sm">{user?.email}</p>

                {user?.isVerified && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-naija-100 text-naija-700 rounded-full text-sm font-medium">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Seller
                  </div>
                )}

                {user?.userType === 'DEALER' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-100 text-gold-800 rounded-full text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Business Account
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-pearl-200">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-4 text-center">
                    <stat.icon className="w-5 h-5 text-naija-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-charcoal-800">{stat.value}</div>
                    <div className="text-xs text-charcoal-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-card p-4"
            >
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => link.href ? navigate(link.href) : setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === link.id
                        ? 'bg-naija-50 text-naija-600'
                        : 'text-charcoal-600 hover:bg-pearl-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card mb-6 p-2"
            >
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-naija-500 text-white shadow-button'
                        : 'text-charcoal-600 hover:bg-pearl-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Profile Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl shadow-card overflow-hidden"
                >
                  <div className="p-6 border-b border-pearl-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-display font-bold text-charcoal-800">
                        Personal Information
                      </h3>
                      <p className="text-charcoal-500 text-sm">
                        Update your personal details and contact information
                      </p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            reset();
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-pearl-200 text-charcoal-700 rounded-xl hover:bg-pearl-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit(onSubmit)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <form className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('firstName', { required: 'First name is required' })}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all ${
                              isEditing
                                ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                                : 'border-transparent bg-pearl-100 text-charcoal-700'
                            }`}
                            placeholder="Enter first name"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('lastName', { required: 'Last name is required' })}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all ${
                              isEditing
                                ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                                : 'border-transparent bg-pearl-100 text-charcoal-700'
                            }`}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('email')}
                            type="email"
                            disabled
                            className="w-full pl-12 pr-4 py-3.5 border border-transparent bg-pearl-100 text-charcoal-700 rounded-xl"
                            placeholder="Email address"
                          />
                          <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-naija-500" />
                        </div>
                        <p className="mt-1 text-xs text-charcoal-400">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('phone')}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all ${
                              isEditing
                                ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                                : 'border-transparent bg-pearl-100 text-charcoal-700'
                            }`}
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-charcoal-400" />
                          <input
                            {...register('address')}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all ${
                              isEditing
                                ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                                : 'border-transparent bg-pearl-100 text-charcoal-700'
                            }`}
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          City
                        </label>
                        <input
                          {...register('city')}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3.5 border rounded-xl transition-all ${
                            isEditing
                              ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                              : 'border-transparent bg-pearl-100 text-charcoal-700'
                          }`}
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          State
                        </label>
                        <select
                          {...register('state')}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3.5 border rounded-xl transition-all ${
                            isEditing
                              ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                              : 'border-transparent bg-pearl-100 text-charcoal-700'
                          }`}
                        >
                          <option value="">Select State</option>
                          {['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Ogun', 'Edo', 'Delta', 'Enugu', 'Anambra', 'Imo'].map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          {...register('bio')}
                          disabled={!isEditing}
                          rows={4}
                          className={`w-full px-4 py-3.5 border rounded-xl transition-all resize-none ${
                            isEditing
                              ? 'border-pearl-300 focus:border-naija-500 focus:ring-2 focus:ring-naija-100'
                              : 'border-transparent bg-pearl-100 text-charcoal-700'
                          }`}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Change Password */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h3 className="text-xl font-display font-bold text-charcoal-800">
                        Change Password
                      </h3>
                      <p className="text-charcoal-500 text-sm">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full pl-12 pr-12 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="password"
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="password"
                            className="w-full pl-12 pr-4 py-3.5 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <button className="btn-primary px-6 py-3 rounded-xl">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-display font-bold text-charcoal-800">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-charcoal-500 text-sm">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-14 h-7 bg-pearl-300 peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-naija-500"></div>
                        </label>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 p-4 bg-pearl-50 rounded-xl">
                        <div className="p-3 bg-naija-100 rounded-xl">
                          <Phone className="w-6 h-6 text-naija-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal-800">SMS Authentication</p>
                          <p className="text-sm text-charcoal-500">Receive a code via SMS when signing in</p>
                        </div>
                        <button className="text-naija-600 font-medium hover:text-naija-700">
                          Setup
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h3 className="text-xl font-display font-bold text-charcoal-800">
                        Active Sessions
                      </h3>
                      <p className="text-charcoal-500 text-sm">
                        Manage your active login sessions
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-naija-100 rounded-xl">
                              <Shield className="w-6 h-6 text-naija-600" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal-800">Current Session</p>
                              <p className="text-sm text-charcoal-500">Lagos, Nigeria • Chrome on Windows</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-naija-100 text-naija-700 text-sm rounded-full font-medium">
                            Active Now
                          </span>
                        </div>
                      </div>
                      <button className="mt-4 text-red-600 font-medium hover:text-red-700">
                        Sign out of all other sessions
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl shadow-card overflow-hidden"
                >
                  <div className="p-6 border-b border-pearl-200">
                    <h3 className="text-xl font-display font-bold text-charcoal-800">
                      Notification Preferences
                    </h3>
                    <p className="text-charcoal-500 text-sm">
                      Choose how you want to be notified
                    </p>
                  </div>
                  <div className="p-6 space-y-6">
                    {[
                      { title: 'New Messages', desc: 'Get notified when you receive new messages', enabled: true },
                      { title: 'Price Drops', desc: 'Get notified when cars in your favorites drop in price', enabled: true },
                      { title: 'New Listings', desc: 'Get notified about new listings matching your search', enabled: false },
                      { title: 'Promotional Emails', desc: 'Receive special offers and promotions', enabled: false },
                      { title: 'Weekly Digest', desc: 'Get a weekly summary of new cars and deals', enabled: true },
                      { title: 'SMS Notifications', desc: 'Receive important updates via SMS', enabled: false },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                        <div>
                          <p className="font-medium text-charcoal-800">{item.title}</p>
                          <p className="text-sm text-charcoal-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                          <div className="w-14 h-7 bg-pearl-300 peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-naija-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Verification Tab */}
              {activeTab === 'verification' && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Verification Status */}
                  <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                    <div className="p-6 border-b border-pearl-200">
                      <h3 className="text-xl font-display font-bold text-charcoal-800">
                        Verification Status
                      </h3>
                      <p className="text-charcoal-500 text-sm">
                        Complete verification to build trust with buyers
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { title: 'Email', status: 'verified', icon: Mail },
                          { title: 'Phone', status: 'pending', icon: Phone },
                          { title: 'ID Verification', status: 'not_started', icon: Shield },
                        ].map((item, index) => (
                          <div key={index} className={`p-4 rounded-xl border-2 ${
                            item.status === 'verified'
                              ? 'border-naija-500 bg-naija-50'
                              : item.status === 'pending'
                                ? 'border-gold-400 bg-gold-50'
                                : 'border-pearl-300 bg-pearl-50'
                          }`}>
                            <item.icon className={`w-8 h-8 mb-3 ${
                              item.status === 'verified'
                                ? 'text-naija-500'
                                : item.status === 'pending'
                                  ? 'text-gold-600'
                                  : 'text-charcoal-400'
                            }`} />
                            <p className="font-medium text-charcoal-800">{item.title}</p>
                            <p className={`text-sm capitalize ${
                              item.status === 'verified'
                                ? 'text-naija-600'
                                : item.status === 'pending'
                                  ? 'text-gold-600'
                                  : 'text-charcoal-500'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </p>
                            {item.status !== 'verified' && (
                              <button className="mt-3 text-naija-600 font-medium text-sm hover:text-naija-700">
                                {item.status === 'pending' ? 'Complete' : 'Start'} →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gradient-to-br from-naija-500 to-naija-700 rounded-3xl shadow-card overflow-hidden p-8 text-white">
                    <h3 className="text-2xl font-display font-bold mb-4">
                      Why Get Verified?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Increased trust from buyers',
                        'Featured placement in search results',
                        'Verified badge on all listings',
                        'Priority customer support',
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="p-1.5 bg-white/20 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
