'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  AppearanceSettings,
  ThemeMode,
  TablesViewMode,
  SidebarFeatureType,
} from '@/features/settings/types/settings.types';
import {
  settingsStorage,
  DEFAULT_APPEARANCE,
} from '@/features/settings/utils/settingsStorage';

interface ThemeContextValue {
  appearance: AppearanceSettings;
  updateAppearance: (partial: Partial<AppearanceSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setBrandColor: (color: string) => void;
  setTransparentSidebar: (transparent: boolean) => void;
  setSidebarFeature: (feature: SidebarFeatureType) => void;
  setTablesView: (view: TablesViewMode) => void;
  setCompanyLogo: (logo: string | null) => void;
  resetAppearance: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = useState(false);

  // Load persisted appearance on mount
  useEffect(() => {
    const loaded = settingsStorage.getAppearance();
    setAppearance(loaded);
    setMounted(true);
  }, []);

  const applyThemeToDom = (theme: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  // Synchronize theme with DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const currentTheme = appearance?.theme || DEFAULT_APPEARANCE.theme;
    applyThemeToDom(currentTheme);

    // Apply custom brand color
    const brandColor = appearance?.brandColor || DEFAULT_APPEARANCE.brandColor;
    root.style.setProperty('--brand-color', brandColor);
    root.style.setProperty('--brand-accent', brandColor);

    // Set transparent sidebar attribute
    root.setAttribute(
      'data-transparent-sidebar',
      appearance?.transparentSidebar ? 'true' : 'false'
    );

    // Set table density attribute
    root.setAttribute('data-table-view', appearance?.tablesView || 'default');

    // Listen for OS system theme changes if theme === 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (currentTheme === 'system') {
        applyThemeToDom('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [
    appearance.theme,
    appearance.brandColor,
    appearance.transparentSidebar,
    appearance.tablesView,
  ]);

  const updateAppearance = (partial: Partial<AppearanceSettings>) => {
    if (partial.theme) {
      applyThemeToDom(partial.theme);
    }
    setAppearance((prev) => {
      const updated = { ...prev, ...partial };
      settingsStorage.saveAppearance(updated);
      return updated;
    });
  };

  const setTheme = (theme: ThemeMode) => {
    applyThemeToDom(theme);
    updateAppearance({ theme });
  };
  const setBrandColor = (brandColor: string) => updateAppearance({ brandColor });
  const setTransparentSidebar = (transparentSidebar: boolean) =>
    updateAppearance({ transparentSidebar });
  const setSidebarFeature = (sidebarFeature: SidebarFeatureType) =>
    updateAppearance({ sidebarFeature });
  const setTablesView = (tablesView: TablesViewMode) =>
    updateAppearance({ tablesView });
  const setCompanyLogo = (companyLogo: string | null) =>
    updateAppearance({ companyLogo });
  const resetAppearance = () => {
    setAppearance(DEFAULT_APPEARANCE);
    settingsStorage.saveAppearance(DEFAULT_APPEARANCE);
  };

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        updateAppearance,
        setTheme,
        setBrandColor,
        setTransparentSidebar,
        setSidebarFeature,
        setTablesView,
        setCompanyLogo,
        resetAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
