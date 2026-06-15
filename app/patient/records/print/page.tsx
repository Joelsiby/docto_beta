'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Printer, ArrowLeft, Heart, FileText, Activity } from 'lucide-react'
import Link from 'next/link'

export default function PrintRecordsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Profile
    const { data: prof } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (prof) {
      setProfile(prof)

      // Prescriptions
      const { data: prescs } = await supabase
        .from('prescriptions')
        .select(`
          id,
          created_at,
          prescription_items (
            id,
            medicine_name,
            dosage,
            duration_days,
            meal_relation,
            notes
          )
        `)
        .eq('patient_id', prof.id)
        .order('created_at', { ascending: false })

      setPrescriptions(prescs || [])

      // Reports
      const { data: reps } = await supabase
        .from('health_reports')
        .select('*')
        .eq('patient_id', prof.id)
        .order('created_at', { ascending: false })

      setReports(reps || [])
    }
    setIsLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-3 border-[#0050cb]/20 border-t-[#0050cb] rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-red-500 font-semibold">Profile not found. Please log in.</p>
        <Link href="/login" className="text-[#0050cb] hover:underline mt-4 inline-block">Go to Login</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      {/* Back & Print Controls (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/patient/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#0050cb] text-white hover:bg-blue-800 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Main Print Container */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm print:shadow-none print:border-0 print:p-0">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b-2 border-gray-100 pb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              🏥 Docto <span className="text-xs uppercase bg-blue-100 text-[#0050cb] px-2 py-0.5 rounded-full font-bold tracking-wider">Health Record</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
          </div>
          <div className="text-left sm:text-right sm:max-w-xs">
            <h3 className="font-bold text-gray-900">MedFlow Clinical Suite</h3>
            <p className="text-xs text-gray-500 mt-1">Comprehensive patient record history summary for personal use and clinical references.</p>
          </div>
        </div>

        {/* Patient Profile Information */}
        <div className="mt-8">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" /> Patient Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of Birth</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{profile.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile.blood_group || 'N/A'}</p>
            </div>
          </div>

          {profile.medical_history && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medical History / Notes</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {typeof profile.medical_history === 'string' 
                  ? profile.medical_history 
                  : JSON.stringify(profile.medical_history)}
              </p>
            </div>
          )}
        </div>

        {/* Prescription History */}
        <div className="mt-10">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
            <Activity className="h-5 w-5 text-[#0050cb]" /> Prescription History
          </h2>
          {prescriptions.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No active prescriptions on record.</p>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-2xl p-5 bg-white">
                  <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                    <span className="text-xs font-bold text-gray-800">Prescription #{p.id.slice(0, 8)}</span>
                    <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2">Medicine</th>
                        <th className="py-2">Dosage</th>
                        <th className="py-2">Meal Relation</th>
                        <th className="py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {p.prescription_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2 font-semibold text-gray-900">{item.medicine_name}</td>
                          <td className="py-2">{item.dosage}</td>
                          <td className="py-2 capitalize">{item.meal_relation || 'N/A'}</td>
                          <td className="py-2 text-gray-500">{item.notes || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lab Reports History */}
        <div className="mt-10 mb-6">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
            <FileText className="h-5 w-5 text-[#0050cb]" /> Lab & Diagnostic Reports
          </h2>
          {reports.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No health reports uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-2xl p-5 bg-white">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{r.report_name}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{r.report_type || 'General'} Panel</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.ai_analysis && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600 bg-blue-50/50 border border-blue-100/30 p-3 rounded-xl leading-relaxed">
                        <span className="font-bold text-[#0050cb] block mb-1">AI Insights & Summary</span>
                        {r.ai_analysis.overall_summary || r.ai_analysis.summary || 'Summary report successfully compiled.'}
                      </div>
                      {r.flagged_parameters && r.flagged_parameters.length > 0 && (
                        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                          <span className="font-bold text-red-600 text-xs block mb-1">Flagged Out-of-Range Parameters</span>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-red-700">
                            {r.flagged_parameters.map((param: any, idx: number) => (
                              <li key={idx}>
                                <strong>{param.parameter || param.name}</strong>: {param.value} {param.unit} (Expected: {param.expected_range || param.range}) - {param.explanation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer Footer */}
        <div className="border-t border-gray-100 pt-8 mt-12 text-center text-[10px] text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Docto AI Report is for informational purposes only. It is generated using advanced AI OCR and clinical summary analysis based on client uploads. Always consult a certified healthcare professional before making any medical decisions or modifying prescriptions.
        </div>
      </div>
    </div>
  )
}
