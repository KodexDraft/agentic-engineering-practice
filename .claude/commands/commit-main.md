---
description: Commit all changes directly on main and push to origin
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git branch:*), Bash(git switch:*), Bash(git commit:*), Bash(git push:*), Bash(npm test:*)
---

Commit the working changes directly on `main` and push them to `origin`.

Follow these steps:

1. Run `git branch --show-current` and tell the user clearly where they are: "You are on `<branch>`." or "You are on `main`."
2. If the branch is not `main`, warn: "You are on `<branch>`, not on main." and ask the user which to do:
   - **Continue on main**: run `git switch main`. If git refuses because of conflicting local changes, explain and ask how to proceed instead of forcing it.
   - **Move to a branch**: follow the `/commit-branch` flow (propose a branch name, get confirmation, commit and push on the branch) and stop here.
3. Run `git status --short`. Show the staged, modified (unstaged), untracked and deleted files separately.
4. If there are unstaged or untracked changes, list them and ask the user to confirm or exclude some files. Then run `git add -A` (or `git add <files>` if some were excluded).
   - Warn if `.env`, `taskr.db*`, `node_modules/` or `.DS_Store` show up; they must never be committed.
5. Check for staged changes with `git diff --cached --quiet`.
   - Exit code 0 means there are NO staged changes. Stop and tell the user: "No changes to commit."
6. Run `npm test -- --runInBand`.
   - If any test fails, do not commit. Report the specific failures and stop.
7. Run `git diff --cached` to review the staged changes.
8. Infer a concise commit message in Conventional Commits format from the staged diff (for example `fix: handle empty task title`). No body unless it adds useful context.
9. Display the proposed commit message and ask for confirmation before committing and pushing.
10. After confirmation, run:
    ```bash
    git commit -m "<generated commit message>"
    git push origin main
    ```
11. Report the commit hash and confirm the push succeeded.
