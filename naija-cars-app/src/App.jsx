import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/modals/AuthModal';
import EnhancedListCarModal from './components/modals/EnhancedListCarModal';
import QuickViewModal from './components/modals/QuickViewModal';
import useAuthStore from './stores/authStore';

// Pages
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import MessagesPage from './pages/MessagesPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import DealerPage from './pages/DealerPage';
import ValuationPage from './pages/ValuationPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HelpPage from './pages/HelpPage';
import SellCarPage from './pages/SellCarPage';
import RentCarsPage from './pages/RentCarsPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import { AdminDashboard, AdminUsers, AdminListings, AdminAnalytics, AdminSettings } from './pages/admin';

// Protected Route for Admin
function AdminRoute({ children }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration or set a timeout fallback
    if (_hasHydrated) {
      setIsReady(true);
    } else {
      // Fallback timeout in case hydration callback doesn't fire
      const timeout = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [_hasHydrated]);

  // Show loading while hydrating persisted state
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl-50">
        <div className="w-8 h-8 border-4 border-naija-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
    <AppProvider>
      <div className="min-h-screen bg-pearl-200">
        {/* Premium grain texture overlay */}
        <div className="texture-overlay" />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main>
          <Routes>
            {/* Core Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/car/:id" element={<CarDetailsPage />} />
            <Route path="/sell" element={<SellCarPage />} />
            <Route path="/rent" element={<RentCarsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

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

            {/* User Pages */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Dealer Pages */}
            <Route path="/dealer/:id" element={<DealerPage />} />

            {/* Transaction Pages */}
            <Route path="/valuation" element={<ValuationPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />

            {/* Static Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
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
  );
}

export default App;
