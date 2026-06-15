'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, Search, Menu, CheckCircle2, FileText, Calendar, Pill, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

export interface TopBarProps {
  userRole?: 'doctor' | 'patient'
  title?: string
  subtitle?: string
  showSearch?: boolean
}

export function TopBar({ 
  userRole = 'doctor', 
  title, 
  subtitle, 
  showSearch = true 
}: TopBarProps) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [userName, setUserName] = useState(userRole === 'doctor' ? 'Dr. User' : 'Patient User')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let channel: any;

    const fetchUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Name
      if (userRole === 'doctor') {
        const { data }: { data: any } = await supabase.from('doctor_profiles').select('full_name').eq('user_id', user.id).maybeSingle()
        if (data) setUserName(`Dr. ${data.full_name}`)
      } else {
        const { data }: { data: any } = await supabase.from('patient_profiles').select('full_name').eq('user_id', user.id).maybeSingle()
        if (data) setUserName(data.full_name)
      }

      // Fetch Notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      setNotifications(notifs || [])

      // Subscribe to realtime notifications
      channel = supabase
        .channel(`notifications-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()
    }

    fetchUserAndNotifications()

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (channel) supabase.removeChannel(channel)
    }
  }, [userRole])

  const markAsRead = async (id: string) => {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase as any).from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type: string) => {
    switch(type) {
      case 'appointment': return <Calendar className="h-4 w-4 text-blue-600" />
      case 'medication': return <Pill className="h-4 w-4 text-emerald-600" />
      case 'report': return <FileText className="h-4 w-4 text-purple-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 sm:gap-x-6 shadow-sm">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {title ? (
            <div className="flex flex-col justify-center">
              <h1 className="text-sm font-bold text-gray-900 font-headline leading-tight">{title}</h1>
              {subtitle && <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">{subtitle}</p>}
            </div>
          ) : showSearch ? (
            <form className="relative flex flex-1 h-full max-w-md" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">Search</label>
              <div className="relative w-full h-full flex items-center">
                <Search className="pointer-events-none absolute left-0 h-4 w-4 text-gray-400" aria-hidden="true" />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm outline-none"
                  placeholder={userRole === 'doctor' ? "Search patients..." : "Search doctors, reports..."}
                  type="search"
                  name="search"
                />
              </div>
            </form>
          ) : null}
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          
          {/* Notification Center */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button" 
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    Notifications {unreadCount > 0 && <span className="bg-[#0050cb] text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-[#0050cb] hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      You're all caught up!
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => { if (!n.is_read) markAsRead(n.id); if(n.link) window.location.href = n.link; }}
                          className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.type === 'appointment' ? 'bg-blue-100' : 
                            n.type === 'medication' ? 'bg-emerald-100' : 
                            n.type === 'report' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                              {new Date(n.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          {!n.is_read && <div className="w-2 h-2 bg-[#0050cb] rounded-full mt-1.5 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                  <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors w-full py-1">
                    View Notification Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-full transition-colors pr-3">
              <span className="sr-only">Open user menu</span>
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarFallback className="bg-blue-50 text-[#0050cb] font-bold text-xs">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-bold text-gray-900" aria-hidden="true">
                  {userName}
                </span>
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
