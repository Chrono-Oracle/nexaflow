'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { LuCamera, LuCheck, LuGlobe } from 'react-icons/lu';
import { UserProfileSettings } from '../../types/settings.types';
import { settingsStorage, DEFAULT_PROFILE } from '../../utils/settingsStorage';
import { LanguageSelector } from '../LanguageSelector';

export function ProfileTab() {
  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_PROFILE);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setProfile(settingsStorage.getProfile());
  }, []);

  const handleChange = (
    field: keyof UserProfileSettings,
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settingsStorage.saveProfile(profile);
    setIsSaved(true);
    toast.success('Profile updated successfully');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Profile Details
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          Manage your personal information, profile photo, and role in this workspace.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Avatar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 py-2">
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary-medium/30 shadow-md shrink-0 bg-primary-surface">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-dark font-extrabold text-2xl">
              {profile.fullName.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <LuCamera className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.info('Avatar upload: Select image from files')}
              className="px-3.5 py-1.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Change avatar
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange('avatar', '');
                toast.info('Avatar removed');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-primary-medium/30 text-primary-dark hover:bg-black/5 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Remove
            </button>
          </div>
          <p className="text-xs text-primary-dark/70 font-medium">
            JPG, GIF or PNG. Recommended size: 400x400px.
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Nickname / Handle
          </label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Role / Job Title
          </label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Department
          </label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Bio / Workspace Role Overview
          </label>
          <textarea
            rows={3}
            value={profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all resize-none shadow-2xs"
          />
        </div>
      </div>

      {/* Language Preference */}
      <div className="pt-2 border-t border-primary-medium/15">
        <div className="flex items-center gap-2 mb-1">
          <LuGlobe className="w-4 h-4 text-primary-dark" />
          <h3 className="text-sm font-bold text-primary-dark">
            Language Preference
          </h3>
        </div>
        <p className="text-xs text-primary-dark/80 font-medium mb-3.5">
          Select your preferred display language for the workspace.
        </p>
        <LanguageSelector variant="cards" />
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-primary-medium/15 flex items-center justify-between">
        <div className="text-xs text-primary-dark/80 font-medium">
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <LuCheck className="w-4 h-4 stroke-[2.5]" />
              Profile updated successfully
            </span>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          Save profile changes
        </button>
      </div>
    </form>
  );
}
