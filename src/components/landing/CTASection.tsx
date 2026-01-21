import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CTASectionProps {
  onScrollToUpload: () => void;
}

export const CTASection = ({ onScrollToUpload }: CTASectionProps) => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Prêt à gagner du temps ?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Analysez votre premier appel d'offres gratuitement. Sans carte bancaire.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToUpload}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/pricing"
            className="text-primary hover:underline font-medium"
          >
            Voir les tarifs →
          </Link>
        </div>
      </div>
    </section>
  );
};