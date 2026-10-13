---
description: Commit staged changes directly on main and push to origin
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git commit:*), Bash(git push:*)
---

Commit staged changes directly on `main` and push them to `origin`.

Follow these steps:

1. Run `git branch --show-current`.
   - If the branch is not `main`, stop and tell the user: "You are not on main. Use /commit-push-pr instead."
2. Run `git status --short` and show the user which staged files will be committed.
3. Check whether there are staged changes with `git diff --cached --quiet`.
   - Exit code 0 means there are NO staged changes; exit code 1 means there ARE staged changes.
   - If no staged changes exist, stop and tell the user: "No staged changes to commit."
4. Run `git diff --cached` to review the staged changes.
5. Infer a concise commit message in Conventional Commits format from the staged diff.
   - Use a format such as: `fix: handle empty task title`.
   - Do not include a body unless it adds useful context.
6. Display the proposed commit message and ask for confirmation before committing and pushing.
7. After confirmation, run:
   ```bash
   git commit -m "<generated commit message>"
   git push origin main
   ```
8. Report the commit hash and confirm the push succeeded.
