#!/usr/bin/env node
/**
 * wp-env wrapper that works around a false "offline" detection.
 *
 * wp-env decides whether it can reach WordPress.org by calling dns.resolve(),
 * which uses c-ares against the DNS servers Node sees. On machines whose OS DNS
 * is a local stub resolver (Node reports 127.0.0.1 and c-ares gets
 * ECONNREFUSED), that call fails even though the network is perfectly fine — so
 * wp-env wrongly concludes it is offline and refuses to download core or pull
 * images. dns.lookup() (the OS resolver, the same path curl uses) works in that
 * situation, so we route dns.resolve through it. On a normal network — CI, most
 * dev machines — lookup succeeds too, so this changes nothing there.
 *
 * All npm "env:*" scripts call wp-env through this wrapper.
 */
const dns = require( 'dns' );

function lookupAll( hostname ) {
	return new Promise( ( resolve, reject ) => {
		dns.lookup( hostname, { all: true }, ( err, addresses ) => {
			if ( err ) {
				reject( err );
				return;
			}
			resolve( addresses.map( ( entry ) => entry.address ) );
		} );
	} );
}

// wp-env uses require('dns').promises.resolve; patch that one method.
dns.promises.resolve = ( hostname ) => lookupAll( hostname );

// Hand off to the real wp-env CLI, which reads the original process.argv. We
// require the bin by file path because the package's "exports" map doesn't
// expose the ./bin subpath.
const path = require( 'path' );
require( path.resolve(
	__dirname,
	'..',
	'node_modules',
	'@wordpress',
	'env',
	'bin',
	'wp-env'
) );
