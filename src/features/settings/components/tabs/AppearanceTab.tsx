'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LuCheck,
  LuEllipsisVertical,
  LuChevronDown,
  LuGlobe,
} from 'react-icons/lu';
import { ToggleSwitch } from '../ToggleSwitch';
import { LanguageSelector } from '../LanguageSelector';
import {
  ThemeMode,
  TablesViewMode,
  SidebarFeatureType,
  AppearanceSettings,
} from '../../types/settings.types';
import { useTheme } from '@/context/ThemeContext';
import { DEFAULT_APPEARANCE } from '../../utils/settingsStorage';

const PRESET_BRAND_COLORS = [
  { id: 'charcoal', hex: '#1e1e1e', label: 'Obsidian' },
  { id: 'purple', hex: '#7c3aed', label: 'Violet' },
  { id: 'royal-blue', hex: '#2563eb', label: 'Royal Blue' },
  { id: 'sky-blue', hex: '#38bdf8', label: 'Sky' },
  { id: 'cyan', hex: '#0284c7', label: 'Teal' },
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
];

export function AppearanceTab() {
  const {
    appearance,
    updateAppearance,
    setTheme,
    setBrandColor,
    setTransparentSidebar,
    setTablesView,
    setCompanyLogo,
  } = useTheme();

  // Local draft state so the user can preview and commit with "Save changes"
  const [draft, setDraft] = useState<AppearanceSettings>(() => ({
    ...DEFAULT_APPEARANCE,
    ...(appearance || {}),
    brandColor: appearance?.brandColor || DEFAULT_APPEARANCE.brandColor,
  }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft if global appearance changes externally
  useEffect(() => {
    if (appearance) {
      setDraft({
        ...DEFAULT_APPEARANCE,
        ...appearance,
        brandColor: appearance.brandColor || DEFAULT_APPEARANCE.brandColor,
      });
    }
  }, [appearance]);

  const activeBrandColor = draft?.brandColor || DEFAULT_APPEARANCE.brandColor;

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDraft((prev) => ({ ...prev, companyLogo: dataUrl }));
      setCompanyLogo(dataUrl);
      toast.success('Company logo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setDraft((prev) => ({ ...prev, companyLogo: null }));
    setCompanyLogo(null);
    toast.info('Custom logo removed');
  };

  const handleSelectColor = (hex: string) => {
    setDraft((prev) => ({ ...prev, brandColor: hex }));
    setBrandColor(hex);
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setDraft((prev) => ({ ...prev, theme: mode }));
    setTheme(mode);
    const label =
      mode === 'system'
        ? 'System preference'
        : mode === 'dark'
        ? 'Dark'
        : 'Light';
    toast.success(`Theme set to ${label}`);
  };

  const handleSelectTableView = (mode: TablesViewMode) => {
    setDraft((prev) => ({ ...prev, tablesView: mode }));
    setTablesView(mode);
  };

  const handleSave = () => {
    updateAppearance(draft);
    toast.success('Appearance settings saved successfully');
  };

  const handleCancel = () => {
    setDraft(appearance);
    setTheme(appearance.theme);
    setBrandColor(appearance.brandColor);
    setTransparentSidebar(appearance.transparentSidebar);
    setTablesView(appearance.tablesView);
    toast.info('Changes reverted');
  };

  return (
    <div className="font-elms space-y-8 text-primary-dark">
      {/* Hidden file input for logo replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Header matching uploaded screenshot */}
      <div className="flex items-center justify-between pb-2 border-b border-primary-medium/15">
        <h2 className="text-xl sm:text-2xl font-extrabold text-primary-dark tracking-tight">
          Appearance
        </h2>
        <button
          type="button"
          title="More options"
          aria-label="More options"
          className="p-1.5 rounded-lg text-primary-dark/60 hover:text-primary-dark hover:bg-black/5 transition-colors cursor-pointer"
        >
          <LuEllipsisVertical className="w-5 h-5 text-primary-dark" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. Company logo */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Company logo
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            Update your company logo.
          </p>
        </div>

        <div className="md:col-span-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Preview Square */}
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary-medium/25 flex items-center justify-center p-2.5 shadow-2xs shrink-0 overflow-hidden">
              {draft.companyLogo ? (
                <img
                  src={draft.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Default Radial Sunburst Logo matching uploaded screenshot */
                <svg
                  viewBox="0 0 100 100"
                  className="w-10 h-10 text-primary-dark"
                  fill="currentColor"
                >
                  <circle cx="50" cy="50" r="10" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                    (deg) => (
                      <rect
                        key={deg}
                        x="46"
                        y="12"
                        width="8"
                        height="20"
                        rx="4"
                        transform={`rotate(${deg} 50 50)`}
                      />
                    )
                  )}
                </svg>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl border border-primary-medium/30 bg-white text-xs sm:text-sm font-semibold text-primary-dark hover:bg-primary-surface/40 shadow-2xs transition-all cursor-pointer"
            >
              Replace logo
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemoveLogo}
            className="px-3 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 border border-rose-200"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 2. Brand color */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Brand color
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            Select or customize your brand color.
          </p>
        </div>

        <div className="md:col-span-8 space-y-3.5">
          {/* Swatches row */}
          <div className="flex items-center gap-3">
            {PRESET_BRAND_COLORS.map((color) => {
              const isSelected =
                activeBrandColor.toLowerCase() === color.hex.toLowerCase();

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleSelectColor(color.hex)}
                  title={color.label}
                  aria-label={color.label}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer relative shrink-0 ${
                    isSelected
                      ? 'scale-110 ring-2 ring-offset-2 ring-primary-dark'
                      : 'hover:scale-105 opacity-90 hover:opacity-100 shadow-2xs'
                  }`}
                />
              );
            })}
          </div>

          {/* Custom color input row */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-xs sm:text-sm text-primary-dark font-semibold">
              Custom color:
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-medium/30 bg-white shadow-2xs">
              <span className="text-xs sm:text-sm font-mono text-primary-dark/60 font-bold">
                #
              </span>
              <input
                type="text"
                value={activeBrandColor.replace('#', '').toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                  if (val.length <= 6) {
                    setDraft((prev) => ({ ...prev, brandColor: `#${val}` }));
                  }
                }}
                className="w-20 text-xs sm:text-sm font-mono font-bold text-primary-dark uppercase focus:outline-none bg-transparent"
                maxLength={6}
              />
            </div>

            {/* Native Color Picker Circle */}
            <label
              title="Pick a color"
              className="w-7 h-7 rounded-full shadow-2xs ring-2 ring-primary-medium/30 cursor-pointer overflow-hidden relative shrink-0 inline-block"
              style={{ backgroundColor: activeBrandColor }}
            >
              <input
                type="color"
                value={
                  activeBrandColor.length === 7 ? activeBrandColor : '#2C68F6'
                }
                onChange={(e) => handleSelectColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 3. Interface theme */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Interface theme
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            Select or customize your UI theme.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: System preference (Split Light / Dark) */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('system')}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden p-2.5 text-left group aspect-[16/10] flex flex-col justify-between ${
                  draft.theme === 'system'
                    ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                    : 'border-primary-medium/20 bg-white hover:border-primary-medium/40'
                }`}
              >
                {/* Miniature Window Frame */}
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-300 flex flex-col">
                  {/* Titlebar with 3 dots */}
                  <div className="h-4 bg-neutral-100 px-2 flex items-center gap-1 border-b border-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Split body: 50% light, 50% dark */}
                  <div className="flex-1 flex min-h-0">
                    {/* Left half (Light) */}
                    <div className="w-1/2 bg-[#faf9f6] p-1.5 flex gap-1 border-r border-neutral-300/80">
                      <div className="w-3 flex flex-col gap-1 pt-0.5">
                        <span className="w-2.5 h-1 rounded-xs bg-neutral-400" />
                        <span className="w-2 h-1 rounded-xs bg-neutral-300" />
                        <span className="w-2.5 h-1 rounded-xs bg-neutral-300" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 w-8 rounded-xs bg-neutral-500" />
                        <div className="flex-1 rounded-xs bg-neutral-300/60 p-1" />
                      </div>
                    </div>

                    {/* Right half (Dark) */}
                    <div className="w-1/2 bg-[#191410] p-1.5 flex gap-1">
                      <div className="w-3 flex flex-col gap-1 pt-0.5">
                        <span className="w-2.5 h-1 rounded-xs bg-neutral-600" />
                        <span className="w-2 h-1 rounded-xs bg-neutral-700" />
                        <span className="w-2.5 h-1 rounded-xs bg-neutral-700" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 w-8 rounded-xs bg-neutral-400" />
                        <div className="flex-1 rounded-xs bg-neutral-800 p-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Checkmark Badge (Bottom Left) */}
                {draft.theme === 'system' && (
                  <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-md">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
              <span className="text-xs font-bold text-primary-dark text-left pl-0.5">
                System preference
              </span>
            </div>

            {/* Card 2: Light */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden p-2.5 text-left group aspect-[16/10] flex flex-col justify-between ${
                  draft.theme === 'light'
                    ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                    : 'border-primary-medium/20 bg-white hover:border-primary-medium/40'
                }`}
              >
                {/* Miniature Window Frame */}
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-300 bg-[#faf9f6] flex flex-col">
                  {/* Titlebar with 3 dots */}
                  <div className="h-4 bg-neutral-100 px-2 flex items-center gap-1 border-b border-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Body (All light) */}
                  <div className="flex-1 p-2 flex gap-1.5">
                    <div className="w-4 flex flex-col gap-1 pt-0.5 border-r border-neutral-300 pr-1">
                      <span className="w-2.5 h-1 rounded-xs bg-neutral-500" />
                      <span className="w-2 h-1 rounded-xs bg-neutral-400" />
                      <span className="w-2.5 h-1 rounded-xs bg-neutral-400" />
                      <span className="w-2 h-1 rounded-xs bg-neutral-400" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-1.5 w-12 rounded-xs bg-neutral-600" />
                      <div className="flex-1 rounded-sm bg-neutral-300/70 p-1" />
                    </div>
                  </div>
                </div>

                {/* Selected Checkmark Badge (Bottom Left) */}
                {draft.theme === 'light' && (
                  <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-md">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
              <span className="text-xs font-bold text-primary-dark text-left pl-0.5">
                Light
              </span>
            </div>

            {/* Card 3: Dark */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden p-2.5 text-left group aspect-[16/10] flex flex-col justify-between ${
                  draft.theme === 'dark'
                    ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                    : 'border-primary-medium/20 bg-white hover:border-primary-medium/40'
                }`}
              >
                {/* Miniature Window Frame */}
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-700 bg-[#191410] flex flex-col">
                  {/* Titlebar with 3 dots */}
                  <div className="h-4 bg-neutral-800 px-2 flex items-center gap-1 border-b border-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Body (All dark) */}
                  <div className="flex-1 p-2 flex gap-1.5">
                    <div className="w-4 flex flex-col gap-1 pt-0.5 border-r border-neutral-700 pr-1">
                      <span className="w-2.5 h-1 rounded-xs bg-neutral-500" />
                      <span className="w-2 h-1 rounded-xs bg-neutral-600" />
                      <span className="w-2.5 h-1 rounded-xs bg-neutral-600" />
                      <span className="w-2 h-1 rounded-xs bg-neutral-600" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-1.5 w-12 rounded-xs bg-neutral-400" />
                      <div className="flex-1 rounded-sm bg-neutral-800 p-1" />
                    </div>
                  </div>
                </div>

                {/* Selected Checkmark Badge (Bottom Left) */}
                {draft.theme === 'dark' && (
                  <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-md">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
              <span className="text-xs font-bold text-primary-dark text-left pl-0.5">
                Dark
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 4. Display Language */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-2">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2">
            <LuGlobe className="w-4 h-4 text-primary-dark" />
            <h3 className="text-sm font-bold text-primary-dark">
              Language
            </h3>
          </div>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            Select your preferred display language for the workspace.
          </p>
        </div>

        <div className="md:col-span-8">
          <LanguageSelector variant="cards" />
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 5. Transparent sidebar */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Transparent sidebar
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            Make the desktop sidebar transparent.
          </p>
        </div>

        <div className="md:col-span-8 flex items-center justify-start">
          <ToggleSwitch
            id="transparent-sidebar-toggle"
            checked={draft.transparentSidebar}
            onChange={(val) => {
              setDraft((prev) => ({ ...prev, transparentSidebar: val }));
              setTransparentSidebar(val);
            }}
          />
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 6. Sidebar feature */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Sidebar feature
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            What shows in the desktop sidebar.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="relative inline-block w-full sm:w-72">
            <select
              value={draft.sidebarFeature}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  sidebarFeature: e.target.value as SidebarFeatureType,
                }))
              }
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-primary-medium/30 bg-white text-xs sm:text-sm font-bold text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#2c68f6]/30 cursor-pointer pl-7 shadow-2xs"
            >
              <option value="recent-changes">Recent changes</option>
              <option value="shortcuts">Quick shortcuts</option>
              <option value="overdue">Overdue task alerts</option>
              <option value="none">Minimal (None)</option>
            </select>

            {/* Leading Status Dot */}
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                draft.sidebarFeature === 'recent-changes'
                  ? 'bg-emerald-500'
                  : draft.sidebarFeature === 'shortcuts'
                  ? 'bg-blue-500'
                  : draft.sidebarFeature === 'overdue'
                  ? 'bg-amber-500'
                  : 'bg-neutral-400'
              }`}
            />

            {/* Trailing Chevron */}
            <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-dark/60 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="border-b border-primary-medium/15" />

      {/* ============================================================ */}
      {/* 7. Tables view */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start py-2">
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold text-primary-dark">
            Tables view
          </h3>
          <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
            How are tables displayed in the app.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            {/* Table Mockup 1: Default */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectTableView('default')}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden p-2.5 text-left group aspect-[16/11] flex flex-col justify-between ${
                  draft.tablesView === 'default'
                    ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                    : 'border-primary-medium/20 bg-white hover:border-primary-medium/40'
                }`}
              >
                {/* Miniature Table UI */}
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-300 bg-white p-2 flex flex-col justify-between text-[8px]">
                  <span className="font-extrabold text-primary-dark">
                    Customer
                  </span>
                  <div className="space-y-1 mt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 py-0.5 border-b border-neutral-200 last:border-0"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
                        <span className="w-10 h-1 rounded-xs bg-neutral-500" />
                        <span className="w-14 h-1 rounded-xs bg-neutral-300 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Checkmark Badge */}
                {draft.tablesView === 'default' && (
                  <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-md">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
              <span className="text-xs font-bold text-primary-dark text-left pl-0.5">
                Default
              </span>
            </div>

            {/* Table Mockup 2: Compact */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectTableView('compact')}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden p-2.5 text-left group aspect-[16/11] flex flex-col justify-between ${
                  draft.tablesView === 'compact'
                    ? 'border-[#2c68f6] ring-2 ring-[#2c68f6]/20 bg-blue-50/20 shadow-xs'
                    : 'border-primary-medium/20 bg-white hover:border-primary-medium/40'
                }`}
              >
                {/* Miniature Compact Table UI */}
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-300 bg-white p-2 flex flex-col justify-between text-[8px]">
                  <span className="font-extrabold text-primary-dark">
                    Customer
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 py-0.2 border-b border-neutral-200 last:border-0"
                      >
                        <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                        <span className="w-9 h-0.5 rounded-xs bg-neutral-500" />
                        <span className="w-12 h-0.5 rounded-xs bg-neutral-300 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Checkmark Badge */}
                {draft.tablesView === 'compact' && (
                  <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-[#2c68f6] text-white flex items-center justify-center shadow-md">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
              <span className="text-xs font-bold text-primary-dark text-left pl-0.5">
                Compact
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. Footer Actions */}
      {/* ============================================================ */}
      <div className="pt-6 border-t border-primary-medium/15 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2.5 rounded-xl border border-primary-medium/30 text-xs sm:text-sm font-semibold text-primary-dark hover:bg-black/5 transition-all cursor-pointer shadow-2xs"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#2c68f6] hover:bg-[#2055db] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
