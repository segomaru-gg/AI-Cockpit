import { client } from './sanity';
import { AERTERNUM_ITEMS } from '../data/items';

/**
 * Migration Script: local items.ts -> Sanity
 * Run this with `npx astro sync` or as a standalone node script.
 * Requires a SANITY_WRITE_TOKEN in .env
 */
async function migrate() {
    const writeClient = client.withConfig({
        token: process.env.SANITY_WRITE_TOKEN,
        useCdn: false,
    });

    console.log('Starting migration...');

    for (const item of AERTERNUM_ITEMS) {
        const doc = {
            _type: 'shushuanItem',
            _id: item.id,
            name: item.name,
            category: item.category, // You might need to map these to the new enum
            era: item.era,
            story: item.story,
            status: item.status,
            price: item.price,
            tags: item.tags,
        };

        try {
            await writeClient.createOrReplace(doc);
            console.log(`Migrated: ${item.name}`);
        } catch (err) {
            console.error(`Failed to migrate ${item.name}:`, err);
        }
    }

    console.log('Migration complete.');
}

// Check for token first
if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('Error: SANITY_WRITE_TOKEN is missing in .env');
} else {
    migrate();
}
