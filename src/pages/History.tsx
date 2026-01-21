import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface Analysis {
  id: string;
  filename: string;
  client_name: string;
  project_title: string;
  risk_level: string;
  summary: string;
  deadline: string;
  budget: string;
  created_at: string;
  analysis_data: any;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement analyses:', error);
      } else {
        setAnalyses(data || []);
      }
      setLoading(false);
    };

    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette analyse ?')) return;

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression:', error);
    } else {
      setAnalyses(analyses.filter(a => a.id !== id));
    }
  };

  const getRiskBadge = (level: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-green-50', text: 'text-green-700', label: 'Faible' },
      medium: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Modéré' },
      high: { bg: 'bg-red-50', text: 'text-red-700', label: 'Élevé' },
    };
    const c = config[level] || config.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Historique</h1>
              <p className="text-muted-foreground mt-1">
                {analyses.length} analyse{analyses.length > 1 ? 's' : ''} sauvegardée{analyses.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/">
              <Button>Nouvelle analyse</Button>
            </Link>
          </div>

          {/* Liste des analyses */}
          {analyses.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground mb-4">Aucune analyse pour l'instant</p>
              <Link to="/">
                <Button>Analyser un document</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                    key={analysis.id}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {analysis.project_title || 'Sans titre'}
                        </h3>
                        {getRiskBadge(analysis.risk_level)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {analysis.client_name || 'Client inconnu'}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {analysis.summary}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>📄 {analysis.filename}</span>
                        <span>📅 {formatDate(analysis.created_at)}</span>
                        {analysis.deadline && (
                          <span>⏰ Deadline: {analysis.deadline}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default History;