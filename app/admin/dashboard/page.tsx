'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants';
import { Package, PackageStatus } from '@/types';
import { getPackages, addPackage, updatePackage, deletePackage } from '@/lib/supabase/actions';
import toast from 'react-hot-toast';

// Fonctions utilitaires pour les statuts
const getStatusColor = (status: PackageStatus) => {
  switch (status) {
    case PackageStatus.RECUE_PAR_TRANSITAIRE:
      return 'bg-blue-100 text-blue-800';
    case PackageStatus.EN_EXPEDITION:
      return 'bg-yellow-100 text-yellow-800';
    case PackageStatus.ARRIVEE:
      return 'bg-green-100 text-green-800';
    case PackageStatus.RECUPERATION:
      return 'bg-purple-100 text-purple-800';
    case PackageStatus.SHIPPED:
      return 'bg-indigo-100 text-indigo-800';
    case PackageStatus.IN_TRANSIT:
      return 'bg-orange-100 text-orange-800';
    case PackageStatus.CUSTOMS:
      return 'bg-red-100 text-red-800';
    case PackageStatus.OUT_FOR_DELIVERY:
      return 'bg-teal-100 text-teal-800';
    case PackageStatus.DELIVERED:
      return 'bg-green-100 text-green-800';
    case PackageStatus.LOST:
      return 'bg-red-100 text-red-800';
    case PackageStatus.RETURNED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
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

export default function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  // Charger les colis depuis Supabase
  const loadPackages = async () => {
    try {
      const packages = await getPackages();
      setPackages(packages);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur générale chargement colis:', err);
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
  const handleAddPackage = async (newPackage: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Tentative d\'ajout de colis avec les données:', newPackage);
      
      await addPackage(newPackage);
      console.log('Colis ajouté avec succès');
      
      toast.success('Colis ajouté avec succès!');
      await loadPackages();
      setShowAddForm(false);
    } catch (err) {
      console.error('Erreur générale ajout colis:', err);
      toast.error('Erreur lors de l\'ajout du colis');
    }
  };

  // Modifier un colis
  const handleEditPackage = async (packageId: string, packageData: Partial<Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await updatePackage(packageId, packageData);
      toast.success('Colis modifié avec succès!');
      await loadPackages();
      setShowEditForm(false);
      setEditingPackage(null);
    } catch (err) {
      console.error('Erreur générale modification colis:', err);
      toast.error('Erreur lors de la modification du colis');
    }
  };

  // Supprimer un colis
  const handleDeletePackage = async (packageId: string) => {
    try {
      // Supprimer d'abord de l'état local pour une mise à jour immédiate
      const originalPackages = [...packages];
      setPackages(packages.filter(pkg => pkg.id !== packageId));
      
      // Puis supprimer de la base de données
      await deletePackage(packageId);
      toast.success('Colis supprimé avec succès!');
      
      // Recharger pour s'assurer que tout est synchronisé
      await loadPackages();
    } catch (err) {
      console.error('Erreur générale suppression colis:', err);
      toast.error('Erreur lors de la suppression du colis');
      // En cas d'erreur, restaurer l'état original
      await loadPackages();
    }
  };

  // Calculer les statistiques
  const getStats = () => {
    const total = packages.length;
    const received = packages.filter(pkg => pkg.status === PackageStatus.RECUE_PAR_TRANSITAIRE).length;
    const inTransit = packages.filter(pkg => pkg.status === PackageStatus.EN_EXPEDITION).length;
    const arrived = packages.filter(pkg => pkg.status === PackageStatus.ARRIVEE).length;
    const recovery = packages.filter(pkg => pkg.status === PackageStatus.RECUPERATION).length;

    const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.totalPrice || 0), 0);
    const avgPrice = total > 0 ? totalRevenue / total : 0;

    return {
      total,
      received,
      inTransit,
      arrived,
      recovery,
      totalRevenue,
      avgPrice,
      arrivalRate: total > 0 ? Math.round((arrived / total) * 100) : 0
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPackages = packages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(packages.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-blue-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{
                          animation: 'spin 2s linear infinite reverse',
                        }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 16l-8-8-8 8M3 8l8 8 8-8m-9 3v10a2 2 0 002 2h14a2 2 0 002-2V11m-9-3l3-3m-3 3l-3-3" 
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-gray-600 font-medium animate-pulse">Chargement des colis...</p>
                    <p className="text-gray-500 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>
                      Veuillez patienter pendant que nous récupérons vos données
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">{packages.length} colis actifs</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              
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
              onSubmit={handleAddPackage}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {showEditForm && editingPackage && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
            <div className="fixed inset-0 overflow-y-auto z-50">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0" aria-hidden="true" onClick={() => setShowEditForm(false)}></div>
                <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lightBlue }}>
                        <svg className="w-5 h-5" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: COLORS.primary.blue }}>
                        Modifier le colis #{editingPackage.trackingNumber}
                      </h2>
                    </div>
                    <EditPackageForm 
                      package={editingPackage}
                      onSubmit={handleEditPackage}
                      onCancel={() => {
                        setShowEditForm(false);
                        setEditingPackage(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Statistiques */}
        {!isLoading && packages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.primary.blue }}>
                Statistiques des colis
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Carte Total */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total des colis</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: COLORS.primary.blue }}>
                      {getStats().total}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lightBlue }}>
                    <svg className="w-6 h-6" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carte Reçus */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reçus par transitaire</p>
                    <p className="text-3xl font-bold mt-2 text-blue-600">
                      {getStats().received}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carte En expédition */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En expédition</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600">
                      {getStats().inTransit}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carte Arrivés */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Arrivés</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                      {getStats().arrived}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{getStats().arrivalRate}% de taux</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carte Revenus */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                    <p className="text-3xl font-bold mt-2 text-purple-600">
                      {getStats().totalRevenue.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Moy: {getStats().avgPrice.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
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
          
          <div>
            <table className="w-full">
              <thead className="hidden lg:table-header-group">
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
                {currentPackages.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0V5a2 2 0 01-2 2H6a2 2 0 01-2-2v3m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                ) : isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col justify-center items-center space-y-6">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 flex items-center justify-center">
                            <svg 
                              className="w-8 h-8 text-blue-600" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              style={{
                                animation: 'spin 2s linear infinite reverse',
                              }}
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M21 16l-8-8-8 8M3 8l8 8 8-8m-9 3v10a2 2 0 002 2h14a2 2 0 002-2V11m-9-3l3-3m-3 3l-3-3" 
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-gray-600 font-medium animate-pulse">Chargement des colis...</p>
                          <p className="text-gray-500 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>
                            Veuillez patienter pendant que nous récupérons vos données
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPackages.map((pkg, index) => (
                    <React.Fragment key={pkg.id}>
                      {/* Vue Desktop */}
                      <tr className="hidden lg:table-row hover:bg-gray-50 transition-colors duration-150" style={{ backgroundColor: index % 2 === 0 ? 'white' : COLORS.primary.lightBlue + '20' }}>
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
                      <div className="text-xs text-gray-500">{pkg.pricePerKg?.toLocaleString('fr-FR')} FCFA/kg</div>
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
                        <button 
                          onClick={() => {
                            setEditingPackage(pkg);
                            setShowEditForm(true);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150" 
                          style={{ color: COLORS.primary.blue }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-150 text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                      {/* Vue Mobile */}
                      <tr className="lg:hidden border-b border-gray-200">
                        <td className="px-4 py-4">
                          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lightYellow }}>
                                  <svg className="w-4 h-4" style={{ color: COLORS.primary.darkYellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="font-mono text-sm font-medium text-gray-900">{pkg.trackingNumber}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                                {getStatusText(pkg.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Client</p>
                                <p className="text-sm font-medium text-gray-900">{pkg.clientName}</p>
                                <p className="text-sm text-gray-600">{pkg.clientPhone}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Trajet</p>
                                <p className="text-sm font-medium text-gray-900">{pkg.departureCountry}</p>
                                <p className="text-xs text-gray-500">→ {pkg.arrivalCountry}, {pkg.arrivalCity}</p>
                                <p className="text-xs text-blue-600">
                                  {pkg.departureDate instanceof Date ? pkg.departureDate.toLocaleDateString('fr-FR') : ''} - 
                                  {pkg.arrivalDate instanceof Date ? pkg.arrivalDate.toLocaleDateString('fr-FR') : ''}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Poids</p>
                                  <p className="text-sm font-medium text-gray-900">{pkg.quantity} kg</p>
                                  <p className="text-xs text-gray-500">{pkg.pricePerKg?.toLocaleString('fr-FR')} FCFA/kg</p>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Total</p>
                                  <p className="text-sm font-bold text-gray-900">{pkg.totalPrice?.toLocaleString('fr-FR')} FCFA</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingPackage(pkg);
                                    setShowEditForm(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-150" 
                                  style={{ color: COLORS.primary.blue }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-150 text-red-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, packages.length)} sur {packages.length} colis
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          currentPage === index + 1
                            ? 'text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        style={{
                          backgroundColor: currentPage === index + 1 ? COLORS.primary.blue : undefined
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
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
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ backgroundColor: COLORS.primary.blue }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4.5" />
              </svg>
              Ajout en cours...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Ajouter le colis
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface EditPackageFormProps {
  package: Package;
  onSubmit: (packageId: string, packageData: Partial<Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>>) => void;
  onCancel: () => void;
}

function EditPackageForm({ package: pkg, onSubmit, onCancel }: EditPackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>>>({
    description: pkg.description,
    sender: pkg.sender,
    recipient: pkg.recipient,
    origin: pkg.origin,
    destination: pkg.destination,
    status: pkg.status,
    weight: pkg.weight,
    dimensions: pkg.dimensions,
    estimatedDelivery: pkg.estimatedDelivery,
    currentLocation: pkg.currentLocation,
    clientName: pkg.clientName,
    clientPhone: pkg.clientPhone,
    nature: pkg.nature,
    departureDate: pkg.departureDate,
    arrivalDate: pkg.arrivalDate,
    quantity: pkg.quantity,
    pricePerKg: pkg.pricePerKg,
    totalPrice: pkg.totalPrice,
    departureCountry: pkg.departureCountry,
    arrivalCountry: pkg.arrivalCountry,
    arrivalCity: pkg.arrivalCity
  });

  // Calculer le total automatiquement
  useEffect(() => {
    const total = (formData.quantity || 0) * (formData.pricePerKg || 0);
    setFormData(prev => ({ ...prev, totalPrice: total }));
  }, [formData.quantity, formData.pricePerKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(pkg.id, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'pricePerKg' || name === 'weight') ? parseFloat(value) || 0 : 
              name === 'estimatedDelivery' || name === 'departureDate' || name === 'arrivalDate' ? new Date(value) :
              value
    }));
  };

  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations de base */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          Informations de base
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Description du colis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expéditeur
            </label>
            <input
              type="text"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Nom de l'expéditeur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataire
            </label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Nom du destinataire"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation actuelle
            </label>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Localisation actuelle"
            />
          </div>
        </div>
      </div>

      {/* Transport */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          Transport
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays de départ
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Pays de départ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays de destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Pays de destination"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de départ
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate ? new Date(formData.departureDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'arrivée estimée
            </label>
            <input
              type="date"
              name="estimatedDelivery"
              value={formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
        </div>
      </div>

      {/* Informations Client */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          Informations Client
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du client
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone du client
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays de départ (client)
            </label>
            <input
              type="text"
              name="departureCountry"
              value={formData.departureCountry}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays d'arrivée (client)
            </label>
            <input
              type="text"
              name="arrivalCountry"
              value={formData.arrivalCountry}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville d'arrivée
            </label>
            <input
              type="text"
              name="arrivalCity"
              value={formData.arrivalCity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'arrivée
            </label>
            <input
              type="date"
              name="arrivalDate"
              value={formData.arrivalDate ? new Date(formData.arrivalDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Détails du colis */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          Détails du colis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nature du colis
            </label>
            <select
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="Électroniques">Électroniques</option>
              <option value="Vêtements">Vêtements</option>
              <option value="Cosmétiques">Cosmétiques</option>
              <option value="Alimentaires">Alimentaires</option>
              <option value="Documents">Documents</option>
              <option value="Autres">Autres</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value={PackageStatus.RECUE_PAR_TRANSITAIRE}>Reçu par transitaire</option>
              <option value={PackageStatus.EN_EXPEDITION}>En expédition</option>
              <option value={PackageStatus.ARRIVEE}>Arrivé</option>
              <option value={PackageStatus.RECUPERATION}>En récupération</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(formData.status || PackageStatus.PENDING)}`}>
                Statut actuel
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poids (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
                  </div>
      </div>

      {/* Prix */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.primary.blue }}>
          Prix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix par kg (FCFA)
            </label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix total (FCFA)
            </label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
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
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ backgroundColor: COLORS.primary.blue }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4.5" />
              </svg>
              Modification en cours...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Modifier le colis
            </>
          )}
        </button>
      </div>
    </form>
  );
}
