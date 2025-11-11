'use client';

import Link from "next/link";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Palette,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Save,
  ArrowLeft,
  Camera,
  Globe,
  Moon,
  Sun
} from 'lucide-react';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  bio: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  careReminders: boolean;
  promotional: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  personalizedAds: boolean;
}

// Mock data
const mockUser: UserProfile = {
  id: '1',
  name: 'Alexander Green',
  email: 'alex.green@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Garden Street, Greenville, CA 90210',
  avatar: '/api/placeholder/100/100',
  bio: 'Passionate plant lover and urban gardener. Always looking for new green friends to add to my collection! 🌿'
};

const initialNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  orderUpdates: true,
  careReminders: true,
  promotional: false
};

const initialPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  dataSharing: true,
  personalizedAds: false
};

// Reusable Components from dashboard (adapted for settings)
const PrimaryButton = ({ children, onClick, icon, disabled = false }: { 
  children: string; 
  onClick?: () => void; 
  icon?: React.ReactNode;
  disabled?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg transition-all duration-300 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
    }`}
  >
    {icon}
    {children}
  </motion.button>
);

const SecondaryButton = ({ children, onClick, icon }: { 
  children: string; 
  onClick?: () => void; 
  icon?: React.ReactNode;
}) => (
  <motion.button
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-3 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium transition-all duration-300"
  >
    {icon}
    {children}
  </motion.button>
);

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/5 ${className}`}
  >
    {children}
  </motion.div>
);

