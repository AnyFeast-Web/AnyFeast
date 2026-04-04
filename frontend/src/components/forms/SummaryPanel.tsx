import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Download } from 'lucide-react';
import { Button } from '../ui';
import type { FullConsultationForm } from '../../types/consultationForm.types';
import { generateConsultationSummary, exportConsultationPDF } from '../../utils/consultationUtils';

interface SummaryPanelProps {
  form: FullConsultationForm;
}

export function SummaryPanel({ form }: SummaryPanelProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const summary = generateConsultationSummary(form);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={() => setShowSummary(!showSummary)}
          className="flex-1"
        >
          {showSummary ? 'Hide Summary' : 'Generate Summary'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={() => exportConsultationPDF(form)}
        >
          PDF
        </Button>
      </div>

      {showSummary && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative"
        >
          <pre className="text-xs text-text-primary bg-bg-input border border-border-subtle rounded-md p-3 overflow-auto max-h-[300px] whitespace-pre-wrap font-body leading-relaxed">
            {summary}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-bg-surface border border-border-subtle text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
