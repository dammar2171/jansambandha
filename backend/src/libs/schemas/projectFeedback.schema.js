import { z } from 'zod';

// Create or change a like/dislike reaction
export const createReactionSchema = z.object({
  reaction: z.enum(['LIKE', 'DISLIKE']),
});

// Comment on a project
export const createCommentSchema = z.object({
  comment: z.string().trim().min(1, 'Comment is required').max(1000),
});

// Rate a project 1-5, with an optional note
export const setRatingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  ratingNote: z.string().trim().max(1000).optional(),
});
