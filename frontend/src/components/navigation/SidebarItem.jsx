import React from 'react';
import { NavLink } from 'react-router-dom';

export const SidebarItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  badge,
  className = '',
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? 'active' : ''} ${className}`
      }
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        backgroundColor: isActive ? 'var(--brand-muted)' : 'transparent',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <Icon
              size={20}
              strokeWidth={isActive ? 2.25 : 1.75}
              style={{
                color: isActive ? 'var(--brand-primary)' : 'inherit',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
          {badge !== undefined && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-muted)',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
