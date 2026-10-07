# ÒsánVault Africa — Hatchable Delete Guard

Created: 2026-10-07
Hatchable project: proj_gc8Cbk8ItySl
Production baseline: v877
Production deployment: 2026-09-30T19:13:56+00:00

## Deletion policy
- Never perform broad/pattern-based deletion.
- A deletion must name the exact file path(s).
- Before deletion: read/list the target, check callers, scheduler targets, recent traffic, and protected dependencies.
- Create/reconfirm a backup/snapshot before deleting.
- Do not combine unrelated deletions in the same operation.
- After deletion: run dry-run validation and re-list files.
- Production deployment requires separate explicit authorization.
- If an unexpected file is selected, STOP immediately.

## Protected Phase 388 files
- lib/phase388-control-plane.js
- api/continental/gis-phase388-workspace
- api/continental/gis-phase388-dashboard-launcher
- api/continental/gis-phase388-role-dashboard
- api/continental/gis-phase388-dashboard (retirement-blocked)

## Protected hashes at audit baseline
lib/phase388-control-plane.js
5f8a5b0e0d88c4487e106f245ccffcf96eb0b0fca546d69210fb7dd2f8fb0de7

api/continental/gis-phase388-workspace
be4fc7875aa710cad06b3308cbf1a00cfa5c64f66a321a74094790ab7f5b7afe

api/continental/gis-phase388-dashboard-launcher
0a5892917768ea7e5f22a9720d2fcd4f19f9ef54ac46a53aa66d1b6f7875cbb1

api/continental/gis-phase388-role-dashboard
72e5f504ac68d30a6447b3d714623e1d026c59a270ed4f200c1f722c6799d08

api/continental/gis-phase388-dashboard
58f81841d5970c4fafa9cef3985591baa2d4c1721af5d86043460228b5655508

## Authorized retirement candidates only
- api/system/phase388-schema-repair.js
- api/continental/gis-phase3884-role-modules.js

These two paths are the only Phase 388 files authorized for the current retirement work. Any other deletion requires fresh explicit authorization.

## Incident-control rule
The previous accidental deletion of unrelated Institutional Evidence Airport routes demonstrated that compound delete batches are unsafe. Future work must use a one-target-at-a-time deletion protocol and verify the exact path immediately before each delete.
