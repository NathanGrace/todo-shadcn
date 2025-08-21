import { createServerConvex } from '$lib/convex-server.js';
import { api } from '../convex/_generated/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { userId } = locals.auth();

    if (!userId) {
        return { todos: [] };
    }

    const convex = await createServerConvex(locals);

    try {
        const todos = await convex.query(api.todos.getTodo);
        return { todos };
    } catch (error) {
        console.error('Failed to load todos:', error);
        return { todos: [] };
    }
};