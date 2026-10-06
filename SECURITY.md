# Security review — 2026-10-06

This is a limited source/dependency review, not a penetration test or a guarantee of security.

## Public repository sanitation
- Fresh source snapshot: private Site Git history is not included.
- No operational database, member records, documents, deployment tokens or environment files are included.
- Removed the previous owner email and shared initial-password hash. New databases have no seeded accounts or passwords.
- Set OWNER_EMAIL only in a trusted server environment. Local development uses a development-only identity.

## Validation performed
- TypeScript check and production build passed.
- Authentication regression checks passed: password verification, member/admin separation, duplicate emails, credential-change session revocation, logout/deletion revocation, rate limiting, public read, and rejection of member email-only login.
- Updated Next.js, React/RSC, Vite, Vinext and related dependencies to address available advisories.

## Remaining limitations
- npm audit --omit=dev reports 0 known vulnerabilities at this date. This does not prove the bundled application is free from vulnerabilities.
- Full npm audit still reports 15 affected packages (8 high, 7 moderate), including transitive effects. Roots are braces pattern recursion, old esbuild in migration tooling, and fflate in the framework OG-image dependency chain. These are tracked in the development/framework tree; do not assume every devDependency is absent from runtime bundles.
- No user-controlled glob patterns, development server exposure, or OG-image/ZIP processing feature is provided by this app. Keep development servers local. Remaining fixes require upstream changes or compatibility review; do not blindly apply npm audit fix --force.
- Any existing operational account still using a shared initial password should be changed individually. This source export does not reset operational passwords.
- Schedules, regulations and attachments intentionally allow public reading. Do not upload confidential documents without adding authenticated read access.
- The owner identity header is trusted ONLY behind the Sites authentication gateway. A generic standalone deployment must replace it with verified authentication and strip spoofable incoming identity headers.
- This public baseline is for NEW databases only. Never replace existing production migration history with it.

## Remaining advisories
- [braces: braces vulnerable to stack-exhaustion denial of service through deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [esbuild: esbuild enables any website to send any requests to the development server and read the response](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- [fflate: fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives](https://github.com/advisories/GHSA-px8p-9vwx-vf98)
