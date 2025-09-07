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
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          username: string
          bio: string | null
          profile_picture_url: string | null
          preferences: Json[]
          friends_count: number
          recommendations_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          username: string
          bio?: string | null
          profile_picture_url?: string | null
          preferences?: Json[]
          friends_count?: number
          recommendations_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          username?: string
          bio?: string | null
          profile_picture_url?: string | null
          preferences?: Json[]
          friends_count?: number
          recommendations_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          location: unknown // geography (PostGIS)
          cuisine: string[]
          rating: number | null
          price_level: number | null
          google_place_id: string | null
          zomato_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          location: unknown // geography (PostGIS)
          cuisine?: string[]
          rating?: number | null
          price_level?: number | null
          google_place_id?: string | null
          zomato_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          location?: unknown // geography (PostGIS)
          cuisine?: string[]
          rating?: number | null
          price_level?: number | null
          google_place_id?: string | null
          zomato_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          type: string[]
          cuisine: string[]
          personal_note: string
          photos: string[]
          upvotes: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          type?: string[]
          cuisine?: string[]
          personal_note: string
          photos?: string[]
          upvotes?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          type?: string[]
          cuisine?: string[]
          personal_note?: string
          photos?: string[]
          upvotes?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendation_upvotes: {
        Row: {
          id: string
          recommendation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          recommendation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          recommendation_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_upvotes_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'friend_request' | 'map_suggestion' | 'upvote' | 'comment'
          title: string
          message: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'friend_request' | 'map_suggestion' | 'upvote' | 'comment'
          title: string
          message: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'friend_request' | 'map_suggestion' | 'upvote' | 'comment'
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      nearby_restaurants: {
        Args: {
          lat: number
          lng: number
          radius_km?: number
        }
        Returns: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          distance_km: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}