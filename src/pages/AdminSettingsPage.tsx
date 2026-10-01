import { useState, type FormEvent } from 'react';
import { Bell, Building2, LockKeyhole, Save, ShieldCheck } from 'lucide-react';
import { PageTitle } from '../features/admin/AdminShared';
import { brand } from '../config/brand';
import { currencies, type CurrencyCode } from '../config/currency';
import { useCurrency } from '../features/currency/CurrencyContext';
import { useAnnouncements } from '../features/storeSettings/AnnouncementContext';

export function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { deliveryAnnouncement, brandAnnouncement, saveAnnouncements } = useAnnouncements();
  const [deliveryDraft, setDeliveryDraft] = useState(deliveryAnnouncement);
  const [brandDraft, setBrandDraft] = useState(brandAnnouncement);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveAnnouncements({ deliveryAnnouncement: deliveryDraft, brandAnnouncement: brandDraft });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="admin-page">
      <PageTitle eyebrow="Your workspace" title="Settings" description="Store preferences for the VERA CLOTHING admin preview." />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a className="selected" href="#store"><Building2 size={16} /> Store profile</a>
          <a href="#notifications"><Bell size={16} /> Notifications</a>
          <a href="#team"><ShieldCheck size={16} /> Team & access</a>
        </nav>
        <form className="settings-card" onSubmit={saveSettings}>
          <div className="settings-card-header"><span className="settings-icon"><Building2 size={18} /></span><div><h2>Store profile</h2><p>These details are preview-only and are not saved to a backend.</p></div></div>
          <label className="admin-field"><span>Store name</span><input defaultValue={brand.name} /></label>
          <label className="admin-field"><span>Store description</span><textarea defaultValue={brand.description} rows={3} /></label>
          <label className="admin-field"><span>Support email</span><input type="email" defaultValue={brand.links.supportEmail} /></label>
          <label className="admin-field"><span>Delivery Announcement</span><input value={deliveryDraft} onChange={(event) => setDeliveryDraft(event.target.value)} placeholder="Leave blank to hide this message" /></label>
          <label className="admin-field"><span>Brand Announcement</span><input value={brandDraft} onChange={(event) => setBrandDraft(event.target.value)} placeholder="Leave blank to hide this message" /></label>
          <label className="admin-field">
            <span>Store Currency</span>
            <select value={currency} onChange={(event) => { setCurrency(event.target.value as CurrencyCode); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}>
              {Object.values(currencies).map((option) => <option key={option.code} value={option.code}>{option.name} ({option.symbol} {option.code})</option>)}
            </select>
            <small>Changing display currency does not convert stored product prices. This setting is saved locally.</small>
          </label>
          <div className="settings-coming-soon"><LockKeyhole size={16} /><span>Authentication, roles, and store integrations can be configured when the secure backend is connected.</span></div>
          <button className="admin-primary-button" type="submit">{saved ? <><ShieldCheck size={15} /> Saved locally</> : <><Save size={15} /> Save preferences</>}</button>
        </form>
      </div>
    </div>
  );
}
