export interface KoreanCompany {
  id: string
  name: string
  logo_url: string | null
  business_sector: string
  description: string | null
  video_url: string | null
  catalog_url: string | null
  contact_email: string | null
  website: string | null
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  company_id: string
  name: string
  description: string | null
  image_urls: string[]
  is_active: boolean
  created_at: string
}

export interface VnMember {
  id: string
  full_name: string
  company_name: string | null
  position: string | null
  phone: string | null
  email: string
  website: string | null
  business_sector: string | null
  partnership_needs: string | null
  created_at: string
}

export interface Favorite {
  id: string
  vn_member_id: string
  company_id: string | null
  product_id: string | null
  created_at: string
}

export interface ZoomEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  duration_minutes: number
  zoom_link: string | null
  zalo_link: string | null
  is_published: boolean
  created_at: string
}

export interface EventInterest {
  id: string
  vn_member_id: string
  event_id: string
  created_at: string
}

export interface Profile {
  id: string
  role: 'admin' | 'korean' | 'vn'
  company_id: string | null
}
