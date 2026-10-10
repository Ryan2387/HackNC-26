import { useState } from 'react';
import { TrendingUp, X, Leaf, Settings, Menu, ChevronRight, Bell, Sparkles } from 'lucide-react';
import { nav } from './data/navigation';
import Overview from './pages/Overview';
import Forecast from './pages/Forecast';
import Copilot from './pages/Copilot';
import Activity from './pages/Activity';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState(false);
  function go(p) { setPage(p); setMobile(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  return (
  <div className="app-shell">
    <aside className={'sidebar ' + (mobile ? 'open' : '')}>
      <div className="brand">
        <div className="brand-mark">
          <TrendingUp size={22} />
        </div>
        <span>Juno<span className="brand-period">.</span>
        </span>
        <button className="mobile-close" onClick={() => setMobile(false)} aria-label="Close menu">
          <X size={20} />
        </button>
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
        <div className="demo-user">
          <div className="avatar">A</div>
          <div>
            <strong>Alex Morgan</strong>
            <span>Demo account</span>
          </div>
          <Settings size={17} />
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
          <button aria-label="Notifications" className="icon-button" onClick={() => setNotice(!notice)}>
            <Bell size={19} />
          </button>
          <div className="avatar small">A</div>
        </div>{notice && <div className="notification-pop">
          <strong>You're all caught up</strong>
          <p>Alerts will appear here once connected to the backend.</p>
        </div>}</header>
      <div className="content">{page === 'dashboard' ? <Overview go={go} /> : page === 'forecast' ? <Forecast /> : page === 'copilot' ? <Copilot /> : <Activity />}<footer>
        <span>© 2026 Juno Advising · HackNC prototype</span>
        <span>Powered by smarter decisions <Sparkles size={13} />
        </span>
      </footer>
      </div>
    </main>
  </div>
  );
}
