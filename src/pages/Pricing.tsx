import { useState } from 'react';
import { Check, Zap, Rocket, Building2, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      name: 'Starter',
      price: 49,
      period: '/mois HT',
      description: 'Pour tester et valider l\'outil',
      icon: Zap,
      features: [
        { text: '30 analyses / mois', included: true },
        { text: 'Export PDF', included: true },
        { text: 'Détection critères Go/No-Go', included: true },
        { text: 'Historique 30 jours', included: true },
        { text: 'Support email', included: true },
        { text: 'Historique illimité', included: false },
        { text: 'Analyses illimitées', included: false },
      ],
      cta: 'Commencer',
      popular: false,
    },
    {
      name: 'Pro',
      price: 149,
      period: '/mois HT',
      description: 'Pour les équipes qui répondent régulièrement',
      icon: Rocket,
      features: [
        { text: 'Analyses illimitées', included: true },
        { text: 'Export PDF', included: true },
        { text: 'Détection critères Go/No-Go', included: true },
        { text: 'Historique illimité', included: true },
        { text: 'Support prioritaire (24h)', included: true },
        { text: 'Accès aux nouvelles features en avant-première', included: true },
      ],
      cta: 'Choisir Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: null,
      period: '',
      description: 'Pour les grands comptes avec besoins spécifiques',
      icon: Building2,
      features: [
        { text: 'Tout le plan Pro', included: true },
        { text: 'Multi-utilisateurs', included: true },
        { text: 'Accès API', included: true },
        { text: 'Intégrations sur-mesure', included: true },
        { text: 'Account manager dédié', included: true },
        { text: 'Facturation annuelle', included: true },
      ],
      cta: 'Nous contacter',
      popular: false,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setError(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedPlan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email, plan: selectedPlan });

      if (insertError) throw insertError;

      setIsSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setIsSuccess(false);
    setEmail('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Un prix simple, un ROI immédiat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une analyse manuelle = 2-4h de travail. WinStack = 30 secondes.
            <br />
            <span className="text-foreground font-medium">Rentabilisé dès le premier appel d'offres.</span>
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
                  <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMANDÉ
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                <h2 className="text-xl font-semibold">{plan.name}</h2>
              </div>

              <div className="mb-4">
                {plan.price !== null ? (
                  <>
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">Sur devis</span>
                )}
              </div>

              <p className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              <button
                onClick={() => handleSelectPlan(plan.name)}
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
                    {feature.included ? (
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary-foreground' : 'text-green-500'}`} />
                    ) : (
                      <X className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary-foreground/40' : 'text-muted-foreground/40'}`} />
                    )}
                    <span className={`text-sm ${
                      feature.included 
                        ? (plan.popular ? 'text-primary-foreground/90' : 'text-foreground')
                        : (plan.popular ? 'text-primary-foreground/40' : 'text-muted-foreground/40')
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-foreground text-center mb-6">
            Calculez votre ROI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">2-4h</p>
              <p className="text-muted-foreground">Temps d'analyse manuelle par CCTP</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">30 sec</p>
              <p className="text-muted-foreground">Temps d'analyse avec WinStack</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">~150€</p>
              <p className="text-muted-foreground">Économisé par analyse (coût horaire consultant)</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-6">
            → Avec seulement <span className="text-foreground font-medium">2 analyses par mois</span>, le plan Pro est rentabilisé.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Questions fréquentes
          </h3>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-2">Puis-je tester avant de m'engager ?</h4>
              <p className="text-muted-foreground text-sm">Oui, nous offrons actuellement un accès beta gratuit pour tester l'outil. Contactez-nous !</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-2">Comment sont comptées les analyses ?</h4>
              <p className="text-muted-foreground text-sm">Une analyse = un document uploadé. Les ré-téléchargements PDF ne comptent pas.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-2">Puis-je changer de plan à tout moment ?</h4>
              <p className="text-muted-foreground text-sm">Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement prend effet immédiatement.</p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            ✓ Sans engagement · ✓ Annulation à tout moment · ✓ Données hébergées en France
          </p>
          <p className="text-sm text-muted-foreground">
            Une question ?{' '}
            <a href="mailto:contact@winstack.fr" className="text-primary hover:underline">
              contact@winstack.fr
            </a>
          </p>
        </div>
      </div>

      {/* Modal de pré-inscription */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Vous êtes sur la liste !
                </h3>
                <p className="text-muted-foreground mb-6">
                  Nous vous contacterons très bientôt pour activer votre plan {selectedPlan}.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {selectedPlan === 'Enterprise' ? 'Demander un devis' : 'Réserver votre accès'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Plan <span className="font-medium text-foreground">{selectedPlan}</span>
                  {selectedPlan !== 'Enterprise' && ' — Lancement imminent !'}
                </p>

                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                  />

                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Envoi...' : selectedPlan === 'Enterprise' ? 'Demander un devis' : 'Réserver ma place'}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Pas de spam. Juste une notification au lancement.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;