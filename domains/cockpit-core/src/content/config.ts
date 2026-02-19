import { defineCollection, z } from 'astro:content';

const tasks = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		phase: z.string(),
		status: z.enum(['pending', 'doing', 'done']),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		order: z.number().optional(),
	}),
});

export const collections = {
	'tasks': tasks,
};
