import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/services/api';

const SettingsContext = createContext(null);
const SETTINGS_CACHE_KEY = 'nafeiz_public_settings';
const DEFAULT_SETTINGS = {
  phone: '+86 155 590 23404',
  email: '2102489451@qq.com',
  whatsapp: '+86 155 590 23404',
  address: 'China',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
};

function readCachedSettings() {
  try {
    const cached = JSON.parse(localStorage.getItem(SETTINGS_CACHE_KEY) || 'null');
    return cached && typeof cached === 'object' && !Array.isArray(cached) ? cached : {};
  } catch {
    return {};
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readCachedSettings() }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await apiGet('/settings');
        if (active) {
          const nextSettings = response?.data?.settings || response?.data || {};
          const safeSettings = nextSettings && typeof nextSettings === 'object' && !Array.isArray(nextSettings)
            ? nextSettings
            : {};
          const mergedSettings = { ...DEFAULT_SETTINGS, ...readCachedSettings(), ...safeSettings };
          setSettings(mergedSettings);
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(mergedSettings));
        }
      } catch (error) {
        // Cached/default public settings keep contact links available during a temporary API failure.
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading, setSettings }), [settings, loading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
