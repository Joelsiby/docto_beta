import { TopBar } from '@/components/shared/top-bar'
import { DoctoBotSidebar } from '@/components/doctor/docto-bot-sidebar'

export default function PlannerTodayPage() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden lg:mr-[320px] bg-surface-bright text-on-surface">
      <TopBar 
        title="" 
        subtitle="" 
        showSearch={true} 
      />
      
      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Focus Summary */}
          <div className="lg:col-span-1 bg-surface-glass backdrop-blur-md border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md font-headline-md text-deep-navy">Today's Focus</h3>
              <span className="text-label-md font-label-md text-primary bg-primary-container/20 px-2 py-1 rounded">June 5, 2026</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-lg border border-border-subtle">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Teleconsultations</p>
                <p className="text-headline-md font-headline-md text-primary">12</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-border-subtle">
                <p className="text-label-md font-label-md text-on-surface-variant mb-1">Clinical Bookings</p>
                <p className="text-headline-md font-headline-md text-secondary">8</p>
              </div>
            </div>
          </div>

          {/* Daily Todo List */}
          <div className="lg:col-span-2 bg-surface-glass backdrop-blur-md border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md font-headline-md text-deep-navy">Daily Tasks</h3>
              <button className="text-primary text-body-sm font-medium hover:underline">+ Add Task</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Work */}
              <div className="flex flex-col gap-2">
                <span className="text-label-md font-label-md text-on-surface-variant/60 uppercase tracking-wider">Work</span>
                <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-border-subtle">
                  <span className="material-symbols-outlined text-sm text-primary">check_box_outline_blank</span>
                  <span className="text-body-sm">Review Lab Results</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-border-subtle">
                  <span className="material-symbols-outlined text-sm text-primary">check_box_outline_blank</span>
                  <span className="text-body-sm">Staff Meeting</span>
                </div>
              </div>
              {/* Home */}
              <div className="flex flex-col gap-2">
                <span className="text-label-md font-label-md text-on-surface-variant/60 uppercase tracking-wider">Home</span>
                <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-border-subtle">
                  <span className="material-symbols-outlined text-sm text-secondary">check_box_outline_blank</span>
                  <span className="text-body-sm">Grocery Shopping</span>
                </div>
              </div>
              {/* Personal */}
              <div className="flex flex-col gap-2">
                <span className="text-label-md font-label-md text-on-surface-variant/60 uppercase tracking-wider">Personal</span>
                <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-border-subtle">
                  <span className="material-symbols-outlined text-sm text-tertiary">check_box_outline_blank</span>
                  <span className="text-body-sm">Evening Run</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action controls (simplified from full planner) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-deep-navy">Timeline</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-surface-container-lowest border border-border-subtle rounded-lg p-1 shadow-sm">
              <button className="px-4 py-1.5 text-body-sm font-body-sm bg-surface-container-low text-on-surface rounded-md border border-border-subtle shadow-sm transition-colors">Day</button>
              <button className="px-4 py-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors">Week</button>
              <button className="px-4 py-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors">Month</button>
            </div>
          </div>
        </div>
      </main>

      {/* NavigationDrawer (Docto Bot AI Interface) */}
      <aside className="hidden lg:flex fixed right-0 top-0 h-full w-80 z-50 flex flex-col bg-surface-container-lowest dark:bg-inverse-surface border-l border-border-subtle shadow-2xl transition-transform duration-300">
        <DoctoBotSidebar inline={true} />
      </aside>
    </div>
  )
}
