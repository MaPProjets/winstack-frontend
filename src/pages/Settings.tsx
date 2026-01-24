import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Crown, Upload, Trash2, Building2, Check, X, Plus, Briefcase, MapPin, Users, Award, Code, FileCheck } from 'lucide-react';

const CERTIFICATIONS_OPTIONS = [
  'ISO 9001', 'ISO 27001', 'ISO 14001', 'RGE', 'Qualiopi', 
  'RGPD', 'HDS', 'SOC 2', 'PCI DSS', 'ITIL', 'PRINCE2', 'Agile/Scrum'
];

const TECHNOLOGIES_OPTIONS = [
  // CMS
  'WordPress', 'Drupal', 'Joomla', 'Magento', 'Shopify', 'PrestaShop', 'WooCommerce',
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
  // Backend
  'Node.js', 'Python', 'Java', '.NET', 'PHP', 'Ruby', 'Go', 'Rust',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
  // Base de données
  'PostgreSQL', 'MySQL', 'MongoDB', 'Elasticsearch', 'Redis',
  // CRM & ERP
  'Salesforce', 'SAP', 'HubSpot', 'Odoo',
  // Design & Création
  'Adobe Photoshop', 'Illustrator', 'InDesign', 'Sketch', 'Figma', 'Adobe XD', 'Canva',
  // SEO & Marketing
  'Yoast', 'RankMath', 'SEMrush', 'Google Analytics', 'Google Tag Manager',
  // Email & Ads
  'Mailjet', 'Mailchimp', 'SendGrid', 'Google Ads', 'AdSense', 'Meta Ads',
  // Performance
  'WP-Rocket', 'Cloudflare', 'Varnish',
  // API & Tourisme (pour AO type Office de Tourisme)
  'Tourinsoft', 'Apidae', 'LEI', 'Ingénie', 'Open System',
  // Affiliation
  'Amazon Affiliates', 'Awin', 'Ezoic'
];

