import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreVertical, UserCheck, UserX, Trash2,
  ChevronLeft, ChevronRight, Eye, Mail, Phone, Shield,
  BadgeCheck, X, AlertTriangle, UserCog
} from 'lucide-react';
import api from '../../services/api';

const roleOptions = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'INDIVIDUAL_SELLER', label: 'Individual Seller' },
  { value: 'DEALER', label: 'Dealer' },
  { value: 'RENTAL_COMPANY', label: 'Rental Company' },
  { value: 'ADMIN', label: 'Admin' },
];

const userTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DEALER', label: 'Dealer' },
  { value: 'INDIVIDUAL_SELLER', label: 'Individual Seller' },
  { value: 'RENTAL_COMPANY', label: 'Rental Company' },
  { value: 'BUYER', label: 'Buyer' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionDropdown, setActionDropdown] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: currentPage,
          limit: usersPerPage,
          search: searchQuery,
          userType: userTypeFilter,
          status: statusFilter,
        },
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data for development
      setUsers([
        { id: '1', email: 'john@example.com', phoneNumber: '+2348012345678', userType: 'DEALER', isVerified: true, isActive: true, createdAt: new Date().toISOString(), profile: { firstName: 'John', lastName: 'Doe', businessName: 'AutoKing Motors', city: 'Lagos', state: 'Lagos' }, _count: { listings: 15 } },
        { id: '2', email: 'jane@example.com', phoneNumber: '+2348023456789', userType: 'INDIVIDUAL_SELLER', isVerified: false, isActive: true, createdAt: new Date().toISOString(), profile: { firstName: 'Jane', lastName: 'Smith', city: 'Abuja', state: 'FCT' }, _count: { listings: 3 } },
        { id: '3', email: 'mike@example.com', phoneNumber: '+2348034567890', userType: 'BUYER', isVerified: true, isActive: true, createdAt: new Date().toISOString(), profile: { firstName: 'Mike', lastName: 'Johnson', city: 'Port Harcourt', state: 'Rivers' }, _count: { listings: 0 } },
        { id: '4', email: 'sarah@example.com', phoneNumber: '+2348045678901', userType: 'RENTAL_COMPANY', isVerified: true, isActive: false, createdAt: new Date().toISOString(), profile: { firstName: 'Sarah', lastName: 'Williams', businessName: 'Premium Rentals', city: 'Ibadan', state: 'Oyo' }, _count: { listings: 8 } },
        { id: '5', email: 'admin@naijacars.com', phoneNumber: '+2348056789012', userType: 'ADMIN', isVerified: true, isActive: true, createdAt: new Date().toISOString(), profile: { firstName: 'Admin', lastName: 'User', city: 'Lagos', state: 'Lagos' }, _count: { listings: 0 } },
      ]);
      setTotalPages(3);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u));
    } catch (error) {
      console.error('Error verifying user:', error);
    }
    setActionDropdown(null);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
    setActionDropdown(null);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setActionDropdown(null);
  };

  const openRoleModal = (user) => {
    setRoleChangeUser(user);
    setNewRole(user.userType);
    setShowRoleModal(true);
    setActionDropdown(null);
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser || !newRole || newRole === roleChangeUser.userType) {
      setShowRoleModal(false);
      return;
    }

    try {
      await api.patch(`/admin/users/${roleChangeUser.id}/role`, { userType: newRole });
      setUsers(users.map(u => u.id === roleChangeUser.id ? { ...u, userType: newRole } : u));
      setShowRoleModal(false);
      setRoleChangeUser(null);
    } catch (error) {
      console.error('Error changing user role:', error);
      alert(error.response?.data?.error?.message || 'Failed to change user role');
    }
  };

  const getUserTypeBadge = (type) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-700',
      DEALER: 'bg-naija-100 text-naija-700',
      INDIVIDUAL_SELLER: 'bg-blue-100 text-blue-700',
      RENTAL_COMPANY: 'bg-emerald-100 text-emerald-700',
      BUYER: 'bg-charcoal-100 text-charcoal-700',
    };
    return styles[type] || styles.BUYER;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setActionDropdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all bg-white"
            >
              {userTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-naija-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pearl-50 border-b border-pearl-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Listings</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-pearl-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center">
                            <span className="text-naija-600 font-bold">
                              {user.profile?.firstName?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-charcoal-800">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </div>
                            {user.profile?.businessName && (
                              <div className="text-sm text-charcoal-500">{user.profile.businessName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-charcoal-800">{user.email}</div>
                        <div className="text-sm text-charcoal-500">{user.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeBadge(user.userType)}`}>
                          {user.userType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isVerified ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm">
                              <BadgeCheck className="w-4 h-4" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              Unverified
                            </span>
                          )}
                          {!user.isActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-600">
                        {user._count?.listings || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setActionDropdown(actionDropdown === user.id ? null : user.id)}
                          className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-charcoal-500" />
                        </button>

                        <AnimatePresence>
                          {actionDropdown === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-lg border border-pearl-200 py-2 z-10"
                            >
                              <button
                                onClick={() => viewUserDetails(user)}
                                className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-pearl-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              {!user.isVerified && (
                                <button
                                  onClick={() => handleVerifyUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Verify User
                                </button>
                              )}
                              {user.userType !== 'ADMIN' && (
                                <button
                                  onClick={() => openRoleModal(user)}
                                  className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <UserCog className="w-4 h-4" />
                                  Change Role
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleActive(user.id, user.isActive)}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                  user.isActive
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Activate User
                                  </>
                                )}
                              </button>
                              {user.userType !== 'ADMIN' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-pearl-200 flex items-center justify-between">
              <div className="text-sm text-charcoal-500">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between">
                <h2 className="font-display font-semibold text-charcoal-800">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-naija-100 rounded-2xl flex items-center justify-center">
                    <span className="text-naija-600 font-bold text-2xl">
                      {selectedUser.profile?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-charcoal-800">
                      {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                    </div>
                    {selectedUser.profile?.businessName && (
                      <div className="text-charcoal-500">{selectedUser.profile.businessName}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeBadge(selectedUser.userType)}`}>
                        {selectedUser.userType.replace('_', ' ')}
                      </span>
                      {selectedUser.isVerified && (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs">
                          <BadgeCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-charcoal-700">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-charcoal-600">
                      <Mail className="w-4 h-4 text-charcoal-400" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-3 text-charcoal-600">
                      <Phone className="w-4 h-4 text-charcoal-400" />
                      {selectedUser.phoneNumber}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {(selectedUser.profile?.city || selectedUser.profile?.state) && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-charcoal-700">Location</h3>
                    <div className="text-charcoal-600">
                      {selectedUser.profile?.city}, {selectedUser.profile?.state}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pearl-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-charcoal-800">{selectedUser._count?.listings || 0}</div>
                    <div className="text-sm text-charcoal-500">Total Listings</div>
                  </div>
                  <div className="bg-pearl-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-charcoal-800">{formatDate(selectedUser.createdAt)}</div>
                    <div className="text-sm text-charcoal-500">Member Since</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {!selectedUser.isVerified && (
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                    >
                      Verify User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleToggleActive(selectedUser.id, selectedUser.isActive);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-colors font-medium ${
                      selectedUser.isActive
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-naija-500 text-white hover:bg-naija-600'
                    }`}
                  >
                    {selectedUser.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && roleChangeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full"
            >
              <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between">
                <h2 className="font-display font-semibold text-charcoal-800">Change User Role</h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 bg-pearl-50 rounded-xl">
                  <div className="w-12 h-12 bg-naija-100 rounded-xl flex items-center justify-center">
                    <span className="text-naija-600 font-bold text-lg">
                      {roleChangeUser.profile?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-charcoal-800">
                      {roleChangeUser.profile?.firstName} {roleChangeUser.profile?.lastName}
                    </div>
                    <div className="text-sm text-charcoal-500">{roleChangeUser.email}</div>
                  </div>
                </div>

                {/* Current Role */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-1">
                    Current Role
                  </label>
                  <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getUserTypeBadge(roleChangeUser.userType)}`}>
                    {roleChangeUser.userType.replace('_', ' ')}
                  </div>
                </div>

                {/* New Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warning for Admin */}
                {newRole === 'ADMIN' && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl text-amber-800">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong>Warning:</strong> Granting admin privileges will give this user full access to manage the platform, including other users and all listings.
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 py-2.5 bg-pearl-100 text-charcoal-700 rounded-xl hover:bg-pearl-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleChange}
                    disabled={newRole === roleChangeUser.userType}
                    className="flex-1 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Role
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
