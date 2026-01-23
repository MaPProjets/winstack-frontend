import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

interface Subscription {
  plan: string;
  analyses_used: number;
  analyses_limit: number;
  company_name: string | null;
  logo_url: string | null;
  company_revenue: string | null;
  company_certifications: string[] | null;
  company_technologies: string[] | null;
  company_location: string | null;
  company_employees: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, analyses_used, analyses_limit, company_name, logo_url, company_revenue, company_certifications, company_technologies, company_location, company_employees')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            analyses_limit: 5,
            analyses_used: 0
          })
          .select('plan, analyses_used, analyses_limit, company_name, logo_url, company_revenue, company_certifications, company_technologies, company_location, company_employees')
          .single();

        if (!insertError && newSub) {
          setSubscription(newSub);
        }
      }
    } else {
      setSubscription(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const canAnalyze = (): boolean => {
    if (!subscription) return false;
    if (subscription.plan === 'pro' || subscription.plan === 'enterprise') return true;
    return subscription.analyses_used < subscription.analyses_limit;
  };

  const remainingAnalyses = (): number | 'illimité' => {
    if (!subscription) return 0;
    if (subscription.plan === 'pro' || subscription.plan === 'enterprise') return 'illimité';
    return Math.max(0, subscription.analyses_limit - subscription.analyses_used);
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (!user || !subscription) return false;
    if (!canAnalyze()) return false;

    const { error } = await supabase
      .from('subscriptions')
      .update({ analyses_used: subscription.analyses_used + 1 })
      .eq('user_id', user.id);

    if (!error) {
      setSubscription(prev => prev ? {
        ...prev,
        analyses_used: prev.analyses_used + 1
      } : null);
      return true;
    }

    return false;
  };

  const hasCompanyProfile = (): boolean => {
    if (!subscription) return false;
    return !!(
      subscription.company_revenue ||
      (subscription.company_certifications && subscription.company_certifications.length > 0) ||
      (subscription.company_technologies && subscription.company_technologies.length > 0)
    );
  };

  return {
    subscription,
    loading,
    canAnalyze,
    remainingAnalyses,
    incrementUsage,
    hasCompanyProfile,
    refetch: fetchSubscription,
  };
};