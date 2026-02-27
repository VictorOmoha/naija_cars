import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/modals/AuthModal';
import EnhancedListCarModal from './components/modals/EnhancedListCarModal';
import QuickViewModal from './components/modals/QuickViewModal';
import useAuthStore from './stores/authStore';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CarsPage = lazy(() => import('./pages/CarsPage'));
const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage'));
const SellCarPage = lazy(() => import('./pages/SellCarPage'));
const RentCarsPage = lazy(() => import('./pages/RentCarsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const DealerPage = lazy(() => import('./pages/DealerPage'));
const ValuationPage = lazy(() => import('./pages/ValuationPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

// Admin Pages (lazy loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminUsers })));
const AdminListings = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminListings })));
const AdminAnalytics = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminSettings })));

// Page loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-naija-200 border-t-naija-500 rounded-full animate-spin" />
        <p className="text-charcoal-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route for authenticated users
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected Route for Admin
function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.userType !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-pearl-200">
          {/* Premium grain texture overlay */}
          <div className="texture-overlay" />

          {/* Navigation */}
          <Navbar />

          {/* Main Content */}
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Core Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/cars" element={<CarsPage />} />
                <Route path="/car/:id" element={<CarDetailsPage />} />
                <Route path="/sell" element={<SellCarPage />} />
                <Route path="/rent" element={<RentCarsPage />} />

                {/* Protected User Pages */}
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/booking/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="listings" element={<AdminListings />} />
                  <Route path="listings/pending" element={<AdminListings />} />
                  <Route path="listings/featured" element={<AdminListings />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Public Pages */}
                <Route path="/dealer/:id" element={<DealerPage />} />
                <Route path="/valuation" element={<ValuationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/help" element={<HelpPage />} />

                {/* 404 Catch-all */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center pt-24">
                    <div className="text-center">
                      <h1 className="text-6xl font-display font-bold text-charcoal-300 mb-4">404</h1>
                      <p className="text-xl text-charcoal-500 mb-8">Page not found</p>
                      <a href="/" className="px-6 py-3 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors">
                        Go Home
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>

          {/* Footer */}
          <Footer />

          {/* Modals */}
          <AuthModal />
          <EnhancedListCarModal />
          <QuickViewModal />

          {/* Toast Notifications */}
          <Toast />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
