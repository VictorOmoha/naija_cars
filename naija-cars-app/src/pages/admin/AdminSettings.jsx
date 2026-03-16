import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Globe, Mail, Bell, Shield, CreditCard,
  Palette, Save, RefreshCw
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Naija Cars',
    siteDescription: 'Nigeria\'s Premier Automotive Marketplace',
    supportEmail: 'support@naijacars.online',
    supportPhone: '+234 800 000 0000',

    // Listing Settings
    listingApprovalRequired: true,
    maxImagesPerListing: 10,
    listingExpiryDays: 90,
    featuredListingPrice: 5000,

    // Notification Settings
    emailNotifications: true,
    newUserNotification: true,
    newListingNotification: true,

    // Security Settings
    requireEmailVerification: true,
    requirePhoneVerification: false,
    sessionTimeout: 30,
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Settings are stored locally for now - backend endpoint can be added later
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Settings saved successfully!');
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch {}
    }
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'listings', label: 'Listings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal-800">Settings</h1>
          <p className="text-charcoal-500">Manage your platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-naija-500 text-white rounded-xl hover:bg-naija-600 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tabs Sidebar */}
        <div className="w-64 bg-white rounded-2xl p-4 shadow-soft h-fit">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-naija-500 text-white'
                      : 'text-charcoal-600 hover:bg-pearl-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-soft">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-charcoal-800 pb-4 border-b border-pearl-200">
                General Settings
              </h2>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => handleChange('supportPhone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'listings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-charcoal-800 pb-4 border-b border-pearl-200">
                Listing Settings
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">Require Approval for New Listings</div>
                    <div className="text-sm text-charcoal-500">New listings will need admin approval before going live</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.listingApprovalRequired}
                      onChange={(e) => handleChange('listingApprovalRequired', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Max Images Per Listing
                    </label>
                    <input
                      type="number"
                      value={settings.maxImagesPerListing}
                      onChange={(e) => handleChange('maxImagesPerListing', parseInt(e.target.value))}
                      min="1"
                      max="20"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Listing Expiry (Days)
                    </label>
                    <input
                      type="number"
                      value={settings.listingExpiryDays}
                      onChange={(e) => handleChange('listingExpiryDays', parseInt(e.target.value))}
                      min="30"
                      max="365"
                      className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Featured Listing Price (NGN)
                  </label>
                  <input
                    type="number"
                    value={settings.featuredListingPrice}
                    onChange={(e) => handleChange('featuredListingPrice', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                  />
                  <p className="text-sm text-charcoal-500 mt-1">Price to feature a listing on the homepage</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-charcoal-800 pb-4 border-b border-pearl-200">
                Notification Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">Email Notifications</div>
                    <div className="text-sm text-charcoal-500">Send email notifications to admins</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">New User Notifications</div>
                    <div className="text-sm text-charcoal-500">Get notified when new users register</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.newUserNotification}
                      onChange={(e) => handleChange('newUserNotification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">New Listing Notifications</div>
                    <div className="text-sm text-charcoal-500">Get notified when new listings are submitted</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.newListingNotification}
                      onChange={(e) => handleChange('newListingNotification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-charcoal-800 pb-4 border-b border-pearl-200">
                Security Settings
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">Require Email Verification</div>
                    <div className="text-sm text-charcoal-500">Users must verify their email before listing</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-pearl-50 rounded-xl">
                  <div>
                    <div className="font-medium text-charcoal-800">Require Phone Verification</div>
                    <div className="text-sm text-charcoal-500">Users must verify their phone number</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requirePhoneVerification}
                      onChange={(e) => handleChange('requirePhoneVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-pearl-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naija-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pearl-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-naija-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                    className="w-full px-4 py-2.5 border border-pearl-200 rounded-xl focus:ring-2 focus:ring-naija-500 focus:border-naija-500"
                  />
                  <p className="text-sm text-charcoal-500 mt-1">Auto logout after inactivity</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
