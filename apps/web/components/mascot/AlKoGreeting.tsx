'use client';

import AlKo from './AlKo';

/**
 * Al-Ko inline à côté du titre "Bonjour" sur le dashboard.
 * Fait coucou et affiche des tips IA rotatifs depuis lib/alko-tips.ts
 */
export default function AlKoGreeting() {
  return (
    <AlKo
      variant="wave"
      size={72}
      hideName
      tipInterval={6000}
      bubbleOffsetX={-134}
      bubbleOffsetY={30}
    />
  );
}
