import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Car, CheckCircle, XCircle, Eye, TrendingUp,
  Search, BadgeCheck, Ban, Mail, Phone, Calendar, Building2,
  ChevronDown, UserCheck, Trash2, Edit2, Save, X, UserPlus,
  Clock, ShoppingBag
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import { adminAPI } from '../services/api';

const USER_TYPE_LABELS = {
  DEALER: 'Dealer',
  INDIVIDUAL_SELLER: 'Individual Seller',
  RENTAL_COMPANY: 'Rental Company',
  BUYER: 'Buyer',
  ADMIN: 'Admin',
};

const USER_TYPE_COLORS = {
  DEALER: 'bg-gold-100 text-gold-700',
  INDIVIDUAL_SELLER: 'bg-blue-100 text-blue-700',
  RENTAL_COMPANY: 'bg-purple-100 text-purple-700',
  BUYER: 'bg-pearl-200 text-charcoal-700',
  ADMIN: 'bg-red-100 text-red-700',
};

function UserTypeBadge({ userType }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${USER_TYPE_COLORS[userType] || 'bg-pearl-100 text-charcoal-600'}`}>
      {USER_TYPE_LABELS[userType] || userType}
    </span>
  );
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = isAuthenticated && user?.userType === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminAPI.getStats();
      return response.data.data;
    },
    enabled: isAdmin,
  });

  const { data: listingsData, refetch: refetchListings } = useQuery({
    queryKey: ['admin-listings', 'PENDING'],
    queryFn: async () => {
      const response = await adminAPI.getListings({ status: 'PENDING', limit: 50 });
      return response.data.data;
    },
    enabled: isAdmin,
  });

  const { data: recentUsersData } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const response = await adminAPI.getRecentUsers();
      return response.data.data;
    },
    enabled: isAdmin,
  });

  if (!isAdmin) return null;

  const handleApproveListing = async (id) => {
    try {
      await adminAPI.approveListing(id);
      addToast('Listing approved', 'success');
      refetchListings();
    } catch {
      addToast('Failed to approve listing', 'error');
    }
  };

  const handleRejectListing = async (id) => {
    if (!confirm('Are you sure you want to reject this listing?')) return;
    try {
      await adminAPI.rejectListing(id);
      addToast('Listing rejected', 'success');
      refetchListings();
    } catch {
      addToast('Failed to reject listing', 'error');
    }
  };

  const stats = statsData || {};
  const pendingListings = listingsData?.listings || [];
  const pendingCount = stats.pendingApproval ?? pendingListings.length;
  const recentUsers = recentUsersData || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'listings', label: 'Pending Listings', icon: Car, badge: pendingCount },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-pearl-100 pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-charcoal-700">Admin Panel</h1>
            <p className="text-charcoal-500">Manage platform content and users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-pearl-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-naija-500 text-naija-600'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-naija-100 rounded-xl">
                    <Car className="w-6 h-6 text-naija-600" />
                  </div>
                  {pendingCount > 0 && (
                    <span className="text-xs text-gold-600 font-medium">Needs Review</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">{pendingCount}</div>
                <div className="text-sm text-charcoal-500">Pending Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Users className="w-6 h-6 text-success-600" />
                  </div>
                  {stats.userGrowth > 0 && (
                    <span className="text-xs text-success-600 font-medium">+{stats.userGrowth}%</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">{stats.totalUsers ?? 0}</div>
                <div className="text-sm text-charcoal-500">Total Users</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gold-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-gold-600" />
                  </div>
                  {stats.listingGrowth > 0 && (
                    <span className="text-xs text-success-600 font-medium">+{stats.listingGrowth}%</span>
                  )}
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">{stats.activeListings ?? 0}</div>
                <div className="text-sm text-charcoal-500">Active Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-charcoal-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-charcoal-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  ₦{(stats.totalRevenue ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-charcoal-500">Revenue</div>
              </div>
            </div>

            {/* Recently Joined Users */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-pearl-200">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-naija-600" />
                  <h2 className="text-lg font-display font-bold text-charcoal-700">Recently Joined Users</h2>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-sm text-naija-600 hover:underline font-medium"
                >
                  View all →
                </button>
              </div>

              {recentUsers.length === 0 ? (
                <div className="p-8 text-center text-charcoal-400">No users yet</div>
              ) : (
                <div className="divide-y divide-pearl-100">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-pearl-50 transition-colors">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center
                                      text-naija-600 font-bold flex-shrink-0">
                        {u.profile?.firstName?.[0] || u.email[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-charcoal-800 truncate">
                            {u.profile?.firstName
                              ? `${u.profile.firstName} ${u.profile.lastName || ''}`.trim()
                              : u.email}
                          </span>
                          {u.isVerified && <BadgeCheck className="w-4 h-4 text-naija-500 flex-shrink-0" />}
                          {!u.isActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Suspended</span>
                          )}
                        </div>
                        <div className="text-sm text-charcoal-500 truncate">{u.email}</div>
                        {u.profile?.businessName && (
                          <div className="text-sm text-charcoal-400">{u.profile.businessName}</div>
                        )}
                      </div>

                      {/* Profile type badge */}
                      <UserTypeBadge userType={u.userType} />

                      {/* Listings count */}
                      <div className="flex items-center gap-1 text-sm text-charcoal-500 flex-shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                        {u._count?.listings ?? 0}
                      </div>

                      {/* Joined date */}
                      <div className="flex items-center gap-1 text-sm text-charcoal-400 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        {new Date(u.createdAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-naija-500 to-naija-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-display font-bold mb-2">Admin Dashboard</h2>
              <p className="text-naija-100 mb-6">
                Review and moderate platform content, manage users, and monitor platform health.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-1">Moderation</div>
                  <div className="text-naija-100">Review pending listings and user verifications</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-1">User Management</div>
                  <div className="text-naija-100">Edit, verify, suspend or delete user accounts</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-1">Analytics</div>
                  <div className="text-naija-100">Track platform metrics and performance</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold text-charcoal-700">
                Pending Listings ({pendingListings.length})
              </h2>
            </div>

            {pendingListings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-card">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success-500" />
                <h3 className="text-xl font-semibold text-charcoal-700 mb-2">All caught up!</h3>
                <p className="text-charcoal-500">No pending listings to review at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 md:h-auto bg-pearl-100 flex-shrink-0">
                        {listing.media?.[0] ? (
                          <img
                            src={listing.media[0].url}
                            alt={`${listing.make} ${listing.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-12 h-12 text-charcoal-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-display font-bold text-charcoal-800">
                              {listing.year} {listing.make} {listing.model}
                            </h3>
                            <p className="text-charcoal-500">{listing.locationCity}, {listing.locationState}</p>
                            <p className="text-sm text-charcoal-400 mt-1">
                              Posted by:{' '}
                              {listing.seller?.profile?.firstName
                                ? `${listing.seller.profile.firstName} ${listing.seller.profile.lastName}`
                                : listing.seller?.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-naija-600">
                              ₦{parseFloat(listing.price).toLocaleString()}
                            </div>
                            <span className="text-xs px-2 py-1 rounded-lg bg-gold-100 text-gold-700">PENDING</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-charcoal-400">Condition</div>
                            <div className="font-semibold text-charcoal-700">{listing.condition?.replace(/_/g, ' ')}</div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Transmission</div>
                            <div className="font-semibold text-charcoal-700">{listing.transmission || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Fuel Type</div>
                            <div className="font-semibold text-charcoal-700">{listing.fuelType || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Mileage</div>
                            <div className="font-semibold text-charcoal-700">
                              {listing.mileage ? `${listing.mileage.toLocaleString()} km` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => window.open(`/car/${listing.id}`, '_blank')}
                            className="px-4 py-2 bg-pearl-100 text-charcoal-700 rounded-lg
                                     hover:bg-pearl-200 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => handleApproveListing(listing.id)}
                            className="px-6 py-2 bg-success-500 text-white rounded-lg
                                     hover:bg-success-600 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectListing(listing.id)}
                            className="px-6 py-2 bg-red-500 text-white rounded-lg
                                     hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagement addToast={addToast} totalUsers={stats.totalUsers ?? 0} />
        )}
      </div>
    </div>
  );
}

