# BB-91: check workflow files before they are pushed

**Problem.** During BB-78, `tests.yml` had an unquoted step name containing ": " (`- name: Unit tests (Node): plan engine and safe HTML`, commit e53ce7f, line 71). GitHub rejected the file, so no check was created at all: the PR page and Auto-fix showed nothing failing and the PR looked mergeable. A workflow cannot check itself, so the check has to run before the push.

**Options.**
- **actionlint** (Go binary): checks YAML, the workflow schema, expressions and shell. Not installed here, not an npm package, so every machine and CI would need a separate install. Rejected for now.
- **`yaml` npm package + a small script.** Chosen. One pinned dev dependency, installed by `npm ci` like the rest. It rejects the BB-78 file (a mapping inside a plain scalar) and duplicate keys. The script adds the few structure rules GitHub needs to create checks: top-level `on` and `jobs`; each job has `runs-on` (or `uses`, for a reusable workflow); `steps` is a non-empty list; each step has exactly one of `run` or `uses`.

**Where it runs.**
- `npm run lint` (so CI's static checks job and the pre-commit hook run it): `eslint . && node scripts/check-workflows.mjs`.
- The pre-commit hook also runs it, on its own and first, when a file under `.github/workflows/` is staged. A workflow-only commit runs only this check (under a second), not the 30 s of tests.

**Reusable.** `scripts/check-workflows.mjs [dir]` takes the folder to check (default `.github/workflows`) and needs only `yaml`, so another repo can copy it as is. Not shared across repos yet: a shared copy would live in the Claude setup repo and each project's hook would call it; flagged for Arthur.

**Proof.** A unit test runs the script on fixtures: the BB-78 step name, a duplicate key, a job with no steps, a step with neither `run` nor `uses`, and a valid file. Run by hand on e53ce7f's `tests.yml` it must fail and point at line 71.

**Not covered.** Expression syntax (`${{ }}`), action inputs and shell scripts inside `run`: actionlint's job, if it is ever added.
