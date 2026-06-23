import ModerationBanner from '@/components/sandbox/ModerationBanner';
import ChatWindow from '@/components/sandbox/ChatWindow';
import AlKoCorner from '@/components/mascot/AlKoCorner';

export default function SandboxPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Bac à Sable IA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Discute avec un assistant IA pédagogique. Limite : 10 messages par minute.
        </p>
      </div>
      <ModerationBanner />
      <ChatWindow />
      <AlKoCorner position="bottom-right" delay={1000} />
    </div>
  );
}