const ToggleSwitch = ({ 
  enabled, 
  onChange,
  label 
}: { 
  enabled: boolean; 
  onChange: (enabled: boolean) => void;
  label?: string;
}) => (
  <div className="flex items-center justify-between">
    {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        enabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const SettingsSection = ({ 
  title, 
  description, 
  children,
  icon 
}: { 
  title: string; 
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <GlassCard className="p-6">
    <div className="flex items-start gap-4 mb-6">
      {icon && (
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        )}
      </div>
    </div>
    {children}
  </GlassCard>
);

const InputField = ({ 
  label, 
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 ${
            error ? 'border-red-500' : ''
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

const RadioGroup = ({ 
  options, 
  value, 
  onChange,
  label 
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) => (
  <div className="space-y-4">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    {options.map((option) => (
      <div key={option.value} className="flex items-start space-x-3">
        <input
          type="radio"
          id={option.value}
          name="radio-group"
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="mt-1 text-emerald-500 focus:ring-emerald-500"
        />
        <div className="flex-1">
          <label htmlFor={option.value} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {option.label}
          </label>
          {option.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacy);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(true);
  const [changes, setChanges] = useState<Partial<UserProfile>>({});

  const handleUserUpdate = useCallback((field: keyof UserProfile, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
    setChanges(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleNotificationToggle = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handlePrivacyUpdate = useCallback((field: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    // Simulate API call
    console.log('Saving changes:', changes);
    setSaved(true);
    setChanges({});
    
    // Show success feedback
    const timer = setTimeout(() => {
      // Reset feedback after 2 seconds
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [changes]);

  const handleReset = useCallback(() => {
    setUser(mockUser);
    setNotifications(initialNotifications);
    setPrivacy(initialPrivacy);
    setChanges({});
    setSaved(true);
  }, []);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Storage', icon: <Download className="w-4 h-4" /> }
  ];

  return (
    <div className={`content-with-navbar min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 ${
      isDark ? 'dark' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <SecondaryButton icon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Dashboard
                </SecondaryButton>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your account preferences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-amber-600 dark:text-amber-400"
              >
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </motion.div>
            )}
            <div className="flex gap-2">
              <SecondaryButton icon={<X className="w-4 h-4" />} onClick={handleReset}>
                Reset
              </SecondaryButton>
              <PrimaryButton 
                icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} 
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? 'Saved' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <GlassCard className="p-6 lg:col-span-1 h-fit">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </GlassCard>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {activeSection === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection 
                    title="Profile Information" 
                    description="Update your personal details and how you appear on PlantShop"
                    icon={<User className="w-5 h-5" />}
                  >
                    <div className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg"
                          >
                            <Camera className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            JPG, GIF or PNG. Max size 5MB.
                          </p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Full Name"
                          value={user.name}
                          onChange={(value) => handleUserUpdate('name', value)}
                          placeholder="Enter your full name"
                          icon={<User className="w-5 h-5" />}
                        />
                        <InputField
                          label="Email Address"
                          type="email"
                          value={user.email}
                          onChange={(value) => handleUserUpdate('email', value)}
                          placeholder="Enter your email"
                          icon={<Mail className="w-5 h-5" />}
                        />
                        <InputField
                          label="Phone Number"
                          type="tel"
                          value={user.phone}
                          onChange={(value) => handleUserUpdate('phone', value)}
                          placeholder="Enter your phone number"
                          icon={<Phone className="w-5 h-5" />}
                        />
                        <InputField
                          label="Address"
                          value={user.address}
                          onChange={(value) => handleUserUpdate('address', value)}
                          placeholder="Enter your address"
                          icon={<MapPin className="w-5 h-5" />}
                        />
                      </div>

                      <InputField
                        label="Bio"
                        value={user.bio}
                        onChange={(value) => handleUserUpdate('bio', value)}
                        placeholder="Tell us about yourself and your plant journey..."
                      />
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection 
                    title="Notification Preferences" 
                    description="Choose how and when you want to be notified"
                    icon={<Bell className="w-5 h-5" />}
                  >
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h4>
                        <ToggleSwitch
                          label="Email notifications"
                          enabled={notifications.emailNotifications}
                          onChange={(value) => handleNotificationToggle('emailNotifications', value)}
                        />
                        <ToggleSwitch
                          label="Order updates and tracking"
                          enabled={notifications.orderUpdates}
                          onChange={(value) => handleNotificationToggle('orderUpdates', value)}
                        />
                        <ToggleSwitch
                          label="Plant care reminders"
                          enabled={notifications.careReminders}
                          onChange={(value) => handleNotificationToggle('careReminders', value)}
                        />
                        <ToggleSwitch
                          label="Promotional emails"
                          enabled={notifications.promotional}
                          onChange={(value) => handleNotificationToggle('promotional', value)}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h4>
                        <ToggleSwitch
                          label="Push notifications"
                          enabled={notifications.pushNotifications}
                          onChange={(value) => handleNotificationToggle('pushNotifications', value)}
                        />
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection 
                    title="Appearance" 
                    description="Customize how PlantShop looks and feels"
                    icon={<Palette className="w-5 h-5" />}
                  >
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Theme</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsDark(false)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              !isDark 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'
                            }`}
                          >
                            <Sun className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-300" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Light</div>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsDark(true)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              isDark 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'
                            }`}
                          >
                            <Moon className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-300" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Dark</div>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed"
                          >
                            <Globe className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-300" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">System</div>
                          </motion.button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Language</h4>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {activeSection === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection 
                    title="Privacy & Security" 
                    description="Manage your privacy settings and account security"
                    icon={<Shield className="w-5 h-5" />}
                  >
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Profile Visibility</h4>
                        <RadioGroup
                          options={[
                            {
                              value: 'public',
                              label: 'Public',
                              description: 'Anyone can see your profile and plant collection'
                            },
                            {
                              value: 'friends',
                              label: 'Friends Only',
                              description: 'Only your approved followers can see your profile'
                            },
                            {
                              value: 'private',
                              label: 'Private',
                              description: 'Only you can see your profile'
                            }
                          ]}
                          value={privacy.profileVisibility}
                          onChange={(value) => handlePrivacyUpdate('profileVisibility', value)}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Data & Privacy</h4>
                        <ToggleSwitch
                          label="Allow data sharing for research"
                          enabled={privacy.dataSharing}
                          onChange={(value) => handlePrivacyUpdate('dataSharing', value)}
                        />
                        <ToggleSwitch
                          label="Personalized advertising"
                          enabled={privacy.personalizedAds}
                          onChange={(value) => handlePrivacyUpdate('personalizedAds', value)}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Change Password</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <InputField
                            label="Current Password"
                            type="password"
                            value=""
                            onChange={() => {}}
                            placeholder="Enter current password"
                            icon={<Lock className="w-5 h-5" />}
                          />
                          <InputField
                            label="New Password"
                            type="password"
                            value=""
                            onChange={() => {}}
                            placeholder="Enter new password"
                            icon={<Lock className="w-5 h-5" />}
                          />
                          <InputField
                            label="Confirm New Password"
                            type="password"
                            value=""
                            onChange={() => {}}
                            placeholder="Confirm new password"
                            icon={<Lock className="w-5 h-5" />}
                          />
                        </div>
                        <PrimaryButton icon={<Lock className="w-4 h-4" />}>
                          Update Password
                        </PrimaryButton>
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {activeSection === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection 
                    title="Data & Storage" 
                    description="Manage your data and storage preferences"
                    icon={<Download className="w-5 h-5" />}
                  >
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Data Management</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <PrimaryButton icon={<Download className="w-4 h-4" />}>
                            Export Data
                          </PrimaryButton>
                          <SecondaryButton icon={<Trash2 className="w-4 h-4" />}>
                            Clear Cache
                          </SecondaryButton>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Account Actions</h4>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                            Delete Account
                          </h5>
                          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                            This action cannot be undone. All your data, plants, and history will be permanently deleted.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete My Account
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}