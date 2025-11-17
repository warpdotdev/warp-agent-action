# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Code Architecture

This repository contains a GitHub Action that runs the Warp Agent.

- **Type**: Node.js action (targeting `node24` runtime).
- **Entry Point**: `src/index.js`.
- **Distribution**: The code is bundled using Rollup into `dist/index.mjs`.
- **Logic**:
  1.  Parses inputs from `action.yaml`.
  2.  Installs the `warp-cli` package (supports Linux/Ubuntu via `.deb`).
  3.  Executes `warp-cli agent run` with the provided prompt/parameters.
  4.  Sets the `agent_output` output.

## Development

- **Install Dependencies**: `npm install`
- **Build**: `npm run bundle`
  - **Important**: You must run the bundle command and commit the changes in `dist/` for them to
    take effect in the action.

## Testing

To test locally, use the `act` command:

```sh
act --container-architecture linux/amd64 -j run_warp_test -s WARP_API_KEY
```

This runs the e2e test workflow in `./.github/workflows/test_e2e.yaml`.
