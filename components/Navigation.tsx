'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/about' },
    { label: 'Media', href: '/' },
    { label: 'Explore', href: '/player/park-jisung' },
    { label: 'List', href: '/gallery' },
  ];

  return (
    <div
      className="fixed z-50"
      style={{
        top: spacing[24],
        right: spacing[24],
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '100px',
        padding: spacing[8],
        gap: spacing[4],
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: `${spacing[12]} ${spacing[24]}`,
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
              color: isActive ? '#000000' : colors.dark.label.primary,
              textAlign: 'center',
              fontSize: typography.fontSize.body,
              fontWeight: typography.fontWeight.semibold,
              textDecoration: 'none',
              transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
              borderRadius: '100px',
              minHeight: interaction.minTouchTarget,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '64px',
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
