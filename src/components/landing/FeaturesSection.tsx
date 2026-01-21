import { FileSearch, AlertTriangle, Download, History } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: FileSearch,
      title: "Analyse intelligente",
      description: "Notre IA extrait automatiquement les informations clés : budget, délais, critères de notation.",
    },
    {
      icon: AlertTriangle,
      title: "Détection Go/No-Go",
      description: "Identifiez instantanément les critères éliminatoires : CA minimum, certifications, références exigées.",
    },
    {
      icon: Download,
      title: "Export PDF",
      description: "Générez un rapport professionnel à partager avec votre équipe en un clic.",
    },
    {
      icon: History,
      title: "Historique complet",
      description: "Retrouvez toutes vos analyses passées et comparez les opportunités.",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tout ce qu'il vous faut pour décider vite
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WinStack analyse vos documents et vous donne une vision claire en quelques secondes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};