import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTodo = query({
    args: {},
    handler: async (ctx) => {
        // Get the authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Query todos for this specific user using their identity subject
        return await ctx.db
            .query("todos")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

export const addTodo = mutation({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Automatically associate with the authenticated user
        return await ctx.db.insert("todos", {
            text: args.text,
            completed: false,
            userId: identity.subject, // This is safe - server-side only
            createdAt: Date.now(),
        });
    },
});

export const toggleTodo = mutation({
    args: { id: v.id("todos") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Get the todo and verify ownership
        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        if (todo.userId !== identity.subject) {
            throw new Error("Unauthorized - not your todo");
        }

        return await ctx.db.patch(args.id, {
            completed: !todo.completed,
        });
    },
});

export const deleteTodo = mutation({
    args: { id: v.id("todos") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Get the todo and verify ownership
        const todo = await ctx.db.get(args.id);
        if (!todo) {
            throw new Error("Todo not found");
        }

        if (todo.userId !== identity.subject) {
            throw new Error("Unauthorized - not your todo");
        }

        return await ctx.db.delete(args.id);
    },
});