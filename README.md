# WordPress Remastered

A lean WordPress **distribution** — a package layered on top of stock WordPress. No fork;
core keeps auto-updating. It strips the bloat, restyles the admin, pushes Gutenberg as the
one page builder, and makes both the admin and the public site feel fast.

Built for agencies who are tired of a different framework and a pile of plugins on every
client project. The niche: fast, clean ecommerce for **digital products** (fonts, design
services, downloads), with physical products prepared for later.

> **Status: early. Built in public.** The design and decisions are being worked out in the
> open — see the docs below before the code arrives.

## Docs

- [`CONTEXT.md`](CONTEXT.md) — the project's shared language (glossary).
- [`WORKFLOW.md`](WORKFLOW.md) — how it's built and how we work.
- [`docs/adr/`](docs/adr/) — architecture decision records.

## Architecture (in one line)

Integrated, not headless: WordPress + WooCommerce + our own block theme on one host, with
Gutenberg editing the real live site. ([why](docs/adr/0001-integrated-not-headless.md))

## License

GPLv2 or later. See [`LICENSE`](LICENSE).
