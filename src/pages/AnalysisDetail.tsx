import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ResultsView } from '@/components/ResultsView';

const AnalysisDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !id) return;

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur chargement analyse:', error);
        setError('Analyse introuvable');
      } else {
        setAnalysis(data);
      }
      setLoading(false);
    };

    if (user) {
      fetchAnalysis();
    }
  }, [user, id]);

  const handleBack = () => {
    navigate('/history');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">{error || 'Analyse introuvable'}</p>
          <Link to="/history" className="text-primary hover:underline">
            Retour à l'historique
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Utilise les données sauvegardées dans analysis_data
  const result = analysis.analysis_data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <ResultsView result={result} onBack={handleBack} />
      </main>
      <Footer />
    </div>
  );
};

export default AnalysisDetail;