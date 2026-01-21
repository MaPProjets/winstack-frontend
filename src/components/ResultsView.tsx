import { ArrowLeft, AlertTriangle, XCircle } from 'lucide-react';

interface AnalysisResult {
  clientName: string;
  projectTitle: string;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  deadline: string;
  estimatedBudget: string;
  duration: string;
  scoringCriteria: {
    price: number;
    technical: number;
    other: number;
  };
  goNoGoCriteria: {
    minRevenue: string;
    certifications: string;
    references: string;
    physicalPresence: string;
  };
  blockers: string[];
  technologies: string[];
  requiredProfiles: string;
  warnings: string[];
}

interface ResultsViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

export const ResultsView = ({ result, onBack }: ResultsViewProps) => {
  const getRiskBadge = () => {
    switch (result.riskLevel) {
      case 'low':
        return (
          <div className="badge-risk-low">
            <span className="w-2 h-2 rounded-full bg-success" />
            Risque faible
          </div>
        );
      case 'medium':
        return (
          <div className="badge-risk-medium">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Risque modéré
          </div>
        );
      case 'high':
        return (
          <div className="badge-risk-high">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Risque élevé
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 stagger-children">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Nouvelle analyse
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{result.clientName}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {result.projectTitle}
          </h1>
        </div>
        {getRiskBadge()}
      </div>

      {/* Summary */}
      <p className="text-muted-foreground leading-relaxed mb-8">{result.summary}</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-professional">
          <p className="text-sm text-muted-foreground mb-1">Date limite</p>
          <p className="text-lg font-medium text-foreground">{result.deadline}</p>
        </div>
        <div className="card-professional">
          <p className="text-sm text-muted-foreground mb-1">Budget estimé</p>
          <p className="text-lg font-medium text-foreground">{result.estimatedBudget}</p>
        </div>
        <div className="card-professional">
          <p className="text-sm text-muted-foreground mb-1">Durée</p>
          <p className="text-lg font-medium text-foreground">{result.duration}</p>
        </div>
      </div>

      {/* Scoring Criteria */}
      <div className="card-professional mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Critères de notation</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {result.scoringCriteria.price}%
            </p>
            <p className="text-sm text-muted-foreground">Prix</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {result.scoringCriteria.technical}%
            </p>
            <p className="text-sm text-muted-foreground">Technique</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {result.scoringCriteria.other}%
            </p>
            <p className="text-sm text-muted-foreground">Autre</p>
          </div>
        </div>
      </div>

      {/* Go/No-Go Criteria */}
      <div className="card-professional mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Critères éliminatoires</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground">CA minimum requis</span>
            <span className="font-medium text-foreground">{result.goNoGoCriteria.minRevenue}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground">Certifications</span>
            <span className="font-medium text-foreground">{result.goNoGoCriteria.certifications}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground">Références exigées</span>
            <span className="font-medium text-foreground">{result.goNoGoCriteria.references}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Présence physique</span>
            <span className="font-medium text-foreground">{result.goNoGoCriteria.physicalPresence}</span>
          </div>
        </div>

        {/* Blockers Alert */}
        {result.blockers.length > 0 && (
          <div className="alert-danger mt-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive mb-2">Critères bloquants détectés</p>
                <ul className="space-y-1">
                  {result.blockers.map((blocker, index) => (
                    <li key={index} className="text-sm text-destructive/90">
                      • {blocker}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical Stack */}
      <div className="card-professional mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Technologies requises</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {result.technologies.map((tech, index) => (
            <span key={index} className="tag-tech">
              {tech}
            </span>
          ))}
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-1">Profils demandés</p>
          <p className="text-foreground">{result.requiredProfiles}</p>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="alert-warning mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning mb-2">Points de vigilance</p>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-warning/90">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
