import { test, expect } from '@playwright/test';

/**
 * The walking-skeleton smoke test.
 *
 * It proves the complete path — stock core + the Remastered plugin + the
 * Remastered block theme, booted by wp-env — is wired together, by asserting
 * on what a browser actually gets from the running site. It never inspects
 * theme.json or hook wiring directly; only observable output.
 */
test.describe( 'lean base: walking skeleton', () => {
	test( 'the homepage returns a successful, rendered response', async ( {
		page,
	} ) => {
		const response = await page.goto( '/' );

		expect( response, 'homepage should respond' ).not.toBeNull();
		expect( response!.status() ).toBe( 200 );

		// Something actually rendered (the default "Hello world!" post).
		await expect( page.locator( 'body' ) ).not.toBeEmpty();
	} );

	test( 'the page is served by the Remastered block theme', async ( {
		page,
		request,
	} ) => {
		await page.goto( '/' );

		// The active block theme enqueues its own stylesheet, so the live page
		// links the Remastered theme's style.css. This is how we observe which
		// theme is live without reading the filesystem or logging in.
		const href = await page
			.locator(
				'link[rel="stylesheet"][href*="/wp-content/themes/remastered/"]'
			)
			.first()
			.getAttribute( 'href' );
		expect(
			href,
			'the Remastered theme stylesheet should be linked on the homepage'
		).toBeTruthy();

		// And it actually resolves on the running site — proving the theme is
		// active and serving its assets, not just named in the markup.
		const asset = await request.get( href! );
		expect( asset.status() ).toBe( 200 );
	} );
} );
