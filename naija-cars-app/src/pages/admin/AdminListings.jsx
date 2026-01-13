import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2,
  ChevronLeft, ChevronRight, Eye, Star, StarOff, Car,
  MapPin, Calendar, X, ExternalLink
} from 'lucide-react';
import api from '../../services/api';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const listingTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
];

const conditionOptions = [
  { value: '', label: 'All Conditions' },
  { value: 'BRAND_NEW', label: 'Brand New' },
  { value: 'FOREIGN_USED', label: 'Foreign Used' },
  { value: 'NIGERIAN_USED', label: 'Nigerian Used' },
];

export default function AdminListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [actionDropdown, setActionDropdown] = useState(null);

  const listingsPerPage = 10;

  useEffect(() => {
    fetchListings();
  }, [currentPage, searchQuery, statusFilter, typeFilter, conditionFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/listings', {
        params: {
          page: currentPage,
          limit: listingsPerPage,
          search: searchQuery,
          status: statusFilter,
          listingType: typeFilter,
          condition: conditionFilter,
        },
      });
      setListings(response.data.listings);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Mock data for development
      setListings([
        { id: '1', make: 'Toyota', model: 'Camry', year: 2020, price: 15500000, status: 'PENDING', listingType: 'SALE', condition: 'FOREIGN_USED', locationState: 'Lagos', locationCity: 'Victoria Island', viewsCount: 145, isFeatured: false, createdAt: new Date().toISOString(), seller: { profile: { firstName: 'John', lastName: 'Doe', businessName: 'AutoKing Motors' } }, media: [{ url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400' }] },
        { id: '2', make: 'Honda', model: 'Accord', year: 2019, price: 12000000, status: 'ACTIVE', listingType: 'SALE', condition: 'NIGERIAN_USED', locationState: 'Abuja', locationCity: 'Wuse', viewsCount: 89, isFeatured: true, createdAt: new Date().toISOString(), seller: { profile: { firstName: 'Jane', lastName: 'Smith' } }, media: [{ url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400' }] },
        { id: '3', make: 'Mercedes-Benz', model: 'C300', year: 2021, price: 28000000, status: 'PENDING', listingType: 'SALE', condition: 'BRAND_NEW', locationState: 'Lagos', locationCity: 'Lekki', viewsCount: 203, isFeatured: false, createdAt: new Date().toISOString(), seller: { profile: { firstName: 'Mike', lastName: 'Johnson', businessName: 'Elite Motors' } }, media: [{ url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400' }] },
        { id: '4', make: 'Lexus', model: 'RX 350', year: 2018, price: 22000000, status: 'ACTIVE', listingType: 'RENT', condition: 'FOREIGN_USED', locationState: 'Port Harcourt', locationCity: 'GRA', viewsCount: 167, isFeatured: true, createdAt: new Date().toISOString(), seller: { profile: { firstName: 'Sarah', lastName: 'Williams', businessName: 'Premium Rentals' } }, media: [{ url: 'https://images.unsplash.com/photo-1551501474-8e082e451939?w=400' }] },
        { id: '5', make: 'BMW', model: 'X5', year: 2020, price: 35000000, status: 'SOLD', listingType: 'SALE', condition: 'FOREIGN_USED', locationState: 'Lagos', locationCity: 'Ikoyi', viewsCount: 312, isFeatured: false, createdAt: new Date().toISOString(), seller: { profile: { firstName: 'David', lastName: 'Brown', businessName: 'AutoKing Motors' } }, media: [{ url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400' }] },
      ]);
      setTotalPages(5);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId) => {
    try {
      await api.patch(`/admin/listings/${listingId}/approve`);
      setListings(listings.map(l => l.id === listingId ? { ...l, status: 'ACTIVE' } : l));
    } catch (error) {
      console.error('Error approving listing:', error);
    }
    setActionDropdown(null);
  };

  const handleReject = async (listingId) => {
    try {
      await api.patch(`/admin/listings/${listingId}/reject`);
      setListings(listings.map(l => l.id === listingId ? { ...l, status: 'INACTIVE' } : l));
    } catch (error) {
      console.error('Error rejecting listing:', error);
    }
    setActionDropdown(null);
  };

  const handleToggleFeatured = async (listingId, currentStatus) => {
    try {
      await api.patch(`/admin/listings/${listingId}/featured`, { isFeatured: !currentStatus });
      setListings(listings.map(l => l.id === listingId ? { ...l, isFeatured: !currentStatus } : l));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
    setActionDropdown(null);
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/admin/listings/${listingId}`);
      setListings(listings.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
    setActionDropdown(null);
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

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700',
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      SOLD: 'bg-blue-100 text-blue-700',
      RENTED: 'bg-purple-100 text-purple-700',
      INACTIVE: 'bg-charcoal-100 text-charcoal-700',
    };
    return styles[status] || styles.PENDING;
  };

  const getConditionBadge = (condition) => {
    const labels = {
      BRAND_NEW: 'Brand New',
      FOREIGN_USED: 'Foreign Used',
      NIGERIAN_USED: 'Nigerian Used',
    };
    return labels[condition] || condition;
  };

  const viewListingDetails = (listing) => {
    setSelectedListing(listing);
    setShowListingModal(true);
    setActionDropdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by make, model, or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all bg-white"
            >
              {listingTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 transition-all bg-white"
            >
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table */}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Listed</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pearl-100">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-pearl-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-pearl-100 rounded-lg overflow-hidden">
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
                          <div>
                            <div className="font-medium text-charcoal-800 flex items-center gap-2">
                              {listing.year} {listing.make} {listing.model}
                              {listing.isFeatured && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <div className="text-sm text-charcoal-500 flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                listing.listingType === 'RENT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {listing.listingType}
                              </span>
                              <span>{getConditionBadge(listing.condition)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-charcoal-800">
                          {listing.seller?.profile?.firstName} {listing.seller?.profile?.lastName}
                        </div>
                        {listing.seller?.profile?.businessName && (
                          <div className="text-sm text-charcoal-500">{listing.seller.profile.businessName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-charcoal-800">
                          {formatCurrency(listing.price)}
                          {listing.listingType === 'RENT' && <span className="text-charcoal-500 font-normal">/day</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-charcoal-600">
                          <Eye className="w-4 h-4" />
                          {listing.viewsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-500">
                        {formatDate(listing.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setActionDropdown(actionDropdown === listing.id ? null : listing.id)}
                          className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-charcoal-500" />
                        </button>

                        <AnimatePresence>
                          {actionDropdown === listing.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-lg border border-pearl-200 py-2 z-10"
                            >
                              <button
                                onClick={() => viewListingDetails(listing)}
                                className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-pearl-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <Link
                                to={`/cars/${listing.id}`}
                                target="_blank"
                                className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-pearl-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View on Site
                              </Link>
                              {listing.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(listing.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(listing.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleToggleFeatured(listing.id, listing.isFeatured)}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                                  listing.isFeatured
                                    ? 'text-charcoal-600 hover:bg-pearl-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                              >
                                {listing.isFeatured ? (
                                  <>
                                    <StarOff className="w-4 h-4" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4" />
                                    Mark Featured
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(listing.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Listing
                              </button>
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

      {/* Listing Details Modal */}
      <AnimatePresence>
        {showListingModal && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowListingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between">
                <h2 className="font-display font-semibold text-charcoal-800">Listing Details</h2>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Image */}
                <div className="aspect-video bg-pearl-100 rounded-xl overflow-hidden">
                  {selectedListing.media?.[0]?.url ? (
                    <img
                      src={selectedListing.media[0].url}
                      alt={`${selectedListing.make} ${selectedListing.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-charcoal-400" />
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-charcoal-800">
                      {selectedListing.year} {selectedListing.make} {selectedListing.model}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedListing.status)}`}>
                      {selectedListing.status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-naija-600">
                    {formatCurrency(selectedListing.price)}
                    {selectedListing.listingType === 'RENT' && <span className="text-charcoal-500 font-normal text-base">/day</span>}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pearl-50 rounded-xl p-4">
                    <div className="text-sm text-charcoal-500">Condition</div>
                    <div className="font-medium text-charcoal-800">{getConditionBadge(selectedListing.condition)}</div>
                  </div>
                  <div className="bg-pearl-50 rounded-xl p-4">
                    <div className="text-sm text-charcoal-500">Listing Type</div>
                    <div className="font-medium text-charcoal-800">{selectedListing.listingType === 'RENT' ? 'For Rent' : 'For Sale'}</div>
                  </div>
                  <div className="bg-pearl-50 rounded-xl p-4">
                    <div className="text-sm text-charcoal-500">Location</div>
                    <div className="font-medium text-charcoal-800">{selectedListing.locationCity}, {selectedListing.locationState}</div>
                  </div>
                  <div className="bg-pearl-50 rounded-xl p-4">
                    <div className="text-sm text-charcoal-500">Views</div>
                    <div className="font-medium text-charcoal-800">{selectedListing.viewsCount}</div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="border-t border-pearl-200 pt-4">
                  <h4 className="font-medium text-charcoal-700 mb-2">Seller Information</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center">
                      <span className="text-naija-600 font-bold">
                        {selectedListing.seller?.profile?.firstName?.[0] || 'S'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-charcoal-800">
                        {selectedListing.seller?.profile?.firstName} {selectedListing.seller?.profile?.lastName}
                      </div>
                      {selectedListing.seller?.profile?.businessName && (
                        <div className="text-sm text-charcoal-500">{selectedListing.seller.profile.businessName}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedListing.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedListing.id);
                          setShowListingModal(false);
                        }}
                        className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                      >
                        Approve Listing
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedListing.id);
                          setShowListingModal(false);
                        }}
                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
                      >
                        Reject Listing
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleToggleFeatured(selectedListing.id, selectedListing.isFeatured);
                      setShowListingModal(false);
                    }}
                    className={`flex-1 py-2.5 rounded-xl transition-colors font-medium ${
                      selectedListing.isFeatured
                        ? 'bg-charcoal-200 text-charcoal-700 hover:bg-charcoal-300'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {selectedListing.isFeatured ? 'Remove Featured' : 'Mark Featured'}
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
