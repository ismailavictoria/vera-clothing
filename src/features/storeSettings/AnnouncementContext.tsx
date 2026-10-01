import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStoredValue, writeStoredValue } from '../../lib/storage';

export interface AnnouncementSettings {
  deliveryAnnouncement: string;
  brandAnnouncement: string;
}

interface AnnouncementContextValue extends AnnouncementSettings {
  saveAnnouncements: (settings: AnnouncementSettings) => void;
}

const STORAGE_KEY = 'vera.store-announcements';
const STORAGE_VERSION = 1;
const DEFAULT_ANNOUNCEMENTS: AnnouncementSettings = {
  deliveryAnnouncement: 'Complimentary delivery on orders over ₦150',
  brandAnnouncement: 'Thoughtfully made, made to last',
};
const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

function loadAnnouncements(): AnnouncementSettings {
  const saved = readStoredValue<Partial<AnnouncementSettings>>(STORAGE_KEY, STORAGE_VERSION, DEFAULT_ANNOUNCEMENTS);
  return {
    deliveryAnnouncement: typeof saved.deliveryAnnouncement === 'string' ? saved.deliveryAnnouncement : DEFAULT_ANNOUNCEMENTS.deliveryAnnouncement,
    brandAnnouncement: typeof saved.brandAnnouncement === 'string' ? saved.brandAnnouncement : DEFAULT_ANNOUNCEMENTS.brandAnnouncement,
  };
}

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<AnnouncementSettings>(loadAnnouncements);
  useEffect(() => writeStoredValue(STORAGE_KEY, STORAGE_VERSION, announcements), [announcements]);
  const saveAnnouncements = useCallback((next: AnnouncementSettings) => {
    setAnnouncements({
      deliveryAnnouncement: next.deliveryAnnouncement.trim(),
      brandAnnouncement: next.brandAnnouncement.trim(),
    });
  }, []);
  const value = useMemo(() => ({ ...announcements, saveAnnouncements }), [announcements, saveAnnouncements]);
  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error('useAnnouncements must be used within AnnouncementProvider');
  return context;
}
