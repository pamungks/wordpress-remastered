<?php
/**
 * Remastered theme bootstrap.
 *
 * Standard block-theme plumbing: enqueue the theme's own stylesheet on the
 * front end. It's empty today, but it's where the theme's own CSS lives, so it
 * stays enqueued and the global styles / design system build on it in a later
 * ticket. A useful side effect for the walking skeleton is that the live page
 * then references this theme's directory, which is how the smoke test observes
 * that the Remastered theme is the one actually serving pages.
 *
 * @package Remastered
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_enqueue_style(
			'remastered-style',
			get_stylesheet_uri(),
			array(),
			wp_get_theme()->get( 'Version' )
		);
	}
);
