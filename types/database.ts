/**
 * Docto — Supabase Database Types
 * These types mirror the schema defined in the backend architecture.
 * Regenerate with: npx supabase gen types typescript --project-id <project-id> > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'doctor' | 'patient' | 'admin'

export interface Database {
  public: {
    Tables: {
      doctor_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          specialization: string
          qualifications: string[] | null
          license_number: string
          experience_years: number | null
          bio: string | null
          profile_image_url: string | null
          clinic_name: string | null
          clinic_address: Json | null
          working_hours: Json | null
          appointment_duration: number
          consultation_fee: number | null
          teleconsultation: boolean
          clinic_visit: boolean
          bot_tone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          specialization: string
          qualifications?: string[] | null
          license_number: string
          experience_years?: number | null
          bio?: string | null
          profile_image_url?: string | null
          clinic_name?: string | null
          clinic_address?: Json | null
          working_hours?: Json | null
          appointment_duration?: number
          consultation_fee?: number | null
          teleconsultation?: boolean
          clinic_visit?: boolean
          bot_tone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          specialization?: string
          qualifications?: string[] | null
          license_number?: string
          experience_years?: number | null
          bio?: string | null
          profile_image_url?: string | null
          clinic_name?: string | null
          clinic_address?: Json | null
          working_hours?: Json | null
          appointment_duration?: number
          consultation_fee?: number | null
          teleconsultation?: boolean
          clinic_visit?: boolean
          bot_tone?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      patient_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          date_of_birth: string | null
          gender: string | null
          blood_group: string | null
          emergency_contact: Json | null
          address: Json | null
          profile_image_url: string | null
          medical_history: Json | null
          preferred_lang: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          date_of_birth?: string | null
          gender?: string | null
          blood_group?: string | null
          emergency_contact?: Json | null
          address?: Json | null
          profile_image_url?: string | null
          medical_history?: Json | null
          preferred_lang?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          date_of_birth?: string | null
          gender?: string | null
          blood_group?: string | null
          emergency_contact?: Json | null
          address?: Json | null
          profile_image_url?: string | null
          medical_history?: Json | null
          preferred_lang?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          appointment_type: 'teleconsultation' | 'clinic_visit'
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          payment_status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          appointment_type: 'teleconsultation' | 'clinic_visit'
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          payment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          payment_status?: string
          notes?: string | null
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          appointment_id: string | null
          doctor_id: string
          patient_id: string
          started_at: string
          ended_at: string | null
          recording_url: string | null
          transcript: Json | null
          ai_summary: string | null
          ai_issues: Json | null
          ai_diagnosis: Json | null
          ai_referrals: Json | null
          doctor_notes: string | null
          is_confirmed: boolean
          status: 'active' | 'ended' | 'confirmed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          doctor_id: string
          patient_id: string
          started_at: string
          ended_at?: string | null
          recording_url?: string | null
          transcript?: Json | null
          ai_summary?: string | null
          ai_issues?: Json | null
          ai_diagnosis?: Json | null
          ai_referrals?: Json | null
          doctor_notes?: string | null
          is_confirmed?: boolean
          status?: 'active' | 'ended' | 'confirmed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          ended_at?: string | null
          recording_url?: string | null
          transcript?: Json | null
          ai_summary?: string | null
          ai_issues?: Json | null
          ai_diagnosis?: Json | null
          ai_referrals?: Json | null
          doctor_notes?: string | null
          is_confirmed?: boolean
          status?: 'active' | 'ended' | 'confirmed' | 'archived'
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          session_id: string
          doctor_id: string
          patient_id: string
          is_confirmed: boolean
          prescription_pdf_url: string | null
          invoice_pdf_url: string | null
          total_fee: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          doctor_id: string
          patient_id: string
          is_confirmed?: boolean
          prescription_pdf_url?: string | null
          invoice_pdf_url?: string | null
          total_fee?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_confirmed?: boolean
          prescription_pdf_url?: string | null
          invoice_pdf_url?: string | null
          total_fee?: number | null
          updated_at?: string
        }
      }
      prescription_items: {
        Row: {
          id: string
          prescription_id: string
          medicine_name: string
          dosage: string | null
          frequency: Json | null
          timing: Json | null
          meal_relation: string | null
          quantity_per_dose: string | null
          duration_days: number | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          prescription_id: string
          medicine_name: string
          dosage?: string | null
          frequency?: Json | null
          timing?: Json | null
          meal_relation?: string | null
          quantity_per_dose?: string | null
          duration_days?: number | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          medicine_name?: string
          dosage?: string | null
          frequency?: Json | null
          timing?: Json | null
          meal_relation?: string | null
          quantity_per_dose?: string | null
          duration_days?: number | null
          notes?: string | null
          sort_order?: number
        }
      }
      bot_conversations: {
        Row: {
          id: string
          user_id: string
          context_type: string | null
          context_id: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          context_type?: string | null
          context_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string | null
          updated_at?: string
        }
      }
      bot_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          content?: string
          metadata?: Json | null
        }
      }
      health_reports: {
        Row: {
          id: string
          patient_id: string
          report_type: string | null
          report_name: string | null
          file_url: string | null
          file_type: string | null
          extracted_data: Json | null
          ai_analysis: Json | null
          flagged_parameters: Json | null
          status: 'uploaded' | 'processing' | 'analyzed' | 'error'
          analyzed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          report_type?: string | null
          report_name?: string | null
          file_url?: string | null
          file_type?: string | null
          extracted_data?: Json | null
          ai_analysis?: Json | null
          flagged_parameters?: Json | null
          status?: 'uploaded' | 'processing' | 'analyzed' | 'error'
          analyzed_at?: string | null
          created_at?: string
        }
        Update: {
          extracted_data?: Json | null
          ai_analysis?: Json | null
          flagged_parameters?: Json | null
          status?: 'uploaded' | 'processing' | 'analyzed' | 'error'
          analyzed_at?: string | null
        }
      }
      medication_schedule: {
        Row: {
          id: string
          patient_id: string
          prescription_item_id: string
          scheduled_date: string
          scheduled_time: string
          status: 'pending' | 'taken' | 'missed' | 'skipped'
          taken_at: string | null
          is_on_time: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          prescription_item_id: string
          scheduled_date: string
          scheduled_time: string
          status?: 'pending' | 'taken' | 'missed' | 'skipped'
          taken_at?: string | null
          is_on_time?: boolean | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'taken' | 'missed' | 'skipped'
          taken_at?: string | null
          is_on_time?: boolean | null
        }
      }
      medication_streaks: {
        Row: {
          id: string
          patient_id: string
          current_streak: number
          longest_streak: number
          last_streak_date: string | null
          total_on_time: number
          total_doses: number
          discount_earned: number
          discount_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          current_streak?: number
          longest_streak?: number
          last_streak_date?: string | null
          total_on_time?: number
          total_doses?: number
          discount_earned?: number
          discount_active?: boolean
          updated_at?: string
        }
        Update: {
          current_streak?: number
          longest_streak?: number
          last_streak_date?: string | null
          total_on_time?: number
          total_doses?: number
          discount_earned?: number
          discount_active?: boolean
          updated_at?: string
        }
      }
      planner_tasks: {
        Row: {
          id: string
          doctor_id: string
          title: string
          description: string | null
          category: 'work' | 'personal' | 'urgent' | 'followup' | 'learning' | null
          priority: 'high' | 'medium' | 'low' | null
          scheduled_date: string | null
          scheduled_time: string | null
          duration_minutes: number | null
          is_completed: boolean
          completed_at: string | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          title: string
          description?: string | null
          category?: 'work' | 'personal' | 'urgent' | 'followup' | 'learning' | null
          priority?: 'high' | 'medium' | 'low' | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          duration_minutes?: number | null
          is_completed?: boolean
          completed_at?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: 'work' | 'personal' | 'urgent' | 'followup' | 'learning' | null
          priority?: 'high' | 'medium' | 'low' | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          duration_minutes?: number | null
          is_completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
      }
      research_documents: {
        Row: {
          id: string
          doctor_id: string
          title: string | null
          source_type: 'pdf' | 'text' | 'url' | 'image'
          file_url: string | null
          extracted_text: string | null
          ai_summary: string | null
          ai_key_takeaways: Json | null
          is_bookmarked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          title?: string | null
          source_type: 'pdf' | 'text' | 'url' | 'image'
          file_url?: string | null
          extracted_text?: string | null
          ai_summary?: string | null
          ai_key_takeaways?: Json | null
          is_bookmarked?: boolean
          created_at?: string
        }
        Update: {
          title?: string | null
          extracted_text?: string | null
          ai_summary?: string | null
          ai_key_takeaways?: Json | null
          is_bookmarked?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
