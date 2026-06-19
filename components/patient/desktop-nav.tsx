'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/patient/dashboard',      icon: 'home',            label: 'Home' },
  { href: '/patient/medications',    icon: 'medication',      label: 'Medications' },
  { href: '/patient/reports',        icon: 'description',     label: 'Health Reports' },
  { href: '/patient/consultations',  icon: 'stethoscope',     label: 'Consultations' },
  { href: '/patient/appointments',   icon: 'calendar_today',  label: 'Appointments' },
  { href: '/patient/doctors',        icon: 'local_hospital',  label: 'Find Doctors' },
  { href: '/patient/records',        icon: 'folder_managed',  label: 'Records & Export' },
]

export default function PatientDesktopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data }: { data: any } = await supabase
        .from('patient_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.full_name) {
        setUserName(data.full_name)
      }
    }
    fetchUserName()
  }, [])

  const profileLabel = userName
    ? `${userName.split(' ')[0]}'s Profile`
    : 'My Profile'

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 h-screen overflow-y-auto py-6 px-3">
      {/* Logo mark */}
      <div className="px-3 mb-6">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Patient Portal</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-50 text-[#0050cb] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span
                className={clsx('material-symbols-outlined text-[20px]')}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0050cb]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Profile & Logout */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-1">
        <Link
          href="/patient/settings"
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            pathname.startsWith('/patient/settings')
              ? 'bg-blue-50 text-[#0050cb]'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span>{profileLabel}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
