export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string
          chief_complaint: string | null
          created_at: string
          department_id: string | null
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          queue_number: number | null
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          chief_complaint?: string | null
          created_at?: string
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          queue_number?: number | null
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          chief_complaint?: string | null
          created_at?: string
          department_id?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          queue_number?: number | null
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          risk_level: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      country_profiles: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          date_format: string
          default_currency: string | null
          default_language: string
          default_tax_rate: number
          tax_model: string
          timezone: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          date_format?: string
          default_currency?: string | null
          default_language?: string
          default_tax_rate?: number
          tax_model?: string
          timezone?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          date_format?: string
          default_currency?: string | null
          default_language?: string
          default_tax_rate?: number
          tax_model?: string
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_profiles_default_currency_fkey"
            columns: ["default_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string
          head_id: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          head_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          as_of_date: string
          base_currency: string
          created_at: string
          id: string
          organization_id: string
          quote_currency: string
          rate: number
          source: string
        }
        Insert: {
          as_of_date?: string
          base_currency: string
          created_at?: string
          id?: string
          organization_id: string
          quote_currency: string
          rate: number
          source?: string
        }
        Update: {
          as_of_date?: string
          base_currency?: string
          created_at?: string
          id?: string
          organization_id?: string
          quote_currency?: string
          rate?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_fkey"
            columns: ["base_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exchange_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_rates_quote_currency_fkey"
            columns: ["quote_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      fiscal_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_periods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      icd10_codes: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string
          is_billable: boolean
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description: string
          is_billable?: boolean
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string
          is_billable?: boolean
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_number: string | null
          category: string | null
          created_at: string
          expiry_date: string | null
          id: string
          item_name: string
          location: string | null
          medication_id: string | null
          min_quantity: number | null
          organization_id: string
          quantity: number | null
          selling_price: number | null
          status: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name: string
          location?: string | null
          medication_id?: string | null
          min_quantity?: number | null
          organization_id: string
          quantity?: number | null
          selling_price?: number | null
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name?: string
          location?: string | null
          medication_id?: string | null
          min_quantity?: number | null
          organization_id?: string
          quantity?: number | null
          selling_price?: number | null
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance: number | null
          created_at: string
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          organization_id: string
          patient_id: string
          status: Database["public"]["Enums"]["billing_status"]
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance?: number | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          organization_id: string
          patient_id: string
          status?: Database["public"]["Enums"]["billing_status"]
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance?: number | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["billing_status"]
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_code: string
          ordered_by: string
          organization_id: string
          patient_id: string
          priority: string | null
          results: Json | null
          specimen_type: string | null
          status: Database["public"]["Enums"]["lab_order_status"]
          test_category: string | null
          test_name: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_code: string
          ordered_by: string
          organization_id: string
          patient_id: string
          priority?: string | null
          results?: Json | null
          specimen_type?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          test_category?: string | null
          test_name: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_code?: string
          ordered_by?: string
          organization_id?: string
          patient_id?: string
          priority?: string | null
          results?: Json | null
          specimen_type?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          test_category?: string | null
          test_name?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      loinc_codes: {
        Row: {
          code: string
          component: string | null
          created_at: string
          long_common_name: string
          property: string | null
          scale: string | null
          system: string | null
        }
        Insert: {
          code: string
          component?: string | null
          created_at?: string
          long_common_name: string
          property?: string | null
          scale?: string | null
          system?: string | null
        }
        Update: {
          code?: string
          component?: string | null
          created_at?: string
          long_common_name?: string
          property?: string | null
          scale?: string | null
          system?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          category: string | null
          created_at: string
          dosage_form: string | null
          generic_name: string | null
          id: string
          is_controlled: boolean | null
          name: string
          organization_id: string
          requires_prescription: boolean | null
          strength: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_controlled?: boolean | null
          name: string
          organization_id: string
          requires_prescription?: boolean | null
          strength?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          id?: string
          is_controlled?: boolean | null
          name?: string
          organization_id?: string
          requires_prescription?: boolean | null
          strength?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_street: string | null
          code: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          license_number: string | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_street?: string | null
          code: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_street?: string | null
          code?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          national_id: string | null
          organization_id: string
          patient_code: string
          phone: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          national_id?: string | null
          organization_id: string
          patient_code: string
          phone?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          national_id?: string | null
          organization_id?: string
          patient_code?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          dosage: string
          duration: string | null
          frequency: string
          id: string
          instructions: string | null
          is_dispensed: boolean | null
          medication_name: string
          prescription_id: string
          quantity: number | null
        }
        Insert: {
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medication_name: string
          prescription_id: string
          quantity?: number | null
        }
        Update: {
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medication_name?: string
          prescription_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          status: string
          updated_at: string
          valid_until: string | null
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          status?: string
          updated_at?: string
          valid_until?: string | null
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          status?: string
          updated_at?: string
          valid_until?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_reminders: {
        Row: {
          id: string
          organization_id: string
          reason: string
          recipient_email: string
          recipient_user_id: string
          sent_at: string
          sent_by: string
        }
        Insert: {
          id?: string
          organization_id: string
          reason?: string
          recipient_email: string
          recipient_user_id: string
          sent_at?: string
          sent_by: string
        }
        Update: {
          id?: string
          organization_id?: string
          reason?: string
          recipient_email?: string
          recipient_user_id?: string
          sent_at?: string
          sent_by?: string
        }
        Relationships: []
      }
      tax_codes: {
        Row: {
          code: string
          country_code: string | null
          created_at: string
          id: string
          is_active: boolean
          is_inclusive: boolean
          name: string
          organization_id: string
          rate: number
          region: string | null
          tax_type: string
          updated_at: string
        }
        Insert: {
          code: string
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_inclusive?: boolean
          name: string
          organization_id: string
          rate?: number
          region?: string | null
          tax_type: string
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_inclusive?: boolean
          name?: string
          organization_id?: string
          rate?: number
          region?: string | null
          tax_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rules: {
        Row: {
          applies_to: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          priority: number
          tax_code_id: string
        }
        Insert: {
          applies_to: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          priority?: number
          tax_code_id: string
        }
        Update: {
          applies_to?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          priority?: number
          tax_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rules_tax_code_id_fkey"
            columns: ["tax_code_id"]
            isOneToOne: false
            referencedRelation: "tax_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_hash: string
          device_label: string | null
          expires_at: string
          id: string
          last_ip: string | null
          last_seen_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_hash: string
          device_label?: string | null
          expires_at?: string
          id?: string
          last_ip?: string | null
          last_seen_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_hash?: string
          device_label?: string | null
          expires_at?: string
          id?: string
          last_ip?: string | null
          last_seen_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          created_at: string
          enrolled_at: string | null
          factor_id: string | null
          id: string
          is_enabled: boolean
          last_verified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enrolled_at?: string | null
          factor_id?: string | null
          id?: string
          is_enabled?: boolean
          last_verified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enrolled_at?: string | null
          factor_id?: string | null
          id?: string
          is_enabled?: boolean
          last_verified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          department_id: string | null
          granted_at: string
          id: string
          is_active: boolean
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          department_id?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          department_id?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_dept"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_timeline: {
        Row: {
          detail: string | null
          id: string
          label: string
          occurred_at: string
          performed_by: string | null
          status: Database["public"]["Enums"]["visit_status"]
          visit_id: string
        }
        Insert: {
          detail?: string | null
          id?: string
          label: string
          occurred_at?: string
          performed_by?: string | null
          status: Database["public"]["Enums"]["visit_status"]
          visit_id: string
        }
        Update: {
          detail?: string | null
          id?: string
          label?: string
          occurred_at?: string
          performed_by?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_timeline_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          admitted_at: string | null
          appointment_id: string | null
          attending_doctor_id: string | null
          created_at: string
          department_id: string | null
          diagnosis: string | null
          discharge_summary: string | null
          discharged_at: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          status: Database["public"]["Enums"]["visit_status"]
          updated_at: string
          visit_type: string
        }
        Insert: {
          admitted_at?: string | null
          appointment_id?: string | null
          attending_doctor_id?: string | null
          created_at?: string
          department_id?: string | null
          diagnosis?: string | null
          discharge_summary?: string | null
          discharged_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_type?: string
        }
        Update: {
          admitted_at?: string | null
          appointment_id?: string | null
          attending_doctor_id?: string | null
          created_at?: string
          department_id?: string | null
          diagnosis?: string | null
          discharge_summary?: string | null
          discharged_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["visit_status"]
          updated_at?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { _user_id: string }; Returns: boolean }
      log_security_event: {
        Args: {
          _action: string
          _details?: Json
          _resource_id: string
          _resource_type: string
          _risk_level?: string
        }
        Returns: string
      }
      max_active_role_rank: { Args: { _user_id: string }; Returns: number }
      role_rank: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "org_owner"
        | "director"
        | "medical_director"
        | "admin"
        | "dept_head"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "pharmacist"
        | "cashier"
        | "accountant"
        | "hr_manager"
        | "storekeeper"
        | "lab_technician"
        | "radiologist"
        | "ambulance_staff"
        | "case_manager"
        | "social_worker"
        | "counselor"
        | "legal_officer"
        | "insurance_officer"
        | "it_manager"
        | "patient"
        | "auditor"
        | "cfo"
        | "finance_manager"
        | "procurement_officer"
        | "warehouse_manager"
        | "biomedical_engineer"
        | "compliance_officer"
        | "billing_officer"
        | "ot_coordinator"
        | "ward_manager"
        | "quality_officer"
      appointment_status:
        | "requested"
        | "confirmed"
        | "checked_in"
        | "waiting"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      billing_status:
        | "draft"
        | "pending"
        | "partial"
        | "paid"
        | "overdue"
        | "insurance_pending"
        | "refunded"
        | "waived"
      lab_order_status:
        | "ordered"
        | "specimen_collected"
        | "in_progress"
        | "completed"
        | "verified"
        | "critical"
        | "cancelled"
      org_type:
        | "hospital"
        | "clinic"
        | "pharmacy"
        | "medical_center"
        | "diagnostic_center"
        | "specialist_center"
      patient_status:
        | "active"
        | "inactive"
        | "discharged"
        | "critical"
        | "follow_up"
        | "deceased"
      triage_level: "red" | "orange" | "yellow" | "green" | "blue"
      visit_status:
        | "registered"
        | "appointment_scheduled"
        | "checked_in"
        | "waiting"
        | "consultation"
        | "lab_ordered"
        | "lab_collected"
        | "lab_results"
        | "prescription_issued"
        | "pharmacy_dispensed"
        | "billing_pending"
        | "billing_paid"
        | "discharge_ready"
        | "discharged"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "org_owner",
        "director",
        "medical_director",
        "admin",
        "dept_head",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "cashier",
        "accountant",
        "hr_manager",
        "storekeeper",
        "lab_technician",
        "radiologist",
        "ambulance_staff",
        "case_manager",
        "social_worker",
        "counselor",
        "legal_officer",
        "insurance_officer",
        "it_manager",
        "patient",
        "auditor",
        "cfo",
        "finance_manager",
        "procurement_officer",
        "warehouse_manager",
        "biomedical_engineer",
        "compliance_officer",
        "billing_officer",
        "ot_coordinator",
        "ward_manager",
        "quality_officer",
      ],
      appointment_status: [
        "requested",
        "confirmed",
        "checked_in",
        "waiting",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      billing_status: [
        "draft",
        "pending",
        "partial",
        "paid",
        "overdue",
        "insurance_pending",
        "refunded",
        "waived",
      ],
      lab_order_status: [
        "ordered",
        "specimen_collected",
        "in_progress",
        "completed",
        "verified",
        "critical",
        "cancelled",
      ],
      org_type: [
        "hospital",
        "clinic",
        "pharmacy",
        "medical_center",
        "diagnostic_center",
        "specialist_center",
      ],
      patient_status: [
        "active",
        "inactive",
        "discharged",
        "critical",
        "follow_up",
        "deceased",
      ],
      triage_level: ["red", "orange", "yellow", "green", "blue"],
      visit_status: [
        "registered",
        "appointment_scheduled",
        "checked_in",
        "waiting",
        "consultation",
        "lab_ordered",
        "lab_collected",
        "lab_results",
        "prescription_issued",
        "pharmacy_dispensed",
        "billing_pending",
        "billing_paid",
        "discharge_ready",
        "discharged",
        "completed",
      ],
    },
  },
} as const
