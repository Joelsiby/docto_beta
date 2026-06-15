import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-bright flex overflow-hidden">
      {/* Left side: branding & image (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container relative flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-container/90 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1576091160550-2173ff9e5e3c?auto=format&fit=crop&q=80" 
          alt="Clinical setup" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        
        <div className="relative z-20">
          <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center font-headline-md font-bold mb-4 shadow-sm">
            D
          </div>
          <h1 className="text-display-lg text-on-primary font-bold max-w-md">
            MedFlow Clinical Suite
          </h1>
          <p className="mt-4 text-body-lg text-on-primary/80 max-w-sm">
            Empowering doctors and patients with intelligent clinical tools and seamless care delivery.
          </p>
        </div>

        <div className="relative z-20">
          <div className="glass-card p-6 rounded-2xl max-w-sm">
            <p className="text-body-md text-on-surface mb-4">
              "The AI transcriptions and smart planner have given me back 2 hours of my day. It's a game changer."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-on-secondary-container">
                DR
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Dr. Sarah Jenkins</p>
                <p className="text-xs text-on-surface-variant">Chief of Cardiology</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-surface-container-lowest">
        <div className="w-full max-w-md animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  )
}
