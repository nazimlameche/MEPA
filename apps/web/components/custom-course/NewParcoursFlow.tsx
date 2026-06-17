'use client';

import { useState } from 'react';
import ConsentBanner from './ConsentBanner';
import ThemeForm from './ThemeForm';

export default function NewParcoursFlow() {
  const [consented, setConsented] = useState(false);

  return (
    <>
      <ConsentBanner onConsent={() => setConsented(true)} />
      {consented && <ThemeForm />}
    </>
  );
}
