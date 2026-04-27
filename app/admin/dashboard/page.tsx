'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';
import { Package, PackageStatus } from '@/types';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export default function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  // Charger les colis depuis Supabase
  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement colis:', error);
        setIsLoading(false);
        return;
      }

      // Transformer les données pour correspondre au type Package
      const transformedPackages: Package[] = (data || []).map(pkg => ({
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
        // Champs supplémentaires
        clientName: pkg.client_name,
        clientPhone: pkg.client_phone,
        nature: pkg.nature,
        quantity: pkg.quantity,
        pricePerKg: pkg.price_per_kg,
        totalPrice: pkg.total_price,
        departureDate: new Date(pkg.departure_date),
        arrivalDate: new Date(pkg.arrival_date),
        departureCountry: pkg.departure_country,
        arrivalCountry: pkg.arrival_country,
        arrivalCity: pkg.arrival_city,
        packageImage: pkg.package_image
      }));

      setPackages(transformedPackages);
    } catch (err) {
      console.error('Erreur générale:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    const storedUserName = localStorage.getItem('userName');
    
    if (!isAuthenticated || userRole !== 'admin') {
      router.push('/login');
      return;
    }

    // Récupérer le nom de l'utilisateur
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Tester la connexion Supabase
    console.log('Test de connexion Supabase...');
    console.log('URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Définie' : 'Non définie');
    console.log('Clé Supabase:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie');

    // Charger les colis depuis Supabase
    loadPackages();
  }, [router]);

  // Ajouter un colis dans Supabase
  const addPackage = async (newPackage: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Tentative d\'ajout de colis avec les données:', newPackage);
      
      // Générer un numéro de tracking unique
      const trackingNumber = generateTrackingNumber();
      console.log('Numéro de tracking généré:', trackingNumber);
      
      const packageData = {
        tracking_number: trackingNumber,
        client_name: newPackage.clientName,
        client_phone: newPackage.clientPhone,
        nature: newPackage.nature,
        quantity: newPackage.quantity,
        price_per_kg: newPackage.pricePerKg,
        total_price: newPackage.totalPrice,
        departure_country: newPackage.departureCountry,
        arrival_country: newPackage.arrivalCountry,
        arrival_city: newPackage.arrivalCity,
        departure_date: newPackage.departureDate.toISOString(),
        arrival_date: newPackage.arrivalDate.toISOString(),
        status: newPackage.status,
        package_image: newPackage.packageImage || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Données préparées pour Supabase:', packageData);

      // Utiliser supabaseAdmin pour contourner les politiques RLS
      const { data, error } = await supabaseAdmin
        .from('packages')
        .insert([packageData])
        .select()
        .single();

      if (error) {
        console.error('Erreur ajout colis:', error);
        console.error('Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      console.log('Colis ajouté avec succès:', data);
      
      // Recharger les colis
      await loadPackages();
      setShowAddForm(false);
    } catch (err) {
      console.error('Erreur générale ajout colis:', err);
    }
  };

  // Supprimer un colis
  const deletePackage = async (packageId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        console.error('Erreur suppression colis:', error);
        return;
      }

      // Recharger les colis
      await loadPackages();
    } catch (err) {
      console.error('Erreur générale suppression colis:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const generateTrackingNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Compter les colis existants pour ce mois
    const monthlyCount = packages.filter(pkg => {
      const pkgDate = new Date(pkg.createdAt);
      return pkgDate.getFullYear() === year && pkgDate.getMonth() === now.getMonth();
    }).length + 1;
    
    const sequence = String(monthlyCount).padStart(2, '0');
    return `FOX-${year}-${month}-${sequence}`;
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case PackageStatus.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800';
      case PackageStatus.CUSTOMS:
        return 'bg-yellow-100 text-yellow-800';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-purple-100 text-purple-800';
      case PackageStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.PENDING:
        return 'En attente';
      case PackageStatus.SHIPPED:
        return 'Expédié';
      case PackageStatus.IN_TRANSIT:
        return 'En transit';
      case PackageStatus.CUSTOMS:
        return 'En douane';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'En livraison';
      case PackageStatus.DELIVERED:
        return 'Livré';
      case PackageStatus.LOST:
        return 'Perdu';
      case PackageStatus.RETURNED:
        return 'Retourné';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.primary.lightBlue }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primary.blue }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold" style={{ color: COLORS.primary.blue }}>
                      Tableau de bord Admin
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-600">Connecté en tant que <span className="font-semibold text-blue-600">{userName}</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg">
                Gérez les colis et suivez leurs expéditions
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">{packages.length} colis actifs</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary.yellow }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showAddForm ? 'Annuler' : 'Ajouter un colis'}
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lightYellow }}>
                <svg className="w-5 h-5" style={{ color: COLORS.primary.darkYellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.primary.blue }}>
                Ajouter un nouveau colis
              </h2>
            </div>
            <PackageForm 
              onSubmit={addPackage}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Tableau des colis */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: COLORS.primary.lightBlue }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold" style={{ color: COLORS.primary.blue }}>
                  Liste des colis
                </h2>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-600">Total: </span>
                <span className="text-lg font-bold" style={{ color: COLORS.primary.blue }}>{packages.length}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200" style={{ backgroundColor: COLORS.primary.lightBlue }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    N° Tracking
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Téléphone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Trajet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary.darkBlue }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Aucun colis trouvé
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Commencez par ajouter votre premier colis en cliquant sur le bouton "Ajouter un colis"
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200"
                          style={{ backgroundColor: COLORS.primary.yellow }}
                        >
                          Ajouter un colis
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 transition-colors duration-150" style={{ backgroundColor: index % 2 === 0 ? 'white' : COLORS.primary.lightBlue + '20' }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lightYellow }}>
                          <svg className="w-4 h-4" style={{ color: COLORS.primary.darkYellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-900">{pkg.trackingNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pkg.clientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pkg.clientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="font-medium text-gray-900">{pkg.departureCountry}</div>
                        <div className="text-xs text-gray-500">→ {pkg.arrivalCountry}, {pkg.arrivalCity}</div>
                        <div className="text-xs text-blue-600">
                          {pkg.departureDate instanceof Date ? pkg.departureDate.toLocaleDateString('fr-FR') : ''} - 
                          {pkg.arrivalDate instanceof Date ? pkg.arrivalDate.toLocaleDateString('fr-FR') : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pkg.quantity} kg</div>
                      <div className="text-xs text-gray-500">{pkg.pricePerKg.toLocaleString('fr-FR')} FCFA/kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold" style={{ color: COLORS.primary.blue }}>
                        {pkg.totalPrice.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                        {getStatusText(pkg.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150" style={{ color: COLORS.primary.blue }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deletePackage(pkg.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-150 text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PackageFormProps {
  onSubmit: (pkg: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function PackageForm({ onSubmit, onCancel }: PackageFormProps) {
  const [formData, setFormData] = useState<Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>>({
    description: '',
    sender: '',
    recipient: '',
    origin: '',
    destination: '',
    status: PackageStatus.RECUE_PAR_TRANSITAIRE,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    estimatedDelivery: new Date(),
    currentLocation: '',
    // Nouveaux champs
    clientName: '',
    clientPhone: '',
    nature: 'Électroniques',
    quantity: 1,
    pricePerKg: 1000,
    totalPrice: 0,
    departureDate: new Date(),
    arrivalDate: new Date(),
    departureCountry: 'France',
    arrivalCountry: 'Cote dIvoire',
    arrivalCity: 'Abidjan',
    packageImage: ''
  });

  // Calculer le total automatiquement
  useEffect(() => {
    const total = formData.quantity * formData.pricePerKg;
    setFormData(prev => ({ ...prev, totalPrice: total }));
  }, [formData.quantity, formData.pricePerKg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'weight' || name === 'quantity' || name === 'pricePerKg') ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations Client */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informations Client
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nom du client *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder=""
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Numéro de téléphone *
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder=""
            />
          </div>
        </div>
      </div>

      {/* Informations Colis */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Informations Colis
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nature du colis *
            </label>
            <select
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="">Sélectionner la nature</option>
              <option value="Électroniques">Électroniques</option>
              <option value="Vêtements">Vêtements</option>
              <option value="Alimentaires">Alimentaires</option>
              <option value="Mobilier">Mobilier</option>
              <option value="Livres">Livres</option>
              <option value="Cosmétiques">Cosmétiques</option>
              <option value="Sports et Loisirs">Sports et Loisirs</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Statut *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value={PackageStatus.RECUE_PAR_TRANSITAIRE}>Reçu par le transitaire</option>
              <option value={PackageStatus.EN_EXPEDITION}>En expédition</option>
              <option value={PackageStatus.ARRIVEE}>Arrivée</option>
              <option value={PackageStatus.RECUPERATION}>Récupération</option>
            </select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Quantité (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder=""
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Prix par kilo (FCFA) *
            </label>
            <input
              type="number"
              step="100"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder=""
            />
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-900">Total à payer:</span>
            <span className="text-xl font-bold" style={{ color: COLORS.primary.blue }}>
              {formData.totalPrice.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Trajet */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Trajet
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Pays de départ *
              </label>
              <input
                type="text"
                name="departureCountry"
                value={formData.departureCountry}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date de départ *
              </label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate instanceof Date ? formData.departureDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData(prev => ({ ...prev, departureDate: date }));
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Pays d'arrivée *
              </label>
              <input
                type="text"
                name="arrivalCountry"
                value={formData.arrivalCountry}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder=""
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Ville d'arrivée *
              </label>
              <input
                type="text"
                name="arrivalCity"
                value={formData.arrivalCity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder=""
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Date d'arrivée estimée *
          </label>
          <input
            type="date"
            name="arrivalDate"
            value={formData.arrivalDate instanceof Date ? formData.arrivalDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setFormData(prev => ({ ...prev, arrivalDate: date }));
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Photo du colis */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Photo du colis
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Importer une photo
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData(prev => ({ ...prev, packageImage: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choisir un fichier
              </label>
              <span className="text-sm text-gray-500">
                {formData.packageImage ? 'Image sélectionnée' : 'Aucune image sélectionnée'}
              </span>
            </div>
          </div>
          
          {formData.packageImage && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Aperçu
              </label>
              <div className="relative inline-block">
                <img
                  src={formData.packageImage}
                  alt="Aperçu du colis"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, packageImage: '' }))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          style={{ backgroundColor: COLORS.primary.blue }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ajouter le colis
        </button>
      </div>
    </form>
  );
}
