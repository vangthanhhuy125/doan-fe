'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CycleWizardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/clpi-models/cycles');
  }, [router]);

  return null;
}