import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user, signOut } = useAuth();

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

  return (
    <nav
      className={`sticky top-0 z-50 bg-card transition-shadow duration-200 ${
        hasScrolled ? 'shadow-navbar' : ''
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-card font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-foreground">WinStack</span>
        </Link>

        {/* Navigation & Auth Section */}
        <div className="flex items-center gap-4">
          {/* Lien Tarifs */}
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </Link>

          {/* API Status */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>API connectée</span>
          </div>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/history"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Historique
              </Link>
              <span className="text-sm text-muted-foreground hidden md:block">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Déconnexion
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};