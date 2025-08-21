<script lang="ts">
	import { SignIn, SignedIn, SignedOut, UserButton } from 'svelte-clerk';
	import { goto } from '$app/navigation';
</script>

<div style="min-height: 100vh; display: grid; place-items: center; padding: 1.5rem;">
	<SignedOut>
		<SignIn
				signUpUrl="/sign-up"
				afterSignInUrl="/"
		/>
	</SignedOut>

	<SignedIn>
		<div style="display: grid; gap: 0.75rem; text-align: center;">
			<p>You’re already signed in.</p>
			<div style="justify-self: center;">
				<UserButton />
			</div>
			<button
					type="button"
					on:click={() => goto('/')}
					style="padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #ddd; background: white; cursor: pointer;"
			>
				Go to app
			</button>
		</div>
	</SignedIn>
</div>