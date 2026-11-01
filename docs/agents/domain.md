# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the project glossary (distribution, core, bloat, store engine,
  builder, global styles, no-reload feel, lean base, integrated-not-headless, ready package, …).
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. Today that is
  `0001-integrated-not-headless.md` (why this is integrated, not headless).
- **`WORKFLOW.md`** at the repo root — how the project is built and how the owner and Claude work
  together (branching, PRs, releases, the Matt Pocock skill flow).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (this repo):

```
/
├── CONTEXT.md
├── WORKFLOW.md
├── docs/adr/
│   └── 0001-integrated-not-headless.md
└── docs/agents/           ← this config (issue tracker, labels, these rules)
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root — not used here):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids — e.g. say **distribution** (not "fork"), **integrated** (not "headless"), **lean base** for the first slice.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0001 (integrated, not headless), but worth reopening because…_
