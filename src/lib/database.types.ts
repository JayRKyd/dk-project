export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          updated_at: string
          role: 'lady' | 'client'
          is_verified: boolean
          membership_tier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA'
          credits: number
         client_number: string | null
        }
        Insert: {
          id?: string
          email: string
          username: string
          created_at?: string
          updated_at?: string
          role: 'lady' | 'client'
          is_verified?: boolean
          membership_tier?: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA'
          credits?: number
         client_number?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
          updated_at?: string
          role?: 'lady' | 'client'
          is_verified?: boolean
          membership_tier?: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA'
          credits?: number
         client_number?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string
          image_url: string | null
          rating: number
          loves: number
          description: string | null
          price: string | null
          is_club: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          location: string
          image_url?: string | null
          rating?: number
          loves?: number
          description?: string | null
          price?: string | null
          is_club?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          location?: string
          image_url?: string | null
          rating?: number
          loves?: number
          description?: string | null
          price?: string | null
          is_club?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profile_details: {
        Row: {
          id: string
          profile_id: string
          sex: string
          age: number | null
          height: number | null
          weight: number | null
          cup_size: string | null
          body_size: string | null
          descent: string | null
          languages: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          sex: string
          age?: number | null
          height?: number | null
          weight?: number | null
          cup_size?: string | null
          body_size?: string | null
          descent?: string | null
          languages?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          sex?: string
          age?: number | null
          height?: number | null
          weight?: number | null
          cup_size?: string | null
          body_size?: string | null
          descent?: string | null
          languages?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          profile_id: string
          name: string
          price: string | null
          is_included: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          price?: string | null
          is_included?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          price?: string | null
          is_included?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          author_id: string | null
          profile_id: string
          rating: number
          positives: string[] | null
          negatives: string[] | null
          likes: number
          dislikes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          profile_id: string
          rating: number
          positives?: string[] | null
          negatives?: string[] | null
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          profile_id?: string
          rating?: number
          positives?: string[] | null
          negatives?: string[] | null
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
        }
      }
      review_replies: {
        Row: {
          id: string
          review_id: string
          author_id: string | null
          message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          author_id?: string | null
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          author_id?: string | null
          message?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string | null
          profile_id: string
          date: string
          time: string
          duration: string
          location_type: 'incall' | 'outcall'
          address: string | null
          message: string | null
          total_cost: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          profile_id: string
          date: string
          time: string
          duration: string
          location_type: 'incall' | 'outcall'
          address?: string | null
          message?: string | null
          total_cost: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          profile_id?: string
          date?: string
          time?: string
          duration?: string
          location_type?: 'incall' | 'outcall'
          address?: string | null
          message?: string | null
          total_cost?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      booking_services: {
        Row: {
          id: string
          booking_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_id?: string
          created_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          sender_id: string | null
          recipient_id: string
          gift_type: string
          credits_cost: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id?: string | null
          recipient_id: string
          gift_type: string
          credits_cost: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string | null
          recipient_id?: string
          gift_type?: string
          credits_cost?: number
          message?: string | null
          created_at?: string
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