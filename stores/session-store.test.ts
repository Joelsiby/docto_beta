import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './session-store'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession()
  })

  it('should initialize with default values', () => {
    const state = useSessionStore.getState()
    expect(state.isRecording).toBe(false)
    expect(state.transcript).toEqual([])
    expect(state.prescriptions).toEqual([])
    expect(state.sessionStatus).toBe('idle')
    expect(state.sessionId).toBeNull()
  })

  it('should add transcript entries', () => {
    const { addTranscript } = useSessionStore.getState()
    addTranscript({ speaker: 'Doctor', time: '00:02', text: 'Hello, how are you?' })
    addTranscript({ speaker: 'Patient', time: '00:05', text: 'I have a cough.' })

    const { transcript } = useSessionStore.getState()
    expect(transcript).toHaveLength(2)
    expect(transcript[0].speaker).toBe('Doctor')
    expect(transcript[1].speaker).toBe('Patient')
  })

  it('should add and remove prescriptions', () => {
    const { addPrescription, removePrescription } = useSessionStore.getState()

    const rx = {
      id: 'rx_test_1',
      name: 'Paracetamol 650mg',
      dosage: '1 tablet',
      whenToTake: ['morning', 'night'],
      timing: ['08:00', '21:00'],
      mealRelation: 'after_meals' as const,
      durationDays: 5,
      notes: 'Take with warm water',
      actions: '',
      confidence: 'high' as const,
    }

    addPrescription(rx)
    expect(useSessionStore.getState().prescriptions).toHaveLength(1)

    removePrescription('rx_test_1')
    expect(useSessionStore.getState().prescriptions).toHaveLength(0)
  })

  it('should update a prescription', () => {
    const { addPrescription, updatePrescription } = useSessionStore.getState()

    addPrescription({
      id: 'rx_1',
      name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      whenToTake: ['morning', 'night'],
      timing: ['08:00', '21:00'],
      mealRelation: 'after_meals',
      durationDays: 7,
      notes: '',
      actions: '',
      confidence: 'high',
    })

    updatePrescription('rx_1', { durationDays: 5, notes: 'Updated note' })

    const updated = useSessionStore.getState().prescriptions.find(p => p.id === 'rx_1')
    expect(updated?.durationDays).toBe(5)
    expect(updated?.notes).toBe('Updated note')
    expect(updated?.name).toBe('Amoxicillin 500mg') // unchanged
  })

  it('should set session status', () => {
    const { setSessionStatus } = useSessionStore.getState()
    setSessionStatus('recording')
    expect(useSessionStore.getState().sessionStatus).toBe('recording')

    setSessionStatus('review')
    expect(useSessionStore.getState().sessionStatus).toBe('review')
  })

  it('should clear session completely', () => {
    const store = useSessionStore.getState()
    store.addTranscript({ speaker: 'Doctor', time: '00:01', text: 'Test' })
    store.setSessionStatus('recording')
    store.setIsRecording(true)

    store.clearSession()

    const cleared = useSessionStore.getState()
    expect(cleared.transcript).toHaveLength(0)
    expect(cleared.sessionStatus).toBe('idle')
    expect(cleared.isRecording).toBe(false)
    expect(cleared.prescriptions).toHaveLength(0)
  })

  it('should seed demo transcript', () => {
    const { seedDemoTranscript } = useSessionStore.getState()
    seedDemoTranscript()

    const { transcript } = useSessionStore.getState()
    expect(transcript.length).toBeGreaterThan(0)
    expect(transcript[0].speaker).toBe('Doctor')
  })
})
