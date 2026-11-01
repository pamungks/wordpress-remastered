# 1. Integrated architecture, not headless

- **Date:** 2026-11-01
- **Status:** Accepted

## Context

The product is a lean WordPress distribution whose core promise is that Gutenberg is the one page builder, pushed "to the next level," editing the real live site.

Midway through design, a headless architecture was proposed: WordPress reduced to a data/API backend, the public site rebuilt as a separate front-end on Cloudflare Workers & Pages, and the admin delivered as a Tauri desktop app. The appeal was edge speed and a modern stack.

We checked the facts before deciding:

- **WordPress cannot run on Cloudflare Workers in production.** It needs PHP + a real database. php-wasm on Workers hits a ~128MB memory limit (PHP alone exceeds it before WordPress even loads) and its SQLite data does not persist reliably. So WordPress core would still need a normal PHP + MySQL host *in addition to* the Cloudflare front-end — two systems, not one.
- **Headless turns Gutenberg into a content-only form.** The live preview and visual building — the main reason to embrace Gutenberg — are lost, because the real site is rendered by a separate app. The design would have to be built twice (once in blocks, once in the front-end).
- **Headless WooCommerce checkout is leaky.** The Store API has no built-in bot/rate protection (card-testing exposure) and the digital-delivery hook never fires in headless flows, risking paid downloads that never deliver.

These cut against the project's actual goals: simple, light, fast to build for clients, no plugin soup.

## Decision

Build **integrated, not headless.** WordPress core, WooCommerce, and our own block theme all run together on one normal host, and Gutenberg edits the real, live site. Speed for visitors comes from edge caching and the WordPress Interactivity API, not from splitting the stack.

The Tauri desktop app survives, but **re-scoped**: it is not the WordPress admin and not the public front-end. It is the owner's private agency Cockpit (clients, analytics, proposals, invoices, one-click site install).

## Consequences

**Positive**
- One system to build, host, and maintain per client — matches the "simple and light" goal.
- Gutenberg stays a true visual builder; design is authored once.
- WooCommerce checkout runs its normal, protected server-side flow.

**Negative**
- Visitor speed depends on us doing caching + Interactivity API well, rather than getting edge speed for free.
- We do not get the modern-edge-stack story that headless would have offered.

**Rejected alternative:** Headless (WordPress API + Cloudflare Pages front-end + desktop admin). Rejected for the three reasons above. Revisit only if Gutenberg-as-builder is dropped as a core promise and WordPress-on-edge becomes production-viable.
