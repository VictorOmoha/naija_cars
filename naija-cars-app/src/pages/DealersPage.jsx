import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, Car, BadgeCheck, Search, Users, ChevronRight, Loader2
} from 'lucide-react';
import { usersAPI } from '../services/api';

export default function DealersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dealers', debouncedSearch],
    queryFn: () => usersAPI.getDealers({ page: 1, limit: 50, search: debouncedSearch || undefined }),
    select: (res) => res?.data?.data ?? { dealers: [], pagination: {} },
    staleTime: 2 * 60 * 1000
  });

  const dealers = data?.dealers ?? [];
  const total = data?.pagination?.total ?? 0;

  const getDealerName = (dealer) => {
    if (dealer.profile?.businessName) return dealer.profile.businessName;
    const first = dealer.profile?.firstName || '';
    const last = dealer.profile?.lastName || '';
    return [first, last].filter(Boolean).join(' ') || 'Private Seller';
  };

  const getLocation = (dealer) => {
    const city = dealer.profile?.city || '';
    const state = dealer.profile?.state || '';
    return [city, state].filter(Boolean).join(', ') || 'Nigeria';
  };

  const getTypeLabel = (userType) => {
    switch (userType) {
      case 'DEALER': return { label: 'Certified Dealer', color: 'bg-naija-100 text-naija-700' };
      case 'RENTAL_COMPANY': return { label: 'Rental Company', color: 'bg-blue-100 text-blue-700' };
      default: return { label: 'Private Seller', color: 'bg-pearl-100 text-charcoal-600' };
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-800 via-gray-900 to-green-900">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Verified <span className="text-green-400">Dealers</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Browse trusted car dealers and rental companies across Nigeria.
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by dealer name, city, or state..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2
                           focus:ring-green-400 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-pearl-200 py-4">
        <div className="section-container flex items-center gap-2 text-charcoal-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {isLoading ? 'Loading...' : `${total} dealer${total !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </section>

      {/* Dealer grid */}
      <section className="py-12 bg-pearl-50 min-h-[60vh]">
        <div className="section-container">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-naija-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-24">
              <p className="text-red-500 font-medium">Failed to load dealers. Please try again.</p>
            </div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-24">
              <Building2 className="w-16 h-16 text-pearl-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal-700 mb-2">No dealers found</h3>
              <p className="text-charcoal-500">
                {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No active dealers at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dealers.map((dealer, i) => {
                const name = getDealerName(dealer);
                const location = getLocation(dealer);
                const typeInfo = getTypeLabel(dealer.userType);
                const listingCount = dealer._count?.listings ?? 0;
                const avatar = dealer.profile?.avatarUrl || dealer.profile?.businessLogoUrl;
                const isVerified = dealer.profile?.verificationBadge;

                return (
                  <motion.div
                    key={dealer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/dealer/${dealer.id}`)}
                    className="bg-white rounded-2xl shadow-card hover:shadow-card-hover
                               border border-pearl-200 cursor-pointer transition-all
                               hover:-translate-y-1 overflow-hidden group"
                  >
                    {/* Avatar / Logo area */}
                    <div className="h-24 bg-gradient-to-br from-naija-50 to-green-50 flex items-center justify-center relative">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-naija-500 flex items-center justify-center border-4 border-white shadow-md">
                          <span className="text-2xl font-bold text-white">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {isVerified && (
                        <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm">
                          <BadgeCheck className="w-4 h-4 text-naija-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-charcoal-800 text-sm leading-tight line-clamp-2 group-hover:text-naija-600 transition-colors">
                          {name}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-pearl-400 shrink-0 mt-0.5 group-hover:text-naija-500 transition-colors" />
                      </div>

                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>

                      <div className="space-y-1.5 text-xs text-charcoal-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 shrink-0" />
                          <span>{listingCount} active listing{listingCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
