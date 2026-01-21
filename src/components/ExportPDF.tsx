import { Download } from 'lucide-react';

interface ExportPDFProps {
  contentId: string;
  filename: string;
}

export const ExportPDF = ({ contentId, filename }: ExportPDFProps) => {
  const handleExport = async () => {
    const element = document.getElementById(contentId);
    if (!element) return;

    // Import dynamique pour éviter les erreurs SSR
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: [15, 15, 25, 15],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      Exporter en PDF
    </button>
  );
};