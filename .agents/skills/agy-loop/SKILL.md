---
name: agy-loop
description: Delegate an approved Claude Code plan to the agy (Antigravity/Gemini) CLI for execution, audit the results cheaply via git status/diff --stat plus a mandated summary report, and iterate with model tier escalation.
---

# agy-loop

**Claude is the planner/auditor; agy is the executor.** agy writes the code — Claude does
not, not even for the part that feels too important to get wrong. Importance is the trap,
not a justification: correctness comes from the audit-and-iterate loop, so a part that
matters gets a sharper spec and a stricter checklist, not Claude-authored code. The single
exception is the Step 5 takeover, after a part genuinely fails at the top tier.

## Preconditions

- An approved plan must exist (from plan mode or `$ARGUMENTS`). If none, ask — don't invent one.
- Identify the target repo. This may be a multi-repo workspace (e.g., `repo-a/`, `repo-b/`, `repo-c/` — each an independent git repo). A plan spanning repositories runs this
  skill once per repository. Never point `--add-dir` at the workspace root.
- **Confirm once, before the first dispatch:** which repo, which tier, a one-line restatement
  of the plan, AND that every dispatch runs with `--dangerously-skip-permissions` — headless
  agy cannot edit files without it, so this grants agy full unattended tool access (shell
  included) for the session. Say so plainly. Do not re-confirm on later parts, repos, or
  iterations — the user already approved running the loop "until it's done".

## Step 0 — Decompose the plan (mandatory)

Split every plan along **two dimensions — repo, then phase — before dispatching anything.**
Never send a whole plan (or a whole repo's work) in one prompt: in bulk, agy re-plans and
introduces errors that compound through the audit loop.

1. **By repo first** — each repo gets its own ordered parts and its own agy session.
2. **By phase within each repo** — use existing `Part N` headings. For a flat plan, derive
   phases: one part per coherent unit ("schema + models", "router endpoints", "tests", or
   per-route-file). Keep each part small enough that its audit checklist is a few bullets.
   A flat plan is not license to bulk-dispatch.

Content before the first part (Context, Key decisions) is shared **preamble**, sent with every
part of that repo. Trailing wrap-up sections (Verification, Commit/PR) are not parts — their
agy-executable pieces append to the **last** part; local checks belong to Step 6.

Steps 1–5 run **once per part, strictly in order** — Part *N+1* waits until Part *N* is
Satisfied. Tier and attempt cap reset at each new part. When all parts of all repos are
Satisfied, run the Step 6 gate, then the aggregate final report.

## Step 1 — Pick the model tier

**Every new submission starts at Low** — every part, every Step 6 fix part — regardless of size
or what the previous part ended on. The only thing that raises the tier is a failed attempt
*within the same part*. A fix-up found after a part was Satisfied is a NEW part starting at Low,
not a retry at an escalated tier.

Tiers, cheapest first — pass the exact string agy lists for the current Gemini Flash model at
that reasoning level (check `agy --help` / the model picker rather than assuming a version;
these names change):

| Tier | `--model` |
|---|---|
| Low (always start here) | `Gemini 3.6 Flash (Low)` |
| Medium (only after Low fails) | `Gemini 3.6 Flash (Medium)` |
| High (only after Medium fails) | `Gemini 3.6 Flash (High)` |
| Quota fallback only | `Claude Opus 4.6 (Thinking)` |

Escalate exactly one tier at a time — never jump tiers, never retry a tier with the same prompt
(it repeats the same mistake). The Opus row is **only** for quota exhaustion (agy reports quota /
rate limit / usage exceeded), never as a fourth quality tier — it spends the tokens this skill
exists to save. If the Opus-via-agy dispatch also produces wrong work, stop spending agy calls
and go to the Step 5 takeover.

## Step 2 — Compose the dispatch prompt

Include, verbatim: the shared preamble, then that part's section (or, on a retry, the narrowed
corrective plan) — never other parts, never the whole plan. "The plan above" below means "this
part." For a Claude-derived part, write its section from the plan's own wording — reorganized,
not reinvented.

**Pass through code the plan already contains** — if the plan spells out an implementation,
include it verbatim; it's already written. What's forbidden is *generating new* implementation
code at dispatch/retry time that the plan lacked. When a part needs detail the plan omits, add
it as *intent* — what the unit must do, its signature, contracts, edge cases — and let agy
produce the code.

Append this fixed block at the end:

```
Follow the plan above exactly. Do not expand scope beyond what it describes.

When finished (or if you get blocked), end your final response with a section
titled exactly "## Summary of Changes" containing:
- A bullet per file touched: path, and a one-line description of what changed.
- A bullet list titled "Deviations" (or "Deviations: none") for anything done
  differently from the plan and why.
- A bullet list titled "Blockers" (or "Blockers: none") for anything the plan
  asked for that you could not complete.
```

