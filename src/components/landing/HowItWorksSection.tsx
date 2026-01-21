import { Upload, Cpu, CheckCircle } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      step: "1",
      title: "Uploadez votre document",
      description: "Glissez-déposez votre CCTP au format PDF ou Word.",
    },
    {
      icon: Cpu,
      step: "2",
      title: "L'IA analyse",
      description: "Notre algorithme extrait les critères clés en quelques secondes.",
    },
    {
      icon: CheckCircle,
      step: "3",
      title: "Décidez instantanément",
      description: "Obtenez une recommandation Go/No-Go claire et argumentée.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground">
            Trois étapes simples pour gagner des heures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background text-sm font-bold rounded-full flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};