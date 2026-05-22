'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface GeneratedCourse {
  title: string;
  sections: Array<{ heading: string; content: string }>;
  exercises: Array<{ question: string; hint: string }>;
}

export default function CustomCoursePage() {
  const [interests, setInterests] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCourse(null);

    const interestList = interests.split(',').map((i) => i.trim()).filter(Boolean);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/custom-course/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: interestList, level }),
      credentials: 'include',
    });

    setLoading(false);

    if (!res.ok) {
      setError('Erreur lors de la génération du cours.');
      return;
    }

    setCourse(await res.json() as GeneratedCourse);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Cours Sur-Mesure</h1>
        <p className="text-sm text-gray-500 mt-1">Génère un cours personnalisé basé sur tes centres d&apos;intérêt.</p>
      </div>

      <form onSubmit={(e) => void generate(e)} className="space-y-4 bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
        <div className="space-y-1">
          <label htmlFor="interests" className="text-sm font-medium text-gray-700">
            Tes centres d&apos;intérêt <span className="text-gray-400">(séparés par des virgules)</span>
          </label>
          <input id="interests" type="text" value={interests} onChange={(e) => setInterests(e.target.value)}
            placeholder="musique, sport, jeux vidéo…" required
            className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
          <p className="text-xs text-gray-400">Ne saisit pas ton nom, email ou informations personnelles.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="level" className="text-sm font-medium text-gray-700">Niveau</label>
          <select id="level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}
            className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm bg-white focus:border-primary-500 outline-none transition">
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
        </div>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 text-white font-semibold px-5 py-2.5 text-sm hover:bg-primary-600 transition disabled:opacity-60">
          <Sparkles className="h-4 w-4" />
          {loading ? 'Génération…' : 'Générer mon cours'}
        </button>
      </form>

      {course && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-gray-900">{course.title}</h2>
          {course.sections.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{s.heading}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
          {course.exercises.length > 0 && (
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <h3 className="font-display font-semibold text-primary-700 mb-3">Exercices</h3>
              <ul className="space-y-3">
                {course.exercises.map((ex, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <p className="font-medium">{ex.question}</p>
                    <p className="text-gray-400 text-xs mt-0.5">💡 {ex.hint}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
