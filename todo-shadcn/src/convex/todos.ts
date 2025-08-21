import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTodo = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("todos").order("desc").collect();
    },
});

export const toggleTodo = mutation({
    args: { id: v.id("todos"), completed: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { completed: args.completed });
    },
});

export const deleteTodo = mutation({
    args: { id: v.id("todos") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const addTodo = mutation({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("todos", { text: args.text, completed: false });
    },
});