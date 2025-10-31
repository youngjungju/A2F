'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: 'Archive', href: '/archive' },
  ];

  return (
    <div
      className="fixed z-50"
      style={{
        top: spacing[24],
        left: spacing[24],
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
        minWidth: '284px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              padding: '6px 10px',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
              color: isActive ? '#000000' : colors.dark.label.primary,
              textAlign: 'center',
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              textDecoration: 'none',
              transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
              borderRadius: '6px',
              minHeight: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
