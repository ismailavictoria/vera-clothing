import { useMemo, useState } from 'react';
import { Download, UserRound } from 'lucide-react';
import { AdminSearch, PageTitle, StatusPill } from '../features/admin/AdminShared';
import { useAdminData } from '../features/admin/AdminDataContext';
import { useCurrency } from '../features/currency/CurrencyContext';

const joinedFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function AdminCustomersPage() {
  const { customers } = useAdminData();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => customers.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(search.toLowerCase())),
    [customers, search],
  );

  return (
    <div className="admin-page">
      <PageTitle
        eyebrow="The people behind every order"
        title="Customers"
        description="A little appreciation for the people who choose VERA."
        action={<button className="admin-outline-button" onClick={() => window.alert('Customer export is a preview-only action.')}><Download size={14} /> Export</button>}
      />
      <div className="admin-summary-cards customer-summary">
        <div><span>Total customers</span><strong>{customers.length}</strong></div>
        <div><span>Returning customers</span><strong>{customers.filter((customer) => customer.orders > 1).length}</strong></div>
        <div><span>New this month</span><strong>{customers.filter((customer) => customer.status === 'New').length}</strong></div>
      </div>
      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search customers..." />
        <span className="customer-results">{filtered.length} customers</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table customer-table">
          <thead><tr><th>Customer</th><th>Orders</th><th>Total spent</th><th>Date joined</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td><div className="customer-profile-cell"><span className="customer-initials">{customer.name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{customer.name}</strong><small>{customer.email}</small></div></div></td>
                <td>{customer.orders}</td>
                <td><strong>{formatPrice(customer.spent)}</strong></td>
                <td>{joinedFormat.format(new Date(`${customer.joined}T00:00:00Z`))}</td>
                <td><StatusPill status={customer.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="admin-no-results">No customers match this search.</div>}
      </div>
      <div className="admin-table-footer"><span>Showing {filtered.length} of {customers.length} customers</span><span className="mock-data-note"><UserRound size={13} /> Sample customer records</span></div>
    </div>
  );
}
