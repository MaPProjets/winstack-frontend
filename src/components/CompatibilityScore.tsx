import { useSubscription } from '@/lib/useSubscription';
import { Crown, CheckCircle, XCircle, AlertTriangle, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  goNoGoCriteria: {
    minRevenue: string;
    certifications: string;
    references: string;
    physicalPresence: string;
  };
  technologies: string[];
}

interface CompatibilityScoreProps {
  result: AnalysisResult;
}

interface MatchResult {
  category: string;
  status: 'match' | 'partial' | 'missing' | 'unknown';
  detail: string;
  points: number;
  maxPoints: number;
}

// Helper pour détecter "pas d'exigence"
const isNoRequirement = (value: string | null | undefined): boolean => {
  if (!value) return true;
  const normalized = value.toLowerCase().trim();
  const noRequirementTerms = [
    'non mentionné', 'non spécifié', 'non précisé', 'aucune', 'aucun',
    'non exigé', 'pas de', 'n/a', 'na', '-', 'néant', 'sans objet',
    'non requis', 'facultatif', 'optionnel', 'non obligatoire'
  ];
  return noRequirementTerms.some(term => normalized.includes(term)) || normalized.length === 0;
};

// Compte le profil rempli (pour l'indicateur)
const getProfileCompleteness = (subscription: any): { filled: number; total: number } => {
  const fields = [
    subscription?.company_revenue,
    subscription?.company_certifications?.length > 0,
    subscription?.company_technologies?.length > 0,
    subscription?.company_location,
    subscription?.company_references,
  ];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length };
};

