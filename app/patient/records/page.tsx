'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FileText, Download, Printer, FileSpreadsheet, Server, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function PatientRecordsHub() {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  
  const handleExport = async (format: 'csv' | 'fhir' | 'json') => {
    setIsExporting(format)
    try {
      const response = await fetch(`/api/export?format=${format}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `docto_health_records.${format === 'fhir' ? 'json' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export records. Please try again later.')
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-headline)' }}>
            <Server className="h-6 w-6 text-[#0050cb]" /> Health Records & Export
          </h1>
          <p className="text-sm text-gray-500 mt-1">Download, print, and securely share your complete medical history.</p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-900">Secure & Encrypted Export</h3>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Your exported records contain sensitive medical data. Please ensure you store them securely and only share them with verified healthcare professionals. All Docto exports comply with data protection standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* PDF Export Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col group">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0050cb] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Printer className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Printable PDF Report</h2>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            A clean, formatted, print-ready document containing your profile, prescriptions, and lab report summaries. Perfect for doctor visits.
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Profile & Demographics</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Prescriptions</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Report Summaries & Flags</li>
          </ul>
          <Link 
            href="/patient/records/print" 
            target="_blank"
            className="w-full py-3 px-4 bg-[#0050cb] text-white hover:bg-blue-800 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" /> View & Print PDF
          </Link>
        </div>

        {/* CSV Export Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">CSV / Excel Export</h2>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            A structured spreadsheet format of your medication history and prescription schedules. Ideal for personal tracking or financial records.
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Medication Names</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Dosages & Timings</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Prescription Dates</li>
          </ul>
          <button 
            onClick={() => handleExport('csv')}
            disabled={isExporting === 'csv'}
            className="w-full py-3 px-4 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isExporting === 'csv' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download CSV
          </button>
        </div>

        {/* HL7 FHIR Export Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex flex-col group">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">HL7 FHIR R4 JSON</h2>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Global healthcare interoperability standard. Use this file to import your records into other hospital systems, EMRs, or digital health wallets.
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Patient Resource</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> MedicationRequest Resources</li>
            <li className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Observation Resources</li>
          </ul>
          <button 
            onClick={() => handleExport('fhir')}
            disabled={isExporting === 'fhir'}
            className="w-full py-3 px-4 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-70 rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isExporting === 'fhir' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download FHIR Bundle
          </button>
        </div>

      </div>
    </div>
  )
}
