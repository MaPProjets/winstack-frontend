import { X } from 'lucide-react';

export const ProblemSection = () => {
  const problems = [
    "Vous passez 2 à 4 heures à lire chaque CCTP",
    "Vous découvrez les critères éliminatoires trop tard",
    "Vous répondez à des AO que vous ne pouvez pas gagner",
    "Votre équipe perd du temps sur des opportunités non qualifiées",
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Le problème avec les appels d'offres
          </h2>
          <p className="text-lg text-muted-foreground">
            Chaque année, des milliers d'heures sont perdues à analyser des AO non pertinents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-foreground">{problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};