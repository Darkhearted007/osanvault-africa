# OV1 Current Blocker

The canonical foundation module has been added additively, but API wiring must not proceed until the existing database schema export surface is inspected and extended safely.

This is intentional: writing a replacement `lib/db/src/schema/index.ts` without its current contents could silently disconnect existing prototype tables. The next operation must read that file and the Drizzle configuration, then add the canonical export without removing any existing export.
