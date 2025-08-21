<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
		import * as Card from "$lib/components/ui/card/index.js";
		import { Input } from "$lib/components/ui/input/index.js";
		import { useConvexClient, useQuery } from 'convex-svelte';
		import { api } from '../convex/_generated/api.js';
		import { z } from 'zod';
		import { Checkbox } from "$lib/components/ui/checkbox/index.js";
		import type {Id} from "../convex/_generated/dataModel";
		import TrashIcon from "@lucide/svelte/icons/trash-2";
		import { SignIn, SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';




		const client = useConvexClient();
		const query = useQuery(api.todos.getTodo, {});

		let text = $state('');
		let error = $state('');
		let isSubmitting = $state(false);

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
					id: todoId,
					completed: completed
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
	<!--	<SignInButton />-->
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
				{#if query.isLoading}
					Loading...
				{:else if query.error}
					failed to load: {query.error.toString()}
				{:else}
					<ul class="w-full">
						{#each query.data as todos}
							<li class="flex items-center justify-between gap-2">
								<label class="flex items-center gap-2 cursor-pointer select-none">
									<Checkbox
											bind:checked={todos.completed}
											onCheckedChange={(checked) => toggleTodoCheckbox(todos._id, checked)}
									/>
									<span>{todos.text}</span>
								</label>
								<button
										onclick={() => deleteTodoAction(todos._id)}
										class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
										title="Delete todo"
								>
									<TrashIcon class="h-4 w-4" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Footer>
		</Card.Root>
	</div>
</SignedIn>