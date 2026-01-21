import { Check, Zap, Building2, Rocket } from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
}

export const PricingPage = ({ onBack }: PricingPageProps) => {
  const plans = [
    {
      name: 'Starter',
      price: 99,
      description: 'Pour les indépendants et petites équipes',
      icon: Zap,
      features: [
        '20 analyses / mois',
        'Export PDF',
        'Détection des critères éliminatoires',
        'Historique 30 jours',
        'Support email',
      ],
      cta: 'Commencer',
      popular: false,
    },
    {
      name: 'Pro',
      price: 199,
      description: 'Pour les PME et cabinets de conseil',
      icon: Rocket,
      features: [
        '100 analyses / mois',
        'Export PDF',
        'Détection des critères éliminatoires',
        'Historique illimité',
        '3 utilisateurs inclus',
        'Analyse comparative',
        'Support prioritaire',
      ],
      cta: 'Choisir Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 349,
      description: 'Pour les ESN et grands comptes',
      icon: Building2,
      features: [
        'Analyses illimitées',
        'Export PDF & Excel',
        'Détection des critères éliminatoires',
        'Historique illimité',
        '10 utilisateurs inclus',
        'API access',
        'Intégration CRM',
        'Account manager dédié',
        'SLA 99.9%',
      ],
      cta: 'Contacter les ventes',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gagnez des heures sur chaque appel d'offres. ROI immédiat dès la première analyse.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-primary text-primary-foreground scale-105 shadow-2xl'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-warning text-warning-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULAIRE
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                <h2 className="text-xl font-semibold">{plan.name}</h2>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}€</span>
                <span className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  /mois HT
                </span>
              </div>

              <p className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 mb-8 ${
                  plan.popular
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary-foreground' : 'text-success'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ / Trust */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            ✓ Sans engagement · ✓ Annulation à tout moment · ✓ Facture française
          </p>
          <p className="text-sm text-muted-foreground">
            Une question ? <a href="mailto:contact@winstack.fr" className="text-primary hover:underline">Contactez-nous</a>
          </p>
        </div>
      </div>
    </div>
  );
};