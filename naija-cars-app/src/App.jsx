import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import CompareTray from './components/CompareTray';
import MessageNotifications from './components/MessageNotifications';
import AuthModal from './components/modals/AuthModal';
import ListingFormRedirect from './components/ListingFormRedirect';
import { PageState } from './components/PageLayout';
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
const DealersPage = lazy(() => import('./pages/DealersPage'));
const ValuationPage = lazy(() => import('./pages/ValuationPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SubscriptionCallbackPage = lazy(() => import('./pages/SubscriptionCallbackPage'));

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
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-greentint border-t-brand rounded-full animate-spin" />
        <p className="text-muted text-sm font-semibold">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route for authenticated users
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { setIsSignInOpen } = useApp();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <PageState title="Sign in to continue" description="Your place is saved. Sign in to view this page and carry on where you left off."><button className="nc-button" onClick={() => setIsSignInOpen(true)}>Sign in</button><Link className="nc-button nc-button-secondary" to="/cars">Browse cars</Link></PageState>;
  }

  return children;
}

// Protected Route for Admin
function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  if (user?.userType !== 'ADMIN') {
    return <PageState title="Administrator access required" description="This area is available to NaijaCars administrators."><Link to="/dashboard" className="nc-button">Go to your dashboard</Link></PageState>;
  }

  return children;
}

function App() {
  const checkedSession = useRef(false);
  useEffect(() => {
    if (checkedSession.current) return;
    checkedSession.current = true;
    if (localStorage.getItem("accessToken")) useAuthStore.getState().getMe().catch(() => {});
  }, []);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-paper">
          {/* Scroll to top on every navigation */}
          <ScrollToTop />

          {/* Navigation */}
          {!isAdminRoute && (
            <>
              <Navbar />
              <MessageNotifications />
            </>
          )}

          {/* Main Content */}
          <main id="main-content" tabIndex={-1}>
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
                  <Route path="listings" element={<AdminListings key="all" />} />
                  <Route path="listings/pending" element={<AdminListings key="pending" initialStatus="PENDING" />} />
                  <Route path="listings/featured" element={<AdminListings key="featured" featuredOnly />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Public Pages */}
                <Route path="/dealers" element={<DealersPage />} />
                <Route path="/dealer/:id" element={<DealerPage />} />
                <Route path="/valuation" element={<ValuationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/subscription/callback" element={<ProtectedRoute><SubscriptionCallbackPage /></ProtectedRoute>} />

                {/* 404 Catch-all */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center pt-6">
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
          {!isAdminRoute && <Footer />}

          {/* Compare tray — sticky at viewport bottom */}
          {!isAdminRoute && <CompareTray />}

          {/* Modals */}
          <AuthModal />
          <ListingFormRedirect />
          <QuickViewModal />

          {/* Toast Notifications */}
          <Toast />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
