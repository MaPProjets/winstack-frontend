import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';
import { Menu, X, Settings, History, CreditCard, LogOut, User, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && !(e.target as Element).closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        hasScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-semibold text-xl text-foreground tracking-tight">
              WinStack
            </span>
            {isPro && (
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-md uppercase tracking-wide">
                Pro
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Main Links */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Accueil
            </Link>
            
            <Link
              to="/pricing"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Tarifs
            </Link>

            {user && (
              <Link
                to="/history"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/history') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Historique
              </Link>
            )}

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-2" />

            {/* Auth Section */}
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userMenuOpen 
                      ? 'bg-secondary text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden lg:block max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Plan {subscription?.plan || 'gratuit'}
                        {isPro && ' ✨'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <History className="w-4 h-4 text-muted-foreground" />
                        Historique
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Paramètres
                        {!isPro && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                            PRO
                          </span>
                        )}
                      </Link>
                      
                      <Link
                        to="/pricing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        Abonnement
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/pricing"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Commencer
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                }`}
              >
                Accueil
              </Link>
              
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/pricing') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                }`}
              >
                Tarifs
              </Link>

              {user && (
                <>
                  <Link
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      isActive('/history') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Historique
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      isActive('/settings') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                </>
              )}

              {/* Mobile Auth Section */}
              <div className="mt-4 pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Plan {subscription?.plan || 'gratuit'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 text-center text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3 text-center bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Commencer gratuitement
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