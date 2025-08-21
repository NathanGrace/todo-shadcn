<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
		import type { Snippet } from 'svelte';
		import { ClerkProvider } from 'svelte-clerk';
		import { ModeWatcher } from "mode-watcher";
    import { PUBLIC_CONVEX_URL } from '$env/static/public';
    import { setupConvex } from 'convex-svelte';
		import SunIcon from "@lucide/svelte/icons/sun";
		import MoonIcon from "@lucide/svelte/icons/moon";

		import { toggleMode } from "mode-watcher";
		import { Button } from "$lib/components/ui/button/index.js";

		const { children }: { children: Snippet } = $props();
		setupConvex(PUBLIC_CONVEX_URL);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>


<ClerkProvider>

	<ModeWatcher />
	<Button onclick={toggleMode} variant="outline" size="icon" class="fixed top-4 left-4 z-50">
		<SunIcon
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
		/>
		<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>

	{@render children?.()}

</ClerkProvider>
