import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2,
  ChevronLeft, ChevronRight, Eye, Star, StarOff, Car,
  MapPin, Calendar, X, ExternalLink, Plus, Edit3, Save
} from 'lucide-react';
import api from '../../services/api';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const carMakes = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Kia',
  'Nissan', 'Volkswagen', 'Audi', 'Mazda', 'Chevrolet', 'Jeep', 'Land Rover',
  'Porsche', 'Peugeot', 'Mitsubishi', 'Subaru', 'Volvo', 'Infiniti', 'Acura'
];

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

  // Create/Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    sellerId: '',
    listingType: 'SALE',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    condition: 'FOREIGN_USED',
    price: '',
    locationState: 'Lagos',
    locationCity: '',
    description: '',
    status: 'ACTIVE',
    isFeatured: false,
    images: ['']
  });

  const listingsPerPage = 10;

  useEffect(() => {
    fetchListings();
  }, [currentPage, searchQuery, statusFilter, typeFilter, conditionFilter]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/admin/sellers');
      setSellers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      sellerId: '',
      listingType: 'SALE',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      trim: '',
      mileage: '',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      condition: 'FOREIGN_USED',
      price: '',
      locationState: 'Lagos',
      locationCity: '',
      description: '',
      status: 'ACTIVE',
      isFeatured: false,
      images: ['']
    });
    setEditingListing(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowEditModal(true);
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setFormData({
      sellerId: listing.sellerId || '',
      listingType: listing.listingType || 'SALE',
      make: listing.make || '',
      model: listing.model || '',
      year: listing.year || new Date().getFullYear(),
      trim: listing.trim || '',
      mileage: listing.mileage || '',
      transmission: listing.transmission || 'Automatic',
      fuelType: listing.fuelType || 'Petrol',
      condition: listing.condition || 'FOREIGN_USED',
      price: listing.price || '',
      locationState: listing.locationState || 'Lagos',
      locationCity: listing.locationCity || '',
      description: listing.description || '',
      status: listing.status || 'ACTIVE',
      isFeatured: listing.isFeatured || false,
      images: listing.media?.map(m => m.url) || ['']
    });
    setShowEditModal(true);
    setActionDropdown(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (editingListing) {
        await api.put(`/admin/listings/${editingListing.id}`, payload);
      } else {
        await api.post('/admin/listings', payload);
      }

      setShowEditModal(false);
      resetForm();
      fetchListings();
    } catch (error) {
      console.error('Error saving listing:', error);
      alert(error.response?.data?.error?.message || 'Failed to save listing');
    } finally {
      setFormLoading(false);
    }
  };

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
      setListings(response.data.data.listings || []);
      setTotalPages(response.data.data.totalPages || 1);
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
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal-800">Listings Management</h1>
          <p className="text-charcoal-500">Manage all car listings on the platform</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Listing
        </button>
      </div>

      {/* Search and Filters */}
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
                                to={`/car/${listing.id}`}
                                target="_blank"
                                className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-pearl-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View on Site
                              </Link>
                              <button
                                onClick={() => openEditModal(listing)}
                                className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-pearl-50 flex items-center gap-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit Listing
                              </button>
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

      {/* Create/Edit Listing Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-pearl-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-display font-semibold text-charcoal-800 text-xl">
                  {editingListing ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Seller Selection (only for new listings) */}
                {!editingListing && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Seller / Dealer
                    </label>
                    <select
                      name="sellerId"
                      value={formData.sellerId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="">-- Select Seller (or leave empty for Admin) --</option>
                      {sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name} ({seller.userType})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Listing Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Listing Type *
                    </label>
                    <select
                      name="listingType"
                      value={formData.listingType}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="SALE">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENTED">Rented</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="BRAND_NEW">Brand New</option>
                      <option value="FOREIGN_USED">Foreign Used</option>
                      <option value="NIGERIAN_USED">Nigerian Used</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Make *
                    </label>
                    <select
                      name="make"
                      value={formData.make}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="">Select Make</option>
                      {carMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. Camry, Accord, X5"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleFormChange}
                      required
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Trim
                    </label>
                    <input
                      type="text"
                      name="trim"
                      value={formData.trim}
                      onChange={handleFormChange}
                      placeholder="e.g. XLE, Sport, Limited"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Price (NGN) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                      min="0"
                      placeholder={formData.listingType === 'RENT' ? 'Daily rate' : 'Total price'}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleFormChange}
                      min="0"
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      State
                    </label>
                    <select
                      name="locationState"
                      value={formData.locationState}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    >
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="locationCity"
                      value={formData.locationCity}
                      onChange={handleFormChange}
                      placeholder="e.g. Victoria Island, Lekki"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Describe the vehicle, its features, and condition..."
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 resize-none"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Image URLs
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-naija-600 hover:text-naija-700 font-medium"
                    >
                      + Add another image
                    </button>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleFormChange}
                    className="w-5 h-5 text-naija-500 border-pearl-300 rounded focus:ring-naija-500"
                  />
                  <label htmlFor="isFeatured" className="text-charcoal-700 font-medium">
                    Mark as Featured Listing
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-pearl-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 px-4 bg-pearl-100 text-charcoal-700 rounded-xl hover:bg-pearl-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 px-4 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingListing ? 'Update Listing' : 'Create Listing'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
