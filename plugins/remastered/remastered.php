<?php
/**
 * Plugin Name:       Remastered
 * Plugin URI:        https://github.com/pamungks/wordpress-remastered
 * Description:       The WordPress Remastered distribution — strips the bloat and ships a lean base. Walking skeleton: registers and activates cleanly, but removes no bloat yet.
 * Version:           0.1.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            Bagus Pamungkas
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       remastered
 *
 * @package Remastered
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Walking skeleton.
 *
 * The plugin loads and activates without error on stock WordPress core, but
 * carries no behaviour yet. Bloat removal arrives in a later ticket; this file
 * is the tracer bullet that proves the plugin is wired into the distribution.
 */
