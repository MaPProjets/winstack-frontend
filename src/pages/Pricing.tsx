import { useState } from 'react';
import { Check, Zap, Rocket, Building2, X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Pricing = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      period: '/mois HT',
      description: 'Pour tester et valider l\'outil',
      icon: Zap,
      features: [
        { text: '20 analyses / mois', included: true },
        { text: 'Export PDF', included: true },
        { text: 'Détection critères Go/No-Go', included: true },
        { text: 'Historique 30 jours', included: true },
        { text: 'Support email', included: true },
        { text: 'Score de compatibilité', included: false },
        { text: 'Historique illimité', included: false },
        { text: 'Analyses illimitées', included: false },
      ],
      cta: 'Choisir Starter',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 149,
      period: '/mois HT',
      description: 'Pour les équipes qui répondent régulièrement',
      icon: Rocket,
      features: [
        { text: 'Analyses illimitées', included: true },
        { text: 'Export PDF personnalisé', included: true },
        { text: 'Détection critères Go/No-Go', included: true },
        { text: 'Score de compatibilité', included: true },
        { text: 'Historique illimité', included: true },
        { text: 'Support prioritaire (24h)', included: true },
        { text: 'Accès aux nouvelles features', included: true },
      ],
      cta: 'Choisir Pro',
      popular: true,
    },
    {
      id: 'enterprise',
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

  const handleSelectPlan = (planId: string) => {
    // Ne rien faire si c'est le plan actuel
    if (planId === currentPlan) return;
    
    setSelectedPlan(planId);
    setError(null);
    setIsSuccess(false);
    // Pré-remplir l'email si connecté
    if (user?.email) {
      setEmail(user.email);
    }
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

  const getPlanStatus = (planId: string) => {
    if (planId === currentPlan) return 'current';
    
    const planOrder = ['free', 'starter', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const planIndex = planOrder.indexOf(planId);
    
    if (planIndex > currentIndex) return 'upgrade';
    return 'downgrade';
  };

  const getButtonContent = (plan: typeof plans[0]) => {
    const status = getPlanStatus(plan.id);
    
    if (status === 'current') {
      return (
        <span className="flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          Plan actuel
        </span>
      );
    }
    
    if (status === 'upgrade') {
      return plan.id === 'enterprise' ? 'Nous contacter' : `Passer à ${plan.name}`;
    }
    
    return plan.cta;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Un prix simple, un ROI immédiat
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une analyse manuelle = 2-4h de travail. WinStack = 30 secondes.
              <br />
              <span className="text-foreground font-medium">Rentabilisé dès le premier appel d'offres.</span>
            </p>
            
            {/* Afficher le plan actuel si connecté */}
            {user && currentPlan !== 'free' && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Crown className="w-4 h-4" />
                Vous êtes actuellement sur le plan {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const status = getPlanStatus(plan.id);
              const isCurrent = status === 'current';
              
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-card border-2 border-primary shadow-lg'
                      : plan.popular
                        ? 'bg-primary text-primary-foreground scale-105 shadow-2xl'
                        : 'bg-card border border-border hover:border-primary/50'
                  }`}
                >
                  {/* Badge Plan actuel */}
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        VOTRE PLAN
                      </span>
                    </div>
                  )}
                  
                  {/* Badge Populaire (seulement si pas le plan actuel) */}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <plan.icon className={`w-6 h-6 ${
                      isCurrent 
                        ? 'text-primary' 
                        : plan.popular 
                          ? 'text-primary-foreground' 
                          : 'text-primary'
                    }`} />
                    <h2 className={`text-xl font-semibold ${
                      isCurrent ? 'text-foreground' : ''
                    }`}>{plan.name}</h2>
                  </div>

                  <div className="mb-4">
                    {plan.price !== null ? (
                      <>
                        <span className={`text-4xl font-bold ${
                          isCurrent ? 'text-foreground' : ''
                        }`}>{plan.price}€</span>
                        <span className={`text-sm ${
                          isCurrent 
                            ? 'text-muted-foreground' 
                            : plan.popular 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                        }`}>
                          {plan.period}
                        </span>
                      </>
                    ) : (
                      <span className={`text-3xl font-bold ${
                        isCurrent ? 'text-foreground' : ''
                      }`}>Sur devis</span>
                    )}
                  </div>

                  <p className={`text-sm mb-6 ${
                    isCurrent 
                      ? 'text-muted-foreground' 
                      : plan.popular 
                        ? 'text-primary-foreground/80' 
                        : 'text-muted-foreground'
                  }`}>
                    {plan.description}
                  </p>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 mb-8 ${
                      isCurrent
                        ? 'bg-primary/10 text-primary cursor-default border-2 border-primary/20'
                        : plan.popular
                          ? 'bg-white text-primary hover:bg-white/90'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {getButtonContent(plan)}
                  </button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${
                            isCurrent 
                              ? 'text-green-500' 
                              : plan.popular 
                                ? 'text-primary-foreground' 
                                : 'text-green-500'
                          }`} />
                        ) : (
                          <X className={`w-5 h-5 flex-shrink-0 ${
                            isCurrent 
                              ? 'text-muted-foreground/40' 
                              : plan.popular 
                                ? 'text-primary-foreground/40' 
                                : 'text-muted-foreground/40'
                          }`} />
                        )}
                        <span className={`text-sm ${
                          feature.included 
                            ? (isCurrent ? 'text-foreground' : plan.popular ? 'text-primary-foreground/90' : 'text-foreground')
                            : (isCurrent ? 'text-muted-foreground/40' : plan.popular ? 'text-primary-foreground/40' : 'text-muted-foreground/40')
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
            <div className="bg-card rounded-2xl p-8 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
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
                    Nous vous contacterons très bientôt pour activer votre plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}.
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
                    {selectedPlan === 'enterprise' ? 'Demander un devis' : `Passer au plan ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedPlan !== 'enterprise' && 'Lancement imminent – Réservez votre place !'}
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
                      {isSubmitting ? 'Envoi...' : selectedPlan === 'enterprise' ? 'Demander un devis' : 'Réserver ma place'}
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
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;