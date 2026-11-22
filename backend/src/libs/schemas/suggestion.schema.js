import { z } from 'zod';

// Citizen suggests a project to their ward
export const createSuggestionSchema = z.object({
  title: z.string().trim().min(5).max(150),

  category: z.string().trim().min(2).max(100),

  // Why the project is needed
  description: z.string().trim().min(20).max(3000),
});
