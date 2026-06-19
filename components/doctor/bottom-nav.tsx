'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const LINKS = [
  { href: '/doctor/planner',      icon: 'calendar_month', label: 'Planner', mergeWith: ['/doctor/planner'] },
  { href: '/doctor/research',     icon: 'menu_book',     label: 'Research' },
  { href: '/doctor/appointments',  icon: 'group',         label: 'Patients' },
]

export function DoctorBottomNav() {
  const pathname = usePathname()

  const isActive = (link: typeof LINKS[0]) => {
    if (link.mergeWith) {
      return link.mergeWith.some((p) => pathname.startsWith(p))
    }
    return pathname.startsWith(link.href)
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/80 backdrop-blur-xl border-t border-black/5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {LINKS.map((link) => {
          const active = isActive(link)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-all',
                active ? 'text-[#0050cb]' : 'text-gray-500 hover:text-gray-900'
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
              <span className={clsx('text-[10px] font-medium tracking-wide', active && 'font-semibold')}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
