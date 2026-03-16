import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Car, MapPin, Eye,
  PieChart, Activity, Calendar
} from 'lucide-react';
import api from '../../services/api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/analytics/overview');
      setAnalytics(response.data.data);
    } catch (error) {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-emerald-500',
      PENDING: 'bg-amber-500',
      SOLD: 'bg-blue-500',
      RENTED: 'bg-purple-500',
      INACTIVE: 'bg-charcoal-400'
    };
    return colors[status] || 'bg-charcoal-400';
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      BUYER: 'Buyers',
      DEALER: 'Dealers',
      INDIVIDUAL_SELLER: 'Individual Sellers',
      RENTAL_COMPANY: 'Rental Companies',
      ADMIN: 'Admins'
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      BUYER: 'bg-blue-500',
      DEALER: 'bg-emerald-500',
      INDIVIDUAL_SELLER: 'bg-amber-500',
      RENTAL_COMPANY: 'bg-purple-500',
      ADMIN: 'bg-red-500'
    };
    return colors[type] || 'bg-charcoal-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-naija-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BarChart3 className="w-12 h-12 text-charcoal-300" />
        <p className="text-charcoal-500 font-medium">Failed to load analytics data</p>
        <button onClick={fetchAnalytics} className="px-4 py-2 bg-naija-500 text-white rounded-xl text-sm font-medium hover:bg-naija-600 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const totalListings = analytics?.listingsByStatus?.reduce((sum, s) => sum + s.count, 0) || 0;
  const totalUsers = analytics?.usersByType?.reduce((sum, u) => sum + u.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-charcoal-800">Analytics Dashboard</h1>
        <p className="text-charcoal-500">Insights and statistics about your platform</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-800">{formatNumber(totalUsers)}</div>
              <div className="text-sm text-charcoal-500">Total Users</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Car className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-800">{formatNumber(totalListings)}</div>
              <div className="text-sm text-charcoal-500">Total Listings</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-800">
                {analytics?.listingsByStatus?.find(s => s.status === 'ACTIVE')?.count || 0}
              </div>
              <div className="text-sm text-charcoal-500">Active Listings</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-charcoal-800">
                {analytics?.listingsByStatus?.find(s => s.status === 'SOLD')?.count || 0}
              </div>
              <div className="text-sm text-charcoal-500">Cars Sold</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-charcoal-600" />
            <h3 className="font-semibold text-charcoal-800">Listings by Status</h3>
          </div>
          <div className="space-y-4">
            {analytics?.listingsByStatus?.map((item, index) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-charcoal-700">{item.status}</span>
                    <span className="text-sm text-charcoal-500">{item.count}</span>
                  </div>
                  <div className="h-2 bg-pearl-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / totalListings) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`h-full ${getStatusColor(item.status)}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Users by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-charcoal-600" />
            <h3 className="font-semibold text-charcoal-800">Users by Type</h3>
          </div>
          <div className="space-y-4">
            {analytics?.usersByType?.map((item, index) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getUserTypeColor(item.type)}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-charcoal-700">{getUserTypeLabel(item.type)}</span>
                    <span className="text-sm text-charcoal-500">{item.count}</span>
                  </div>
                  <div className="h-2 bg-pearl-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / totalUsers) * 100}%` }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`h-full ${getUserTypeColor(item.type)}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-charcoal-600" />
            <h3 className="font-semibold text-charcoal-800">Top Locations</h3>
          </div>
          <div className="space-y-3">
            {analytics?.topLocations?.slice(0, 5).map((item, index) => (
              <div key={item.state} className="flex items-center justify-between p-3 bg-pearl-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-naija-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-charcoal-700">{item.state}</span>
                </div>
                <span className="text-charcoal-500">{item.count} listings</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Car Makes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-6">
            <Car className="w-5 h-5 text-charcoal-600" />
            <h3 className="font-semibold text-charcoal-800">Top Car Makes</h3>
          </div>
          <div className="space-y-3">
            {analytics?.topMakes?.slice(0, 5).map((item, index) => (
              <div key={item.make} className="flex items-center justify-between p-3 bg-pearl-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-charcoal-700">{item.make}</span>
                </div>
                <span className="text-charcoal-500">{item.count} listings</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Listings Type Split */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-charcoal-600" />
          <h3 className="font-semibold text-charcoal-800">Listings by Type</h3>
        </div>
        <div className="flex gap-8 items-center justify-center">
          {analytics?.listingsByType?.map((item) => {
            const percentage = totalListings > 0 ? ((item.count / totalListings) * 100).toFixed(1) : 0;
            return (
              <div key={item.type} className="text-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  item.type === 'SALE' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <div>
                    <div className={`text-3xl font-bold ${
                      item.type === 'SALE' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {item.count}
                    </div>
                    <div className="text-sm text-charcoal-500">{percentage}%</div>
                  </div>
                </div>
                <div className="mt-3 font-medium text-charcoal-700">
                  {item.type === 'SALE' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Most Viewed Listings */}
      {analytics?.mostViewedListings?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-charcoal-600" />
            <h3 className="font-semibold text-charcoal-800">Most Viewed Listings</h3>
          </div>
          <div className="space-y-3">
            {analytics.mostViewedListings.map((listing, index) => (
              <div key={listing.id} className="flex items-center gap-4 p-3 bg-pearl-50 rounded-xl">
                <span className="w-8 h-8 bg-naija-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="w-16 h-12 bg-pearl-200 rounded-lg overflow-hidden">
                  {listing.media?.[0]?.url ? (
                    <img
                      src={listing.media[0].url}
                      alt={`${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-charcoal-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-charcoal-800">
                    {listing.year} {listing.make} {listing.model}
                  </div>
                  <div className="text-sm text-charcoal-500">
                    {listing.seller?.profile?.businessName ||
                     `${listing.seller?.profile?.firstName || ''} ${listing.seller?.profile?.lastName || ''}`}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-charcoal-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{formatNumber(listing.viewsCount)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
