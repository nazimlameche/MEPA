'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProgress(): Promise<void> {
  revalidatePath('/dashboard');
  revalidatePath('/(app)', 'layout'); // topbar XP/streak
  revalidatePath('/modules/theory');  // LearningPath — statut completed des leçons
}

/** Invalide le cache du module Cours Sur-Mesure (après delete / change de thème) */
export async function revalidateParcours(): Promise<void> {
  revalidatePath('/modules/custom-course');
}
