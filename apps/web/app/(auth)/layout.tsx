export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-primary-600">AI-Edu</h1>
          <p className="text-gray-500 text-sm mt-1">Apprendre l&apos;IA autrement</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
