'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const [parentEmail, setParentEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
          <Mail className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">Email envoyé !</h2>
        <p className="text-sm text-gray-600">
          Un email de demande de consentement a été envoyé à ton parent ou tuteur légal.
          Ton compte sera activé dès validation.
        </p>
        <button onClick={() => router.push('/login')}
          className="mt-4 text-primary-600 text-sm font-medium hover:underline">
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="flex gap-3 p-4 rounded-xl bg-warning-50 border border-warning-500/20">
        <ShieldCheck className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-semibold">Consentement parental requis</p>
          <p>
            Conformément au <strong>RGPD (Art. 8)</strong> et à la réglementation CNIL, les
            personnes de moins de 15 ans doivent obtenir l&apos;autorisation d&apos;un
            parent ou tuteur légal avant d&apos;utiliser cette plateforme.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="parentEmail" className="text-sm font-medium text-gray-700">
          Email du parent ou tuteur légal
        </label>
        <input
          id="parentEmail"
          type="email"
          required
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          placeholder="parent@exemple.fr"
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
        />
      </div>

      <label className="flex gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded accent-primary-500"
        />
        <span className="text-sm text-gray-600">
          Je confirme que l&apos;adresse email saisie est celle de mon parent ou tuteur légal,
          et qu&apos;il sera informé de ma demande d&apos;inscription.
        </span>
      </label>

      <button type="submit" disabled={!agreed || loading}
        className="w-full rounded-xl bg-primary-500 text-white font-semibold py-2.5 text-sm hover:bg-primary-600 transition disabled:opacity-60">
        {loading ? 'Envoi…' : 'Envoyer la demande au parent'}
      </button>
    </form>
  );
}
