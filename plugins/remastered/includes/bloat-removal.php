<?php
/**
 * Bloat removal: a conservative first set.
 *
 * Switches off well-known default WordPress output that a lean store doesn't
 * need. Plumbing only — no settings, no front-end chrome. Everything here is
 * done by unhooking or filtering; core is never edited, and nothing below
 * disables wp-admin, the block editor, or the REST API they depend on.
 *
 * The exhaustive bloat list is still open (see CONTEXT.md); add to it here.
 *
 * @package Remastered
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Emoji: the detection script, its inline styles, and the CDN image swaps in
 * feeds and email. Every modern browser renders emoji natively.
 */
function remastered_remove_emoji() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'embed_head', 'print_emoji_detection_script' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );

	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'enqueue_embed_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'admin_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );

	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
// On a front-end request `init` is late enough to catch the emoji hooks that
// `default-filters.php` registered. On an admin request wp-settings.php fires
// `init` BEFORE wp-admin/admin.php pulls in admin-filters.php, so the admin
// emoji hooks don't exist yet at init time — they're registered just before
// `admin_init`, which is where we unhook them.
add_action( 'init', 'remastered_remove_emoji' );
add_action( 'admin_init', 'remastered_remove_emoji' );

/**
 * Discovery links in <head> and the HTTP Link header: RSD, wlwmanifest,
 * shortlink, REST API, and oEmbed. The REST API and embeds keep working; only
 * the advertising of them goes.
 */
function remastered_remove_discovery_links() {
	remove_action( 'wp_head', 'rsd_link' );
	// `wlwmanifest_link` was dropped from core in WP 6.3 and this plugin
	// requires 6.4+, so no removal is needed.

	remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
	remove_action( 'template_redirect', 'wp_shortlink_header', 11 );

	remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
	remove_action( 'template_redirect', 'rest_output_link_header', 11 );

	remove_action( 'wp_head', 'wp_oembed_add_discovery_links', 4 );
	remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
}
add_action( 'init', 'remastered_remove_discovery_links' );

/**
 * The generator tag, which advertises the WordPress version. Filtering it
 * empties it everywhere it prints — page <head> and feeds alike.
 */
add_filter( 'the_generator', '__return_empty_string' );

/**
 * Extra feed links: the comments feed, and the per-post / category / tag /
 * search feeds. The one main site feed stays — it's useful to readers.
 */
function remastered_remove_extra_feed_links() {
	add_filter( 'feed_links_show_comments_feed', '__return_false' );
	remove_action( 'wp_head', 'feed_links_extra', 3 );
}
add_action( 'init', 'remastered_remove_extra_feed_links' );

/**
 * Default dashboard widgets. The dashboard itself stays; it just starts empty.
 * Core's security nags (PHP and browser version) are deliberately kept.
 */
function remastered_remove_dashboard_widgets() {
	remove_meta_box( 'dashboard_site_health', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_right_now', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_activity', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
}
add_action( 'wp_dashboard_setup', 'remastered_remove_dashboard_widgets' );
