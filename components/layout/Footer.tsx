import Link from 'next/link';
import { COLORS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: COLORS.primary.yellow }}>
                <span className="text-gray-900 font-bold text-sm">FT</span>
              </div>
              <span className="font-bold text-xl"><span style={{color: COLORS.primary.blue}}>TRAS</span><span style={{color: COLORS.primary.yellow}}>colis</span></span>
            </div>
            <p className="text-gray-300 max-w-md">
              Votre partenaire de confiance pour le suivi de colis entre la Chine et le Cameroun. 
              Suivez vos expéditions en temps réel avec une transparence totale.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: COLORS.primary.yellow }}>
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tracking" className="text-gray-300 hover:text-white transition-colors">
                  Suivi de colis
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                  Espace admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: COLORS.primary.yellow }}>
              Contact
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: foxtransval@gmail.com</li>
              <li>Téléphone: +237 692-95-70-69</li>
              <li>Yaoundé, Cameroun</li>
              
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 TRAScolis. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
