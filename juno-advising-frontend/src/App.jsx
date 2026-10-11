import { useEffect, useRef, useState } from 'react';
import { Leaf, Menu, ChevronRight, Sparkles, ChevronsUpDown } from 'lucide-react';
import { nav } from './data/navigation';
import Overview from './pages/Overview';
import Forecast from './pages/Forecast';
import Copilot from './pages/Copilot';
import Activity from './pages/Activity';
import junoLogo from './assets/juno-logo.png';

const customers = [
  { _id: '3a0742d9-9abc-4c17-aa09-c42e3d482c06', first_name: 'James', last_name: 'Carter', city: 'Raleigh' },
  { _id: '3b59fe89-03ab-4d6f-83aa-4c469a7e1877', first_name: 'Alexander', last_name: 'Edgar', city: 'Chapel Hill' },
  { _id: '3b9e4beb-11b3-4fe1-94f9-b1abea5a778a', first_name: 'Sophia', last_name: 'Mitchell', city: 'Durham' },
  { _id: 'a0d8f763-0f3d-4461-a963-8777ade8011a', first_name: 'Andrea', last_name: 'Garrido', city: 'Chapel Hill' },
  { _id: 'b7e5bc14-94b2-4b74-b031-409211579aa6', first_name: 'Olivia', last_name: 'Bennett', city: 'Carrboro' },
  { _id: 'db0684ac-6dbb-4bee-a31b-85f8fe1fd1af', first_name: 'William', last_name: 'Parker', city: 'Hillsborough' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobile, setMobile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeAccountMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeAccountMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function go(p) { setPage(p); setMobile(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const customerName = `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
  const customerInitials = `${selectedCustomer.first_name[0]}${selectedCustomer.last_name[0]}`;
  return (
  <div className="app-shell">
    <aside className={'sidebar ' + (mobile ? 'open' : '')}>
      <div className="brand">
        <div className="brand-mark">
          <img src={junoLogo} alt="Juno Logo" className="brand-logo" />
        </div>
        <span>
          Juno<span className="brand-period">.</span>
        </span>
      </div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav>{nav.map(n => <button key={n.id} className={'nav-link ' + (page === n.id ? 'active' : '')} onClick={() => go(n.id)}>
        <n.icon size={19} />{n.name}{page === n.id && <span className="nav-indicator" />}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <div className="tip-icon">
            <Leaf size={18} />
          </div>
          <strong>Make money make sense.</strong>
          <p>Small decisions today create a brighter tomorrow.</p>
        </div>
        <div className="account-picker" ref={accountMenuRef}>
          <button
            className="demo-user"
            type="button"
            aria-label={`Switch demo account. Current account: ${customerName}`}
            aria-expanded={accountMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setAccountMenuOpen(open => !open)}
          >
            <span className="avatar">{customerInitials}</span>
            <span className="demo-user-copy">
              <strong>{customerName}</strong>
              <span>{selectedCustomer.city} · Demo account</span>
            </span>
            <ChevronsUpDown size={16} />
          </button>
          {accountMenuOpen && (
            <div className="account-menu" role="listbox" aria-label="Choose a demo account">
              {customers.map(customer => {
                const name = `${customer.first_name} ${customer.last_name}`;
                const initials = `${customer.first_name[0]}${customer.last_name[0]}`;
                const selected = customer._id === selectedCustomer._id;

                return (
                  <button
                    className={'account-option' + (selected ? ' selected' : '')}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    key={customer._id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setAccountMenuOpen(false);
                    }}
                  >
                    <span className="avatar option-avatar">{initials}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>{customer.city}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>{mobile && <div className="mobile-overlay" onClick={() => setMobile(false)} />}<main className="main">
      <header className="topbar">
        <button className="hamburger" aria-label="Open menu" onClick={() => setMobile(true)}>
          <Menu size={22} />
        </button>
        <div className="breadcrumbs">Workspace <ChevronRight size={14} /> <strong>{nav.find(n => n.id === page)?.name}</strong>
        </div>
        <div className="top-actions">
          <span className="demo-pill">
            <span /> DEMO DATA</span>
          <div className="avatar small" aria-label={`Selected account: ${customerName}`} title={customerName}>
            {customerInitials}
          </div>
        </div></header>
      <div className="content">{page === 'dashboard' ? <Overview key={selectedCustomer._id} go={go} customer={selectedCustomer} /> : page === 'forecast' ? <Forecast key={selectedCustomer._id} customerId={selectedCustomer._id} /> : page === 'copilot' ? <Copilot key={selectedCustomer._id} customer={selectedCustomer} /> : <Activity key={selectedCustomer._id} customerId={selectedCustomer._id} />}<footer>
        <span>© 2026 Juno Advising · HackNC prototype</span>
        <span>Powered by smarter decisions <Sparkles size={13} />
        </span>
      </footer>
      </div>
    </main>
  </div>
  );
}
