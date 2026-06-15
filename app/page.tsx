import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1 items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xl">
              +
            </div>
            <span className="text-2xl font-bold font-headline tracking-tight text-primary">Docto</span>
          </div>
          <div className="flex flex-1 justify-end gap-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register/doctor">For Doctors</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="isolate">
        {/* Background gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-display-lg font-bold tracking-tight text-on-surface sm:text-6xl">
                The intelligent operating system for Indian healthcare
              </h1>
              <p className="mt-6 text-body-lg leading-8 text-on-surface-variant">
                Docto powers the modern clinic with AI. Instantly extract insights from research, automatically generate prescriptions from conversations, and keep patients engaged with smart medication tracking.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" variant="doctor" asChild>
                  <Link href="/register/doctor">I'm a Doctor</Link>
                </Button>
                <Button size="lg" variant="patient" asChild>
                  <Link href="/register/patient">I'm a Patient</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
