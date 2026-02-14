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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adrian_projects: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          budget: number | null
          client_company: string | null
          client_contact_id: string | null
          client_name: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_date: string | null
          id: string
          priority: string
          progress: number | null
          project_id: string | null
          project_name: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          budget?: number | null
          client_company?: string | null
          client_contact_id?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          progress?: number | null
          project_id?: string | null
          project_name: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          budget?: number | null
          client_company?: string | null
          client_contact_id?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          progress?: number | null
          project_id?: string | null
          project_name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adrian_projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "adrian_projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adrian_projects_client_contact_id_fkey"
            columns: ["client_contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adrian_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "adrian_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adrian_projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string | null
          name: string | null
          name_en: string
          name_fa: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          name?: string | null
          name_en: string
          name_fa: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string | null
          name?: string | null
          name_en?: string
          name_fa?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blog_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          keywords: string[] | null
          language: string
          meta_description: string | null
          og_image: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          post_id: string
          title: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          post_id: string
          title: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          post_id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "blog_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          contact_type: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          department: string | null
          email: string | null
          first_name: string
          first_name_fa: string | null
          honorific_fa: string | null
          id: string
          is_active: boolean | null
          is_decision_maker: boolean | null
          is_primary_contact: boolean | null
          job_title: string | null
          job_title_fa: string | null
          last_name: string
          last_name_fa: string | null
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          title_fa: string | null
          updated_at: string
        }
        Insert: {
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          department?: string | null
          email?: string | null
          first_name: string
          first_name_fa?: string | null
          honorific_fa?: string | null
          id?: string
          is_active?: boolean | null
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          job_title?: string | null
          job_title_fa?: string | null
          last_name: string
          last_name_fa?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          title_fa?: string | null
          updated_at?: string
        }
        Update: {
          contact_type?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          department?: string | null
          email?: string | null
          first_name?: string
          first_name_fa?: string | null
          honorific_fa?: string | null
          id?: string
          is_active?: boolean | null
          is_decision_maker?: boolean | null
          is_primary_contact?: boolean | null
          job_title?: string | null
          job_title_fa?: string | null
          last_name?: string
          last_name_fa?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          title_fa?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customer_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          contact_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          interaction_date: string
          interaction_type: string
          is_completed: boolean | null
          subject: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          interaction_date?: string
          interaction_type: string
          is_completed?: boolean | null
          subject: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          is_completed?: boolean | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customer_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_manager_id: string | null
          address: string | null
          brand_color: string | null
          city: string | null
          company_name: string
          company_name_fa: string | null
          company_size: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: string | null
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer_status: string
          email: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          monthly_value: number | null
          notes: string | null
          phone: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          brand_color?: string | null
          city?: string | null
          company_name: string
          company_name_fa?: string | null
          company_size?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_status?: string
          email?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          monthly_value?: number | null
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          brand_color?: string | null
          city?: string | null
          company_name?: string
          company_name_fa?: string | null
          company_size?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_status?: string
          email?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          monthly_value?: number | null
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "customers_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          mime_type: string | null
          project_id: string | null
          summary: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          email_id: string
          file_name: string
          file_size: number | null
          id: string
          storage_path: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          email_id: string
          file_name: string
          file_size?: number | null
          id?: string
          storage_path?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          email_id?: string
          file_name?: string
          file_size?: number | null
          id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          direction: string
          from_email: string
          from_name: string | null
          has_attachment: boolean
          id: string
          in_reply_to: string | null
          is_archived: boolean
          is_deleted: boolean
          is_read: boolean
          is_starred: boolean
          resend_id: string | null
          status: string
          subject: string
          to_email: string
          to_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction: string
          from_email: string
          from_name?: string | null
          has_attachment?: boolean
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean
          is_deleted?: boolean
          is_read?: boolean
          is_starred?: boolean
          resend_id?: string | null
          status?: string
          subject?: string
          to_email: string
          to_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string
          from_email?: string
          from_name?: string | null
          has_attachment?: boolean
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean
          is_deleted?: boolean
          is_read?: boolean
          is_starred?: boolean
          resend_id?: string | null
          status?: string
          subject?: string
          to_email?: string
          to_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          ai_extracted_data: Json | null
          ai_verified: boolean | null
          created_at: string
          created_by: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_url: string
          id: string
          title: string | null
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          ai_extracted_data?: Json | null
          ai_verified?: boolean | null
          created_at?: string
          created_by?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_url: string
          id?: string
          title?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          ai_extracted_data?: Json | null
          ai_verified?: boolean | null
          created_at?: string
          created_by?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          title?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sensitive_data: {
        Row: {
          bank_account_number: string | null
          bank_account_type: string | null
          bank_name: string | null
          bank_sheba: string | null
          contract_type: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_id: string
          employment_contract_id: string | null
          gender: string | null
          home_address: string | null
          id: string
          insurance_number: string | null
          insurance_start_date: string | null
          insurance_type: string | null
          marital_status: string | null
          military_service_status: string | null
          national_id: string | null
          pay_frequency: string | null
          personal_email: string | null
          phone_number: string | null
          salary: number | null
          sort_code: string | null
          tax_exemption_status: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_name?: string | null
          bank_sheba?: string | null
          contract_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_id: string
          employment_contract_id?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          insurance_number?: string | null
          insurance_start_date?: string | null
          insurance_type?: string | null
          marital_status?: string | null
          military_service_status?: string | null
          national_id?: string | null
          pay_frequency?: string | null
          personal_email?: string | null
          phone_number?: string | null
          salary?: number | null
          sort_code?: string | null
          tax_exemption_status?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_name?: string | null
          bank_sheba?: string | null
          contract_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_id?: string
          employment_contract_id?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          insurance_number?: string | null
          insurance_start_date?: string | null
          insurance_type?: string | null
          marital_status?: string | null
          military_service_status?: string | null
          national_id?: string | null
          pay_frequency?: string | null
          personal_email?: string | null
          phone_number?: string | null
          salary?: number | null
          sort_code?: string | null
          tax_exemption_status?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_sensitive_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employee_full"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_sensitive_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          employee_number: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          job_title: string | null
          job_title_fa: string | null
          job_type: string | null
          manager_id: string | null
          name: string
          name_fa: string | null
          nationality: string | null
          probation_end_date: string | null
          profile_photo_url: string | null
          start_date: string | null
          status: string
          surname: string
          surname_fa: string | null
          updated_at: string
          user_id: string | null
          work_location_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_number?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          job_title?: string | null
          job_title_fa?: string | null
          job_type?: string | null
          manager_id?: string | null
          name: string
          name_fa?: string | null
          nationality?: string | null
          probation_end_date?: string | null
          profile_photo_url?: string | null
          start_date?: string | null
          status?: string
          surname: string
          surname_fa?: string | null
          updated_at?: string
          user_id?: string | null
          work_location_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          employee_number?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          job_title?: string | null
          job_title_fa?: string | null
          job_type?: string | null
          manager_id?: string | null
          name?: string
          name_fa?: string | null
          nationality?: string | null
          probation_end_date?: string | null
          profile_photo_url?: string | null
          start_date?: string | null
          status?: string
          surname?: string
          surname_fa?: string | null
          updated_at?: string
          user_id?: string | null
          work_location_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          project_id: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          document_id: string | null
          from_entity: string | null
          id: string
          project_id: string | null
          to_entity: string | null
          transaction_date: string
          transaction_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_id?: string | null
          from_entity?: string | null
          id?: string
          project_id?: string | null
          to_entity?: string | null
          transaction_date: string
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_id?: string | null
          from_entity?: string | null
          id?: string
          project_id?: string | null
          to_entity?: string | null
          transaction_date?: string
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "financial_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          customer_contact_id: string | null
          customer_id: string | null
          date: string | null
          document_id: string | null
          file_url: string | null
          final_generated_at: string | null
          final_image_url: string | null
          generated_body: string | null
          generated_subject: string | null
          has_attachment: boolean | null
          id: string
          letter_number: string | null
          letter_title: string | null
          mime_type: string | null
          needs_signature: boolean | null
          needs_stamp: boolean | null
          preview_generated_at: string | null
          preview_image_url: string | null
          project_id: string | null
          recipient_company: string | null
          recipient_name: string | null
          recipient_position: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
          user_request: string | null
          writer_name: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id?: string | null
          date?: string | null
          document_id?: string | null
          file_url?: string | null
          final_generated_at?: string | null
          final_image_url?: string | null
          generated_body?: string | null
          generated_subject?: string | null
          has_attachment?: boolean | null
          id?: string
          letter_number?: string | null
          letter_title?: string | null
          mime_type?: string | null
          needs_signature?: boolean | null
          needs_stamp?: boolean | null
          preview_generated_at?: string | null
          preview_image_url?: string | null
          project_id?: string | null
          recipient_company?: string | null
          recipient_name?: string | null
          recipient_position?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
          user_request?: string | null
          writer_name?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          customer_contact_id?: string | null
          customer_id?: string | null
          date?: string | null
          document_id?: string | null
          file_url?: string | null
          final_generated_at?: string | null
          final_image_url?: string | null
          generated_body?: string | null
          generated_subject?: string | null
          has_attachment?: boolean | null
          id?: string
          letter_number?: string | null
          letter_title?: string | null
          mime_type?: string | null
          needs_signature?: boolean | null
          needs_stamp?: boolean | null
          preview_generated_at?: string | null
          preview_image_url?: string | null
          project_id?: string | null
          recipient_company?: string | null
          recipient_name?: string | null
          recipient_position?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
          user_request?: string | null
          writer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letters_customer_contact_id_fkey"
            columns: ["customer_contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letters_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letters_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          calendar_notifications: boolean | null
          created_at: string | null
          financial_notifications: boolean | null
          id: string
          project_notifications: boolean | null
          task_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_notifications?: boolean | null
          created_at?: string | null
          financial_notifications?: boolean | null
          id?: string
          project_notifications?: boolean | null
          task_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_notifications?: boolean | null
          created_at?: string | null
          financial_notifications?: boolean | null
          id?: string
          project_notifications?: boolean | null
          task_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      our_calendar: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "our_calendar_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "our_calendar_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      our_financial: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          for_who: string | null
          id: string
          payment_for: string | null
          transaction_date: string
          transaction_type: string | null
          user_id: string
          who_paid: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          for_who?: string | null
          id?: string
          payment_for?: string | null
          transaction_date: string
          transaction_type?: string | null
          user_id: string
          who_paid?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          for_who?: string | null
          id?: string
          payment_for?: string | null
          transaction_date?: string
          transaction_type?: string | null
          user_id?: string
          who_paid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "our_financial_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "our_financial_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      our_todos: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "our_todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "our_todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          device_info: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          device_info?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          device_info?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          request_by: string
          request_to: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          request_by: string
          request_to: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          request_by?: string
          request_to?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mentioned_users: string[] | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mentioned_users?: string[] | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mentioned_users?: string[] | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_documents: {
        Row: {
          created_at: string
          document_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_files: {
        Row: {
          created_at: string
          file_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_letters: {
        Row: {
          created_at: string
          id: string
          letter_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          letter_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          id?: string
          letter_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_letters_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_letters_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          follow_by: string | null
          id: string
          notes: string | null
          outcome: string | null
          outcome_audio_url: string | null
          priority: string
          project_id: string | null
          related_task_id: string | null
          start_time: string | null
          status: string
          task_name: string | null
          task_type: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          follow_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          outcome_audio_url?: string | null
          priority?: string
          project_id?: string | null
          related_task_id?: string | null
          start_time?: string | null
          status?: string
          task_name?: string | null
          task_type?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          follow_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          outcome_audio_url?: string | null
          priority?: string
          project_id?: string | null
          related_task_id?: string | null
          start_time?: string | null
          status?: string
          task_name?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employee_full: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: string | null
          employee_id: string | null
          employee_number: string | null
          employment_type: string | null
          end_date: string | null
          full_name: string | null
          job_title: string | null
          job_type: string | null
          manager_id: string | null
          name: string | null
          name_fa: string | null
          nationality: string | null
          probation_end_date: string | null
          profile_photo_url: string | null
          start_date: string | null
          status: string | null
          surname: string | null
          surname_fa: string | null
          user_id: string | null
          work_email: string | null
          work_location_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_full"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_id_by_email: { Args: { lookup_email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "general_user"
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
      app_role: ["admin", "general_user"],
    },
  },
} as const
