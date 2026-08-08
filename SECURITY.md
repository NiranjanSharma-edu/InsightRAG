# Security Policy

We take the security of InsightRAG seriously. This document outlines the supported versions, how to report security vulnerabilities, and our disclosure process.

---

## Supported Versions

We currently support and actively patch the following version branches:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `v1.x` | Yes | Main active development branch |
| `< v1.0` | No | Legacy developer drafts |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please do **NOT** open a public issue on GitHub. Doing so exposes the project and its users to immediate risk.

Instead, please report vulnerabilities by contacting the maintainer via:
- **Email**: niranjansharma.edu@gmail.com (or the email associated with `@NiranjanSharma-edu`)
- Please prefix your email subject with: `[SECURITY VULNERABILITY] InsightRAG`

### What to Include:
1. A detailed description of the vulnerability.
2. Steps to reproduce the issue (including any proof-of-concept scripts or requests).
3. The potential impact of the vulnerability.
4. Your contact details for updates.

---

## Disclosure Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within **48 hours**.
2. **Triage**: We will investigate and verify the report, providing updates as we proceed.
3. **Patching**: We aim to resolve verified vulnerabilities within **15 days** of receipt.
4. **Release**: Once a patch is available and verified, we will release it in a new repository version.
5. **Credit**: We will credit you for your responsible disclosure in our security announcements or changelogs, unless you request to remain anonymous.

---

## Security Architecture & Practices

### Implemented Controls
- **Non-Root Runtime Execution**: Container processes execute under dedicated, unprivileged system accounts (`backend` and `nextjs` users) to restrict sandbox boundaries.
- **Privilege Separation Entrypoint**: The backend container boots as `root` to set ownership permissions on dynamically mounted paths and instantly drops privileges to the unprivileged `backend` user via `gosu` before server execution.
- **Secret Management Protection**: Local secrets are configured exclusively within Git-ignored `.env` configurations. Production credentials/keys are managed via Railway's deployment environment variables.
- **Least-Privilege GitHub Actions Tokens**: Continuous integration workflows run with explicit read-only token scopes:
  ```yaml
  permissions:
    contents: read
  ```

### Planned Controls (Upcoming Phase 2.4)
- **Automated CVE Scanning**: Continuous container vulnerability assessments via image scanners (e.g., Trivy/Anchore).
- **Production Logging & Monitoring**: Remote security event monitoring.
- **API Hardening**: Rate-limiting constraints and secure header profiles.

