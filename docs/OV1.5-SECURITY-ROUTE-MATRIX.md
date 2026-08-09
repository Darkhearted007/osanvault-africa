# OV1.5 Security Route Matrix

This matrix is a design gate, not an authorization implementation.

| Route family | Read | Write | Initial protection target |
|---|---:|---:|---|
| health | public | n/a | public |
| properties | public* | protected* | public discovery; protected mutations |
| carbon | public* | protected* | public discovery; protected mutations |
| governance | public* | protected | authenticated + governance permission |
| activity | public* | protected | public read where approved; protected writes |
| platform stats | public | n/a | public |
| whitelist | protected | protected | admin/compliance permission |
| leads | protected | protected | staff/CRM permission |
| device tokens | authenticated | authenticated | owner-scoped principal |
| investment | protected | protected | verified investor + product permission |
| ownership | protected | protected | verified owner + controlled operations |
| treasury | highly protected | highly protected | treasury role + approval workflow |
| verification decisions | protected | protected | verifier/compliance role |

`*` Exact access is subject to route-level review and product requirements.

## Principle

Authentication answers **who is calling**. Authorization answers **what that principal may do**. Verification answers **whether the principal or asset satisfies a business requirement**. These must remain separate controls.

## Prohibited shortcut

Do not use a wallet address alone as proof of identity, investment eligibility, legal ownership or authorization to modify an account.

## Next implementation gate

After authentication discovery is complete, implement a request principal adapter and authorization middleware without changing existing business logic. Then add regression tests for each protected route family.
