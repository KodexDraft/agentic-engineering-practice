---
description: Commit staged changes, push the current branch to origin, and open a pull request
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git switch:*), Bash(gh --version), Bash(gh auth status), Bash(gh pr create:*)
---

Commit all staged changes, push the current branch to `origin`, and open a pull request.

Follow these steps:

1. Run `git status --short` and show the user which staged files will be committed.
2. Check whether there are staged changes with `git diff --cached --quiet`.
   - Exit code 0 means there are NO staged changes; exit code 1 means there ARE staged changes.
   - If no staged changes exist, stop and tell the user: "No staged changes to commit."
3. Run `git diff --cached` to review the staged changes.
4. Run `git branch --show-current` to get the current branch.
   - If the branch is `main`, do not commit yet. Propose a branch name based on the staged diff (for example `feat/user-profile-validation`), ask the user to confirm or change it, then run `git switch -c <branch-name>`. Staged changes carry over to the new branch.
5. Infer a concise commit message in Conventional Commits format from the staged diff.
   - Use a format such as: `feat: add user profile validation`.
   - Do not include a body unless it adds useful context.
6. Display the proposed commit message and ask for confirmation before committing.
7. After confirmation, run:
   ```bash
   git commit -m "<generated commit message>"
   ```
8. Verify that GitHub CLI is installed and authenticated with `gh auth status`.
   - If it is unavailable or not logged in, stop and explain that GitHub CLI must be installed and authenticated (`gh auth login`). The commit is already made locally; say so.
9. Push the branch and set upstream:
   ```bash
   git push -u origin <current-branch>
   ```
10. Create a pull request:
    ```bash
    gh pr create --fill
    ```
    `--fill` uses the commit message for the PR title and body. With several commits, the title comes from the first one.
11. Return the URL of the created pull request.
