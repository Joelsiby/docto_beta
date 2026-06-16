import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.cdnfonts.com/s/29107/HelveticaNeueThin.otf', fontWeight: 100 },
    { src: 'https://fonts.cdnfonts.com/s/29107/HelveticaNeueLight.otf', fontWeight: 300 },
    { src: 'https://fonts.cdnfonts.com/s/29107/HelveticaNeueMedium.otf', fontWeight: 500 },
    { src: 'https://fonts.cdnfonts.com/s/29107/HelveticaNeueBold.otf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: '40 50',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  border: {
    border: '2 solid #1a1a1a',
    padding: 30,
    minHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1 solid #ccc',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 2,
    color: '#0a2a5e',
  },
  qualifications: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  regNo: {
    fontSize: 8,
    color: '#666',
  },
  clinicInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  clinicName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0a2a5e',
  },
  clinicAddress: {
    fontSize: 8,
    color: '#555',
    textAlign: 'right',
    marginTop: 2,
  },
  clinicContact: {
    fontSize: 8,
    color: '#555',
    textAlign: 'right',
  },
  rxSymbol: {
    fontSize: 28,
    fontWeight: 700,
    color: '#c62828',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f5f7fa',
    padding: '8 10',
    borderRadius: 2,
  },
  patientField: {
    flexDirection: 'row',
    marginRight: 24,
  },
  patientLabel: {
    fontSize: 8,
    color: '#888',
    fontWeight: 500,
    marginRight: 4,
    textTransform: 'uppercase',
  },
  patientValue: {
    fontSize: 10,
    fontWeight: 500,
    color: '#1a1a1a',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0a2a5e',
    color: '#fff',
    fontSize: 8,
    fontWeight: 700,
    padding: '6 8',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    padding: '6 8',
    fontSize: 9,
    minHeight: 24,
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    padding: '6 8',
    fontSize: 9,
    minHeight: 24,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  colSno: { width: '6%' },
  colMedicine: { width: '24%' },
  colDosage: { width: '12%' },
  colFrequency: { width: '16%' },
  colTiming: { width: '14%' },
  colMeal: { width: '14%' },
  colDuration: { width: '14%' },
  diagnosisSection: {
    marginTop: 16,
    padding: '10 12',
    backgroundColor: '#f0f4ff',
    borderRadius: 2,
  },
  diagnosisLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#0a2a5e',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  notesSection: {
    marginTop: 12,
    padding: '10 12',
    backgroundColor: '#fff8e1',
    borderRadius: 2,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#e65100',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#444',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTop: '1 solid #ccc',
    paddingTop: 12,
  },
  signatureArea: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 120,
    borderTop: '1 solid #1a1a1a',
    marginTop: 24,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666',
    textTransform: 'uppercase',
  },
  stampArea: {
    alignItems: 'center',
  },
  stampBox: {
    width: 90,
    height: 90,
    border: '2 dashed #0a2a5e',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  stampText: {
    fontSize: 7,
    color: '#0a2a5e',
    textAlign: 'center',
    fontWeight: 700,
  },
  disclaimer: {
    fontSize: 6,
    color: '#999',
    textAlign: 'center',
    marginTop: 6,
  },
  colHeader: {
    fontSize: 7,
    fontWeight: 700,
    color: '#fff',
  },
})

interface PrescriptionItemData {
  id: string
  name: string
  dosage: string | null
  dosage_unit: string | null
  frequency: string[] | null
  timing: string[] | null
  meal_relation: string | null
  quantity_per_dose: string | null
  duration_days: number | null
  notes: string | null
}

interface PatientData {
  full_name: string
  date_of_birth: string | null
  gender: string | null
}

interface DoctorData {
  full_name: string
  specialization: string
  qualifications: string[] | null
  license_number: string | null
  clinic_name: string | null
  clinic_address: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    pin?: string
  } | null
}

interface PrescriptionPDFProps {
  doctor: DoctorData
  patient: PatientData
  items: PrescriptionItemData[]
  diagnosis: string[]
  doctorNotes: string | null
  sessionDate: string
}

function getMealLabel(relation: string | null): string {
  switch (relation) {
    case 'before_meals': return 'Before Food'
    case 'after_meals': return 'After Food'
    case 'with_meals': return 'With Food'
    default: return 'As Directed'
  }
}

function getFreqLabel(freq: string[] | null): string {
  if (!freq || freq.length === 0) return '—'
  const map: Record<string, string> = {
    morning: 'Morn',
    afternoon: 'Noon',
    evening: 'Eve',
    night: 'Night',
  }
  return freq.map(f => map[f] || f).join(' + ')
}

