---
description: Commit all changes on a branch (never main) and push it to origin, without opening a PR
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git branch:*), Bash(git switch:*), Bash(git commit:*), Bash(git push:*), Bash(npm test:*)
---

Commit the working changes on a feature branch and push the branch to `origin`. No pull request is created.

Follow these steps:

1. Run `git branch --show-current` and tell the user clearly where they are: "You are on `<branch>`." or "You are on `main`."
2. Run `git status --short`. Show the staged, modified (unstaged), untracked and deleted files separately.
3. If there are unstaged or untracked changes, list them and ask the user to confirm or exclude some files. Then run `git add -A` (or `git add <files>` if some were excluded).
   - Warn if `.env`, `taskr.db*`, `node_modules/` or `.DS_Store` show up; they must never be committed.
4. Check for staged changes with `git diff --cached --quiet`.
   - Exit code 0 means there are NO staged changes. Stop and tell the user: "No changes to commit."
5. Run `npm test -- --runInBand`.
   - If any test fails, do not commit. Report the specific failures and stop.
6. Run `git diff --cached` to review the staged changes.
7. If the current branch is `main`, say so and propose a branch name based on the diff (for example `feat/user-profile-validation` or `fix/empty-task-title`). Ask the user to confirm or change it, then run `git switch -c <branch-name>`. Staged changes carry over.
   - If already on another branch, keep using it.
8. Infer a concise commit message in Conventional Commits format from the staged diff (for example `fix: handle empty task title`). No body unless it adds useful context.
9. Do not ask for confirmation of the message. Run:
    ```bash
    git commit -m "<generated commit message>"
    git push -u origin <current-branch>
    ```
10. Report the commit hash and the commit message used, and confirm the push succeeded. Suggest `/commit-push-pr` when the user is ready to open a pull request.
