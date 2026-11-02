import { test, expect, type APIResponse, type Page } from '@playwright/test';

/**
 * Bloat removal.
 *
 * With the Remastered plugin active, a conservative first set of default
 * WordPress bloat is gone from what the running site serves — while wp-admin
 * and the block editor keep working. Every assertion is on observable output
 * (raw HTML, response headers, admin pages), never on which hook was touched.
 */

// A single post: the default "Hello world!" that wp-env seeds. Shortlink,
// oEmbed, and per-post feed links only appear on singular views, so the
// homepage alone would not prove they are gone.
const PAGES = [
	{ name: 'homepage', path: '/' },
	{ name: 'single post', path: '/?p=1' },
];

// wp-env's documented default admin account.
const ADMIN_USER = process.env.WP_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.WP_PASSWORD ?? 'password';

async function logIn( page: Page ) {
	await page.goto( '/wp-login.php' );
	await page.locator( '#user_login' ).fill( ADMIN_USER );
	await page.locator( '#user_pass' ).fill( ADMIN_PASSWORD );
	await Promise.all( [
		page.waitForURL( /\/wp-admin\/?/, { timeout: 60_000 } ),
		page.locator( '#wp-submit' ).click(),
	] );
}

function linkHeader( response: APIResponse ) {
	return response.headers()[ 'link' ] ?? '';
}

/**
 * Asserts `pattern` matches nowhere in `output`. On failure it reports just
 * the offending snippet, not the whole page.
 */
function expectAbsent( output: string, pattern: RegExp ) {
	const found = output.match( pattern )?.[ 0 ];
	expect( found, `found bloat: ${ found }` ).toBeUndefined();
}

test.describe( 'lean base: bloat removal on the front end', () => {
	for ( const { name, path } of PAGES ) {
		test.describe( name, () => {
			let html: string;
			let response: APIResponse;

			test.beforeEach( async ( { request } ) => {
				response = await request.get( path );
				expect( response.status() ).toBe( 200 );
				html = await response.text();
			} );

			test( 'serves no emoji scripts or styles', () => {
				expectAbsent( html, /wp-emoji|twemoji|s\.w\.org\/images\/core\/emoji/i );
			} );

			test( 'serves no generator meta tag', () => {
				expectAbsent( html, /<meta[^>]+name=["']generator["'][^>]*>/i );
			} );

			test( 'serves no RSD or wlwmanifest links', () => {
				expectAbsent( html, /<link[^>]+rel=["']EditURI["'][^>]*>/i );
				expectAbsent( html, /xmlrpc\.php\?rsd/ );
				expectAbsent( html, /wlwmanifest/i );
			} );

			test( 'serves no shortlink, in the markup or the headers', () => {
				expectAbsent( html, /<link[^>]+rel=["']shortlink["'][^>]*>/i );
				expectAbsent( linkHeader( response ), /rel=["']?shortlink/i );
			} );

			test( 'serves no oEmbed discovery links', () => {
				expectAbsent( html, /<link[^>]+(json|xml)\+oembed[^>]*>/i );
			} );

			test( 'serves no REST API discovery links, in the markup or the headers', () => {
				expectAbsent( html, /<link[^>]+api\.w\.org[^>]*>/i );
				expectAbsent( html, /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/json["'][^>]*>/i );
				expectAbsent( linkHeader( response ), /api\.w\.org/ );
				expectAbsent( linkHeader( response ), /rel=["']?alternate/i );
			} );

			test( 'keeps the main feed link but serves no extra feed links', () => {
				const feedLinks = html.match(
					/<link[^>]+type=["']application\/rss\+xml["'][^>]*>/gi
				) ?? [];

				// The one site feed is useful to readers, so it stays.
				expect( feedLinks ).toHaveLength( 1 );
				expect( feedLinks[ 0 ] ).toContain( 'feed=rss2' );
				expectAbsent( feedLinks[ 0 ] ?? '', /comments/i );
			} );
		} );
	}

	test( 'the REST API itself still answers — only its discovery links are gone', async ( {
		request,
	} ) => {
		// The block editor talks to the REST API, so hiding the discovery
		// links must never switch the API off.
		const response = await request.get( '/?rest_route=/' );
		expect( response.status() ).toBe( 200 );
		expect( ( await response.json() ).namespaces ).toContain( 'wp/v2' );
	} );
} );

test.describe( 'lean base: wp-admin survives bloat removal', () => {
	// wp-admin is heavy and parallel logins can bounce each other back to
	// wp-login.php (`reauth=1`), so these tests run serially and reuse one
	// browser context whose auth cookies survive across tests.
	test.describe.configure( { mode: 'serial' } );
	test.setTimeout( 120_000 );

	let adminPage: Page;

	test.beforeAll( async ( { browser } ) => {
		// Login against a freshly booted wp-admin can take a while.
		test.setTimeout( 120_000 );
		const context = await browser.newContext();
		adminPage = await context.newPage();
		await logIn( adminPage );
	} );

	test.afterAll( async () => {
		await adminPage.context().close();
	} );

	test( 'the dashboard loads without the default widgets', async () => {
		const response = await adminPage.goto( '/wp-admin/', {
			waitUntil: 'domcontentloaded',
		} );
		expect( response!.status() ).toBe( 200 );
		await expect(
			adminPage.locator( '#dashboard-widgets-wrap' )
		).toBeVisible();

		for ( const widget of [
			'dashboard_site_health',
			'dashboard_right_now',
			'dashboard_activity',
			'dashboard_quick_press',
			'dashboard_primary',
		] ) {
			await expect(
				adminPage.locator( `#${ widget }` ),
				`${ widget } should be removed`
			).toHaveCount( 0 );
		}
	} );

	test( 'the admin serves no emoji scripts or styles', async () => {
		await adminPage.goto( '/wp-admin/', { waitUntil: 'domcontentloaded' } );
		expectAbsent( await adminPage.content(), /wp-emoji|twemoji/i );
	} );

	test( 'the block editor still loads and accepts content', async () => {
		const errors: string[] = [];
		const onError = ( error: Error ) => errors.push( error.message );
		adminPage.on( 'pageerror', onError );

		try {
			await adminPage.goto( '/wp-admin/post-new.php', {
				waitUntil: 'domcontentloaded',
			} );

			// The editor renders the post into its canvas iframe once it has
			// booted and fetched what it needs from the REST API.
			const canvas = adminPage.frameLocator(
				'iframe[name="editor-canvas"]'
			);
			const title = canvas.getByRole( 'textbox', { name: 'Add title' } );
			await expect( title ).toBeVisible( { timeout: 60_000 } );

			await title.fill( 'Bloat-free' );
			await expect( title ).toHaveText( 'Bloat-free' );

			expect(
				errors,
				'the editor should boot without JS errors'
			).toEqual( [] );
		} finally {
			adminPage.off( 'pageerror', onError );
		}
	} );
} );
