import { Download, Crown } from 'lucide-react';
import { useSubscription } from '@/lib/useSubscription';

interface ExportPDFProps {
  contentId: string;
  filename: string;
}

export const ExportPDF = ({ contentId, filename }: ExportPDFProps) => {
  const { subscription } = useSubscription();
  
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  const logoUrl = subscription?.logo_url;
  const companyName = subscription?.company_name;

  const handleExport = async () => {
    const element = document.getElementById(contentId);
    if (!element) return;

    // Créer un wrapper avec l'en-tête personnalisé pour les Pro
    const wrapper = document.createElement('div');
    
    // Ajouter les styles pour éviter les coupures de page
    const style = document.createElement('style');
    style.textContent = `
      .card-professional, 
      .alert-warning, 
      .alert-danger,
      [class*="rounded-2xl"],
      [class*="rounded-xl"] {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      h2 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    `;
    wrapper.appendChild(style);
    
    if (isPro && (logoUrl || companyName)) {
      const header = document.createElement('div');
      header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0 0 20px 0; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb;';
      
      if (logoUrl) {
        const logo = document.createElement('img');
        logo.src = logoUrl;
        logo.style.cssText = 'height: 40px; object-fit: contain;';
        header.appendChild(logo);
      } else {
        header.appendChild(document.createElement('div'));
      }
      
      if (companyName) {
        const name = document.createElement('span');
        name.textContent = companyName;
        name.style.cssText = 'font-size: 14px; font-weight: 500; color: #6b7280;';
        header.appendChild(name);
      }
      
      wrapper.appendChild(header);
    }
    
    // Cloner le contenu
    const content = element.cloneNode(true) as HTMLElement;
    wrapper.appendChild(content);

    // Import dynamique pour éviter les erreurs SSR
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: [15, 15, 20, 15],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.card-professional, .alert-warning, .alert-danger, [class*="rounded"]'
      }
    };
    
    html2pdf().set(opt).from(wrapper).save();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      Exporter en PDF
      {isPro && <Crown className="w-3 h-3 text-primary" />}
    </button>
  );
};