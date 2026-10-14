---
description: Commit all changes, push the current branch to origin, and open a pull request
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git switch:*), Bash(npm test:*), Bash(gh --version), Bash(gh auth status), Bash(gh pr create:*)
---

Commit the working changes, push the current branch to `origin`, and open a pull request.

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
7. If the current branch is `main`, do not commit yet. Propose a branch name based on the staged diff (for example `feat/user-profile-validation`), ask the user to confirm or change it, then run `git switch -c <branch-name>`. Staged changes carry over to the new branch.
8. Infer a concise commit message in Conventional Commits format from the staged diff (for example `feat: add user profile validation`). No body unless it adds useful context.
9. Display the proposed commit message and ask for confirmation before committing.
10. After confirmation, run:
    ```bash
    git commit -m "<generated commit message>"
    ```
11. Verify that GitHub CLI is installed and authenticated with `gh auth status`.
    - If it is unavailable or not logged in, stop and explain that GitHub CLI must be installed and authenticated (`gh auth login`). The commit is already made locally; say so.
12. Push the branch and set upstream:
    ```bash
    git push -u origin <current-branch>
    ```
13. Create a pull request:
    ```bash
    gh pr create --fill
    ```
    `--fill` uses the commit message for the PR title and body. With several commits, the title comes from the first one.
14. Return the URL of the created pull request.
