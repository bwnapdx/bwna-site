import { defineCollection, z } from 'astro:content';

const newsletters = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    issue: z.string(),                    // "Jan-Feb 2026" (display)
    issueSlug: z.string(),                // "2026-01" (grouping/sorting)
    date: z.coerce.date(),
    author: z.string().optional(),
    category: z.enum([
      'presidents-message',
      'community-news',
      'land-use',
      'parks',
      'safety',
      'schools',
      'business',
      'events',
      'history',
      'environment',
      'opinion',
      'announcements',
      'volunteer',
      'other',
    ]).default('community-news'),
    featured: z.boolean().default(false),
    page: z.number().optional(),          // page in the PDF
    pdfFile: z.string().optional(),       // "bwna-2026-01.pdf"
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    time: z.string(),
    location: z.string(),
    address: z.string().optional(),
    type: z.enum(['meeting', 'community', 'social', 'tour']),
    scope: z.enum(['bwna', 'neighborhood', 'city']).default('bwna'),
    recurring: z.boolean().default(false),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { newsletters, events };
