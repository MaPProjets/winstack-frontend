import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

interface Subscription {
  plan: string;
  analyses_used: number;
  analyses_limit: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, analyses_used, analyses_limit')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur subscription:', error);
        // Créer un abonnement par défaut si n'existe pas
        if (error.code === 'PGRST116') {
          const { data: newSub } = await supabase
            .from('subscriptions')
            .insert({ user_id: user.id, plan: 'free', analyses_limit: 5 })
            .select()
            .single();
          setSubscription(newSub);
        }
      } else {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const canAnalyze = () => {
    if (!subscription) return false;
    if (subscription.plan === 'pro' || subscription.plan === 'enterprise') return true;
    return subscription.analyses_used < subscription.analyses_limit;
  };

  const remainingAnalyses = () => {
    if (!subscription) return 0;
    if (subscription.plan === 'pro' || subscription.plan === 'enterprise') return Infinity;
    return Math.max(0, subscription.analyses_limit - subscription.analyses_used);
  };

  const incrementUsage = async () => {
    if (!user) return false;
    
    const { data, error } = await supabase.rpc('increment_analysis_count', {
      p_user_id: user.id
    });

    if (!error && data) {
      setSubscription(prev => prev ? {
        ...prev,
        analyses_used: prev.analyses_used + 1
      } : null);
    }

    return data ?? false;
  };

  return {
    subscription,
    loading,
    canAnalyze,
    remainingAnalyses,
    incrementUsage,
  };
};