This output contract is what lets Claude audit without reading every file back.

## Step 3 — Dispatch via Bash

Two non-negotiable flags on **every** dispatch:

- `< /dev/null` — headless `agy -p` otherwise blocks forever reading a non-tty stdin (hangs
  before auth with an empty log; not a permission prompt).
- `--dangerously-skip-permissions` — in print mode agy soft-denies every file-edit confirmation
  and exits having written nothing (often after narrating a plan as if it had). This is the only
  working bypass: `permissions.allow` gates only shell steps, `--mode accept-edits` is wired to
  the interactive TUI, and no settings.json rule changes it.

First dispatch of a repo's session:

```bash
agy -p "<composed prompt>" --model "<tier>" --dangerously-skip-permissions --add-dir <repo-path> < /dev/null
```

Every other dispatch — retries within a part AND the first dispatch of each subsequent part
**within the same repo** — uses `--continue` (resumes the most recent agy conversation, so
context carries across that repo's parts; valid only because this flow is strictly sequential,
so don't interleave other agy calls):

```bash
agy -p "<composed corrective prompt>" --continue --dangerously-skip-permissions < /dev/null
```

A **different repo** starts fresh: full `--model ... --add-dir <new-repo-path>` form, no
`--continue`. Cold starts have exceeded 60s — don't set a Bash timeout below ~180s for the
first call. On quota exhaustion, retry with `--model Claude Opus 4.6 (Thinking) --continue`.

## Step 4 — Audit cheaply

Do not re-read the changed files to verify. Instead:

1. Parse agy's `## Summary of Changes` block.
2. Run `git -C <repo-path> status --short` and `git -C <repo-path> diff --stat` — filenames and
   line-deltas only. Catches a summary that undersells or oversells (claims a file changed but
   git shows no diff, or vice versa).
3. Cross-check the file list and stated changes against the **current part's** checklist only.
   Files outside the part's scope are a Not-satisfied signal (agy re-planned/expanded) unless
   the summary's Deviations justify them.

## Step 5 — Verdict

- **Satisfied** — file list, diff stat, and summary line up, and Blockers is empty/non-blocking.
  More parts remain → reset tier to Low, dispatch the next part (`--continue`). Last part of the
  last repo → Step 6 gate. Do NOT report success or push yet.
- **Not satisfied** — write a plan scoped only to the gap (not a full redo), escalate one tier,
  re-dispatch with `--continue`. Point agy at the mistake ("the `foo` handler returns the wrong
  status on X; it must return 409") and let it produce the fix — do not write the fixed code
  yourself and have agy paste it.
- **Not satisfied at High — Claude takeover (last resort)** — do not retry or escalate; spend no
  more agy calls on this part. This is the one sanctioned point where **Claude fixes the part
  with its own Edit/Write tools**, scoped strictly to the gap the audit found — not a rewrite of
  what agy got right, never another part. Then: fix the gap, re-audit against the checklist
  (Step 4), and resume the loop — remaining parts still start at Low via agy. A per-part escape
  hatch, not license to finish the plan. Applies only to a genuine High failure, not a quota
  fallback (the `--model Claude Opus 4.6 (Thinking)` dispatch runs first). If Claude still can't complete it, stop and
  ask the user — name the part and the blocker.
- **Attempt cap** — 3 agy dispatches per part (Low, Medium, High) by construction. No Satisfied
  verdict by the third means that dispatch was High, so the takeover rule applies.

## Step 6 — Local verification gate (before any PR/push)

Once every part is Satisfied, Claude runs the repo's quality checks **locally, itself** (not via
agy) in each touched repo before anything is committed/pushed. CI must never be the first place
a failure surfaces. Run whichever the repo has (check `package.json` / repo scripts): lint
(`npm run lint`), typecheck (`npm run typecheck` / `npx tsc --noEmit`), tests (repository-specific test command, e.g., `bash run-tests.sh` or `npm test`). Prefer the `run_test_suite` and
`run_linter` tools from `gemma-local` — they return only failures.

- **All green** — produce the aggregate final report: per part, files touched + one-line summary
  + tier used + iteration count, plus verification results. No full diffs unless asked. Only
  then may commit/PR work proceed, and only if the user asked.
- **Any failure** — each distinct failure becomes a NEW corrective part scoped to that check's
  errors, dispatched through Steps 1–5 starting at **Low**. After it's Satisfied, re-run the
  full Step 6 gate (a fix can break another check). Attempt cap and takeover rule apply.

## Guardrails

- `--dangerously-skip-permissions` is required on every dispatch — a hard constraint, not a
  default. If the user declines the grant, do not run this skill — implement the plan directly
  with Claude's own tools instead.
- Never point `--add-dir` at the workspace root — always the specific repo(s).
- If `agy` is not on PATH, tell the user rather than silently editing files directly —
  delegating to agy is the whole point.
