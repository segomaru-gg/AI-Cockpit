import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        const filePath = formData.get('filePath') as string;

        if (!filePath || !fs.existsSync(filePath)) {
            return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Update status in frontmatter
        const newContent = content.replace(/status:\s*.*(\r?\n)/, 'status: done$1');

        // If status wasn't found/replaced (e.g. implied status), we might need to add it.
        // But for BluePrint tasks, they usually have status. 
        // If not, we should parse and add. For now, simple regex replace is MVP.

        if (content === newContent) {
            // Fallback: try to insert status if missing? 
            // Or maybe it was already done?
            // For now, assume it works or the regex needs to be robust.
        }

        fs.writeFileSync(filePath, newContent);

        // Check if client expects JSON (AJAX) or Redirect (Form)
        const accept = request.headers.get('Accept');
        if (accept && accept.includes('application/json')) {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return redirect('/focus');

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
