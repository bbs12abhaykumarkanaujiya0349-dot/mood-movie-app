import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Sliders,
  AlertTriangle,
  Check,
  Globe,
  Trash2,
  Shield,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const ALL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Drama',
  'Family',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Thriller'
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Section 1: Account info
  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Section 2: Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Section 3: Preferences
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Section 4: Danger zone (Delete Account with password verification)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    const loadPrefs = async () => {
      try {
        const prefs = await userService.getPreferences();
        if (Array.isArray(prefs.favoriteGenres)) {
          setSelectedGenres(prefs.favoriteGenres);
        }
        if (prefs.language) {
          setLanguage(prefs.language);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
    loadPrefs();
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSavingName(true);
    try {
      await userService.updateProfile({ name: name.trim() });
      toast.success('Account name updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      await userService.updatePreferences({
        favoriteGenres: selectedGenres,
        language: language.toLowerCase()
      });
      toast.success('Movie preferences saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount(deletePassword);
      await logout();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
      setDeletePassword('');
    }
  };

  return (
    <div className="py-12 sm:py-16 text-left pb-24 space-y-10">
      <Container size="md">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="rose" size="md" className="mb-3">
            Account Preferences
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Settings & Security
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Manage your account credentials, favorite genres, and privacy controls.
          </p>
        </div>

        {/* Section 1: Account Profile */}
        <form
          onSubmit={handleUpdateName}
          className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-xl space-y-4"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-rose-400" />
            <span>Profile Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Display Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email address cannot be changed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingName}
              leftIcon={Save}
            >
              Update Profile Name
            </Button>
          </div>
        </form>

        {/* Section 2: Change Password (PATCH /auth/password) */}
        <form
          onSubmit={handleChangePassword}
          className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-xl space-y-4"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span>Change Password</span>
          </h3>

          <div className="space-y-4 pt-1">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 chars with mix of cases & numbers"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isChangingPassword}
              leftIcon={Save}
            >
              Update Password
            </Button>
          </div>
        </form>

        {/* Section 3: Genre & Language Preferences (PATCH /users/me/preferences) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#11141e]/90 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>Movie & Genre Preferences</span>
          </h3>

          <div>
            <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Favorite Genres (Click to toggle)
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleToggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-60 bg-[#0a0b10] text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              <option value="en">English (en)</option>
              <option value="hi">Hindi (hi)</option>
              <option value="ja">Japanese (ja)</option>
              <option value="fr">French (fr)</option>
              <option value="es">Spanish (es)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800/80">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSavePreferences}
              isLoading={isSavingPreferences}
              leftIcon={Save}
            >
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Section 4: Danger Zone (DELETE /users/me with password) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-950/15 border border-red-500/25 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Danger Zone</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Permanently delete your account. This action will cascade and remove all your written reviews, mood history, and saved libraries from the system.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={Trash2}
          >
            Delete Account
          </Button>
        </div>

        {/* Delete Account Modal with Password Confirmation */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!isDeletingAccount) {
                    setIsDeleteModalOpen(false);
                    setDeletePassword('');
                  }
                }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-3xl bg-[#0e111a] border border-red-500/30 p-6 sm:p-8 shadow-2xl z-10 text-left space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (!isDeletingAccount) {
                        setIsDeleteModalOpen(false);
                        setDeletePassword('');
                      }
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  This action is permanent and irreversible. To confirm deletion of your account and all associated reviews and history, enter your current password below:
                </p>

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletePassword('');
                      }}
                      disabled={isDeletingAccount}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      isLoading={isDeletingAccount}
                      leftIcon={Trash2}
                    >
                      Permanently Delete
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
