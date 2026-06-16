import React from 'react'
import { PatientBottomNav } from '@/components/patient/bottom-nav'
import { TopBar } from '@/components/shared/top-bar'
import { DoctoBotSidebar } from '@/components/patient/docto-bot-sidebar'
import PatientDesktopNav from '@/components/patient/desktop-nav'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-bright text-on-surface font-body-md antialiased">
      {/* TopBar */}
      <TopBar userRole="patient" />

      <div className="flex min-h-screen pt-[60px]">
        {/* Desktop Side Nav */}
        <PatientDesktopNav />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 lg:pb-8">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <PatientBottomNav />

      {/* Docto Bot Sidebar (global — every patient page) */}
      <DoctoBotSidebar />
    </div>
  )
}
