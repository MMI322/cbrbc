# Repository Guidelines

## Project Structure

- `src/index.ts` is the TypeScript entry point. Keep new application modules under `src/` and use filenames that describe their purpose.
- `package.json` defines the npm build command and the runtime entry point, `dist/index.js`. `tsconfig.json` compiles `src/` to CommonJS for ES2016 and writes the output to `dist/`. Treat `dist/` as generated output.
- There are no dedicated test or asset directories. `.idea/` contains IDE metadata.

## Build and Run Locally

1. Run `npm install` to install the TypeScript development dependency.
2. Run `npm run build` to type-check the source and emit JavaScript into `dist/`.
3. Run `node dist/index.js` to execute the compiled entry point. The current starter prints `Happy developing ✨`.

## Coding Style

Keep changes compatible with TypeScript's strict mode. Match import paths to the exact case of filenames. Follow the entry point's single quotes and use two spaces for indentation when adding blocks. Prefer descriptive camelCase names for functions and variables and PascalCase for types and classes. The project has no configured formatter or linter.

## Testing

The project has no test script, test framework, or coverage target. Run the build and execute the compiled entry point as a smoke check. For behavior changes, exercise the affected paths and record the commands and expected results so reviewers can repeat the checks.

## Commits and Pull Requests

Use a short, imperative commit subject that describes the change. In the pull request, summarize the behavior change, link any relevant issue, and list the verification commands and their results. Keep generated output and unrelated editor changes out of the diff.