export const CompatibilityScore = ({ result }: CompatibilityScoreProps) => {
  const { subscription, hasCompanyProfile } = useSubscription();
  
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';

  if (!isPro) {
    return (
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Score de compatibilité</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Découvrez instantanément si cet appel d'offres correspond à votre entreprise.
            </p>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Débloquer avec Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasCompanyProfile()) {
    const { filled, total } = getProfileCompleteness(subscription);
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 mb-1">Complétez votre profil</h3>
            <p className="text-sm text-amber-700 mb-3">
              Renseignez les informations de votre entreprise pour calculer le score de compatibilité.
              <span className="block mt-1 text-amber-600">
                Profil complété : {filled}/{total} champs
              </span>
            </p>
            <Link 
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Compléter mon profil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calcul du score
  const matches = calculateMatches(result, subscription);
  const totalPoints = matches.reduce((sum, m) => sum + m.points, 0);
  const maxPoints = matches.reduce((sum, m) => sum + m.maxPoints, 0);
  
  // Score de base
  let scorePercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  
  // Critères bloquants = status "missing" sur un critère avec des points (et pas juste "aucune exigence")
  const blockers = matches.filter(m => 
    m.status === 'missing' && 
    m.maxPoints >= 15 &&
    !m.detail.toLowerCase().includes('aucun')
  );
  
  // Pénalité réduite pour les bloquants (10% par bloquant, minimum 20%)
  if (blockers.length > 0) {
    scorePercent = Math.max(20, scorePercent - (blockers.length * 10));
  }

  // Bonus si tout match parfaitement et pas de bloquants
  const allMatch = matches.every(m => m.status === 'match');
  if (allMatch && blockers.length === 0) {
    scorePercent = Math.min(100, scorePercent + 5);
  }

  const warnings = matches.filter(m => m.status === 'partial');
  const unknowns = matches.filter(m => m.status === 'unknown');

  const getScoreColor = () => {
    if (scorePercent >= 75) return 'text-green-600';
    if (scorePercent >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (scorePercent >= 75) return 'bg-green-50 border-green-200';
    if (scorePercent >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = () => {
    if (scorePercent >= 75) return 'Bonne compatibilité';
    if (scorePercent >= 50) return 'Compatibilité moyenne';
    return 'Faible compatibilité';
  };

  const getScoreEmoji = () => {
    if (scorePercent >= 75) return '✅';
    if (scorePercent >= 50) return '⚠️';
    return '❌';
  };

  return (
    <div className={`border rounded-2xl p-6 mb-6 ${getScoreBg()}`}>
      {/* Header avec score */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Score de compatibilité {getScoreEmoji()}</h3>
          <p className="text-sm text-muted-foreground">{getScoreLabel()}</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {scorePercent}%
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-3 bg-white rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full transition-all duration-500 ${
            scorePercent >= 75 ? 'bg-green-500' : 
            scorePercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="bg-red-100 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">
              {blockers.length} critère{blockers.length > 1 ? 's' : ''} bloquant{blockers.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="space-y-1">
            {blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-700">• {b.detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              {warnings.length} point{warnings.length > 1 ? 's' : ''} d'attention
            </span>
          </div>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700">• {w.detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Unknowns - incitation à compléter le profil */}
      {unknowns.length > 0 && (
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">
              {unknowns.length} critère{unknowns.length > 1 ? 's' : ''} non évalué{unknowns.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Complétez votre profil pour améliorer la précision du score.
          </p>
          <Link 
            to="/settings"
            className="text-sm text-primary hover:underline"
          >
            → Compléter mon profil
          </Link>
        </div>
      )}

      {/* Détail des critères */}
      <div className="space-y-3">
        {matches.map((match, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-white/50 last:border-0">
            <div className="flex items-center gap-2">
              {match.status === 'match' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {match.status === 'partial' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {match.status === 'missing' && <XCircle className="w-4 h-4 text-red-600" />}
              {match.status === 'unknown' && <div className="w-4 h-4 rounded-full bg-gray-300" />}
              <span className="text-sm text-foreground">{match.category}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {match.points}/{match.maxPoints}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function calculateMatches(result: AnalysisResult, subscription: any): MatchResult[] {
  const matches: MatchResult[] = [];

  // 1. Chiffre d'affaires (20 points)
  const revenueMatch = checkRevenue(
    subscription?.company_revenue,
    result.goNoGoCriteria.minRevenue
  );
  matches.push(revenueMatch);

  // 2. Certifications (20 points)
  const certMatch = checkCertifications(
    subscription?.company_certifications || [],
    result.goNoGoCriteria.certifications
  );
  matches.push(certMatch);

  // 3. Références (20 points) - NOUVEAU
  const refMatch = checkReferences(
    subscription?.company_references,
    result.goNoGoCriteria.references
  );
  matches.push(refMatch);

  // 4. Technologies (25 points)
  const techMatch = checkTechnologies(
    subscription?.company_technologies || [],
    result.technologies
  );
  matches.push(techMatch);

  // 5. Présence physique / Localisation (15 points)
  const locationMatch = checkLocation(
    subscription?.company_location,
    result.goNoGoCriteria.physicalPresence
  );
  matches.push(locationMatch);

  return matches;
}

function checkRevenue(companyRevenue: string | null, required: string): MatchResult {
  const maxPoints = 20;
  
  // Si pas d'exigence de CA → 100% sur ce critère
  if (isNoRequirement(required)) {
    return {
      category: 'Chiffre d\'affaires',
      status: 'match',
      detail: 'Aucune exigence de CA',
      points: maxPoints,
      maxPoints
    };
  }

  if (!companyRevenue) {
    return {
      category: 'Chiffre d\'affaires',
      status: 'unknown',
      detail: 'CA entreprise non renseigné',
      points: Math.round(maxPoints * 0.5),
      maxPoints
    };
  }

  // Extraire le montant requis
  const requiredAmount = extractAmount(required);
  const companyAmount = getRevenueAmount(companyRevenue);

  if (companyAmount >= requiredAmount) {
    return {
      category: 'Chiffre d\'affaires',
      status: 'match',
      detail: `CA suffisant ✓`,
      points: maxPoints,
      maxPoints
    };
  }

  // Partial si on est proche (>60% du requis)
  if (companyAmount >= requiredAmount * 0.6) {
    return {
      category: 'Chiffre d\'affaires',
      status: 'partial',
      detail: `CA requis: ${required} (proche)`,
      points: Math.round(maxPoints * 0.6),
      maxPoints
    };
  }

  return {
    category: 'Chiffre d\'affaires',
    status: 'missing',
    detail: `CA requis: ${required}`,
    points: Math.round(maxPoints * 0.2),
    maxPoints
  };
}

function checkCertifications(companyCerts: string[], required: string): MatchResult {
  const maxPoints = 20;
  
  // Si pas d'exigence de certifications → 100% sur ce critère
  if (isNoRequirement(required)) {
    return {
      category: 'Certifications',
      status: 'match',
      detail: 'Aucune certification requise',
      points: maxPoints,
      maxPoints
    };
  }

  if (companyCerts.length === 0) {
    return {
      category: 'Certifications',
      status: 'unknown',
      detail: 'Certifications non renseignées',
      points: Math.round(maxPoints * 0.4),
      maxPoints
    };
  }

  const requiredCerts = required.split(/[,;]/).map(c => c.trim().toLowerCase()).filter(c => c.length > 0);
  
  if (requiredCerts.length === 0) {
    return {
      category: 'Certifications',
      status: 'match',
      detail: 'Aucune certification requise',
      points: maxPoints,
      maxPoints
    };
  }
  
  const companyCertsLower = companyCerts.map(c => c.toLowerCase());
  
  const matched = requiredCerts.filter(rc => 
    companyCertsLower.some(cc => cc.includes(rc) || rc.includes(cc))
  );

  if (matched.length === requiredCerts.length) {
    return {
      category: 'Certifications',
      status: 'match',
      detail: 'Toutes les certifications ✓',
      points: maxPoints,
      maxPoints
    };
  }

  if (matched.length > 0) {
    const ratio = matched.length / requiredCerts.length;
    const points = Math.round(ratio * maxPoints);
    return {
      category: 'Certifications',
      status: 'partial',
      detail: `${matched.length}/${requiredCerts.length} certifications`,
      points,
      maxPoints
    };
  }

  return {
    category: 'Certifications',
    status: 'missing',
    detail: `Manquantes: ${required}`,
    points: 0,
    maxPoints
  };
}

// NOUVEAU : Vérification des références
function checkReferences(companyRefs: string | null, required: string): MatchResult {
  const maxPoints = 20;
  
  // Si pas d'exigence de références → 100% sur ce critère
  if (isNoRequirement(required)) {
    return {
      category: 'Références',
      status: 'match',
      detail: 'Aucune référence exigée',
      points: maxPoints,
      maxPoints
    };
  }

  if (!companyRefs) {
    return {
      category: 'Références',
      status: 'unknown',
      detail: 'Références non renseignées',
      points: Math.round(maxPoints * 0.4),
      maxPoints
    };
  }

  // Extraire le nombre de références requises
  const requiredCount = extractReferencesCount(required);
  const companyCount = getReferencesCount(companyRefs);

  if (companyCount >= requiredCount) {
    return {
      category: 'Références',
      status: 'match',
      detail: `Références suffisantes ✓`,
      points: maxPoints,
      maxPoints
    };
  }

  // Partial si on a au moins 50%
  if (companyCount >= requiredCount * 0.5) {
    return {
      category: 'Références',
      status: 'partial',
      detail: `${companyCount} réf. (requis: ${requiredCount})`,
      points: Math.round(maxPoints * 0.6),
      maxPoints
    };
  }

  return {
    category: 'Références',
    status: 'missing',
    detail: `Requis: ${required}`,
    points: Math.round(maxPoints * 0.2),
    maxPoints
  };
}

function checkTechnologies(companyTech: string[], required: string[]): MatchResult {
  const maxPoints = 25;
  
  // Si pas de technologie requise → 100% sur ce critère
  if (!required || required.length === 0) {
    return {
      category: 'Technologies',
      status: 'match',
      detail: 'Aucune technologie spécifique requise',
      points: maxPoints,
      maxPoints
    };
  }

  // Filtrer les valeurs vides ou "non spécifié"
  const filteredRequired = required.filter(t => t && !isNoRequirement(t));
  
  if (filteredRequired.length === 0) {
    return {
      category: 'Technologies',
      status: 'match',
      detail: 'Aucune technologie spécifique requise',
      points: maxPoints,
      maxPoints
    };
  }

  if (companyTech.length === 0) {
    return {
      category: 'Technologies',
      status: 'unknown',
      detail: 'Technologies non renseignées',
      points: Math.round(maxPoints * 0.4),
      maxPoints
    };
  }

  const companyTechLower = companyTech.map(t => t.toLowerCase());
  const requiredLower = filteredRequired.map(t => t.toLowerCase());
  
  const matched = requiredLower.filter(rt => 
    companyTechLower.some(ct => 
      ct.includes(rt) || 
      rt.includes(ct) ||
      // Matching plus souple pour les variantes
      ct.replace(/[^a-z0-9]/g, '') === rt.replace(/[^a-z0-9]/g, '')
    )
  );

  const matchRatio = matched.length / filteredRequired.length;
  const points = Math.round(matchRatio * maxPoints);

  if (matchRatio >= 0.7) {
    return {
      category: 'Technologies',
      status: 'match',
      detail: `${matched.length}/${filteredRequired.length} technologies ✓`,
      points,
      maxPoints
    };
  }

  if (matchRatio >= 0.3) {
    return {
      category: 'Technologies',
      status: 'partial',
      detail: `${matched.length}/${filteredRequired.length} technologies`,
      points,
      maxPoints
    };
  }

  return {
    category: 'Technologies',
    status: 'missing',
    detail: `${matched.length}/${filteredRequired.length} technologies`,
    points,
    maxPoints
  };
}

function checkLocation(companyLocation: string | null, required: string): MatchResult {
  const maxPoints = 15;
  
  // Si pas d'exigence de présence → 100% sur ce critère
  if (isNoRequirement(required)) {
    return {
      category: 'Présence géographique',
      status: 'match',
      detail: 'Aucune contrainte géographique',
      points: maxPoints,
      maxPoints
    };
  }

  if (!companyLocation) {
    return {
      category: 'Présence géographique',
      status: 'partial',
      detail: 'Zone non renseignée',
      points: Math.round(maxPoints * 0.6),
      maxPoints
    };
  }

  // Si l'entreprise couvre toute la France
  const companyLower = companyLocation.toLowerCase();
  
  if (companyLower === 'france' || companyLower === 'international' || companyLower === 'europe') {
    return {
      category: 'Présence géographique',
      status: 'match',
      detail: 'Couverture nationale ✓',
      points: maxPoints,
      maxPoints
    };
  }

  // Vérifier si la région correspond
  const requiredLower = required.toLowerCase();
  const regions = ['île-de-france', 'bretagne', 'normandie', 'paca', 'occitanie', 'auvergne', 'hauts-de-france', 'grand-est', 'nouvelle-aquitaine', 'pays de la loire'];
  const matchingRegion = regions.some(r => companyLower.includes(r) && requiredLower.includes(r));
  
  if (matchingRegion) {
    return {
      category: 'Présence géographique',
      status: 'match',
      detail: 'Zone compatible ✓',
      points: maxPoints,
      maxPoints
    };
  }

  return {
    category: 'Présence géographique',
    status: 'partial',
    detail: required,
    points: Math.round(maxPoints * 0.5),
    maxPoints
  };
}

function extractAmount(text: string): number {
  if (!text) return 0;
  
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(k|K|M|m|€|euros?|millions?)?/i);
  if (!match) return 0;
  
  let amount = parseFloat(match[1].replace(',', '.'));
  const unit = match[2]?.toLowerCase();
  
  if (unit === 'k') amount *= 1000;
  if (unit === 'm' || unit?.includes('million')) amount *= 1000000;
  
  return amount;
}

function getRevenueAmount(range: string): number {
  const ranges: Record<string, number> = {
    '0-100k': 100000,
    '100k-500k': 500000,
    '500k-1m': 1000000,
    '1m-5m': 5000000,
    '5m-10m': 10000000,
    '10m+': 50000000
  };
  return ranges[range] || 0;
}

// NOUVEAU : Extraction du nombre de références requises
function extractReferencesCount(text: string): number {
  if (!text) return 0;
  
  // Chercher des patterns comme "3 références", "au moins 5", "minimum 2"
  const match = text.match(/(\d+)\s*(références?|projets?|réalisations?)?/i);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Patterns textuels
  if (text.toLowerCase().includes('plusieurs')) return 3;
  if (text.toLowerCase().includes('quelques')) return 2;
  
  return 1; // Par défaut si mention vague
}

// NOUVEAU : Conversion des références de l'entreprise
function getReferencesCount(range: string): number {
  const ranges: Record<string, number> = {
    '0': 0,
    '1-2': 2,
    '3-5': 5,
    '6-10': 10,
    '10-20': 20,
    '20+': 30
  };
  return ranges[range] || 0;
}