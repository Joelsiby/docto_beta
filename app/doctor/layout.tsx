import React from 'react'
import { DoctorSidebar } from '@/components/doctor/sidebar'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F7]">
      <DoctorSidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-[72px]">
        {children}
      </div>
    </div>
  )
}
