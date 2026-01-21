import { ArrowRight, FileSearch, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  onScrollToUpload: () => void;
}

export const HeroSection = ({ onScrollToUpload }: HeroSectionProps) => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Utilisé par +50 équipes commerciales
        </div>

        {/* Titre */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Analysez un appel d'offres
          <br />
          <span className="text-primary">en 30 secondes</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Notre IA détecte automatiquement les critères Go/No-Go pour que vous décidiez instantanément si vous devez répondre.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onScrollToUpload}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            Analyser un document
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/pricing"
            className="px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-all duration-200"
          >
            Voir les tarifs
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">2h → 30s</p>
            <p className="text-muted-foreground">Temps d'analyse</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">83%</p>
            <p className="text-muted-foreground">Précision moyenne</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
               <Target className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">7</p>
            <p className="text-muted-foreground">Critères extraits</p>
         </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">PDF</p>
            <p className="text-muted-foreground">Export instantané</p>
          </div>
        </div>
      </div>
    </section>
  );
};