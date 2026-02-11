// Driver Location Module Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'driver' | 'customer' | 'support';
  phone?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  customer_name?: string;
  type: 'rental' | 'pickup' | 'delivery' | 'service';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  driver_id?: string;
  location_address?: string;
  location_lat?: number;
  location_lon?: number;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  driver_id: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  stops: RouteStop[];
  total_distance_km?: number;
  estimated_duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  job_id: string;
  sequence: number;
  status: 'pending' | 'completed' | 'skipped';
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
  location_address: string;
  location_lat: number;
  location_lon: number;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface TruckSession {
  token: string;
  truck_id: string;
  truck_name: string;
  phone_number: string;
  expires_at: number;
}

export interface OptimizeResult {
  optimizedOrder: string[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  savings?: {
    distanceKm: number;
    durationMinutes: number;
  };
}
