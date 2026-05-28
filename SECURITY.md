# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Òsánvault Africa, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security@osanvault.africa with details
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

## Security Updates

We are committed to maintaining the highest security standards. This document outlines our security practices and the process for reporting vulnerabilities.

### Scope

This policy covers:
- Smart contracts (Solana/Anchor)
- Backend API (Node.js/Express)
- Frontend (React/TypeScript)
- Infrastructure (Docker, Kubernetes)
- CI/CD pipelines

### Responsible Disclosure

We follow responsible disclosure:
1. We will acknowledge reports within 48 hours
2. We will provide regular updates on progress
3. We will publicly disclose the vulnerability after fixes are deployed
4. We appreciate researchers who help improve our security

## Security Architecture

### Authentication
- Wallet signature verification using nonce-based challenge
- Cryptographic proof of wallet ownership required
- No mock authentication in production

### Authorization
- Role-based access control (RBAC)
- Three roles: ADMIN, PROPERTY_MANAGER, INVESTOR
- KYC verification required for investors

### Data Protection
- All secrets via environment variables
- TLS 1.3 for data in transit
- Database connection pooling with PgBouncer
- Redis authentication required

### Smart Contract Security
- Pause/unpause mechanism for emergencies
- Initialization guards to prevent re-initialization
- Overflow protection with checked arithmetic
- CEI (Checks-Effects-Interactions) pattern
- Role-based access for admin functions

### Infrastructure
- Rate limiting on all API endpoints
- DDoS protection via Cloudflare
- Container resource limits
- Network isolation with custom Docker network
- Read-only filesystems where possible

## Vulnerability Disclosure Timeline

| Phase | Timeline |
|-------|----------|
| Initial Response | 48 hours |
| Severity Assessment | 7 days |
| Fix Development | 30 days (critical), 90 days (high) |
| Security Advisory | Within 7 days of fix |

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | ✅ Active development |

## Security Audits

The smart contracts undergo regular security audits. Audit reports are available upon request from institutional investors.

## Compliance

- Nigeria SEC ARIP Sandbox compliance
- SCUML registration
- GDPR-adjacent data handling
- KYC/AML compliant architecture