# Fix Import Error Plan

## Goal Description
Fix `google/types.js` not found error in `src/google/auth.ts` enforcing user rules.

## Proposed Changes
### Configuration
#### [MODIFY] [tsconfig.json](file:///wsl.localhost/Ubuntu/home/iruk/work/2uky/daruGirl_discordBot/tsconfig.json)
- Add `"paths": { "@/*": ["./*"] }` to `compilerOptions`.

### Source
#### [MODIFY] [auth.ts](file:///wsl.localhost/Ubuntu/home/iruk/work/2uky/daruGirl_discordBot/src/google/auth.ts)
- Change import to `import { Credentials, GoogleContext } from '@/google/types.js';`.

## Verification Plan
### Automated Tests
- Run `npx tsc --noEmit`
