# scripts

The root `scripts/` directory exists for workflows that coordinate both applications.

These scripts should stay thin and operational:
- setup shared local prerequisites
- start backend and frontend with consistent commands
- run cross-app build, test, and verification flows

App-specific automation should stay inside the owning app instead of moving here prematurely.

## Available Scripts

- `setup_all.sh`
  Installs or prepares local dependencies for the full monorepo development flow.
- `dev_api.sh`
  Starts the backend development flow from the root.
- `dev_web.sh`
  Starts the frontend development flow from the root.
- `dev_all.sh`
  Convenience helper for running both app flows together when supported by your local environment.
- `build_all.sh`
  Runs repository-level build verification across apps.
- `test_all.sh`
  Runs repository-level automated tests across apps.
- `verify_all.sh`
  Runs the closest thing to a full local handoff check.

## Usage Guidance

Use root scripts when:
- onboarding a new developer
- checking the repository from a monorepo perspective
- validating that backend and frontend still work together operationally

Use app-local commands when:
- you are working deeply inside one app
- you need app-specific options, profiles, or debugging flags
