import { AlertTriangle } from 'lucide-react';

export default function ModerationBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-warning-50 border border-warning-500/30 p-3">
      <AlertTriangle className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" />
      <p className="text-xs text-warning-700 leading-relaxed">
        <strong>Important :</strong> L&apos;IA peut se tromper. Les réponses générées sont à titre pédagogique et
        ne constituent pas un avis professionnel. Si un message a été filtré, c&apos;est parce qu&apos;il ne respecte
        pas les règles de la plateforme.
      </p>
    </div>
  );
}
