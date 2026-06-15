'use client'

export function PlannerView() {
  return (
    <>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-deep-navy">My Clinical Plan</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Segmented Controls */}
          <div className="flex bg-surface-container-lowest border border-border-subtle rounded-lg p-1 shadow-sm">
            <button className="px-4 py-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors">Milestone</button>
            <button className="px-4 py-1.5 text-body-sm font-body-sm bg-primary text-on-primary rounded-md shadow-sm transition-colors">Planner</button>
          </div>
          <div className="flex bg-surface-container-lowest border border-border-subtle rounded-lg p-1 shadow-sm">
            <button className="px-4 py-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors">Day</button>
            <button className="px-4 py-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-on-surface rounded-md transition-colors">Week</button>
            <button className="px-4 py-1.5 text-body-sm font-body-sm bg-surface-container-low text-on-surface rounded-md border border-border-subtle shadow-sm transition-colors">Month</button>
          </div>
          <div className="h-6 w-px bg-border-subtle"></div>
          {/* Action Buttons */}
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-border-subtle text-on-surface rounded-lg hover:bg-surface-container-low transition-colors shadow-sm text-body-sm font-body-sm font-medium">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Reset Plan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-body-sm font-body-sm font-medium">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Task
          </button>
        </div>
      </div>

      {/* Calendar Wrapper (Bento style) */}
      <div className="bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
        {/* Month/Nav Header */}
        <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-surface-bright/50">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-border-subtle rounded-lg px-2 py-1">
            <button className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <span className="text-body-md font-body-md font-medium px-2">June 2026</span>
            <button className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
          <span className="text-label-md font-label-md text-on-surface-variant">Last edited on 05/06/2026</span>
        </div>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-container-low/50">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="py-3 text-center text-label-md font-label-md text-on-surface-variant">{day}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-4 bg-border-subtle gap-px">
          {/* Example Day 1 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">1</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max">OPD · 2</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max">Rounds · 1</div>
            <div className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-medium w-max">Surgery · 7</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 3h 52m
            </div>
          </div>
          
          {/* Example Day 2 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">2</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max">OPD · 2</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max">Rounds · 3</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 4h 18m
            </div>
          </div>

          {/* Example Day 3 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">3</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max">OPD · 2</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max">Rounds · 8</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 2h 44m
            </div>
          </div>

          {/* Example Day 4 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">4</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max">OPD · 14</div>
            <div className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-medium w-max">Surgery · 6</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max">Rounds · 7</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 11h 17m
            </div>
          </div>

          {/* Day 5 (TODAY - ACTIVE) */}
          <div className="bg-surface-bright p-2 flex flex-col gap-1 border-2 border-primary/40 relative cursor-pointer shadow-sm">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
            <span className="text-body-sm font-body-sm font-bold text-primary mb-1">5</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max relative z-10">OPD · 11</div>
            <div className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-medium w-max relative z-10">Surgery · 8</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max relative z-10">Rounds · 2</div>
            <div className="mt-auto flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[12px]">schedule</span> 9h 41m
              </div>
              <div className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded">TODAY</div>
            </div>
          </div>

          {/* Example Day 6 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">6</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max">OPD · 5</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max">Rounds · 2</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 6h 8m
            </div>
          </div>

          {/* Example Day 7 */}
          <div className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
            <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">7</span>
            <div className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-medium w-max opacity-60">OPD · 7</div>
            <div className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-medium w-max opacity-60">Rounds · 1</div>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 6h 15m
            </div>
          </div>

          {/* More blank days to fill grid */}
          {[...Array(21)].map((_, i) => (
             <div key={`empty-${i+8}`} className="bg-surface-container-lowest p-2 flex flex-col gap-1 hover:bg-surface-bright transition-colors cursor-pointer group">
               <span className="text-body-sm font-body-sm font-medium text-on-surface-variant mb-1 group-hover:text-primary">{i + 8}</span>
             </div>
          ))}

        </div>
      </div>
    </>
  )
}
