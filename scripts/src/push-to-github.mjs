import { execSync } from 'child_process';

const pat = process.env.GITHUB_PAT;
if (!pat) {
  console.error('GITHUB_PAT not set');
  process.exit(1);
}

const repo = 'https://github.com/Darkhearted007/osanvault-africa.git';
const remoteWithAuth = `https://${pat}@github.com/Darkhearted007/osanvault-africa.git`;
const cwd = '/home/runner/workspace';
const run = (cmd, opts = {}) =>
  execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });

try {
  // Configure identity for the merge commit if needed
  try { run('git config user.email "agent@osanvault.africa"'); } catch {}
  try { run('git config user.name "OsanVault Agent"'); } catch {}

  // Fetch remote main
  console.log('Fetching remote…');
  run(`git fetch "${remoteWithAuth}" main:refs/remotes/origin/main`);

  // Check if remote has anything we don't
  const ahead = run('git log refs/remotes/origin/main..HEAD --oneline').trim();
  const behind = run('git log HEAD..refs/remotes/origin/main --oneline').trim();
  console.log('Local ahead:', ahead || '(none)');
  console.log('Remote ahead:', behind || '(none)');

  if (behind) {
    // Merge remote into local, preferring our changes on conflict
    console.log('Merging remote changes (our side wins on conflict)…');
    run('git merge refs/remotes/origin/main --no-edit -X ours -m "Merge remote: keep local institutional platform work"');
    console.log('Merge complete');
  }

  // Push
  console.log('Pushing to GitHub…');
  run(`git push "${remoteWithAuth}" main`);
  console.log('✓ Push succeeded');

  // Print final log
  const log = run('git log --oneline -6');
  console.log('\nLatest commits:\n' + log);
} catch (err) {
  console.error('Failed:', err.stderr || err.message);
  process.exit(1);
}
