'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { DoctorSidebar } from '@/components/doctor/sidebar'
import { DoctorBottomNav } from '@/components/doctor/bottom-nav'
import { DoctoBotSidebar } from '@/components/doctor/docto-bot-sidebar'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPlannerPage = pathname.startsWith('/doctor/planner')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F7]">
      {/* Sidebar for Desktop */}
      <DoctorSidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 ml-0 lg:ml-[72px] pb-16 lg:pb-0">
        {children}
      </div>

      {/* Bottom Nav for Mobile */}
      <DoctorBottomNav />

      {/* Global Floating Docto Bot for Mobile (hidden on planner pages to avoid overlap with planner bot) */}
      {!isPlannerPage && <DoctoBotSidebar inline={false} />}
    </div>
  )
}
