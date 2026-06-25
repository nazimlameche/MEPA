'use client';

import { useState } from 'react';
import ConsentBanner from './ConsentBanner';
import ThemeForm from './ThemeForm';
import type { ParcoursLevel } from '@/lib/types/custom-course';

interface NewParcoursFlowProps {
  defaultLevel: ParcoursLevel;
}

export default function NewParcoursFlow({ defaultLevel }: NewParcoursFlowProps) {
  const [consented, setConsented] = useState(false);

  return (
    <>
      <ConsentBanner onConsent={() => setConsented(true)} />
      {consented && <ThemeForm defaultLevel={defaultLevel} />}
    </>
  );
}
