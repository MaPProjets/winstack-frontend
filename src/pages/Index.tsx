import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { UploadZone } from '@/components/UploadZone';
import { ResultsView } from '@/components/ResultsView';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CTASection } from '@/components/landing/CTASection';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';
import { supabase } from '@/lib/supabase';
import { AlertTriangle } from 'lucide-react';

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

const formatApiResponse = (data: ApiResponse): FormattedResult => {
  const analysis = data.analysis;

  const parsePercent = (value: string | null): number => {
    if (!value) return 0;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

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
  const { user } = useAuth();
  const { subscription, canAnalyze, remainingAnalyses, incrementUsage, loading: subLoading } = useSubscription();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setError('Connectez-vous pour analyser un document.');
      return;
    }

    // Vérifier le quota
    if (!canAnalyze()) {
      setError('Vous avez atteint votre limite d\'analyses. Passez au plan supérieur pour continuer.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://winstack-api.onrender.com/analyze-rfp', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'analyse');
      }

      const data: ApiResponse = await response.json();
      const formattedResult = formatApiResponse(data);

      // Incrémenter le compteur d'analyses
      const incremented = await incrementUsage();
      if (!incremented) {
        console.warn('Impossible d\'incrémenter le compteur');
      }

      // Sauvegarder dans l'historique
      if (user) {
        const { error: saveError } = await supabase.from('analyses').insert({
          user_id: user.id,
          filename: file.name,
          client_name: formattedResult.clientName,
          project_title: formattedResult.projectTitle,
          risk_level: formattedResult.riskLevel,
          summary: formattedResult.summary,
          deadline: formattedResult.deadline,
          budget: formattedResult.estimatedBudget,
          duration: formattedResult.duration,
          analysis_data: formattedResult,
        });

        if (saveError) {
          console.error('Erreur sauvegarde:', saveError);
        }
      }

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
      <main className="flex-1">
        {/* Hero */}
        <HeroSection onScrollToUpload={scrollToUpload} />

        {/* Problem */}
        <ProblemSection />

        {/* Features */}
        <FeaturesSection />

        {/* How it works */}
        <HowItWorksSection />

        {/* Upload Zone */}
        <section ref={uploadRef} className="py-20 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Essayez maintenant
              </h2>
              
              {/* Affichage du quota */}
              {user && subscription && !subLoading && (
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    {remainingAnalyses() === 'illimité' ? (
                      <span className="text-green-600 font-medium">Analyses illimitées</span>
                    ) : (
                      <>
                        <span className="text-foreground font-medium">{remainingAnalyses()}</span>
                        {' '}analyse{Number(remainingAnalyses()) > 1 ? 's' : ''} restante{Number(remainingAnalyses()) > 1 ? 's' : ''}
                        <span className="text-muted-foreground"> sur votre plan {subscription.plan}</span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {!user && (
                <p className="text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link>
                  {' '}pour analyser vos documents.
                </p>
              )}
            </div>

            {/* Alerte si limite atteinte */}
            {user && subscription && !canAnalyze() && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-medium">Limite atteinte</p>
                  <p className="text-yellow-700 text-sm">
                    Vous avez utilisé toutes vos analyses ce mois-ci.{' '}
                    <Link to="/pricing" className="underline font-medium">
                      Passez au plan supérieur
                    </Link>
                    {' '}pour continuer.
                  </p>
                </div>
              </div>
            )}

            <UploadZone
              file={file}
              onFileChange={setFile}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              disabled={!user || (subscription ? !canAnalyze() : false)}
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <CTASection onScrollToUpload={scrollToUpload} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;