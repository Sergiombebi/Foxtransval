'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '@/lib/constants';
import { Package, PackageStatus } from '@/types';
import { supabase } from '@/lib/supabase';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchResult, setSearchResult] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSearchResult(null);

    try {
      if (!supabase) {
        setError('Service de suivi temporairement indisponible');
        setIsLoading(false);
        return;
      }
      
      console.log('Recherche du colis avec numéro:', trackingNumber);
      
      // Rechercher dans la base de données Supabase
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (error) {
        console.error('Erreur recherche colis:', error);
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          setError('Aucun colis trouvé avec ce numéro de suivi');
        } else {
          setError('Erreur lors de la recherche du colis');
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        // Transformer les données de la base vers le format Package
        const packageData: Package = {
          id: data.id,
          trackingNumber: data.tracking_number,
          description: data.nature,
          sender: 'Transitaire',
          recipient: data.client_name,
          origin: data.departure_country,
          destination: data.arrival_country,
          status: data.status,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at),
          estimatedDelivery: data.arrival_date ? new Date(data.arrival_date) : undefined,
          currentLocation: data.arrival_city,
          weight: data.quantity,
          dimensions: { length: 0, width: 0, height: 0 },
          // Champs supplémentaires
          clientName: data.client_name,
          clientPhone: data.client_phone,
          nature: data.nature,
          departureDate: data.departure_date ? new Date(data.departure_date) : undefined,
          arrivalDate: data.arrival_date ? new Date(data.arrival_date) : undefined,
          quantity: data.quantity,
          pricePerKg: data.price_per_kg,
          totalPrice: data.total_price,
          departureCountry: data.departure_country,
          arrivalCountry: data.arrival_country,
          arrivalCity: data.arrival_city,
          packageImage: data.package_image
        };
        
        console.log('Colis trouvé:', packageData);
        setSearchResult(packageData);
      } else {
        setError('Aucun colis trouvé avec ce numéro de suivi');
      }
    } catch (err) {
      console.error('Erreur générale:', err);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200';
      case PackageStatus.IN_TRANSIT:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200';
      case PackageStatus.CUSTOMS:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200';
      case PackageStatus.PENDING:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200';
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
      // Nouveaux statuts personnalisés
      case PackageStatus.RECUE_PAR_TRANSITAIRE:
        return 'Reçu par la transitaire';
      case PackageStatus.EN_EXPEDITION:
        return 'En expédition';
      case PackageStatus.ARRIVEE:
        return 'Arrivé';
      case PackageStatus.RECUPERATION:
        return 'Récupération';
      default:
        return status;
    }
  };

  const getStatusProgress = (status: PackageStatus): number => {
    switch (status) {
      case PackageStatus.RECUE_PAR_TRANSITAIRE:
        return 1;
      case PackageStatus.EN_EXPEDITION:
        return 2;
      case PackageStatus.ARRIVEE:
        return 3;
      case PackageStatus.RECUPERATION:
        return 4;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case PackageStatus.IN_TRANSIT:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 00-1-1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1z" />
          </svg>
        );
      case PackageStatus.CUSTOMS:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-5 animate-pulse"
             style={{ 
               backgroundColor: COLORS.primary.blue,
               top: '5%',
               right: '-10%',
               animation: 'float 8s ease-in-out infinite'
             }}>
        </div>
        <div className="absolute w-64 h-64 rounded-full opacity-5 animate-pulse"
             style={{ 
               backgroundColor: COLORS.primary.yellow,
               bottom: '10%',
               left: '-5%',
               animation: 'float 10s ease-in-out infinite reverse'
             }}>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 animate-bounce"
               style={{ backgroundColor: COLORS.primary.lightBlue }}>
            <svg className="w-12 h-12" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Suivi de
            <span className="block bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
              Colis International
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Suivez vos expéditions en temps réel de la Chine vers le Cameroun
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className={`bg-white rounded-2xl shadow-2xl p-8 mb-12 border border-gray-100 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '200ms' }}>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Entrez votre numéro de suivi (ex: FOX-2024-01-01)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-black transition-all duration-300"
                style={{ borderColor: COLORS.primary.lightBlue }}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              style={{ backgroundColor: COLORS.primary.blue }}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4.5" />
                    </svg>
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Suivre mon colis
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </form>

          {error && (
            <div className="mt-8 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 text-center relative overflow-hidden">
              {/* Arrière-plan décoratif */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full opacity-50 -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full opacity-50 -ml-12 -mb-12"></div>
              
              {/* Contenu principal */}
              <div className="relative z-10">
                {/* Icône d'erreur animée */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center animate-pulse shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                {/* Titre d'erreur */}
                <h3 className="text-2xl font-bold text-red-800 mb-3">
                  Colis non trouvé
                </h3>
                
                {/* Message d'erreur personnalisé */}
                <p className="text-red-600 mb-6 max-w-md mx-auto">
                  Nous n'avons pas pu trouver de colis correspondant au numéro <span className="font-mono font-semibold bg-red-100 px-2 py-1 rounded">"{trackingNumber}"</span>
                </p>
                
                {/* Suggestions d'aide */}
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Voici quelques suggestions :
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 text-left max-w-sm mx-auto">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4.586 4.586a1 1 0 001.414-1.414l-2-2z" clipRule="evenodd" />
                      </svg>
                      Vérifiez que le numéro de suivi est correct
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4.586 4.586a1 1 0 001.414-1.414l-2-2z" clipRule="evenodd" />
                      </svg>
                      Contactez le service client si le problème persiste
                    </li>
                  </ul>
                </div>
                
                {/* Bouton d'action rapide */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                      setError('');
                      setTrackingNumber('');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Nouvelle recherche
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {searchResult && (
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: '400ms' }}>
            {/* Header du résultat */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Détails du colis
                  </h2>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono text-lg font-semibold" style={{ color: COLORS.primary.blue }}>
                      {searchResult.trackingNumber}
                    </span>
                  </div>
                </div>
                <div className={`px-6 py-3 rounded-full text-sm font-semibold border-2 flex items-center space-x-2 ${getStatusColor(searchResult.status)}`}>
                  {getStatusIcon(searchResult.status)}
                  <span>{getStatusText(searchResult.status)}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Statut horizontal - EN PREMIER */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 mb-8 overflow-hidden">
                {/* Header - Desktop affiché, Mobile caché */}
                <div className="hidden sm:flex items-center justify-between p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold flex items-center" style={{ color: COLORS.primary.blue }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Statut du colis
                  </h3>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center space-x-2 ${getStatusColor(searchResult.status)}`}>
                    {getStatusIcon(searchResult.status)}
                    <span>{getStatusText(searchResult.status)}</span>
                  </div>
                </div>
                
                {/* Version Desktop */}
                <div className="hidden sm:block p-6">
                  <div className="relative">
                    {/* Ligne de progression */}
                    <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                    <div 
                      className="absolute top-8 left-0 h-1 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: COLORS.primary.yellow,
                        width: `${(getStatusProgress(searchResult.status) / 4) * 100}%`
                      }}
                    ></div>
                    
                    {/* Étapes Desktop */}
                    <div className="relative flex justify-between">
                      {[
                        { key: PackageStatus.RECUE_PAR_TRANSITAIRE, label: 'Reçu par la transitaire', shortLabel: 'Transitaire' },
                        { key: PackageStatus.EN_EXPEDITION, label: 'En expédition', shortLabel: 'Expédition' },
                        { key: PackageStatus.ARRIVEE, label: 'Arrivé', shortLabel: 'Arrivé' },
                        { key: PackageStatus.RECUPERATION, label: 'Récupération', shortLabel: 'Récupération' }
                      ].map((step, index) => {
                        const isCompleted = getStatusProgress(searchResult.status) > index;
                        const isCurrent = getStatusProgress(searchResult.status) === index + 1;
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg transform scale-110' 
                                : isCurrent 
                                  ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg animate-pulse transform scale-110'
                                  : 'bg-gray-200'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-white font-bold text-lg">{index + 1}</span>
                              )}
                            </div>
                            <div className="mt-3 text-center max-w-xs">
                              <p className={`text-sm font-medium ${
                                isCompleted ? 'text-yellow-600' : isCurrent ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Version Mobile - Épuré */}
                <div className="sm:hidden">
                  {/* Header Mobile */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold" style={{ color: COLORS.primary.blue }}>
                        Statut du colis
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center space-x-1 ${getStatusColor(searchResult.status)}`}>
                        {getStatusIcon(searchResult.status)}
                        <span>{getStatusText(searchResult.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progression verticale mobile */}
                  <div className="p-4 space-y-3">
                    {[
                      { key: PackageStatus.RECUE_PAR_TRANSITAIRE, label: 'Reçu par la transitaire', shortLabel: 'Transitaire' },
                      { key: PackageStatus.EN_EXPEDITION, label: 'En expédition', shortLabel: 'Expédition' },
                      { key: PackageStatus.ARRIVEE, label: 'Arrivé', shortLabel: 'Arrivé' },
                      { key: PackageStatus.RECUPERATION, label: 'Récupération', shortLabel: 'Récupération' }
                    ].map((step, index) => {
                      const isCompleted = getStatusProgress(searchResult.status) > index;
                      const isCurrent = getStatusProgress(searchResult.status) === index + 1;
                      
                      return (
                        <div key={step.key} className="flex items-center space-x-3">
                          {/* Cercle du statut */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md transform scale-105' 
                              : isCurrent 
                                ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg animate-pulse transform scale-105'
                                : 'bg-gray-200'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            )}
                          </div>
                          
                          {/* Texte et ligne de connexion */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                isCompleted ? 'text-yellow-600' : isCurrent ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {step.shortLabel}
                              </p>
                              {isCurrent && (
                                <span className="text-xs text-green-600 font-medium animate-pulse">
                                  En cours
                                </span>
                              )}
                            </div>
                            
                            {/* Ligne de connexion entre les étapes */}
                            {index < 3 && (
                              <div className={`ml-5 mt-2 h-0.5 transition-all duration-500 ${
                                isCompleted ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Informations du colis - Grid 3 colonnes */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Carte Client */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: COLORS.primary.blue }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations client
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-gray-600 text-sm font-medium">Nom:</span>
                      <span className="font-semibold text-gray-900">{searchResult.clientName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm font-medium">Téléphone:</span>
                      <span className="font-semibold text-gray-900">{searchResult.clientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Carte Nature et Quantité */}
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: COLORS.primary.yellow }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Nature & Quantité
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-yellow-100">
                      <span className="text-gray-600 text-sm font-medium">Nature:</span>
                      <span className="font-semibold text-gray-900">{searchResult.nature}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm font-medium">Quantité:</span>
                      <span className="font-semibold text-gray-900">{searchResult.quantity} kg</span>
                    </div>
                  </div>
                </div>

                {/* Carte Prix */}
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#10b981' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prix
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-100">
                      <span className="text-gray-600 text-sm font-medium">Prix/kg:</span>
                      <span className="font-semibold text-gray-900">{searchResult.pricePerKg.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm font-medium">Total:</span>
                      <span className="font-bold text-lg" style={{ color: '#10b981' }}>{searchResult.totalPrice.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates et Trajet - Grid 2 colonnes */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Carte Dates */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#8b5cf6' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Dates importantes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-purple-100">
                      <span className="text-gray-600 text-sm font-medium">Départ:</span>
                      <span className="font-semibold text-gray-900">
                        {searchResult.departureDate ? searchResult.departureDate.toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm font-medium">Arrivée:</span>
                      <span className="font-semibold text-gray-900">
                        {searchResult.arrivalDate ? searchResult.arrivalDate.toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carte Trajet */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#6366f1' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Trajet
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-gray-600 text-sm font-medium">Pays départ:</span>
                      <span className="font-semibold text-gray-900">{searchResult.departureCountry}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-gray-600 text-sm font-medium">Pays arrivée:</span>
                      <span className="font-semibold text-gray-900">{searchResult.arrivalCountry}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm font-medium">Ville arrivée:</span>
                      <span className="font-semibold text-indigo-600">{searchResult.arrivalCity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo du colis - EN DERNIER */}
              {searchResult.packageImage ? (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: COLORS.primary.blue }}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Photo du colis
                    </h3>
                    <div className="flex justify-center">
                      <img 
                        src={searchResult.packageImage} 
                        alt="Photo du colis" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: COLORS.primary.blue }}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Photo du colis
                    </h3>
                    <div className="flex justify-center">
                      <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Aucune photo disponible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section d'information */}
        <div className={`mt-12 text-center transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '600ms' }}>
          <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-8 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.primary.blue }}>
              Comment suivre votre colis ?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg border-2 border-blue-100">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Numéro de suivi</h4>
                <p className="text-sm text-gray-600">Entrez le numéro de tracking que vous avez reçu par email</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-yellow-100">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Recherche</h4>
                <p className="text-sm text-gray-600">Cliquez sur "Suivre mon colis" pour voir le statut en temps réel</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-green-100">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Suivi</h4>
                <p className="text-sm text-gray-600">Consultez les détails et l'état d'avancement de votre expédition</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Besoin d'aide ?</strong> Contactez notre service client au +237 692-95-70-69 ou par email à foxtransval@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
