// src/lib/convex-server.ts
import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

export async function createServerConvex(locals: RequestEvent['locals']) {
    const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

    const { userId, getToken } = locals.auth();

    if (userId && getToken) {
        try {
            const token = await getToken({ template: 'convex' });
            if (token !== null) {
                convex.setAuth(token);
            }
        } catch (error) {
            console.error('Failed to get auth token:', error);
        }
    }

    return convex;
}