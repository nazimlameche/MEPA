import type { CourseBlock } from './course';

export type SchoolLevel = 'college' | 'lycee' | 'adulte';

export interface CourseFormData {
  interest: string;
  level: SchoolLevel;
  context: string;
}

export interface GeneratedCourseOutput {
  title: string;
  level: SchoolLevel;
  estimated_duration_minutes: number;
  blocks: CourseBlock[];
}

export interface SavedCourse {
  id: string;
  title: string;
  generatedAt: string;
  level: SchoolLevel;
  estimatedMinutes: number;
  blocks: CourseBlock[];
}
