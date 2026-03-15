import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle, ChevronDown } from 'lucide-react';
import { STATUS_OPTIONS } from '../data/defaults';

// ============================================
// Card
// ============================================
export function Card({ children, className = '', onClick, padding = true }) {
  return (
    <div
      className={`card ${padding ? '' : 'no-padding'} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============================================
// Stat Card
// ============================================
export function StatCard({ label, value, sub, color, onClick }) {
  return (
    <Card className="stat-card" onClick={onClick}>
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </Card>
  );
}

// ============================================
// Status Badge
// ============================================
export function StatusBadge({ status, small = false }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  if (!opt) return null;
  return (
    <span
      className={`status-badge ${small ? 'small' : ''}`}
      style={{ '--badge-color': opt.color }}
    >
      {opt.label}
    </span>
  );
}

// ============================================
// Badge
// ============================================
export function Badge({ children, color = 'gray', small = false }) {
  return (
    <span className={`badge badge-${color} ${small ? 'small' : ''}`}>
      {children}
    </span>
  );
}

// ============================================
// Warning Box
// ============================================
export function WarningBox({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="warnings-container">
      {warnings.map((w, i) => (
        <div key={i} className={`warning-item warning-${w.type}`}>
          {w.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Modal
// ============================================
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Confirm Dialog
// ============================================
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Bevestig', danger = false }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ============================================
// Empty State
// ============================================
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} strokeWidth={1.2} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

// ============================================
// Section Header
// ============================================
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================
// Tabs
// ============================================
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`tab ${active === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Form Components
// ============================================
export function FormField({ label, hint, error, required, children }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export function Input({ value, onChange, ...props }) {
  return (
    <input
      className="form-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function Textarea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      className="form-input form-textarea"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      {...props}
    />
  );
}

export function Select({ value, onChange, options, placeholder = 'Selecteer...', ...props }) {
  return (
    <select
      className="form-input form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

export function MultiSelect({ value = [], onChange, options }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="multi-select">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <button
            key={val}
            type="button"
            className={`multi-select-option ${value.includes(val) ? 'selected' : ''}`}
            onClick={() => toggle(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Page Header
// ============================================
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

// ============================================
// Score Stars
// ============================================
export function ScoreStars({ value, max = 5, onChange }) {
  return (
    <div className="score-stars">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`star ${i < value ? 'filled' : ''}`}
          onClick={onChange ? () => onChange(i + 1) : undefined}
        >
          ★
        </button>
      ))}
    </div>
  );
}
