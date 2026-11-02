# Workflow

How this project is built, and how the owner and Claude work together.
Read `CONTEXT.md` first for the language; decisions live in `docs/adr/`.

## 1. GitHub environment

### Repos

| Repo | Visibility | Holds | License |
|---|---|---|---|
| `remastered` | Public | The distribution: plugin + block theme | GPLv2+ |
| `cockpit` | Private | The Tauri desktop app (and client portal) | Owner's choice |

Business code (clients, invoices) stays in `cockpit`, never in the public repo.

### Branching (solo, trunk-based)

- `main` is always shippable.
- Every change goes on a short branch → Pull Request → merge. No direct commits to `main`.
- The PR exists even though we are solo: it is the review gate, the CI gate, and a clean history.
- **Claude opens PRs. The owner reviews and approves; Claude squash-merges.** `main` stays under
  the owner's control: nothing merges without the owner's approval.
  - GitHub won't let the owner approve a PR opened from their own account, so the approval is the
    owner saying so in chat, not a GitHub review.
  - On approval Claude runs `gh pr merge --squash --auto --delete-branch`: it merges now if CI
    is green, or as soon as CI finishes. Auto-merge is never turned on *before* approval —
    with 0 required GitHub approvals it would merge on green CI alone.

### `main` protection (ruleset)

- A pull request is required; 0 GitHub approvals (see above for why).
- Required status checks: `Docs present` and `E2E (wp-env + Playwright)`. These are the CI
  **job names**, not the `CI / … (pull_request)` label the PR page shows. Rename a job and the
  ruleset must change with it, or every PR waits forever on a check that never reports.

### Commits

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
Clean log, and the changelog can be generated from it.

### Releases (the "ready package")

- Tag a version (`v0.1.0`) → a GitHub Action builds the installable zip → publishes a GitHub Release.
- That release zip is the package pushed to a client's host. The Cockpit can pull the latest release to install.

### CI (GitHub Actions)

- **On PR:** lint + PHP/JS checks.
- **On tag:** build and publish the release zip.

### CI connection checkpoints — verify EARLY, with throwaway changes

Never debug CI and real code at the same time. Prove the pipeline before building:

1. **First PR check.** After the repo and the Actions workflow file are pushed, open a tiny PR
   (e.g. edit the README). Confirm the Action runs green. This proves lint/build CI is wired.
2. **First tag check.** Push `v0.0.1` on a near-empty repo. Confirm it builds and publishes the
   zip as a Release. This proves the release pipeline.

Both happen before the real build starts.

## 2. How we work together (Claude flow)

The route is **idea → ship**, following the Matt Pocock skills.

1. **`/grill-with-docs`** — sharpen the idea by interview; write `CONTEXT.md` + ADRs. (Done this session.)
2. **Prototype detour** — if a question needs *running* code to answer, build a throwaway
   `/prototype`, learn, fold the answer back. The prototype is kept on a `prototype/<name>` branch.
3. **Big multi-session build**, so break it down:
   - **`/to-spec`** — turn CONTEXT into a buildable spec.
   - **`/to-tickets`** — split the spec into small, self-contained "tracer bullet" tickets.
   - **`/implement`** — one ticket at a time, clearing context between each. Each `/implement`
     runs `/tdd` (test-first) then `/code-review` before committing.

### Rules that keep the work sharp

- **One ticket per session.** Clear context between tickets. Claude reasons best under
  ~150k tokens (the "smart zone").
- **`CONTEXT.md` + ADRs are the shared memory.** Keep them current — update CONTEXT when a term
  is settled, add an ADR when a hard-to-reverse decision is made.
- **`/code-review` before every merge** — two axes: follows standards + matches the spec.
- **Claude opens PRs; the owner approves; Claude squash-merges.**

### One-time precondition

Run **`/setup-matt-pocock-skills`** once before the first build flow. It sets up the issue
tracker, triage labels, and doc layout that `/to-tickets` and `/implement` assume.

## 3. Order of work from here

1. Run `/setup-matt-pocock-skills` (one-time).
2. Create the two repos; first commit = `CONTEXT.md` + ADR + this file.
3. Wire CI and run both CI checkpoints above.
4. `/to-spec` → `/to-tickets` to break the build down.
5. `/implement` the **lean base** first (bloat-removal + block theme + global styles).
