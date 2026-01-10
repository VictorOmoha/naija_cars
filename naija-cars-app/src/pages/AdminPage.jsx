import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Car, CheckCircle, XCircle, Eye, TrendingUp,
  Search, Filter, BadgeCheck, Ban, Mail, Phone, Calendar, Building2,
  MoreVertical, ChevronDown, AlertTriangle, UserCheck, UserX
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import api from '../services/api';

// Mock users data for demonstration
const mockUsers = [
  {
    id: 1,
    email: 'chinedu@email.com',
    profile: { firstName: 'Chinedu', lastName: 'Okonkwo', phone: '+234 801 234 5678' },
    userType: 'INDIVIDUAL',
    isVerified: true,
    createdAt: '2023-06-15',
    status: 'active',
    listingsCount: 5,
    salesCount: 3,
  },
  {
    id: 2,
    email: 'premiumautos@email.com',
    profile: { firstName: 'Premium', lastName: 'Autos', phone: '+234 802 345 6789' },
    userType: 'DEALER',
    businessName: 'Premium Autos Nigeria',
    isVerified: true,
    createdAt: '2023-03-20',
    status: 'active',
    listingsCount: 45,
    salesCount: 120,
  },
  {
    id: 3,
    email: 'amaka@email.com',
    profile: { firstName: 'Amaka', lastName: 'Nwosu', phone: '+234 803 456 7890' },
    userType: 'INDIVIDUAL',
    isVerified: false,
    createdAt: '2024-01-10',
    status: 'active',
    listingsCount: 2,
    salesCount: 0,
  },
  {
    id: 4,
    email: 'luxurywheels@email.com',
    profile: { firstName: 'Luxury', lastName: 'Wheels', phone: '+234 804 567 8901' },
    userType: 'DEALER',
    businessName: 'Luxury Wheels Ltd',
    isVerified: false,
    createdAt: '2024-01-05',
    status: 'pending_verification',
    listingsCount: 12,
    salesCount: 0,
  },
  {
    id: 5,
    email: 'emeka@email.com',
    profile: { firstName: 'Emeka', lastName: 'Adeyemi', phone: '+234 805 678 9012' },
    userType: 'INDIVIDUAL',
    isVerified: true,
    createdAt: '2023-09-22',
    status: 'suspended',
    listingsCount: 0,
    salesCount: 1,
  },
];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin (in production, check user role)
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // For production, check if user has admin role
  if (user?.userType !== 'ADMIN') {
    navigate('/');
    return null;
  }

  // Fetch all listings for moderation
  const { data: listingsData, refetch: refetchListings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const response = await api.get('/listings?status=PENDING&limit=50');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const handleApproveListing = async (id) => {
    try {
      await api.put(`/listings/${id}`, { status: 'ACTIVE' });
      addToast('Listing approved', 'success');
      refetchListings();
    } catch (error) {
      addToast('Failed to approve listing', 'error');
    }
  };

  const handleRejectListing = async (id) => {
    if (!confirm('Are you sure you want to reject this listing?')) return;

    try {
      await api.put(`/listings/${id}`, { status: 'INACTIVE' });
      addToast('Listing rejected', 'success');
      refetchListings();
    } catch (error) {
      addToast('Failed to reject listing', 'error');
    }
  };

  const pendingListings = listingsData?.data?.listings || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'listings', label: 'Pending Listings', icon: Car, badge: pendingListings.length },
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
            <h1 className="text-4xl font-display font-bold text-charcoal-700">
              Admin Panel
            </h1>
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
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors relative ${activeTab === tab.id
                    ? 'border-naija-500 text-naija-600'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                                 px-2 py-0.5 rounded-full">
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
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  {pendingListings.length}
                </div>
                <div className="text-sm text-charcoal-500">Pending Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success-100 rounded-xl">
                    <Users className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  0
                </div>
                <div className="text-sm text-charcoal-500">Total Users</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gold-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-gold-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  0
                </div>
                <div className="text-sm text-charcoal-500">Active Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-charcoal-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-charcoal-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  0
                </div>
                <div className="text-sm text-charcoal-500">Revenue (₦)</div>
              </div>
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
                  <div className="text-naija-100">
                    Review pending listings and user verifications
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-1">User Management</div>
                  <div className="text-naija-100">
                    Verify dealers and manage user accounts
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-semibold mb-1">Analytics</div>
                  <div className="text-naija-100">
                    Track platform metrics and performance
                  </div>
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
                <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
                  All caught up!
                </h3>
                <p className="text-charcoal-500">
                  No pending listings to review at the moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl shadow-card overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-64 h-48 md:h-auto bg-pearl-100 flex-shrink-0">
                        {listing.media && listing.media[0] ? (
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

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-display font-bold text-charcoal-800">
                              {listing.year} {listing.make} {listing.model}
                            </h3>
                            <p className="text-charcoal-500">
                              {listing.locationCity}, {listing.locationState}
                            </p>
                            <p className="text-sm text-charcoal-400 mt-1">
                              Posted by: {listing.seller?.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-naija-600">
                              ₦{parseFloat(listing.price).toLocaleString()}
                            </div>
                            <span className="text-xs px-2 py-1 rounded-lg bg-gold-100 text-gold-700">
                              PENDING
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-charcoal-400">Condition</div>
                            <div className="font-semibold text-charcoal-700">
                              {listing.condition.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Transmission</div>
                            <div className="font-semibold text-charcoal-700">
                              {listing.transmission}
                            </div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Fuel Type</div>
                            <div className="font-semibold text-charcoal-700">
                              {listing.fuelType}
                            </div>
                          </div>
                          <div>
                            <div className="text-charcoal-400">Mileage</div>
                            <div className="font-semibold text-charcoal-700">
                              {listing.mileage ? `${listing.mileage.toLocaleString()} km` : 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => window.open(`/car/${listing.id}`, '_blank')}
                            className="px-4 py-2 bg-pearl-100 text-charcoal-700 rounded-lg
                                     hover:bg-pearl-200 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleApproveListing(listing.id)}
                            className="px-6 py-2 bg-success-500 text-white rounded-lg
                                     hover:bg-success-600 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectListing(listing.id)}
                            className="px-6 py-2 bg-red-500 text-white rounded-lg
                                     hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
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
          <UserManagement addToast={addToast} />
        )}
      </div>
    </div>
  );
}

