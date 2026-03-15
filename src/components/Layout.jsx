import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, PlusCircle, BookOpen, CalendarCheck, Settings, ChevronLeft, Menu, Eye, FileText, Layers } from 'lucide-react';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/experiments', label: 'Experimenten', icon: FlaskConical },
  { path: '/experiments/new', label: 'Nieuw', icon: PlusCircle },
  { path: '/funnel', label: 'Funnel', icon: Layers },
  { path: '/content', label: 'Content', icon: FileText },
  { path: '/learnings', label: 'Learnings', icon: BookOpen },
  { path: '/competitors', label: 'Concurrenten', icon: Eye },
  { path: '/review', label: 'Review', icon: CalendarCheck },
  { path: '/settings', label: 'Instellingen', icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="logo" onClick={() => navigate('/')}>
              <span className="logo-icon">🧪</span>
              <div>
                <span className="logo-title">Rinse&Go</span>
                <span className="logo-subtitle">Marketing Lab</span>
              </div>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <button key={path} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => navigate(path)} title={collapsed ? label : undefined}>
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
        {!collapsed && <div className="sidebar-footer"><span className="version-tag">v2.0 — intern</span></div>}
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
