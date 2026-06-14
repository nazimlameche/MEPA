'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProgress(): Promise<void> {
  revalidatePath('/dashboard');
  revalidatePath('/(app)', 'layout'); // topbar XP/streak
}
