import { createClient } from "@sanity/client";

const projectId =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_PROJECT_ID) ||
    process.env.PUBLIC_SANITY_PROJECT_ID;

const dataset =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_DATASET) ||
    process.env.PUBLIC_SANITY_DATASET ||
    "production";

export const client = createClient({
    projectId,
    dataset,
    useCdn: true,
    apiVersion: "2023-05-03",
});
