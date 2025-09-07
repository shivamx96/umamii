import { supabase } from '../supabase'

// Get all restaurants
export const getRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

// Get nearby restaurants using PostGIS function
export const getNearbyRestaurants = async (lat: number, lng: number, radiusKm: number = 5) => {
  const { data, error } = await supabase
    .rpc('nearby_restaurants', {
      lat,
      lng,
      radius_km: radiusKm,
    })

  if (error) {
    console.error('Error fetching nearby restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

// Create a new restaurant
export const createRestaurant = async (restaurant: {
  name: string
  address: string
  latitude: number
  longitude: number
  cuisine?: string[]
  rating?: number
  priceLevel?: number
  googlePlaceId?: string
}) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name: restaurant.name,
      address: restaurant.address,
      location: `POINT(${restaurant.longitude} ${restaurant.latitude})`,
      cuisine: restaurant.cuisine || [],
      rating: restaurant.rating,
      price_level: restaurant.priceLevel,
      google_place_id: restaurant.googlePlaceId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating restaurant:', error)
    throw new Error(error.message)
  }

  return data
}

// Search restaurants by name or address
export const searchRestaurants = async (query: string, count: number) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    .limit(count)

  if (error) {
    console.error('Error searching restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

// Transform restaurant data from database to frontend format
export const transformRestaurantRow = (row: any) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  location: {
    latitude: 0, // Will be populated by PostGIS function
    longitude: 0, // Will be populated by PostGIS function
  },
  cuisine: row.cuisine,
  rating: row.rating,
  priceLevel: row.price_level,
  googlePlaceId: row.google_place_id,
  zomatoId: row.zomato_id,
})