'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { COLORS } from '@/lib/constants'
import styles from './Navbar.module.css'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    // Vérifier l'état d'authentification
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated')
      setIsAuthenticated(!!auth)
    }
    
    checkAuth()
    
    // Écouter les changements dans localStorage (pour les autres onglets)
    window.addEventListener('storage', checkAuth)
    
    // Vérifier périodiquement (pour la même page)
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/logo.png" alt="FOXtransval Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoBrand}><span style={{color: COLORS.primary.blue}}>TRAS</span><span style={{color: COLORS.primary.yellow}}>colis</span></span>
          </div>
        </Link>

        {/* Navigation centrale */}
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            Accueil
          </Link>
          <Link href="/tracking" className={`${styles.navLink} ${pathname === '/tracking' ? styles.active : ''}`}>
            Suivre un colis
          </Link>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Déconnexion</span>
            </button>
          ) : (
            <Link href="/login" className={`btn btn-primary ${styles.loginBtn}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Connexion</span>
            </Link>
          )}
        </div>

        {/* Burger mobile */}
        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.show : ''}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/tracking" onClick={() => setMenuOpen(false)}>Suivre un colis</Link>
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Déconnexion</span>
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Connexion Admin</span>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}