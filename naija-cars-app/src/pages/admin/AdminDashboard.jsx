import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Car, DollarSign, TrendingUp, Eye, Clock,
  CheckCircle, XCircle, AlertTriangle, ArrowUpRight,
  ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import api from '../../services/api';

const statCards = [
  {
    name: 'Total Users',
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    name: 'Active Listings',
    icon: Car,
    color: 'bg-naija-500',
    lightColor: 'bg-naija-50',
    textColor: 'text-naija-600',
  },
  {
    name: 'Pending Approval',
    icon: Clock,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    name: 'Total Revenue',
    icon: DollarSign,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingApproval: 0,
    totalRevenue: 0,
    userGrowth: 0,
    listingGrowth: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, listingsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/listings/recent'),
        api.get('/admin/users/recent'),
      ]);

      setStats(statsRes.data);
      setRecentListings(listingsRes.data);
      setRecentUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for now
      setStats({
        totalUsers: 156,
        activeListings: 89,
        pendingApproval: 12,
        totalRevenue: 2450000,
        userGrowth: 12.5,
        listingGrowth: 8.3,
      });
      setRecentListings([
        { id: '1', make: 'Toyota', model: 'Camry', year: 2020, price: 15500000, status: 'PENDING', createdAt: new Date().toISOString() },
        { id: '2', make: 'Honda', model: 'Accord', year: 2019, price: 12000000, status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: '3', make: 'Mercedes-Benz', model: 'C300', year: 2021, price: 28000000, status: 'PENDING', createdAt: new Date().toISOString() },
        { id: '4', make: 'Lexus', model: 'RX 350', year: 2018, price: 22000000, status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: '5', make: 'BMW', model: 'X5', year: 2020, price: 35000000, status: 'PENDING', createdAt: new Date().toISOString() },
      ]);
      setRecentUsers([
        { id: '1', profile: { firstName: 'John', lastName: 'Doe' }, email: 'john@example.com', userType: 'DEALER', createdAt: new Date().toISOString() },
        { id: '2', profile: { firstName: 'Jane', lastName: 'Smith' }, email: 'jane@example.com', userType: 'INDIVIDUAL_SELLER', createdAt: new Date().toISOString() },
        { id: '3', profile: { firstName: 'Mike', lastName: 'Johnson' }, email: 'mike@example.com', userType: 'BUYER', createdAt: new Date().toISOString() },
        { id: '4', profile: { firstName: 'Sarah', lastName: 'Williams' }, email: 'sarah@example.com', userType: 'RENTAL_COMPANY', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatValue = (name) => {
    switch (name) {
      case 'Total Users':
        return stats.totalUsers;
      case 'Active Listings':
        return stats.activeListings;
      case 'Pending Approval':
        return stats.pendingApproval;
      case 'Total Revenue':
        return formatCurrency(stats.totalRevenue);
      default:
        return 0;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      SOLD: 'bg-blue-100 text-blue-700',
      INACTIVE: 'bg-charcoal-100 text-charcoal-700',
    };
    return styles[status] || styles.PENDING;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-naija-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.lightColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {card.name === 'Total Users' && (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">{stats.userGrowth}%</span>
                  </>
                )}
                {card.name === 'Active Listings' && (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">{stats.listingGrowth}%</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-charcoal-800 mb-1">
              {getStatValue(card.name)}
            </div>
            <div className="text-sm text-charcoal-500">{card.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-soft"
        >
          <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between">
            <h2 className="font-display font-semibold text-charcoal-800">Recent Listings</h2>
            <Link to="/admin/listings" className="text-sm text-naija-600 hover:text-naija-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-pearl-100">
            {recentListings.map((listing) => (
              <div key={listing.id} className="px-6 py-4 flex items-center justify-between hover:bg-pearl-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pearl-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-charcoal-400" />
                  </div>
                  <div>
                    <div className="font-medium text-charcoal-800">
                      {listing.year} {listing.make} {listing.model}
                    </div>
                    <div className="text-sm text-charcoal-500">
                      {formatCurrency(listing.price)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                    {listing.status}
                  </span>
                  <Link to={`/admin/listings`} className="p-1 hover:bg-pearl-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-charcoal-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-soft"
        >
          <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between">
            <h2 className="font-display font-semibold text-charcoal-800">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-naija-600 hover:text-naija-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-pearl-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-pearl-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-naija-100 rounded-xl flex items-center justify-center">
                    <span className="text-naija-600 font-bold">
                      {user.profile?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-charcoal-800">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </div>
                    <div className="text-sm text-charcoal-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeBadge(user.userType)}`}>
                    {user.userType.replace('_', ' ')}
                  </span>
                  <Link to="/admin/users" className="p-1 hover:bg-pearl-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-charcoal-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <h2 className="font-display font-semibold text-charcoal-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/listings/pending"
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
          >
            <Clock className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-charcoal-700">Review Pending</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <Users className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-charcoal-700">Manage Users</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
          >
            <TrendingUp className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-charcoal-700">View Analytics</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
          >
            <AlertTriangle className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-charcoal-700">Settings</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
