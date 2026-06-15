import React from 'react'
import { PatientBottomNav } from '@/components/patient/bottom-nav'
import { TopBar } from '@/components/shared/top-bar'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-bright text-on-surface font-body-md antialiased overflow-hidden flex flex-col h-screen">
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <TopBar userRole="patient" />
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-container-max mx-auto h-full">
             {children}
          </div>
        </main>
      </div>
      <PatientBottomNav />
    </div>
  )
}
