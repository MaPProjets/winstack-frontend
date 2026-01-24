import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, XCircle, FileText, CheckSquare, Square, Briefcase, Receipt, ClipboardList, ListChecks, Users, Cog, Calendar, Award, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { ExportPDF } from './ExportPDF';
import { CompatibilityScore } from './CompatibilityScore';

interface RequiredDocument {
  name: string;
  type: 'administrative' | 'technical' | 'financial';
  mandatory: boolean;
  description: string | null;
}

interface ResponseRequirement {
  requirement: string;
  category: 'methodology' | 'team' | 'technical' | 'planning' | 'references' | 'commitments';
  source: string | null;
  priority: 'high' | 'medium';
}

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
  requiredDocuments: RequiredDocument[];
  responseRequirements: ResponseRequirement[];
}

interface ResultsViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

// Générer une clé unique pour le localStorage basée sur le projet
const getStorageKey = (projectTitle: string, clientName: string, type: 'docs' | 'reqs') => {
  const hash = `${projectTitle}-${clientName}`.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  return `winstack_checklist_${type}_${hash}`;
};

export const ResultsView = ({ result, onBack }: ResultsViewProps) => {
  // États pour les sections collapsibles
  const [isDocsExpanded, setIsDocsExpanded] = useState(false);
  const [isReqsExpanded, setIsReqsExpanded] = useState(false);

  // Clés de stockage
  const docsKey = getStorageKey(result.projectTitle, result.clientName, 'docs');
  const reqsKey = getStorageKey(result.projectTitle, result.clientName, 'reqs');

  // État pour la checklist documents - initialisé depuis localStorage
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(docsKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // État pour la checklist exigences - initialisé depuis localStorage
  const [checkedReqs, setCheckedReqs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(reqsKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Sauvegarder les docs cochés dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(docsKey, JSON.stringify([...checkedDocs]));
    } catch (e) {
      console.warn('Impossible de sauvegarder dans localStorage:', e);
    }
  }, [checkedDocs, docsKey]);

  // Sauvegarder les reqs cochés dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(reqsKey, JSON.stringify([...checkedReqs]));
    } catch (e) {
      console.warn('Impossible de sauvegarder dans localStorage:', e);
    }
  }, [checkedReqs, reqsKey]);

  const toggleDoc = (docName: string) => {
    const newChecked = new Set(checkedDocs);
    if (newChecked.has(docName)) {
      newChecked.delete(docName);
    } else {
      newChecked.add(docName);
    }
    setCheckedDocs(newChecked);
  };

  const toggleReq = (reqText: string) => {
    const newChecked = new Set(checkedReqs);
    if (newChecked.has(reqText)) {
      newChecked.delete(reqText);
    } else {
      newChecked.add(reqText);
    }
    setCheckedReqs(newChecked);
  };

  // Réinitialiser toutes les coches
  const resetChecklist = (type: 'docs' | 'reqs' | 'all') => {
    if (type === 'docs' || type === 'all') {
      setCheckedDocs(new Set());
      localStorage.removeItem(docsKey);
    }
    if (type === 'reqs' || type === 'all') {
      setCheckedReqs(new Set());
      localStorage.removeItem(reqsKey);
    }
  };

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

  // Grouper les documents par type
  const groupedDocs = {
    administrative: result.requiredDocuments?.filter(d => d.type === 'administrative') || [],
    technical: result.requiredDocuments?.filter(d => d.type === 'technical') || [],
    financial: result.requiredDocuments?.filter(d => d.type === 'financial') || [],
  };

  // Grouper les exigences par catégorie
  const groupedReqs = {
    methodology: result.responseRequirements?.filter(r => r.category === 'methodology') || [],
    team: result.responseRequirements?.filter(r => r.category === 'team') || [],
    technical: result.responseRequirements?.filter(r => r.category === 'technical') || [],
    planning: result.responseRequirements?.filter(r => r.category === 'planning') || [],
    references: result.responseRequirements?.filter(r => r.category === 'references') || [],
    commitments: result.responseRequirements?.filter(r => r.category === 'commitments') || [],
  };

  const totalDocs = result.requiredDocuments?.length || 0;
  const checkedDocsCount = checkedDocs.size;
  const docsProgress = totalDocs > 0 ? (checkedDocsCount / totalDocs) * 100 : 0;

  const totalReqs = result.responseRequirements?.length || 0;
  const checkedReqsCount = checkedReqs.size;
  const reqsProgress = totalReqs > 0 ? (checkedReqsCount / totalReqs) * 100 : 0;

  const getDocTypeConfig = (type: 'administrative' | 'technical' | 'financial') => {
    const config = {
      administrative: {
        icon: Briefcase,
        label: 'Documents administratifs',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
      },
      technical: {
        icon: ClipboardList,
        label: 'Documents techniques',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
      },
      financial: {
        icon: Receipt,
        label: 'Documents financiers',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      },
    };
    return config[type];
  };

  const getReqCategoryConfig = (category: ResponseRequirement['category']) => {
    const config = {
      methodology: {
        icon: Cog,
        label: 'Méthodologie',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
      },
      team: {
        icon: Users,
        label: 'Équipe',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-700',
      },
      technical: {
        icon: ClipboardList,
        label: 'Technique',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
      },
      planning: {
        icon: Calendar,
        label: 'Planning',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
      },
      references: {
        icon: Award,
        label: 'Références',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
      },
      commitments: {
        icon: Shield,
        label: 'Engagements',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
      },
    };
    return config[category];
  };

  const sanitizedFilename = `Analyse_${result.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 stagger-children">
      {/* Back Link & Export Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Nouvelle analyse
        </button>
        <ExportPDF contentId="analysis-content" filename={sanitizedFilename} />
      </div>

      {/* Score de compatibilité (avant le contenu principal) */}
      <CompatibilityScore result={result} />

      {/* Contenu exportable en PDF */}
      <div id="analysis-content">
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

        {/* ========== SECTION 1 : CHECKLIST DOCUMENTS (COLLAPSIBLE) ========== */}
        {totalDocs > 0 && (
          <div className="card-professional mb-6">
            {/* Header cliquable */}
            <button
              onClick={() => setIsDocsExpanded(!isDocsExpanded)}
              className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-foreground">Documents à fournir</h2>
                  <p className="text-sm text-muted-foreground">
                    {checkedDocsCount} / {totalDocs} préparés
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Barre de progression */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${docsProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{Math.round(docsProgress)}%</span>
                </div>
                {/* Chevron */}
                {isDocsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Contenu déroulable */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDocsExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              {/* Bouton reset */}
              {checkedDocsCount > 0 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); resetChecklist('docs'); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Réinitialiser les coches
                  </button>
                </div>
              )}

              {/* Liste par type */}
              <div className="space-y-6">
                {(['administrative', 'technical', 'financial'] as const).map((type) => {
                  const docs = groupedDocs[type];
                  if (docs.length === 0) return null;
                  
                  const config = getDocTypeConfig(type);
                  const Icon = config.icon;
                  
                  return (
                    <div key={type}>
                      {/* Header de catégorie */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} ${config.borderColor} border mb-3`}>
                        <Icon className={`w-4 h-4 ${config.textColor}`} />
                        <span className={`text-sm font-medium ${config.textColor}`}>
                          {config.label} ({docs.length})
                        </span>
                      </div>
                      
                      {/* Liste des documents */}
                      <div className="space-y-2 pl-2">
                        {docs.map((doc, index) => {
                          const isChecked = checkedDocs.has(doc.name);
                          return (
                            <div 
                              key={index}
                              onClick={() => toggleDoc(doc.name)}
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                isChecked 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isChecked ? 'text-green-700 line-through' : 'text-foreground'}`}>
                                    {doc.name}
                                  </span>
                                  {doc.mandatory && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                      Obligatoire
                                    </span>
                                  )}
                                </div>
                                {doc.description && (
                                  <p className={`text-sm mt-1 ${isChecked ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message de complétion */}
              {checkedDocsCount === totalDocs && totalDocs > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Tous les documents sont prêts ! 🎉
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== SECTION 2 : EXIGENCES DE RÉPONSE (COLLAPSIBLE) ========== */}
        {totalReqs > 0 && (
          <div className="card-professional mb-6">
            {/* Header cliquable */}
            <button
              onClick={() => setIsReqsExpanded(!isReqsExpanded)}
              className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ListChecks className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-foreground">Points à traiter dans votre réponse</h2>
                  <p className="text-sm text-muted-foreground">
                    {checkedReqsCount} / {totalReqs} traités
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Barre de progression */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${reqsProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{Math.round(reqsProgress)}%</span>
                </div>
                {/* Chevron */}
                {isReqsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Contenu déroulable */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isReqsExpanded ? 'max-h-[3000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              {/* Bouton reset */}
              {checkedReqsCount > 0 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); resetChecklist('reqs'); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Réinitialiser les coches
                  </button>
                </div>
              )}

              {/* Liste par catégorie */}
              <div className="space-y-6">
                {(['methodology', 'team', 'technical', 'planning', 'references', 'commitments'] as const).map((category) => {
                  const reqs = groupedReqs[category];
                  if (reqs.length === 0) return null;
                  
                  const config = getReqCategoryConfig(category);
                  const Icon = config.icon;
                  
                  return (
                    <div key={category}>
                      {/* Header de catégorie */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} mb-3`}>
                        <Icon className={`w-4 h-4 ${config.textColor}`} />
                        <span className={`text-sm font-medium ${config.textColor}`}>
                          {config.label} ({reqs.length})
                        </span>
                      </div>
                      
                      {/* Liste des exigences */}
                      <div className="space-y-2 pl-2">
                        {reqs.map((req, index) => {
                          const isChecked = checkedReqs.has(req.requirement);
                          return (
                            <div 
                              key={index}
                              onClick={() => toggleReq(req.requirement)}
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                isChecked 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`${isChecked ? 'text-green-700 line-through' : 'text-foreground'}`}>
                                    {req.requirement}
                                  </span>
                                  {req.priority === 'high' && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                      Priorité haute
                                    </span>
                                  )}
                                </div>
                                {req.source && (
                                  <p className={`text-xs mt-1 ${isChecked ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    📍 {req.source}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message de complétion */}
              {checkedReqsCount === totalReqs && totalReqs > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Tous les points sont traités ! Votre réponse est complète 🚀
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

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
          <h2 className="text-lg font-semibold text-foreground mb-4">Technologies requises / recommandées</h2>
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

        {/* Footer for PDF */}
        <div className="text-center text-xs text-muted-foreground pt-6 border-t border-border mt-8">
          Analyse générée par WinStack • {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
};