// ─── User Management ─────────────────────────────────────────────────────────
function UserManagement({ addToast, totalUsers }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit'

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery, filterType, filterStatus],
    queryFn: async () => {
      const params = { limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (filterType) params.userType = filterType;
      if (filterStatus) params.status = filterStatus;
      const response = await adminAPI.getUsers(params);
      return response.data.data;
    },
  });

  const users = usersData?.users || [];

  const openModal = (u, mode = 'view') => {
    setSelectedUser(u);
    setModalMode(mode);
  };
  const closeModal = () => {
    setSelectedUser(null);
    setModalMode('view');
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      addToast('User verified successfully', 'success');
      refetch();
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, isVerified: true }));
    } catch {
      addToast('Failed to verify user', 'error');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId, false);
      addToast('User suspended', 'success');
      refetch();
      closeModal();
    } catch {
      addToast('Failed to suspend user', 'error');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId, true);
      addToast('User activated', 'success');
      refetch();
      closeModal();
    } catch {
      addToast('Failed to activate user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Permanently delete this user and all their data? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      addToast('User deleted', 'success');
      refetch();
      closeModal();
    } catch {
      addToast('Failed to delete user', 'error');
    }
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      const res = await adminAPI.updateUser(userId, data);
      addToast('User updated successfully', 'success');
      refetch();
      setSelectedUser(res.data.data);
      setModalMode('view');
    } catch {
      addToast('Failed to update user', 'error');
    }
  };

  const handleRoleChange = async (userId, userType) => {
    try {
      await adminAPI.updateUserRole(userId, userType);
      addToast(`Role updated to ${USER_TYPE_LABELS[userType]}`, 'success');
      refetch();
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, userType }));
    } catch {
      addToast('Failed to update role', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or business..."
              className="w-full pl-12 pr-4 py-3 border border-pearl-300 rounded-xl
                       focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl
                       bg-white focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            >
              <option value="">All Types</option>
              <option value="INDIVIDUAL_SELLER">Individual</option>
              <option value="DEALER">Dealer</option>
              <option value="RENTAL_COMPANY">Rental Company</option>
              <option value="BUYER">Buyer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl
                       bg-white focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Suspended</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-charcoal-800">{totalUsers}</div>
          <div className="text-sm text-charcoal-500">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-emerald-600">{users.filter(u => u.isActive).length}</div>
          <div className="text-sm text-charcoal-500">Active (Page)</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-gold-600">{users.filter(u => u.userType === 'DEALER').length}</div>
          <div className="text-sm text-charcoal-500">Dealers (Page)</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</div>
          <div className="text-sm text-charcoal-500">Suspended (Page)</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-naija-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-charcoal-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pearl-50 border-b border-pearl-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Profile Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Listings</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-200">
                {users.map((u, index) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-pearl-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center
                                       justify-center text-naija-600 font-bold">
                          {u.profile?.firstName?.[0] || u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-charcoal-800">
                              {u.profile?.firstName
                                ? `${u.profile.firstName} ${u.profile.lastName || ''}`.trim()
                                : <span className="text-charcoal-400 italic">No name</span>}
                            </span>
                            {u.isVerified && <BadgeCheck className="w-4 h-4 text-naija-500" />}
                          </div>
                          <div className="text-sm text-charcoal-500">{u.email}</div>
                          {u.profile?.businessName && (
                            <div className="text-xs text-charcoal-400">{u.profile.businessName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserTypeBadge userType={u.userType} />
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-charcoal-700">{u._count?.listings ?? 0}</td>
                    <td className="px-6 py-4 text-charcoal-500">
                      {new Date(u.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(u, 'view')}
                          className="p-2 text-charcoal-500 hover:text-naija-600 hover:bg-naija-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal(u, 'edit')}
                          className="p-2 text-charcoal-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {!u.isVerified && u.isActive && (
                          <button
                            onClick={() => handleVerifyUser(u.id)}
                            className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Verify User"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                        {u.isActive ? (
                          <button
                            onClick={() => handleSuspendUser(u.id)}
                            className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(u.id)}
                            className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && users.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserModal
            user={selectedUser}
            mode={modalMode}
            setMode={setModalMode}
            onClose={closeModal}
            onVerify={handleVerifyUser}
            onSuspend={handleSuspendUser}
            onActivate={handleActivateUser}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser}
            onRoleChange={handleRoleChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User Modal ───────────────────────────────────────────────────────────────
function UserModal({ user, mode, setMode, onClose, onVerify, onSuspend, onActivate, onDelete, onUpdate, onRoleChange }) {
  const [form, setForm] = useState({
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    phoneNumber: user.phoneNumber || '',
    businessName: user.profile?.businessName || '',
    bio: user.profile?.bio || '',
    location: user.profile?.location || '',
  });

  // Keep form in sync if user prop changes (e.g. after verify)
  useEffect(() => {
    setForm({
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phoneNumber: user.phoneNumber || '',
      businessName: user.profile?.businessName || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
    });
  }, [user]);

  const handleSave = () => onUpdate(user.id, form);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-lifted max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-pearl-200 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-display font-bold text-charcoal-800">
              {mode === 'edit' ? 'Edit User' : 'User Details'}
            </h3>
            <UserTypeBadge userType={user.userType} />
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <button
                onClick={() => setMode('edit')}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-pearl-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-charcoal-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-naija-100 rounded-2xl flex items-center justify-center
                           text-naija-600 text-2xl font-bold flex-shrink-0">
              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg font-bold text-charcoal-800">
                  {user.profile?.firstName
                    ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
                    : user.email}
                </h4>
                {user.isVerified && <BadgeCheck className="w-5 h-5 text-naija-500" />}
              </div>
              {user.profile?.businessName && (
                <p className="text-charcoal-600">{user.profile.businessName}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {user.isActive ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Active</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Suspended</span>
                )}
              </div>
            </div>
          </div>

          {mode === 'view' ? (
            <>
              {/* View Mode — contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-charcoal-600">
                  <Mail className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                  {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-charcoal-600">
                    <Phone className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                    {user.phoneNumber}
                  </div>
                )}
                {user.profile?.location && (
                  <div className="flex items-center gap-3 text-charcoal-600">
                    <Building2 className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                    {user.profile.location}
                  </div>
                )}
                {user.profile?.bio && (
                  <p className="text-charcoal-600 text-sm bg-pearl-50 rounded-xl p-3">{user.profile.bio}</p>
                )}
                <div className="flex items-center gap-3 text-charcoal-600">
                  <Calendar className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-NG', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pearl-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-charcoal-800">{user._count?.listings ?? 0}</div>
                  <div className="text-sm text-charcoal-500">Listings</div>
                </div>
                <div className="bg-pearl-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-charcoal-800">{user._count?.favorites ?? 0}</div>
                  <div className="text-sm text-charcoal-500">Favourites</div>
                </div>
              </div>

              {/* Role change */}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">Change Role</label>
                <div className="relative">
                  <select
                    value={user.userType}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl
                             bg-white focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="INDIVIDUAL_SELLER">Individual Seller</option>
                    <option value="DEALER">Dealer</option>
                    <option value="RENTAL_COMPANY">Rental Company</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
                </div>
              </div>
            </>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl
                             focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl
                             focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl
                           focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm(f => ({ ...f, businessName: e.target.value }))}
                  placeholder="For dealers / rental companies"
                  className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl
                           focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl
                           focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-pearl-300 rounded-xl resize-none
                           focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-pearl-200">
            {mode === 'edit' ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-3
                           bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="flex-1 flex items-center justify-center gap-2 py-3
                           bg-pearl-100 text-charcoal-700 rounded-xl hover:bg-pearl-200 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <>
                {!user.isVerified && user.isActive && (
                  <button
                    onClick={() => onVerify(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3
                             bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                  >
                    <BadgeCheck className="w-4 h-4" /> Verify
                  </button>
                )}
                {user.isActive ? (
                  <button
                    onClick={() => onSuspend(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3
                             bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => onActivate(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3
                             bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" /> Activate
                  </button>
                )}
                <button
                  onClick={() => onDelete(user.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3
                           bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
