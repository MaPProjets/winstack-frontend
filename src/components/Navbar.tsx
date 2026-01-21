import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-200 ${
        hasScrolled ? 'border-border shadow-sm' : 'border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-semibold text-xl text-foreground">WinStack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/pricing"
                className={`text-sm font-medium transition-colors ${
                  isActive('/pricing') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tarifs
              </Link>
              {user && (
                <Link
                  to="/history"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/history') 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Historique
                </Link>
              )}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4 pl-6 border-l border-border">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden lg:block">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/pricing"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Commencer
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-foreground'}`}
              >
                Accueil
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${isActive('/pricing') ? 'text-primary' : 'text-foreground'}`}
              >
                Tarifs
              </Link>
              {user && (
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium ${isActive('/history') ? 'text-primary' : 'text-foreground'}`}
                >
                  Historique
                </Link>
              )}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium text-foreground text-left"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-foreground"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg text-center"
                    >
                      Commencer
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};