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
  Save
} from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';
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
  const [name, setName] = useState(user?.name || 'Explorer');
  const [isSavingName, setIsSavingName] = useState(false);

  // Section 2: Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Section 3: Preferences
  const [selectedGenres, setSelectedGenres] = useState(['Sci-Fi', 'Comedy', 'Drama']);
  const [language, setLanguage] = useState('English');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Section 4: Danger zone
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    const loadPrefs = async () => {
      try {
        const prefs = await userService.getPreferences();
        if (prefs.favoriteGenres) setSelectedGenres(prefs.favoriteGenres);
        if (prefs.preferredLanguage) setLanguage(prefs.preferredLanguage);
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
    } catch {
      toast.error('Failed to update name');
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
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
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
        preferredLanguage: language
      });
      toast.success('Movie preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await logout();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteConfirmOpen(false);
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
              helperText="Email cannot be modified in mock mode"
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

        {/* Section 2: Change Password */}
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
                placeholder="Min 8 characters"
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

        {/* Section 3: Genre & Language Preferences */}
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
              className="w-full sm:w-60 bg-[#0a0b10] text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="Hindi">Hindi</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
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

        {/* Section 4: Danger Zone */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-950/15 border border-red-500/25 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Danger Zone</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Deleting your account will purge your saved watchlists, favorites, and mood history from local memory.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteConfirmOpen(true)}
            leftIcon={Trash2}
          >
            Delete Account
          </Button>
        </div>

        {/* Confirm Delete Account Dialog */}
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          title="Delete Account Confirmation"
          message="Are you certain you wish to permanently delete your account and all associated watchlist history? This cannot be undone."
          confirmText="Yes, Delete My Account"
          confirmVariant="danger"
          isLoading={isDeletingAccount}
          onConfirm={handleDeleteAccount}
          onClose={() => setIsDeleteConfirmOpen(false)}
        />
      </Container>
    </div>
  );
}
