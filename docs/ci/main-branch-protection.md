# Main Branch Protection

Use GitHub branch protection to prevent unverified code from reaching `main`.

## Required Settings

In GitHub, open:

`Settings -> Branches -> Add branch protection rule`

Use this branch name pattern:

`main`

Enable:

- Require a pull request before merging
- Require approvals
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Do not allow bypassing the above settings

Select this required status check after the workflow has run once:

- `Lint, Test, Build`

## Local Pre-PR Check

Before opening or merging a PR, run:

```bash
npm run test:ci
npm run test:e2e
```

The CI workflow also runs both commands on every pull request to `main`.
