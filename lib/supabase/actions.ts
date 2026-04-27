// Server Actions pour les opérations Supabase sécurisées
'use server'

import { createAdminSupabase } from './server'
import type { Package } from '@/types'

// Server Action pour charger les colis
export async function getPackages(): Promise<Package[]> {
  try {
    const supabase = createAdminSupabase()
    
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement colis:', error)
      throw new Error('Impossible de charger les colis')
    }

    // Transformer les données du format BDD vers le format Package
    return data.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      description: pkg.nature,
      sender: 'Transitaire',
      recipient: pkg.client_name,
      origin: pkg.departure_country,
      destination: pkg.arrival_country,
      status: pkg.status,
      createdAt: new Date(pkg.created_at),
      updatedAt: new Date(pkg.updated_at || pkg.created_at),
      estimatedDelivery: new Date(pkg.arrival_date),
      currentLocation: pkg.arrival_city,
      weight: pkg.quantity,
      dimensions: { length: 0, width: 0, height: 0 },
      clientName: pkg.client_name,
      clientPhone: pkg.client_phone,
      nature: pkg.nature,
      departureDate: new Date(pkg.departure_date),
      arrivalDate: new Date(pkg.arrival_date),
      quantity: pkg.quantity,
      pricePerKg: pkg.price_per_kg,
      totalPrice: pkg.total_price,
      departureCountry: pkg.departure_country,
      arrivalCountry: pkg.arrival_country,
      arrivalCity: pkg.arrival_city,
      packageImage: pkg.package_image
    }))
  } catch (error) {
    console.error('Erreur getPackages:', error)
    throw error
  }
}

// Server Action pour ajouter un colis
export async function addPackage(packageData: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const supabase = createAdminSupabase()
    
    // Générer un numéro de tracking unique
    const trackingNumber = `FOX-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`
    
    const { error } = await supabase
      .from('packages')
      .insert({
        tracking_number: trackingNumber,
        client_name: packageData.clientName,
        client_phone: packageData.clientPhone,
        nature: packageData.nature,
        departure_country: packageData.departureCountry,
        arrival_country: packageData.arrivalCountry,
        arrival_city: packageData.arrivalCity,
        departure_date: packageData.departureDate.toISOString(),
        arrival_date: packageData.arrivalDate.toISOString(),
        quantity: packageData.quantity,
        price_per_kg: packageData.pricePerKg,
        total_price: packageData.totalPrice,
        package_image: packageData.packageImage,
        status: 'RECUE_PAR_TRANSITAIRE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erreur ajout colis:', error)
      throw new Error('Impossible d\'ajouter le colis')
    }
  } catch (error) {
    console.error('Erreur addPackage:', error)
    throw error
  }
}

// Server Action pour supprimer un colis
export async function deletePackage(packageId: string): Promise<void> {
  try {
    const supabase = createAdminSupabase()
    
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId)

    if (error) {
      console.error('Erreur suppression colis:', error)
      throw new Error('Impossible de supprimer le colis')
    }
  } catch (error) {
    console.error('Erreur deletePackage:', error)
    throw error
  }
}