// User Management Component
function UserManagement({ addToast }) {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.businessName && user.businessName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || user.userType === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleVerifyUser = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u));
    addToast('User verified successfully', 'success');
  };

  const handleSuspendUser = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
    addToast('User suspended', 'success');
  };

  const handleActivateUser = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    addToast('User activated', 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Suspended</span>;
      case 'pending_verification':
        return <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 bg-pearl-200 text-charcoal-600 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or business..."
              className="w-full pl-12 pr-4 py-3 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl bg-white focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            >
              <option value="all">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DEALER">Dealer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl bg-white focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-charcoal-800">{users.length}</div>
          <div className="text-sm text-charcoal-500">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-emerald-600">{users.filter(u => u.status === 'active').length}</div>
          <div className="text-sm text-charcoal-500">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-gold-600">{users.filter(u => u.userType === 'DEALER').length}</div>
          <div className="text-sm text-charcoal-500">Dealers</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card text-center">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</div>
          <div className="text-sm text-charcoal-500">Suspended</div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pearl-50 border-b border-pearl-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Listings</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pearl-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-pearl-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center text-naija-600 font-bold">
                        {user.profile.firstName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-charcoal-800">
                            {user.profile.firstName} {user.profile.lastName}
                          </span>
                          {user.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-naija-500" />
                          )}
                        </div>
                        <div className="text-sm text-charcoal-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.userType === 'DEALER' ? (
                        <>
                          <Building2 className="w-4 h-4 text-gold-600" />
                          <span className="text-charcoal-700">Dealer</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-charcoal-500" />
                          <span className="text-charcoal-700">Individual</span>
                        </>
                      )}
                    </div>
                    {user.businessName && (
                      <div className="text-sm text-charcoal-500">{user.businessName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-charcoal-800">{user.listingsCount} listings</div>
                    <div className="text-sm text-charcoal-500">{user.salesCount} sales</div>
                  </td>
                  <td className="px-6 py-4 text-charcoal-600">
                    {new Date(user.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-charcoal-500 hover:text-naija-600 hover:bg-naija-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {!user.isVerified && user.status !== 'suspended' && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Verify User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      ) : user.status === 'suspended' && (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Activate User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-lifted max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-pearl-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-charcoal-800">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-charcoal-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-naija-100 rounded-2xl flex items-center justify-center text-naija-600 text-2xl font-bold">
                    {selectedUser.profile.firstName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-charcoal-800">
                        {selectedUser.profile.firstName} {selectedUser.profile.lastName}
                      </h4>
                      {selectedUser.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-naija-500" />
                      )}
                    </div>
                    {selectedUser.businessName && (
                      <p className="text-charcoal-600">{selectedUser.businessName}</p>
                    )}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-charcoal-600">
                    <Mail className="w-5 h-5 text-charcoal-400" />
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-3 text-charcoal-600">
                    <Phone className="w-5 h-5 text-charcoal-400" />
                    {selectedUser.profile.phone}
                  </div>
                  <div className="flex items-center gap-3 text-charcoal-600">
                    <Calendar className="w-5 h-5 text-charcoal-400" />
                    Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pearl-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-charcoal-800">{selectedUser.listingsCount}</div>
                    <div className="text-sm text-charcoal-500">Total Listings</div>
                  </div>
                  <div className="bg-pearl-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-charcoal-800">{selectedUser.salesCount}</div>
                    <div className="text-sm text-charcoal-500">Completed Sales</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-pearl-200">
                  {!selectedUser.isVerified && selectedUser.status !== 'suspended' && (
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors"
                    >
                      <BadgeCheck className="w-5 h-5" />
                      Verify User
                    </button>
                  )}
                  {selectedUser.status === 'active' ? (
                    <button
                      onClick={() => {
                        handleSuspendUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <Ban className="w-5 h-5" />
                      Suspend
                    </button>
                  ) : selectedUser.status === 'suspended' && (
                    <button
                      onClick={() => {
                        handleActivateUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      <UserCheck className="w-5 h-5" />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
