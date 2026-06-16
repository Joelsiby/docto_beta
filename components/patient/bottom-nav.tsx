'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const LINKS = [
  { href: '/patient/dashboard',     icon: 'home',           label: 'Home' },
  { href: '/patient/appointments',  icon: 'calendar_today', label: 'Bookings' },
  { href: '/patient/medications',   icon: 'medication',     label: 'Meds' },
  // "Health" tab merges Reports (/patient/reports) + Consultations (/patient/consultations)
  { href: '/patient/reports',       icon: 'monitor_heart',  label: 'Health', mergeWith: ['/patient/consultations', '/patient/reports'] },
  { href: '/patient/settings',      icon: 'person',         label: 'Profile' },
]

export function PatientBottomNav() {
  const pathname = usePathname()

  const isActive = (link: typeof LINKS[0]) => {
    if (link.mergeWith) {
      return link.mergeWith.some((p) => pathname.startsWith(p))
    }
    return pathname.startsWith(link.href)
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface-glass backdrop-blur-xl border-t border-border-subtle shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {LINKS.map((link) => {
          const active = isActive(link)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-all',
                active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span
                className={clsx(
                  'material-symbols-outlined text-2xl transition-all duration-200',
                  active && 'scale-110'
                )}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {link.icon}
              </span>
              <span className={clsx('text-[10px] font-medium tracking-wide', active && 'font-bold')}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
