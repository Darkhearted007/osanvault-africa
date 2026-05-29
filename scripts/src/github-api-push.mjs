/**
 * Pushes local workspace to GitHub via the Git Data API.
 *
 * Strategy: fetch the remote's full tree, compare git blob SHAs with local,
 * only upload blobs for files that are NEW or CHANGED, then create a new
 * tree (based on remote tree) + merge commit + update ref.
 *
 * This minimises the number of API calls dramatically.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import https from 'https';

const pat    = process.env.GITHUB_PAT;
const OWNER  = 'Darkhearted007';
const REPO   = 'osanvault-africa';
const CWD    = '/home/runner/workspace';

if (!pat) { console.error('GITHUB_PAT not set'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function rawReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', path, method,
      headers: {
        'User-Agent': 'osanvault-push',
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(d) }); }
        catch  { resolve({ status: res.statusCode, headers: res.headers, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function api(method, path, body, retries = 6) {
  for (let i = 0; i < retries; i++) {
    const r = await rawReq(method, path, body);
    if (r.status === 429 || (r.status === 403 && String(r.body?.message).includes('rate limit'))) {
      const wait = (parseInt(r.headers['retry-after'] || '61', 10) + 2) * 1000;
      console.log(`  Rate limited. Waiting ${wait / 1000}s… (attempt ${i + 1}/${retries})`);
      await sleep(wait);
      continue;
    }
    return r;
  }
  throw new Error(`API ${method} ${path} failed after ${retries} retries`);
}

const GET   = path       => api('GET',   path, null);
const POST  = (path, b)  => api('POST',  path, b);
const PATCH = (path, b)  => api('PATCH', path, b);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const base = `/repos/${OWNER}/${REPO}`;

  // ── 1. Remote HEAD ──────────────────────────────────────────────────────────
  const branchRes = await GET(`${base}/git/refs/heads/main`);
  if (branchRes.status !== 200) { console.error('Branch fetch failed:', branchRes.body); process.exit(1); }
  const remoteHeadSha  = branchRes.body.object.sha;
  console.log('Remote HEAD:', remoteHeadSha);

  // ── 2. Local HEAD ───────────────────────────────────────────────────────────
  const localHeadSha = execSync('git --no-optional-locks rev-parse HEAD', { cwd: CWD, encoding: 'utf8' }).trim();
  console.log('Local HEAD: ', localHeadSha);

  // ── 3. Remote commit → tree SHA ─────────────────────────────────────────────
  const remoteCommitRes = await GET(`${base}/git/commits/${remoteHeadSha}`);
  if (remoteCommitRes.status !== 200) { console.error('Remote commit fetch failed:', remoteCommitRes.body); process.exit(1); }
  const remoteTreeSha = remoteCommitRes.body.tree.sha;
  console.log('Remote tree:', remoteTreeSha);

  // ── 4. Remote tree (recursive) ──────────────────────────────────────────────
  console.log('\nFetching remote tree…');
  const remoteTreeRes = await GET(`${base}/git/trees/${remoteTreeSha}?recursive=1`);
  if (remoteTreeRes.status !== 200) { console.error('Remote tree fetch failed:', remoteTreeRes.body); process.exit(1); }
  // Map: filepath → blob sha
  const remoteFiles = {};
  for (const item of remoteTreeRes.body.tree) {
    if (item.type === 'blob') remoteFiles[item.path] = item.sha;
  }
  console.log(`Remote tree has ${Object.keys(remoteFiles).length} blobs.`);

  // ── 5. Local tree ───────────────────────────────────────────────────────────
  const lsTree = execSync('git --no-optional-locks ls-tree -r HEAD', { cwd: CWD, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean)
    .map(line => {
      const tab  = line.indexOf('\t');
      const meta = line.slice(0, tab).split(' ');
      return { mode: meta[0], type: meta[1], sha: meta[2], path: line.slice(tab + 1) };
    });
  console.log(`Local tree has ${lsTree.length} blobs.`);

  // ── 6. Diff: only upload files that are new or changed ──────────────────────
  const toUpload = lsTree.filter(f => remoteFiles[f.path] !== f.sha);
  const toRemove = Object.keys(remoteFiles).filter(p => !lsTree.find(f => f.path === p));
  console.log(`\nDiff: ${toUpload.length} new/changed, ${toRemove.length} deleted.`);

  // ── 7. Upload only the changed blobs (paced) ────────────────────────────────
  const treeItems = [];
  let done = 0;

  if (toUpload.length > 0) {
    console.log('\nUploading changed blobs (paced at ~2/s)…');
    for (const entry of toUpload) {
      const absPath = `${CWD}/${entry.path}`;
      if (!existsSync(absPath)) { console.warn(`  SKIP (not on disk): ${entry.path}`); continue; }

      const rawBuf = readFileSync(absPath);
      let content, encoding;
      try {
        const str = rawBuf.toString('utf8');
        if (Buffer.from(str, 'utf8').equals(rawBuf)) { content = str; encoding = 'utf-8'; }
        else { throw new Error(); }
      } catch { content = rawBuf.toString('base64'); encoding = 'base64'; }

      const blobRes = await POST(`${base}/git/blobs`, { content, encoding });
      if (blobRes.status !== 201) {
        console.error(`  FAIL blob ${entry.path}:`, blobRes.status, JSON.stringify(blobRes.body).slice(0, 200));
        process.exit(1);
      }
      treeItems.push({ path: entry.path, mode: entry.mode, type: 'blob', sha: blobRes.body.sha });
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${toUpload.length} blobs…`);

      // Pace: 500ms between uploads (~120/min, stays under limit)
      await sleep(500);
    }
    console.log(`  All ${done} changed blobs uploaded.`);
  }

  // Add deletion markers for files removed locally
  for (const p of toRemove) {
    treeItems.push({ path: p, mode: '100644', type: 'blob', sha: null });
  }

  // ── 8. Create tree (based on remote tree, apply our delta) ─────────────────
  console.log('\nCreating tree…');
  const treeRes = await POST(`${base}/git/trees`, {
    base_tree: remoteTreeSha,
    tree: treeItems,
  });
  if (treeRes.status !== 201) { console.error('Tree create failed:', treeRes.body); process.exit(1); }
  const treeSha = treeRes.body.sha;
  console.log('New tree SHA:', treeSha);

  // ── 9. Commit (single parent: remote HEAD) ──────────────────────────────────
  // Use the local HEAD commit message so GitHub history mirrors Replit commits.
  let commitMessage;
  try {
    commitMessage = execSync('git --no-optional-locks log -1 --format=%B HEAD', { cwd: CWD, encoding: 'utf8' }).trim();
    if (!commitMessage) throw new Error('empty');
  } catch {
    commitMessage = 'chore: sync Replit workspace to GitHub';
  }

  console.log('\nCreating commit…');
  const now = new Date().toISOString();
  const commitRes = await POST(`${base}/git/commits`, {
    message: commitMessage,
    tree: treeSha,
    parents: [remoteHeadSha],
    author:    { name: 'OsanVault Agent', email: 'agent@osanvault.africa', date: now },
    committer: { name: 'OsanVault Agent', email: 'agent@osanvault.africa', date: now },
  });
  if (commitRes.status !== 201) { console.error('Commit create failed:', commitRes.body); process.exit(1); }
  const mergeCommitSha = commitRes.body.sha;
  console.log('Merge commit:', mergeCommitSha);

  // ── 10. Update ref ──────────────────────────────────────────────────────────
  console.log('\nUpdating remote ref…');
  const refRes = await PATCH(`${base}/git/refs/heads/main`, { sha: mergeCommitSha, force: true });
  if (refRes.status !== 200) { console.error('Ref update failed:', refRes.body); process.exit(1); }
  console.log('Remote main →', refRes.body.object.sha);

  // ── 11. Verify ──────────────────────────────────────────────────────────────
  const verifyRes = await GET(`${base}/commits?per_page=5`);
  if (verifyRes.status === 200) {
    console.log('\nLatest remote commits:');
    verifyRes.body.forEach(c => console.log(' ', c.sha.slice(0, 8), c.commit.message.split('\n')[0]));
  }
  console.log('\n✓ Push complete — https://github.com/Darkhearted007/osanvault-africa');
}

main().catch(err => { console.error('Fatal:', err.message || err); process.exit(1); });
