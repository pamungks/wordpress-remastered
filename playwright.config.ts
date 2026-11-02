import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright drives a real browser against the running WordPress that wp-env
 * boots (default dev instance on http://localhost:8888). Tests assert on what
 * the site actually serves — the single seam for the whole lean base.
 */
export default defineConfig( {
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: 'list',
	use: {
		baseURL: process.env.WP_BASE_URL ?? 'http://localhost:8888',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],
} );
