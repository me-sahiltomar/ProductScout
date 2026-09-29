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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cevondocs_documents: {
        Row: {
          created_at: string
          extracted_json: string | null
          filename: string
          id: string
          image_url: string | null
          product_id: string
          reviewed_json: string | null
          status: string
          watermarked_url: string | null
        }
        Insert: {
          created_at?: string
          extracted_json?: string | null
          filename: string
          id: string
          image_url?: string | null
          product_id?: string
          reviewed_json?: string | null
          status: string
          watermarked_url?: string | null
        }
        Update: {
          created_at?: string
          extracted_json?: string | null
          filename?: string
          id?: string
          image_url?: string | null
          product_id?: string
          reviewed_json?: string | null
          status?: string
          watermarked_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cevondocs_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          entitlement_key: string
          expires_at: string | null
          id: string
          organization_id: string
          product_id: string
          starts_at: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          entitlement_key: string
          expires_at?: string | null
          id?: string
          organization_id: string
          product_id: string
          starts_at?: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          entitlement_key?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          product_id?: string
          starts_at?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      productscout_existing_solutions: {
        Row: {
          cluster_id: string | null
          complaints: string[]
          complexity_friction: string | null
          created_at: string
          id: string
          integration_limitations: string[]
          missing_functionality: string[]
          name: string
          positive_aspects: string[]
          pricing_info: string | null
          product_id: string
          run_id: string
          type: string
          unserved_segments: string | null
          what_users_do: string
        }
        Insert: {
          cluster_id?: string | null
          complaints?: string[]
          complexity_friction?: string | null
          created_at?: string
          id: string
          integration_limitations?: string[]
          missing_functionality?: string[]
          name: string
          positive_aspects?: string[]
          pricing_info?: string | null
          product_id?: string
          run_id: string
          type: string
          unserved_segments?: string | null
          what_users_do: string
        }
        Update: {
          cluster_id?: string | null
          complaints?: string[]
          complexity_friction?: string | null
          created_at?: string
          id?: string
          integration_limitations?: string[]
          missing_functionality?: string[]
          name?: string
          positive_aspects?: string[]
          pricing_info?: string | null
          product_id?: string
          run_id?: string
          type?: string
          unserved_segments?: string | null
          what_users_do?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_existing_solutions_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "productscout_problem_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_existing_solutions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_existing_solutions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_gaps: {
        Row: {
          cluster_id: string | null
          created_at: string
          description: string
          gap_type: string
          id: string
          is_ai_inference: boolean
          product_id: string
          run_id: string
          supporting_evidence_ids: string[]
          supporting_quotes: string[]
          title: string
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string
          description: string
          gap_type: string
          id: string
          is_ai_inference?: boolean
          product_id?: string
          run_id: string
          supporting_evidence_ids?: string[]
          supporting_quotes?: string[]
          title: string
        }
        Update: {
          cluster_id?: string | null
          created_at?: string
          description?: string
          gap_type?: string
          id?: string
          is_ai_inference?: boolean
          product_id?: string
          run_id?: string
          supporting_evidence_ids?: string[]
          supporting_quotes?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_gaps_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "productscout_problem_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_gaps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_gaps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_opportunities: {
        Row: {
          cluster_id: string | null
          core_workflow: string
          created_at: string
          distribution_difficulty: string
          estimated_mvp_build_time: string
          evaluation: Json | null
          evidence_confidence: number
          evidence_quotes: Json
          evidence_summary: string
          existing_alternatives: string
          gap: string
          id: string
          is_saved: boolean
          key_dependencies: string[]
          major_risks: string[]
          monetization_possibilities: string[]
          mvp_profile: Json
          mvp_scope: string[]
          name: string
          notes: string | null
          one_line_description: string
          opportunity_type: string
          product_id: string
          proposed_solution: string
          run_id: string
          target_customer: string
          technical_complexity: string
          updated_at: string
          user_problem: string
          what_not_to_build_initially: string[]
          why_useful: string
        }
        Insert: {
          cluster_id?: string | null
          core_workflow: string
          created_at?: string
          distribution_difficulty: string
          estimated_mvp_build_time: string
          evaluation?: Json | null
          evidence_confidence?: number
          evidence_quotes?: Json
          evidence_summary: string
          existing_alternatives: string
          gap: string
          id: string
          is_saved?: boolean
          key_dependencies?: string[]
          major_risks?: string[]
          monetization_possibilities?: string[]
          mvp_profile?: Json
          mvp_scope?: string[]
          name: string
          notes?: string | null
          one_line_description: string
          opportunity_type?: string
          product_id?: string
          proposed_solution: string
          run_id: string
          target_customer: string
          technical_complexity: string
          updated_at?: string
          user_problem: string
          what_not_to_build_initially?: string[]
          why_useful: string
        }
        Update: {
          cluster_id?: string | null
          core_workflow?: string
          created_at?: string
          distribution_difficulty?: string
          estimated_mvp_build_time?: string
          evaluation?: Json | null
          evidence_confidence?: number
          evidence_quotes?: Json
          evidence_summary?: string
          existing_alternatives?: string
          gap?: string
          id?: string
          is_saved?: boolean
          key_dependencies?: string[]
          major_risks?: string[]
          monetization_possibilities?: string[]
          mvp_profile?: Json
          mvp_scope?: string[]
          name?: string
          notes?: string | null
          one_line_description?: string
          opportunity_type?: string
          product_id?: string
          proposed_solution?: string
          run_id?: string
          target_customer?: string
          technical_complexity?: string
          updated_at?: string
          user_problem?: string
          what_not_to_build_initially?: string[]
          why_useful?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_opportunities_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "productscout_problem_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_opportunities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_opportunities_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_opportunity_evidence: {
        Row: {
          author: string | null
          created_at: string
          id: string
          is_direct_first_hand: boolean
          opportunity_id: string
          platform: string
          product_id: string
          quote: string
          signal_id: string | null
          url: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          is_direct_first_hand?: boolean
          opportunity_id: string
          platform: string
          product_id?: string
          quote: string
          signal_id?: string | null
          url: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          is_direct_first_hand?: boolean
          opportunity_id?: string
          platform?: string
          product_id?: string
          quote?: string
          signal_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_opportunity_evidence_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "productscout_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_opportunity_evidence_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_opportunity_evidence_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "productscout_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_problem_clusters: {
        Row: {
          cluster_name: string
          common_affected_users: string
          common_workflow: string
          created_at: string
          description: string
          id: string
          overall_evidence_strength: string
          problem_ids: string[]
          product_id: string
          run_id: string
          signal_count: number
          source_diversity: number
        }
        Insert: {
          cluster_name: string
          common_affected_users: string
          common_workflow: string
          created_at?: string
          description: string
          id: string
          overall_evidence_strength: string
          problem_ids?: string[]
          product_id?: string
          run_id: string
          signal_count?: number
          source_diversity?: number
        }
        Update: {
          cluster_name?: string
          common_affected_users?: string
          common_workflow?: string
          created_at?: string
          description?: string
          id?: string
          overall_evidence_strength?: string
          problem_ids?: string[]
          product_id?: string
          run_id?: string
          signal_count?: number
          source_diversity?: number
        }
        Relationships: [
          {
            foreignKeyName: "productscout_problem_clusters_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_problem_clusters_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_problems: {
        Row: {
          confidence: number
          created_at: string
          current_workaround: string
          evidence_ids: string[]
          evidence_quality: string
          evidence_quotes: Json
          frequency: string
          id: string
          job_workflow: string
          pain_point: string
          problem_statement: string
          product_id: string
          run_id: string
          signal_count: number
          source_links: string[]
          target_user: string
          user_context: string
          why_painful: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          current_workaround: string
          evidence_ids?: string[]
          evidence_quality: string
          evidence_quotes?: Json
          frequency: string
          id: string
          job_workflow: string
          pain_point: string
          problem_statement: string
          product_id?: string
          run_id: string
          signal_count?: number
          source_links?: string[]
          target_user: string
          user_context: string
          why_painful: string
        }
        Update: {
          confidence?: number
          created_at?: string
          current_workaround?: string
          evidence_ids?: string[]
          evidence_quality?: string
          evidence_quotes?: Json
          frequency?: string
          id?: string
          job_workflow?: string
          pain_point?: string
          problem_statement?: string
          product_id?: string
          run_id?: string
          signal_count?: number
          source_links?: string[]
          target_user?: string
          user_context?: string
          why_painful?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_problems_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_problems_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_research_runs: {
        Row: {
          adaptive_output_type: string | null
          brief: Json | null
          coverage: Json
          created_at: string
          current_step: string | null
          enabled_sources: string[]
          error: string | null
          focus: string | null
          geography: string | null
          id: string
          industry: string | null
          is_reference: boolean
          max_sources: number
          organization_id: string | null
          product_id: string
          raw_evidence_count: number
          report_markdown: string | null
          status: string
          target_user: string | null
          timeframe: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          adaptive_output_type?: string | null
          brief?: Json | null
          coverage?: Json
          created_at?: string
          current_step?: string | null
          enabled_sources?: string[]
          error?: string | null
          focus?: string | null
          geography?: string | null
          id: string
          industry?: string | null
          is_reference?: boolean
          max_sources?: number
          organization_id?: string | null
          product_id?: string
          raw_evidence_count?: number
          report_markdown?: string | null
          status?: string
          target_user?: string | null
          timeframe?: string
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          adaptive_output_type?: string | null
          brief?: Json | null
          coverage?: Json
          created_at?: string
          current_step?: string | null
          enabled_sources?: string[]
          error?: string | null
          focus?: string | null
          geography?: string | null
          id?: string
          industry?: string | null
          is_reference?: boolean
          max_sources?: number
          organization_id?: string | null
          product_id?: string
          raw_evidence_count?: number
          report_markdown?: string | null
          status?: string
          target_user?: string | null
          timeframe?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productscout_research_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_research_runs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_saved_opportunities: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
          opportunity_snapshot: Json | null
          organization_id: string | null
          product_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
          opportunity_snapshot?: Json | null
          organization_id?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
          opportunity_snapshot?: Json | null
          organization_id?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productscout_saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "productscout_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_saved_opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_saved_opportunities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_settings: {
        Row: {
          ai_provider: string
          created_at: string
          default_max_sources: number
          default_timeframe: string
          gemini_model: string | null
          id: string
          openai_base_url: string | null
          openai_model: string | null
          organization_id: string | null
          product_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_provider?: string
          created_at?: string
          default_max_sources?: number
          default_timeframe?: string
          gemini_model?: string | null
          id?: string
          openai_base_url?: string | null
          openai_model?: string | null
          organization_id?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_provider?: string
          created_at?: string
          default_max_sources?: number
          default_timeframe?: string
          gemini_model?: string | null
          id?: string
          openai_base_url?: string | null
          openai_model?: string | null
          organization_id?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productscout_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_settings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_signals: {
        Row: {
          author: string | null
          created_at: string
          evidence_type: string
          first_hand_markers: string[] | null
          id: string
          pain_quote: string | null
          platform: string
          product_id: string
          published_date: string | null
          quality: string
          quality_score: number
          raw_id: string | null
          run_id: string
          snippet: string
          source_id: string | null
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          evidence_type: string
          first_hand_markers?: string[] | null
          id: string
          pain_quote?: string | null
          platform: string
          product_id?: string
          published_date?: string | null
          quality: string
          quality_score?: number
          raw_id?: string | null
          run_id: string
          snippet: string
          source_id?: string | null
          title: string
          url: string
        }
        Update: {
          author?: string | null
          created_at?: string
          evidence_type?: string
          first_hand_markers?: string[] | null
          id?: string
          pain_quote?: string | null
          platform?: string
          product_id?: string
          published_date?: string | null
          quality?: string
          quality_score?: number
          raw_id?: string | null
          run_id?: string
          snippet?: string
          source_id?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_signals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_signals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "productscout_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_sources: {
        Row: {
          author: string | null
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          platform: string
          product_id: string
          published_at: string | null
          raw_metadata: Json | null
          run_id: string
          score: number | null
          title: string | null
          url: string
        }
        Insert: {
          author?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id: string
          platform: string
          product_id?: string
          published_at?: string | null
          raw_metadata?: Json | null
          run_id: string
          score?: number | null
          title?: string | null
          url: string
        }
        Update: {
          author?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          platform?: string
          product_id?: string
          published_at?: string | null
          raw_metadata?: Json | null
          run_id?: string
          score?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_sources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_sources_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_validation_experiments: {
        Row: {
          created_at: string
          hypothesis: string
          id: string
          invalidation_signal: string
          opportunity_id: string
          product_id: string
          success_signal: string
          target_users: string
          test: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hypothesis: string
          id?: string
          invalidation_signal: string
          opportunity_id: string
          product_id?: string
          success_signal: string
          target_users: string
          test: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hypothesis?: string
          id?: string
          invalidation_signal?: string
          opportunity_id?: string
          product_id?: string
          success_signal?: string
          target_users?: string
          test?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_validation_experiments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "productscout_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_validation_experiments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      productscout_weak_signals: {
        Row: {
          created_at: string
          id: string
          platform: string
          potential_value: string
          product_id: string
          run_id: string
          source_url: string
          title: string
          user_statement: string
          why_insufficient: string
        }
        Insert: {
          created_at?: string
          id: string
          platform: string
          potential_value: string
          product_id?: string
          run_id: string
          source_url: string
          title: string
          user_statement: string
          why_insufficient: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          potential_value?: string
          product_id?: string
          run_id?: string
          source_url?: string
          title?: string
          user_statement?: string
          why_insufficient?: string
        }
        Relationships: [
          {
            foreignKeyName: "productscout_weak_signals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productscout_weak_signals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "productscout_research_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          product_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          product_id: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          product_id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      documents: {
        Row: {
          created_at: string | null
          extracted_json: string | null
          filename: string | null
          id: string | null
          image_url: string | null
          product_id: string | null
          reviewed_json: string | null
          status: string | null
          watermarked_url: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_json?: string | null
          filename?: string | null
          id?: string | null
          image_url?: string | null
          product_id?: string | null
          reviewed_json?: string | null
          status?: string | null
          watermarked_url?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_json?: string | null
          filename?: string | null
          id?: string | null
          image_url?: string | null
          product_id?: string | null
          reviewed_json?: string | null
          status?: string | null
          watermarked_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cevondocs_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
