export interface Package {
  id: string;
  trackingNumber: string;
  description: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  status: PackageStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  currentLocation?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  // Nouveaux champs
  clientName: string;
  clientPhone: string;
  nature: string;
  departureDate?: Date;
  arrivalDate?: Date;
  quantity: number; // en kg
  pricePerKg: number;
  totalPrice: number;
  departureCountry: string;
  arrivalCountry: string;
  arrivalCity: string;
  packageImage?: string;
}

export enum PackageStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  CUSTOMS = 'customs',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  LOST = 'lost',
  RETURNED = 'returned',
  // Nouveaux statuts personnalisés
  RECUE_PAR_TRANSITAIRE = 'recu_par_transitaire',
  EN_EXPEDITION = 'en_expedition',
  ARRIVEE = 'arrivee',
  RECUPERATION = 'recuperation'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date;
}

export interface TrackingUpdate {
  id: string;
  packageId: string;
  status: PackageStatus;
  location: string;
  description: string;
  timestamp: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
