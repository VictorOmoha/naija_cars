import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Car, CheckCircle, XCircle, Eye, TrendingUp,
  Search, BadgeCheck, Ban, Mail, Phone, Calendar, Building2,
  ChevronDown, UserCheck, DollarSign, ShoppingCart, BarChart3,
  Settings, LogOut, Menu, X, Loader2, RefreshCw, Trash2,
  Star, Clock, AlertTriangle, FileText
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import { adminAPI, bookingsAPI } from '../services/api';

export default function AdminPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Handle screen resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getStats();
        setStats(response.data.data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use fallback stats
        setStats({
          totalUsers: 0,
          verifiedUsers: 0,
          totalListings: 0,
          activeListings: 0,
          pendingListings: 0,
          totalBookings: 0,
          pendingBookings: 0,
          revenue: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-pearl-100 pt-20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-20 left-0 right-0 bg-white border-b border-pearl-200 z-40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-pearl-100 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-display font-bold text-charcoal-800">Admin Portal</span>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || isLargeScreen) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed lg:sticky top-20 left-0 w-64 h-[calc(100vh-5rem)] bg-white border-r border-pearl-200 z-30 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-charcoal-800">Admin Portal</h2>
                    <p className="text-xs text-charcoal-500">Management Dashboard</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          if (!isLargeScreen) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          activeSection === item.id
                            ? 'bg-naija-500 text-white'
                            : 'text-charcoal-600 hover:bg-pearl-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-8 border-t border-pearl-200">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0">
          {activeSection === 'dashboard' && (
            <DashboardSection stats={stats} isLoading={isLoading} />
          )}
          {activeSection === 'users' && (
            <UsersSection addToast={addToast} />
          )}
          {activeSection === 'listings' && (
            <ListingsSection addToast={addToast} />
          )}
          {activeSection === 'bookings' && (
            <BookingsSection addToast={addToast} />
          )}
          {activeSection === 'settings' && (
            <SettingsSection addToast={addToast} />
          )}
        </main>
      </div>
    </div>
  );
}

// Dashboard Section
function DashboardSection({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-naija-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'naija', change: '+12%' },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: Car, color: 'emerald', change: '+8%' },
    { label: 'Pending Approval', value: stats?.pendingListings || 0, icon: Clock, color: 'gold', change: null },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: ShoppingCart, color: 'blue', change: '+25%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Dashboard</h1>
        <p className="text-charcoal-500">Overview of your platform's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
                )}
              </div>
              <div className="text-3xl font-bold text-charcoal-800 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-charcoal-500">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-naija-500 to-naija-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold mb-1">Total Revenue</h2>
            <p className="text-naija-100">Platform earnings from service fees</p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
        <div className="text-4xl font-bold mb-2">
          ₦{(stats?.revenue || 0).toLocaleString()}
        </div>
        <div className="text-naija-100">
          From {stats?.totalBookings || 0} transactions
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal-800 mb-4">User Verification</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-pearl-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-naija-500 h-full rounded-full"
                style={{ width: `${stats?.totalUsers ? (stats.verifiedUsers / stats.totalUsers * 100) : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-charcoal-600">
              {stats?.verifiedUsers || 0}/{stats?.totalUsers || 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal-800 mb-4">Listing Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Active</span>
              <span className="font-medium">{stats?.activeListings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Pending</span>
              <span className="font-medium text-gold-600">{stats?.pendingListings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Total</span>
              <span className="font-medium">{stats?.totalListings || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-charcoal-800 mb-4">Pending Actions</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gold-50 rounded-lg">
              <span className="text-sm text-gold-700">Listings to review</span>
              <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-bold rounded-full">
                {stats?.pendingListings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">Pending bookings</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {stats?.pendingBookings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Section
function UsersSection({ addToast }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { userType: filterType }),
        ...(filterStatus !== 'all' && {
          ...(filterStatus === 'verified' && { isVerified: true }),
          ...(filterStatus === 'unverified' && { isVerified: false }),
          ...(filterStatus === 'active' && { isActive: true }),
          ...(filterStatus === 'inactive' && { isActive: false }),
        }),
      };
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      addToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, filterType, filterStatus]);

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      await adminAPI.verifyUser(userId, isVerified);
      addToast(isVerified ? 'User verified' : 'User verification removed', 'success');
      fetchUsers();
    } catch (error) {
      addToast('Failed to update user', 'error');
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, isActive);
      addToast(isActive ? 'User activated' : 'User deactivated', 'success');
      fetchUsers();
    } catch (error) {
      addToast('Failed to update user status', 'error');
    }
  };

  const handleUpdateBadge = async (userId, badge) => {
    try {
      await adminAPI.updateUserBadge(userId, badge);
      addToast('Badge updated', 'success');
      fetchUsers();
    } catch (error) {
      addToast('Failed to update badge', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Users</h1>
          <p className="text-charcoal-500">Manage platform users and verification</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-pearl-100 text-charcoal-700 rounded-xl hover:bg-pearl-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 border border-pearl-300 rounded-xl focus:border-naija-500 focus:ring-2 focus:ring-naija-100"
            />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl bg-white"
            >
              <option value="all">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DEALER">Dealer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-pearl-300 rounded-xl bg-white"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-naija-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pearl-50 border-b border-pearl-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-pearl-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center text-naija-600 font-bold">
                          {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-charcoal-800">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </span>
                            {user.isVerified && <BadgeCheck className="w-4 h-4 text-naija-500" />}
                          </div>
                          <div className="text-sm text-charcoal-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.userType === 'DEALER' ? (
                          <Building2 className="w-4 h-4 text-gold-600" />
                        ) : (
                          <Users className="w-4 h-4 text-charcoal-500" />
                        )}
                        <span className="text-charcoal-700">{user.userType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                          className="p-2 text-charcoal-500 hover:text-naija-600 hover:bg-naija-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {!user.isVerified ? (
                          <button
                            onClick={() => handleVerifyUser(user.id, true)}
                            className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Verify"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyUser(user.id, false)}
                            className="p-2 text-charcoal-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg"
                            title="Remove Verification"
                          >
                            <BadgeCheck className="w-5 h-5" />
                          </button>
                        )}
                        {user.isActive ? (
                          <button
                            onClick={() => handleToggleStatus(user.id, false)}
                            className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Deactivate"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, true)}
                            className="p-2 text-charcoal-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Activate"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-pearl-200 flex items-center justify-between">
            <span className="text-sm text-charcoal-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-pearl-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-pearl-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-lifted max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-pearl-200 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-charcoal-800">User Details</h3>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-pearl-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-naija-100 rounded-2xl flex items-center justify-center text-naija-600 text-2xl font-bold">
                    {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-charcoal-800">
                      {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                    </h4>
                    <p className="text-charcoal-500">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-pearl-50 rounded-xl">
                    <div className="text-charcoal-500">Type</div>
                    <div className="font-medium">{selectedUser.userType}</div>
                  </div>
                  <div className="p-3 bg-pearl-50 rounded-xl">
                    <div className="text-charcoal-500">Phone</div>
                    <div className="font-medium">{selectedUser.phoneNumber || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-pearl-50 rounded-xl">
                    <div className="text-charcoal-500">Verified</div>
                    <div className="font-medium">{selectedUser.isVerified ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="p-3 bg-pearl-50 rounded-xl">
                    <div className="text-charcoal-500">Status</div>
                    <div className="font-medium">{selectedUser.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-pearl-200">
                  <button
                    onClick={() => { handleVerifyUser(selectedUser.id, !selectedUser.isVerified); setShowUserModal(false); }}
                    className="flex-1 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600"
                  >
                    {selectedUser.isVerified ? 'Remove Verification' : 'Verify User'}
                  </button>
                  <button
                    onClick={() => { handleToggleStatus(selectedUser.id, !selectedUser.isActive); setShowUserModal(false); }}
                    className={`flex-1 py-3 rounded-xl ${selectedUser.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                  >
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Listings Section
function ListingsSection({ addToast }) {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus }),
      };
      const response = await adminAPI.getListings(params);
      setListings(response.data.data.listings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      addToast('Failed to load listings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [pagination.page, filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateListingStatus(id, status);
      addToast(`Listing ${status.toLowerCase()}`, 'success');
      fetchListings();
    } catch (error) {
      addToast('Failed to update listing', 'error');
    }
  };

  const handleFeature = async (id, isFeatured) => {
    try {
      await adminAPI.featureListing(id, isFeatured);
      addToast(isFeatured ? 'Listing featured' : 'Listing unfeatured', 'success');
      fetchListings();
    } catch (error) {
      addToast('Failed to update listing', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await adminAPI.deleteListing(id);
      addToast('Listing deleted', 'success');
      fetchListings();
    } catch (error) {
      addToast('Failed to delete listing', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-gold-100 text-gold-700',
      SOLD: 'bg-blue-100 text-blue-700',
      RENTED: 'bg-purple-100 text-purple-700',
      INACTIVE: 'bg-charcoal-100 text-charcoal-700',
    };
    return badges[status] || badges.INACTIVE;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Listings</h1>
          <p className="text-charcoal-500">Manage all vehicle listings</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-pearl-300 rounded-xl bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
          <button onClick={fetchListings} className="p-2 bg-pearl-100 rounded-xl hover:bg-pearl-200">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-naija-500 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No listings found</p>
          </div>
        ) : (
          <div className="divide-y divide-pearl-200">
            {listings.map((listing) => (
              <div key={listing.id} className="p-6 hover:bg-pearl-50 transition-colors">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-24 bg-pearl-100 rounded-xl overflow-hidden flex-shrink-0">
                    {listing.media?.[0] ? (
                      <img src={listing.media[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-8 h-8 text-charcoal-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-charcoal-800">
                          {listing.year} {listing.make} {listing.model}
                        </h3>
                        <p className="text-sm text-charcoal-500">
                          {listing.locationCity}, {listing.locationState}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-charcoal-600 mb-3">
                      <span>₦{parseFloat(listing.price).toLocaleString()}</span>
                      <span>{listing.condition.replace(/_/g, ' ')}</span>
                      {listing.isFeatured && (
                        <span className="flex items-center gap-1 text-gold-600">
                          <Star className="w-4 h-4" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => window.open(`/car/${listing.id}`, '_blank')}
                        className="px-3 py-1.5 bg-pearl-100 text-charcoal-700 rounded-lg text-sm hover:bg-pearl-200"
                      >
                        <Eye className="w-4 h-4 inline mr-1" /> View
                      </button>
                      {listing.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(listing.id, 'ACTIVE')}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(listing.id, 'INACTIVE')}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleFeature(listing.id, !listing.isFeatured)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${listing.isFeatured ? 'bg-gold-100 text-gold-700' : 'bg-pearl-100 text-charcoal-700 hover:bg-pearl-200'}`}
                      >
                        <Star className="w-4 h-4 inline mr-1" /> {listing.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-pearl-200 flex items-center justify-between">
            <span className="text-sm text-charcoal-500">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-pearl-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-pearl-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Bookings Section
function BookingsSection({ addToast }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsAPI.getAll({
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      addToast('Failed to load bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      addToast(`Booking ${status.toLowerCase()}`, 'success');
      fetchBookings();
    } catch (error) {
      addToast('Failed to update booking', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-gold-100 text-gold-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-charcoal-100 text-charcoal-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Bookings</h1>
          <p className="text-charcoal-500">Manage customer bookings and orders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-pearl-300 rounded-xl bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
          </div>
          <button onClick={fetchBookings} className="p-2 bg-pearl-100 rounded-xl hover:bg-pearl-200">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-naija-500 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pearl-50 border-b border-pearl-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Booking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pearl-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-pearl-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-charcoal-800">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-charcoal-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-charcoal-800">{booking.firstName} {booking.lastName}</div>
                      <div className="text-xs text-charcoal-500">{booking.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-charcoal-700">{booking.bookingType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-charcoal-800">
                        ₦{parseFloat(booking.totalPrice).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                              className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                            className="px-3 py-1 bg-naija-500 text-white text-xs rounded-lg hover:bg-naija-600"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection({ addToast }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Settings</h1>
        <p className="text-charcoal-500">Configure platform settings</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-charcoal-800 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="Naija Cars"
                className="w-full px-4 py-3 border border-pearl-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Contact Email</label>
              <input
                type="email"
                defaultValue="support@naijacars.com"
                className="w-full px-4 py-3 border border-pearl-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-charcoal-800 mb-4">Listing Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
              <div>
                <div className="font-medium text-charcoal-800">Auto-approve verified sellers</div>
                <div className="text-sm text-charcoal-500">Skip moderation for verified users</div>
              </div>
              <input type="checkbox" className="w-5 h-5 text-naija-500 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
              <div>
                <div className="font-medium text-charcoal-800">Require photos</div>
                <div className="text-sm text-charcoal-500">Listings must have at least one photo</div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-naija-500 rounded" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-charcoal-800 mb-4">Fee Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Service Fee (%)</label>
              <input
                type="number"
                defaultValue="1"
                className="w-full px-4 py-3 border border-pearl-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Featured Listing Fee (₦)</label>
              <input
                type="number"
                defaultValue="50000"
                className="w-full px-4 py-3 border border-pearl-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => addToast('Settings saved successfully', 'success')}
          className="w-full md:w-auto px-8 py-3 bg-naija-500 text-white font-medium rounded-xl hover:bg-naija-600 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
