# Production-Hardening Guidelines

To scale MissionOps AI from MVP into high-load corporate operations, implement these critical safety updates.

## Hardening Checksheet
1. **Activate Firestore Repository**: Map variables inside standard adapters inside `/repositories/firestore.repository.ts`.
2. **Setup OAuth2 Authentication**: Initialize Google Identity Platform to restrict dashboards to authorized corporate email domains.
3. **Model Rate Limiting**: Apply token buckets rate limits on incoming API routes to prevent resource exhaustion or rogue browser loops.
4. **Deploy Secret Manager bindings**: Mount GSM directly rather than injecting text strings inside configuration files.
5. **Secure Middleware CORS Headers**: Authorize requests originating exclusively from approved domain structures.
