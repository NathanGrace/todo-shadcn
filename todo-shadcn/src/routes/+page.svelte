
<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api.js';
	import { z } from 'zod';
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import type { Id } from "../convex/_generated/dataModel";
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import { SignIn, SignedIn, SignedOut, UserButton, useClerkContext } from 'svelte-clerk';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const client = useConvexClient();
	const clerk = useClerkContext();

	// Only create the query when user is authenticated and loaded
	let query = $derived(
			clerk.isLoaded && clerk.user && clerk.session
					? useQuery(api.todos.getTodo, {})
					: { data: undefined, isLoading: false, error: null }
	);

	let text = $state('');
	let error = $state('');
	let isSubmitting = $state(false);

	// Get user and session from clerk context
	let currentUser = $derived(clerk.user);
	let session = $derived(clerk.session);

	// Set up auth when user loads
	$effect(() => {
		if (currentUser && session) {
			updateAuth();
		}
	});

	async function updateAuth() {
		if (session) {
			try {
				client.setAuth(async () => {
					const token = await session.getToken({ template: 'convex' });
					return token;
				});
			} catch (error) {
				console.error('Failed to set auth:', error);
			}
		} else {
			// Clear auth when no session
			client.setAuth(async () => null);
		}
	}

	// Use reactive data from convex-svelte, fallback to SSR data
	let todoList = $derived(query.data || data.todos || []);
	let isLoading = $derived(
			!clerk.isLoaded ||
			(clerk.isLoaded && clerk.user && query.isLoading && todoList.length === 0)
	);
	let hasError = $derived(query.error);

	// Zod schema
	const todoSchema = z.object({
		text: z.string().min(1, 'You want to do nothing? Brilliant! Just don\'t add it...').trim(),
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Zod validation
		const result = todoSchema.safeParse({ text });

		if (!result.success) {
			error = result.error.issues[0].message;
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			await client.mutation(api.todos.addTodo, {
				text: result.data.text // Use validated data
			});

			// Success - clear form
			text = '';

		} catch (err) {
			error = 'Failed to add todo';
		} finally {
			isSubmitting = false;
		}
	}

	// Optional: Real-time validation on blur
	function validateOnBlur() {
		if (!text) return; // Don't show error on empty until submit

		const result = todoSchema.safeParse({ text });
		if (!result.success) {
			error = result.error.issues[0].message;
		} else {
			error = '';
		}
	}

	async function toggleTodoCheckbox(todoId: Id<"todos">, completed: boolean) {
		try {
			await client.mutation(api.todos.toggleTodo, {
				id: todoId
			});
		} catch (error) {
			console.error('Failed to update todo:', error);
			// Optionally revert the checkbox state or show an error message
		}
	}

	async function deleteTodoAction(todoId: Id<"todos">) {
		try {
			await client.mutation(api.todos.deleteTodo, {
				id: todoId
			});
		} catch (error) {
			console.error('Failed to delete todo:', error);
		}
	}
</script>

<SignedOut>
	<div class="flex justify-center mt-12">
		<SignIn />
	</div>
</SignedOut>

<SignedIn>
	<div class="fixed top-4 right-4 z-50">
		<UserButton />
	</div>
	<div class="flex justify-center mt-24">
		<Card.Root class="w-full max-w-sm">
			<Card.Header class="flex flex-col items-start space-y-1">
				<Card.Title>Todo List</Card.Title>
			</Card.Header>
			<Card.Content>
				<form onsubmit={handleSubmit} class="w-full max-w-sm">
					<div class="flex items-center space-x-2">
						<div class="flex-1">
							<Input
									bind:value={text}
									onblur={validateOnBlur}
									oninput={() => error = ''}
									placeholder="Enter todo..."
									class={error ? 'border-red-500' : ''}
									disabled={isSubmitting}
							/>
						</div>
						<Button type="submit" class="w-12" disabled={isSubmitting}>
							{#if isSubmitting}
								...
							{:else}
								Add
							{/if}
						</Button>
					</div>
					<!-- Only show error container when there's an error -->
					{#if error}
						<div class="mt-1">
							<p class="text-red-500 text-sm">{error}</p>
						</div>
					{/if}
				</form>
			</Card.Content>
			<Card.Footer>
				{#if isLoading}
					Loading...
				{:else if hasError}
					failed to load: {hasError.toString()}
				{:else}
					<ul class="w-full space-y-2">
						{#each todoList as todo (todo._id)}
							<li class="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
								<label class="flex items-center gap-2 cursor-pointer select-none flex-1">
									<Checkbox
											bind:checked={todo.completed}
											onCheckedChange={(checked) => toggleTodoCheckbox(todo._id, checked)}
									/>
									<span class={todo.completed ? 'line-through text-gray-500' : ''}>
                                        {todo.text}
                                    </span>
								</label>
								<button
										onclick={() => deleteTodoAction(todo._id)}
										class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
										title="Delete todo"
								>
									<TrashIcon class="h-4 w-4" />
								</button>
							</li>
						{/each}

						{#if todoList.length === 0}
							<li class="text-center text-gray-500 py-4">
								No todos yet. Add one above!
							</li>
						{/if}
					</ul>
				{/if}
			</Card.Footer>
		</Card.Root>
	</div>
</SignedIn>