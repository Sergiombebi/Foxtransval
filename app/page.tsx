'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COLORS, ROUTES } from '@/lib/constants';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animation de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-10 animate-pulse"
             style={{ 
               backgroundColor: COLORS.primary.blue,
               top: '10%',
               left: '-10%',
               animation: 'float 6s ease-in-out infinite'
             }}>
        </div>
        <div className="absolute w-64 h-64 rounded-full opacity-10 animate-pulse"
             style={{ 
               backgroundColor: COLORS.primary.yellow,
               bottom: '20%',
               right: '-5%',
               animation: 'float 8s ease-in-out infinite reverse'
             }}>
        </div>
        <div className="absolute w-48 h-48 rounded-full opacity-5 animate-pulse"
             style={{ 
               backgroundColor: COLORS.primary.blue,
               top: '50%',
               left: '50%',
               animation: 'float 10s ease-in-out infinite'
             }}>
        </div>
      </div>

      {/* Particules flottantes */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full opacity-30 animate-pulse"
            style={{
              backgroundColor: particle.id % 2 === 0 ? COLORS.primary.blue : COLORS.primary.yellow,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animation: `float ${particle.duration}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Badge animé */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce"
               style={{ 
                 backgroundColor: COLORS.primary.lightBlue,
                 color: COLORS.primary.blue
               }}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Nouveau : Suivi en temps réel
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Suivez vos colis
            <span className="block bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              Chine → Cameroun
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            FOXtransval vous offre un suivi transparent et fiable de vos expéditions. 
            Restez informé en temps réel de l'état d'avancement de vos colis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href={ROUTES.TRACKING}
              className="group relative px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.primary.blue }}
            >
              <span className="relative z-10">Suivre un colis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="group relative px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              style={{ 
                borderColor: COLORS.primary.yellow,
                color: COLORS.primary.blue,
                backgroundColor: COLORS.primary.yellow
              }}
            >
              <span className="relative z-10">Espace Admin</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className={`group bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:animate-bounce"
                 style={{ backgroundColor: COLORS.primary.lightBlue }}>
              <svg className="w-8 h-8" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary.blue }}>
              Suivi en temps réel
            </h3>
            <p className="text-gray-600">
              Suivez vos colis à chaque étape de leur voyage de la Chine jusqu'au Cameroun.
            </p>
          </div>

          <div className={`group bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '400ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:animate-spin"
                 style={{ backgroundColor: COLORS.primary.lightYellow }}>
              <svg className="w-8 h-8" style={{ color: COLORS.primary.yellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary.blue }}>
              Sécurisé
            </h3>
            <p className="text-gray-600">
              Vos informations sont protégées avec un système d'authentification sécurisé.
            </p>
          </div>

          <div className={`group bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '600ms' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:animate-pulse"
                 style={{ backgroundColor: COLORS.primary.lightBlue }}>
              <svg className="w-8 h-8" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.primary.blue }}>
              Rapide et simple
            </h3>
            <p className="text-gray-600">
              Interface intuitive pour un suivi rapide et sans complication de vos expéditions.
            </p>
          </div>
        </div>

        <div className={`text-center bg-white p-12 rounded-2xl shadow-xl transform transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '800ms' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 animate-bounce"
               style={{ backgroundColor: COLORS.primary.lightBlue }}>
            <svg className="w-10 h-10" style={{ color: COLORS.primary.blue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.primary.blue }}>
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Rejoignez les centaines d'utilisateurs qui font confiance à FOXtransval
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={ROUTES.TRACKING}
              className="group inline-flex items-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.primary.blue }}
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Commencer maintenant
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gratuit et sans engagement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
