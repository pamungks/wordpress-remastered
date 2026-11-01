# Context

Shared language for this project. A glossary only — no implementation details.
Decisions that are hard to reverse live in `docs/adr/`.

## What this is

A lean WordPress **distribution** layered on stock WordPress — no fork, core keeps
auto-updating. It strips bloat, restyles, makes Gutenberg the one builder, and makes
the admin and the public site feel fast. **Integrated, not headless** (see ADR 0001).
Niche: ecommerce for **digital products** (fonts, design services, downloads); physical
later. Open source, built in public. First user: the agency owner; then clients editing
their own stores.

## Three parts

- **Remastered** — the public distro that runs on each client site: bloat-removal
  plugin + own block theme + global styles + trimmed WooCommerce.
- **Cockpit** — the owner's private Tauri desktop app: clients, analytics, proposals,
  invoices, one-click site install. Not the WordPress admin; not part of the distro.
- **Client Portal** — one hosted multi-client web portal (Cloudflare Pages). Each client
  logs in and sees only their own progress.

## Glossary

- **Distribution** — the whole shipped product: the layer on top of unmodified core.
  Core keeps auto-updating; the distro hides, disables, or restyles what it chooses.
- **Core** — stock, unmodified WordPress. We never edit it.
- **Bloat** — default WordPress/WooCommerce parts removed or disabled as unnecessary for
  a lean store. (Exact list: TBD.)
- **Store engine** — WooCommerce, used for backend/core logic only (products, cart,
  checkout, orders, payments, tax, shipping). Its default design is replaced.
- **Admin** — the `wp-admin` dashboard, reworked: a restyle first, then a React dashboard
  for the parts that matter most (store, pages). `wp-admin` is never fully removed, so
  plugins keep working.
- **Builder** — Gutenberg, extended as the only page builder: real design controls +
  our own clean block set + global styles. Full site editing comes soon after.
- **Global styles** — one design system (brand color, type, spacing) set once, that every
  block and page follows. Solves outdated, inconsistent design.
- **No-reload feel** — the goal that both admin and public site navigate without full
  page reloads. React for the admin, the WordPress Interactivity API for the front-end;
  no heavy extra library.
- **Curated plugins** — third-party plugins are off by default. They can be enabled, but
  with a warning that they may break the admin or the site.
- **Lean base** — the first slice to build: bloat-removal plugin + block theme + global
  styles. A fast, pretty, empty site. The foundation the store and admin sit on.
- **Integrated (not headless)** — the chosen architecture: core, store, and theme run
  together on one host and Gutenberg edits the real site. Headless was rejected
  (ADR 0001).
- **Ready package** — how a client site is delivered: the distro cut as a tagged GitHub
  Release (auto-built zip), pushed straight to the client's host. Client sites get no
  GitHub repo and are not individually version-controlled.
- **Tooling repo(s)** — version control (the "better GitHub use" goal) applies to building
  *these tools*, in two repos: `remastered` (public) and `cockpit` (private). Releases
  are cut as tagged GitHub Releases.
- **Project phases** — the fixed milestone template every client project follows:
  Proposal → Design → Build → Launch. The owner ticks a phase in the Cockpit and the
  Client Portal updates. Keeps progress reporting automatic and forget-proof.

## Open (TBD)

- Exact bloat list to remove.
- Contents of the custom block set.
- Live-deploy from the Cockpit (local-first scaffolding for now).
- The secure Cockpit ↔ client-site link (analytics/management).
