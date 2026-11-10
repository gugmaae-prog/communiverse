import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { optimizeBaseline } from '../../repairs/account-media-20261109/scripts/optimize-baseline.mjs';
import { enableAccounts } from './enable-accounts.mjs';

test('restores accounts only behind the existing branded two-part gate', async () => {
  const baseline = gunzipSync(await readFile(new URL('../modules/public-worker.mjs.gz', import.meta.url)));
  const optimized = optimizeBaseline(baseline);
  const enabled = enableAccounts(optimized);
  assert.match(enabled, /let accountReady=accountConfiguration\(env\)\.enabled/);
  assert.match(enabled, /if\(!accountReady&&\(pausedAccountPage\(request\)\|\|pausedAccountAPI\(request\)\)\)/);
  assert.match(enabled, /return accountReady\?publicResponse:accountPausedSupport/);
  assert.match(enabled, /CV_ACCOUNT_CUTOVER_READY==="true"/);
  assert.match(enabled, /BRANDED_APP_BASE="https:\/\/communiverseclubs\.com\/account\/"/);
  assert.equal(enabled.length > optimized.length, true);
  assert.throws(() => enableAccounts(enabled), /Unexpected account pause anchor/);
});
