'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { LuKeyRound, LuShieldCheck, LuLaptop, LuSmartphone, LuCheck } from 'react-icons/lu';
import { ToggleSwitch } from '../ToggleSwitch';

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
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

    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleTwoFactorToggle = (val: boolean) => {
    setTwoFactor(val);
    toast.info(val ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
  };

  return (
    <div className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Password & Security
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          Manage your authentication credentials, session security, and account protection.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider mb-2">
          Change Account Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary-dark mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-dark mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-dark mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-bold hover:bg-primary shadow-xs transition-all cursor-pointer"
          >
            Update password
          </button>
        </div>
      </form>

      {/* Two-Factor Authentication */}
      <div className="pt-6 border-t border-primary-medium/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-surface/60 flex items-center justify-center text-primary-dark shrink-0 mt-0.5 border border-primary-medium/20">
            <LuShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-dark">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
              Protect your account with authenticator apps (1Password, Google Authenticator) on sign in.
            </p>
          </div>
        </div>

        <ToggleSwitch
          id="two-factor-auth"
          label={twoFactor ? 'Enabled' : 'Disabled'}
          checked={twoFactor}
          onChange={handleTwoFactorToggle}
        />
      </div>

      {/* Active Sessions */}
      <div className="pt-6 border-t border-primary-medium/15 space-y-3">
        <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
          Active Sign-in Sessions
        </h3>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl border border-primary-medium/20 bg-white/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <LuLaptop className="w-5 h-5 text-primary-dark shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-primary-dark">
                  Linux Chrome (Current Session)
                </p>
                <p className="text-[11px] text-primary-dark/75 font-medium">
                  IP: 154.72.168.90 • Douala, Cameroon • Active Now
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-primary-medium/20 bg-white/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <LuSmartphone className="w-5 h-5 text-primary-dark/70 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-primary-dark">
                  Mobile Safari (iPhone 15 Pro)
                </p>
                <p className="text-[11px] text-primary-dark/75 font-medium">
                  IP: 197.234.221.14 • Last active yesterday at 21:40
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info('Session revoked')}
              className="text-xs text-rose-700 hover:text-rose-800 font-bold cursor-pointer"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