function calcAge(dob: string | null): string {
  if (!dob) return '—'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} yrs`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const PRESCRIPTION_NOTE = 'This is a computer-generated prescription. It is valid without a physical signature.'

export default function PrescriptionPDF({ doctor, patient, items, diagnosis, doctorNotes, sessionDate }: PrescriptionPDFProps) {
  const addr = doctor.clinic_address
  const addrStr = [
    addr?.line1,
    addr?.line2,
    addr?.city,
    addr?.state,
    addr?.pin ? `- ${addr.pin}` : null,
  ].filter(Boolean).join(', ')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          {/* Doctor Header */}
          <View style={styles.headerRow}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>Dr. {doctor.full_name}</Text>
              <Text style={styles.qualifications}>
                {doctor.qualifications?.join(', ') || doctor.specialization}
              </Text>
              <Text style={styles.regNo}>
                Reg. No: {doctor.license_number || 'N/A'}
              </Text>
              <Text style={[styles.regNo, { marginTop: 2 }]}>
                {doctor.specialization}
              </Text>
            </View>
            {doctor.clinic_name && (
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{doctor.clinic_name}</Text>
                {addrStr && (
                  <Text style={styles.clinicAddress}>{addrStr}</Text>
                )}
              </View>
            )}
          </View>

          {/* Patient Info */}
          <View style={styles.patientInfoRow}>
            <View style={styles.patientField}>
              <Text style={styles.patientLabel}>Name</Text>
              <Text style={styles.patientValue}>{patient.full_name}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.patientLabel}>Age</Text>
              <Text style={styles.patientValue}>{calcAge(patient.date_of_birth)}</Text>
            </View>
            {patient.gender && (
              <View style={styles.patientField}>
                <Text style={styles.patientLabel}>Sex</Text>
                <Text style={styles.patientValue}>{patient.gender}</Text>
              </View>
            )}
            <View style={styles.patientField}>
              <Text style={styles.patientLabel}>Date</Text>
              <Text style={styles.patientValue}>{formatDate(sessionDate)}</Text>
            </View>
          </View>

          {/* Rx */}
          <Text style={styles.rxSymbol}>Rx</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, styles.colSno]}>#</Text>
            <Text style={[styles.colHeader, styles.colMedicine]}>Medicine</Text>
            <Text style={[styles.colHeader, styles.colDosage]}>Dosage</Text>
            <Text style={[styles.colHeader, styles.colFrequency]}>Frequency</Text>
            <Text style={[styles.colHeader, styles.colTiming]}>Timing</Text>
            <Text style={[styles.colHeader, styles.colMeal]}>Relation</Text>
            <Text style={[styles.colHeader, styles.colDuration]}>Duration</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, i) => (
            <View key={item.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colSno}>{i + 1}</Text>
              <Text style={[styles.colMedicine, { fontWeight: 500 }]}>{item.name}</Text>
              <Text style={styles.colDosage}>
                {item.dosage}{item.dosage_unit ? ` ${item.dosage_unit}` : ''}
              </Text>
              <Text style={styles.colFrequency}>{getFreqLabel(item.frequency)}</Text>
              <Text style={styles.colTiming}>{item.timing?.join(', ') || '—'}</Text>
              <Text style={styles.colMeal}>{getMealLabel(item.meal_relation)}</Text>
              <Text style={styles.colDuration}>
                {item.duration_days ? `${item.duration_days} days` : '—'}
              </Text>
            </View>
          ))}

          {items.length === 0 && (
            <View style={[styles.tableRow, { justifyContent: 'center', padding: 20 }]}>
              <Text style={{ color: '#999', fontStyle: 'italic' }}>No medicines prescribed</Text>
            </View>
          )}

          {/* Diagnosis */}
          {diagnosis.length > 0 && (
            <View style={styles.diagnosisSection}>
              <Text style={styles.diagnosisLabel}>Diagnosis</Text>
              <Text style={styles.diagnosisText}>
                {diagnosis.map((d: any) => (typeof d === 'string' ? d : d.condition || d.diagnosis)).join(', ')}
              </Text>
            </View>
          )}

          {/* Doctor Notes */}
          {doctorNotes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes & Instructions</Text>
              <Text style={styles.notesText}>{doctorNotes}</Text>
            </View>
          )}

          {/* Medication Notes */}
          {items.some(i => i.notes) && (
            <View style={[styles.notesSection, { backgroundColor: '#f3e5f5' }]}>
              <Text style={[styles.notesLabel, { color: '#6a1b9a' }]}>Medicine Instructions</Text>
              {items.filter(i => i.notes).map(item => (
                <Text key={item.id} style={[styles.notesText, { marginTop: 2 }]}>
                  • {item.name}: {item.notes}
                </Text>
              ))}
            </View>
          )}

          {/* Footer with Signature and Stamp */}
          <View style={styles.footer}>
            <View style={styles.signatureArea}>
              <Text style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Doctor's Signature</Text>
            </View>
            <View style={styles.stampArea}>
              <View style={styles.stampBox}>
                <Text style={styles.stampText}>Dr. {doctor.full_name}</Text>
                <Text style={[styles.stampText, { fontSize: 6, fontWeight: 300, marginTop: 2 }]}>
                  {doctor.specialization}
                </Text>
                {doctor.license_number && (
                  <Text style={[styles.stampText, { fontSize: 6, fontWeight: 300 }]}>
                    Reg: {doctor.license_number}
                  </Text>
                )}
              </View>
              <Text style={styles.signatureLabel}>Clinic Stamp</Text>
            </View>
          </View>

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { position: 'absolute', bottom: 30, left: 0, right: 0 }]}>
            {PRESCRIPTION_NOTE}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
