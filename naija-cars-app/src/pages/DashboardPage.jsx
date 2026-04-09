import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Eye, Heart, MessageCircle, TrendingUp,
  Edit, Trash2, Plus
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import api, { subscriptionAPI } from '../services/api';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { setIsListCarOpen, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's own listings (all statuses)
  const { data: listingsData, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const response = await api.get('/users/me/listings');
      return response.data;
    },
    enabled: isAuthenticated && !!user,
  });

  // Fetch subscription status
  const { data: subData } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionAPI.getMySubscription(),
    enabled: isAuthenticated,
  });
  const subscription = subData?.data?.data?.subscription;

  // Fetch favorites count
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites-count'],
    queryFn: async () => {
      const response = await api.get('/users/me/favorites');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch conversations to derive per-listing message counts
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const listings = listingsData?.data?.listings || [];
  const favoritesCount = favoritesData?.data?.favorites?.length || 0;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success-100 text-success-700';
      case 'PENDING': return 'bg-gold-100 text-gold-700';
      case 'SOLD': return 'bg-blue-100 text-blue-700';
      case 'RENTED': return 'bg-purple-100 text-purple-700';
      case 'INACTIVE': return 'bg-charcoal-100 text-charcoal-600';
      default: return 'bg-charcoal-100 text-charcoal-600';
    }
  };

  // Build per-listing message count from conversations
  const conversations = conversationsData?.data?.conversations || [];
  const messagesByListing = conversations.reduce((map, conv) => {
    const listingId = conv.listing?.id;
    if (listingId) {
      map[listingId] = (map[listingId] || 0) + 1;
    }
    return map;
  }, {});

  // Calculate stats
  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'ACTIVE').length;
  const pendingListings = listings.filter(l => l.status === 'PENDING').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favoritesCount || 0), 0);

  const handleDeleteListing = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await api.delete(`/listings/${id}`);
      addToast('Listing deleted successfully', 'success');
      refetch();
    } catch (error) {
      addToast('Failed to delete listing', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-pearl-100 pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-charcoal-700 mb-2">
            Dashboard
          </h1>
          <p className="text-charcoal-500">
            Welcome back, {user?.profile?.firstName || user?.email}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-pearl-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-naija-500 text-naija-600'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Subscription Status */}
            {subscription ? (
              <div className="bg-naija-50 border border-naija-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-naija-800">
                    {subscription.planName} Plan
                  </p>
                  <p className="text-sm text-naija-700 mt-0.5">
                    {subscription.listingsLimit === -1
                      ? `Unlimited listings \u2022 ${subscription.listingsUsed} used`
                      : `${subscription.listingsUsed}/${subscription.listingsLimit} listings used`}
                    {' '}&middot; Expires {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                  {subscription.listingsLimit !== -1 && (
                    <div className="mt-2 w-48 bg-naija-100 rounded-full h-2">
                      <div
                        className="bg-naija-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (subscription.listingsUsed / subscription.listingsLimit) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <Link
                  to="/pricing"
                  className="px-5 py-2 bg-naija-500 hover:bg-naija-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {subscription.planType === 'PREMIUM' ? 'Manage' : 'Upgrade'}
                </Link>
              </div>
            ) : (
              <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gold-800">No active subscription</p>
                  <p className="text-sm text-gold-700 mt-0.5">
                    Subscribe to start listing your cars on NaijaCars.
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="px-5 py-2 bg-naija-500 hover:bg-naija-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  View Plans
                </Link>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-naija-100 rounded-xl">
                    <Car className="w-6 h-6 text-naija-600" />
                  </div>
                  <span className="text-xs text-success-600 font-medium">Active</span>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  {activeListings}
                </div>
                <div className="text-sm text-charcoal-500">Active Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gold-100 rounded-xl">
                    <Eye className="w-6 h-6 text-gold-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  {totalViews}
                </div>
                <div className="text-sm text-charcoal-500">Total Views</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  {totalFavorites}
                </div>
                <div className="text-sm text-charcoal-500">Total Favorites</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-charcoal-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-charcoal-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-charcoal-800 mb-1">
                  {totalListings}
                </div>
                <div className="text-sm text-charcoal-500">Total Listings</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-display font-bold text-charcoal-700 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsListCarOpen(true)}
                  className="p-4 border-2 border-dashed border-pearl-300 rounded-xl
                           hover:border-naija-500 hover:bg-naija-50 transition-all
                           flex items-center gap-3 text-left"
                >
                  <div className="p-3 bg-naija-100 rounded-xl">
                    <Plus className="w-6 h-6 text-naija-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-800">Add New Listing</div>
                    <div className="text-sm text-charcoal-500">List a car for sale or rent</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/messages')}
                  className="p-4 border-2 border-pearl-300 rounded-xl
                           hover:border-naija-500 hover:bg-naija-50 transition-all
                           flex items-center gap-3 text-left"
                >
                  <div className="p-3 bg-gold-100 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-800">View Messages</div>
                    <div className="text-sm text-charcoal-500">Check your inbox</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Listings Preview */}
            {listings.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-display font-bold text-charcoal-700 mb-4">
                  Recent Listings
                </h2>
                <div className="space-y-3">
                  {listings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 p-3 bg-pearl-50 rounded-xl"
                    >
                      {listing.media && listing.media[0] ? (
                        <img
                          src={listing.media[0].thumbnailUrl || listing.media[0].url}
                          alt={`${listing.make} ${listing.model}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-pearl-200 rounded-lg flex items-center justify-center">
                          <Car className="w-8 h-8 text-charcoal-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="font-semibold text-charcoal-800">
                          {listing.year} {listing.make} {listing.model}
                        </div>
                        <div className="text-sm text-charcoal-500">
                          {listing.locationCity}, {listing.locationState}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.viewsCount || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {listing.favoritesCount || 0} favorites
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-naija-600">
                          ₦{parseFloat(listing.price).toLocaleString()}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg ${getStatusStyle(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {listings.length > 3 && (
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="w-full mt-4 py-2 text-naija-600 hover:text-naija-700
                             font-medium transition-colors"
                  >
                    View all {listings.length} listings →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold text-charcoal-700">
                My Listings ({listings.length})
              </h2>
              <button
                onClick={() => setIsListCarOpen(true)}
                className="px-6 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600
                         transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Listing
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-card">
                <Car className="w-16 h-16 mx-auto mb-4 text-charcoal-300" />
                <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
                  No listings yet
                </h3>
                <p className="text-charcoal-500 mb-6">
                  Start by creating your first car listing
                </p>
                <button
                  onClick={() => setIsListCarOpen(true)}
                  className="px-8 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600
                           transition-colors"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {listings.map((listing) => (
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
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-naija-600">
                              ₦{parseFloat(listing.price).toLocaleString()}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-lg ${getStatusStyle(listing.status)}`}>
                              {listing.status}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 mb-4 text-sm text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.viewsCount || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.favoritesCount || 0} favorites
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {messagesByListing[listing.id] || 0} messages
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/car/${listing.id}`)}
                            className="px-4 py-2 bg-pearl-100 text-charcoal-700 rounded-lg
                                     hover:bg-pearl-200 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/sell?edit=${listing.id}`)}
                            className="px-4 py-2 bg-naija-100 text-naija-700 rounded-lg
                                     hover:bg-naija-200 transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg
                                     hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
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
      </div>
    </div>
  );
}
