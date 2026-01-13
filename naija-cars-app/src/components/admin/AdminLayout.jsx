import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Car, Settings, LogOut, Menu, X,
  ChevronDown, Bell, Shield, BarChart3, MessageSquare,
  FileText, CreditCard, Tag, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Listings',
    icon: Car,
    children: [
      { name: 'All Listings', href: '/admin/listings' },
      { name: 'Pending Approval', href: '/admin/listings/pending' },
      { name: 'Featured', href: '/admin/listings/featured' },
    ],
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleExpanded = (name) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const NavLink = ({ item, mobile = false }) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const active = item.href ? isActive(item.href, item.exact) : item.children?.some(c => isActive(c.href));
    const expanded = expandedItems[item.name];

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              active
                ? 'bg-naija-500 text-white'
                : 'text-charcoal-600 hover:bg-pearl-100 hover:text-charcoal-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-12 py-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={() => mobile && setSidebarOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                        isActive(child.href)
                          ? 'bg-naija-100 text-naija-700 font-medium'
                          : 'text-charcoal-500 hover:bg-pearl-100 hover:text-charcoal-700'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        to={item.href}
        onClick={() => mobile && setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          active
            ? 'bg-naija-500 text-white'
            : 'text-charcoal-600 hover:bg-pearl-100 hover:text-charcoal-800'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-pearl-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-pearl-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-pearl-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-charcoal-700" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-naija-500" />
            <span className="font-display font-bold text-charcoal-800">Admin Portal</span>
          </div>
          <button className="p-2 hover:bg-pearl-100 rounded-lg transition-colors relative">
            <Bell className="w-6 h-6 text-charcoal-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-pearl-200 z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-pearl-200">
            <div className="flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-naija-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-charcoal-800">Naija Cars</div>
                  <div className="text-xs text-charcoal-500">Admin Portal</div>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-pearl-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} mobile={true} />
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-pearl-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center">
                <span className="text-naija-600 font-bold">
                  {user?.profile?.firstName?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal-800 truncate">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </div>
                <div className="text-xs text-charcoal-500 truncate">{user?.email}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pearl-100 text-charcoal-700 rounded-lg hover:bg-pearl-200 transition-colors text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-pearl-200">
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal-800">
              {navItems.find(item =>
                item.href ? isActive(item.href, item.exact) : item.children?.some(c => isActive(c.href))
              )?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-pearl-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-charcoal-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-pearl-200">
              <div className="text-right">
                <div className="text-sm font-medium text-charcoal-800">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </div>
                <div className="text-xs text-charcoal-500">Administrator</div>
              </div>
              <div className="w-10 h-10 bg-naija-100 rounded-xl flex items-center justify-center">
                <span className="text-naija-600 font-bold">
                  {user?.profile?.firstName?.[0] || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