const REFERENCES_OPTIONS = [
  '0', '1-2', '3-5', '6-10', '10-20', '20+'
];

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, refetch } = useSubscription();
  const navigate = useNavigate();
  
  // États pour le branding
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // États pour le profil entreprise
  const [companyRevenue, setCompanyRevenue] = useState('');
  const [companyEmployees, setCompanyEmployees] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyReferences, setCompanyReferences] = useState(''); // NOUVEAU
  const [companyCertifications, setCompanyCertifications] = useState<string[]>([]);
  const [companyTechnologies, setCompanyTechnologies] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [customTechnology, setCustomTechnology] = useState('');
  const [customCertification, setCustomCertification] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('subscriptions')
        .select('company_name, logo_url, company_revenue, company_certifications, company_technologies, company_location, company_employees, company_references')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setCompanyName(data.company_name || '');
        setLogoUrl(data.logo_url);
        setCompanyRevenue(data.company_revenue || '');
        setCompanyEmployees(data.company_employees || '');
        setCompanyLocation(data.company_location || '');
        setCompanyReferences(data.company_references || ''); // NOUVEAU
        setCompanyCertifications(data.company_certifications || []);
        setCompanyTechnologies(data.company_technologies || []);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 2 Mo' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-logo.${fileExt}`;

    if (logoUrl) {
      const oldPath = logoUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    const newLogoUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ logo_url: newLogoUrl })
      .eq('user_id', user.id);

    if (updateError) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } else {
      setLogoUrl(newLogoUrl);
      setMessage({ type: 'success', text: 'Logo mis à jour !' });
    }

    setUploading(false);
  };

  const handleDeleteLogo = async () => {
    if (!user || !logoUrl) return;

    const fileName = logoUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('logos').remove([fileName]);
    }

    await supabase
      .from('subscriptions')
      .update({ logo_url: null })
      .eq('user_id', user.id);

    setLogoUrl(null);
    setMessage({ type: 'success', text: 'Logo supprimé' });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        company_name: companyName,
        company_revenue: companyRevenue,
        company_employees: companyEmployees,
        company_location: companyLocation,
        company_references: companyReferences, // NOUVEAU
        company_certifications: companyCertifications,
        company_technologies: companyTechnologies,
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } else {
      setMessage({ type: 'success', text: 'Profil entreprise sauvegardé !' });
      refetch();
    }

    setSaving(false);
  };

  // Certifications
  const addCertification = (cert: string) => {
    if (cert && !companyCertifications.includes(cert)) {
      setCompanyCertifications([...companyCertifications, cert]);
    }
    setNewCertification('');
  };

  const addCustomCertification = () => {
    const cert = customCertification.trim();
    if (cert && !companyCertifications.includes(cert)) {
      setCompanyCertifications([...companyCertifications, cert]);
    }
    setCustomCertification('');
  };

  const removeCertification = (cert: string) => {
    setCompanyCertifications(companyCertifications.filter(c => c !== cert));
  };

  // Technologies
  const addTechnology = (tech: string) => {
    if (tech && !companyTechnologies.includes(tech)) {
      setCompanyTechnologies([...companyTechnologies, tech]);
    }
    setNewTechnology('');
  };

  const addCustomTechnology = () => {
    const tech = customTechnology.trim();
    if (tech && !companyTechnologies.includes(tech)) {
      setCompanyTechnologies([...companyTechnologies, tech]);
    }
    setCustomTechnology('');
  };

  const removeTechnology = (tech: string) => {
    setCompanyTechnologies(companyTechnologies.filter(t => t !== tech));
  };

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground mb-8">Personnalisez vos exports et votre profil entreprise</p>

          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' && <Check className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {!isPro ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Fonctionnalité Pro</h2>
              <p className="text-muted-foreground mb-6">
                Personnalisez vos exports PDF et calculez votre score de compatibilité avec chaque appel d'offres.
              </p>
              <Button onClick={() => navigate('/pricing')} className="gap-2">
                <Crown className="w-4 h-4" />
                Passer au Plan Pro
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Nom de l'entreprise */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Nom de l'entreprise</h2>
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Votre entreprise"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              {/* Logo */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Logo de l'entreprise</h2>
                </div>
                
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-16 w-auto object-contain border border-border rounded-lg p-2"
                    />
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                          <Upload className="w-4 h-4" />
                          Changer
                        </span>
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteLogo}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-foreground font-medium">
                        {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter votre logo'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG jusqu'à 2 Mo
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Séparateur */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Profil entreprise</h2>
                <p className="text-muted-foreground mb-6">
                  Ces informations servent à calculer votre score de compatibilité avec chaque appel d'offres.
                </p>
              </div>

              {/* CA et Effectif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Chiffre d'affaires</h2>
                  </div>
                  <select
                    value={companyRevenue}
                    onChange={(e) => setCompanyRevenue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionner</option>
                    <option value="0-100k">0 - 100 000 €</option>
                    <option value="100k-500k">100 000 € - 500 000 €</option>
                    <option value="500k-1m">500 000 € - 1 M€</option>
                    <option value="1m-5m">1 M€ - 5 M€</option>
                    <option value="5m-10m">5 M€ - 10 M€</option>
                    <option value="10m+">Plus de 10 M€</option>
                  </select>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Effectif</h2>
                  </div>
                  <select
                    value={companyEmployees}
                    onChange={(e) => setCompanyEmployees(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">Auto-entrepreneur</option>
                    <option value="2-10">2-10 salariés</option>
                    <option value="11-50">11-50 salariés</option>
                    <option value="51-200">51-200 salariés</option>
                    <option value="200+">Plus de 200 salariés</option>
                  </select>
                </div>
              </div>

              {/* Références et Localisation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NOUVEAU : Références */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileCheck className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Références similaires</h2>
                  </div>
                  <select
                    value={companyReferences}
                    onChange={(e) => setCompanyReferences(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionner</option>
                    <option value="0">Aucune référence</option>
                    <option value="1-2">1-2 références</option>
                    <option value="3-5">3-5 références</option>
                    <option value="6-10">6-10 références</option>
                    <option value="10-20">10-20 références</option>
                    <option value="20+">Plus de 20 références</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Nombre de projets similaires réalisés
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Zone d'intervention</h2>
                  </div>
                  <select
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionner</option>
                    <option value="local">Local (ville/département)</option>
                    <option value="regional">Régional</option>
                    <option value="france">France entière</option>
                    <option value="europe">Europe</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Certifications</h2>
                </div>
                
                {companyCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {companyCertifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-full text-sm"
                      >
                        {cert}
                        <button
                          onClick={() => removeCertification(cert)}
                          className="hover:bg-secondary/80 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <select
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Choisir une certification</option>
                    {CERTIFICATIONS_OPTIONS.filter(c => !companyCertifications.includes(c)).map((cert) => (
                      <option key={cert} value={cert}>{cert}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => addCertification(newCertification)}
                    disabled={!newCertification}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Champ pour ajout manuel */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCertification}
                    onChange={(e) => setCustomCertification(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomCertification()}
                    placeholder="Ou ajouter manuellement..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <Button
                    onClick={addCustomCertification}
                    disabled={!customCertification.trim()}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Technologies */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Technologies maîtrisées</h2>
                </div>
                
                {companyTechnologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {companyTechnologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-full text-sm"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(tech)}
                          className="hover:bg-secondary/80 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Sélecteur depuis la liste */}
                <div className="flex gap-2 mb-3">
                  <select
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Choisir dans la liste</option>
                    {TECHNOLOGIES_OPTIONS.filter(t => !companyTechnologies.includes(t)).map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => addTechnology(newTechnology)}
                    disabled={!newTechnology}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Champ pour ajout manuel */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTechnology}
                    onChange={(e) => setCustomTechnology(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTechnology()}
                    placeholder="Ou ajouter manuellement (ex: WP-Rocket, Mailjet...)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <Button
                    onClick={addCustomTechnology}
                    disabled={!customTechnology.trim()}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Astuce : Vous pouvez ajouter n'importe quelle technologie manuellement
                </p>
              </div>

              {/* Bouton Sauvegarder */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full h-12 text-base font-medium"
              >
                {saving ? 'Sauvegarde en cours...' : 'Sauvegarder le profil'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;