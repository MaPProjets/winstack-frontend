import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadZone } from '@/components/UploadZone';
import { ResultsView } from '@/components/ResultsView';
import { Footer } from '@/components/Footer';

// Types pour l'API
interface ApiResponse {
  filename: string;
  success: boolean;
  analysis: {
    project_title: string;
    client_name: string;
    deadline: string;
    budget_estimated: string | null;
    duration: string | null;
    go_no_go: {
      min_turnover: string | null;
      certifications: string[];
      references_required: string | null;
      physical_presence: string | null;
      other_blockers: string[];
    };
    tech_stack: {
      technologies: string[];
      profiles_required: string[];
    };
    scoring_criteria: {
      price_weight: string | null;
      technical_weight: string | null;
      other_weight: string | null;
    };
    risk_analysis: {
      level: 'LOW' | 'MEDIUM' | 'HIGH';
      summary: string;
    };
    warnings: string[];
  };
}

// Type pour les résultats formatés
interface FormattedResult {
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

// Fonction pour convertir les données API vers le format frontend
const formatApiResponse = (data: ApiResponse): FormattedResult => {
  const analysis = data.analysis;

  // Convertir les pourcentages (ex: "30%" -> 30)
  const parsePercent = (value: string | null): number => {
    if (!value) return 0;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Convertir le niveau de risque
  const riskMap: Record<string, 'low' | 'medium' | 'high'> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
  };

  return {
    clientName: analysis.client_name || 'Client non spécifié',
    projectTitle: analysis.project_title || 'Projet sans titre',
    riskLevel: riskMap[analysis.risk_analysis.level] || 'medium',
    summary: analysis.risk_analysis.summary || '',
    deadline: analysis.deadline || 'Non spécifié',
    estimatedBudget: analysis.budget_estimated || 'Non spécifié',
    duration: analysis.duration || 'Non spécifié',
    scoringCriteria: {
      price: parsePercent(analysis.scoring_criteria.price_weight),
      technical: parsePercent(analysis.scoring_criteria.technical_weight),
      other: parsePercent(analysis.scoring_criteria.other_weight),
    },
    goNoGoCriteria: {
      minRevenue: analysis.go_no_go.min_turnover || 'Non mentionné',
      certifications: analysis.go_no_go.certifications.length > 0
        ? analysis.go_no_go.certifications.join(', ')
        : 'Aucune',
      references: analysis.go_no_go.references_required || 'Non spécifié',
      physicalPresence: analysis.go_no_go.physical_presence || 'Non spécifié',
    },
    blockers: analysis.go_no_go.other_blockers || [],
    technologies: analysis.tech_stack.technologies || [],
    requiredProfiles: analysis.tech_stack.profiles_required.join(', ') || 'Non spécifié',
    warnings: analysis.warnings || [],
  };
};

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Envoi de la requête vers le backend...');
      
      const response = await fetch('https://winstack-api.onrender.com/analyze-rfp', {
        method: 'POST',
        body: formData,
      });

      console.log('Réponse reçue:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'analyse');
      }

      const data: ApiResponse = await response.json();
      console.log('Données reçues:', data);
      
      const formattedResult = formatApiResponse(data);

      setResult(formattedResult);
      setShowResults(true);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de l\'analyse du document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (showResults && result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <ResultsView result={result} onBack={handleBack} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Analysez vos appels d'offres en quelques secondes.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Notre IA identifie les critères Go/No-Go pour que vous décidiez en 30 secondes si vous devez répondre.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <UploadZone
            file={file}
            onFileChange={setFile}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md w-full">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;