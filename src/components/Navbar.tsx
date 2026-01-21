import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-card transition-shadow duration-200 ${
        hasScrolled ? 'shadow-navbar' : ''
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-card font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-foreground">WinStack</span>
        </div>

        {/* API Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>API connectée</span>
        </div>
      </div>
    </nav>
  );
};
