import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAdvisors, fetchSecurityScan} from './security-advisor-scan.mjs';

test('normalizes documented advisor response without dropping errors or changing accepted legacy keys', () => {
  assert.deepEqual(normalizeAdvisors({lints: [
    {name: '0028_anon_security_definer_function_executable', level: 'WARN'},
    {name: 'authenticated_security_definer_function_executable', level: 'WARN'},
    {name: 'rls_disabled_in_public', level: 'ERROR'},
    {name: 'unused_index', level: 'INFO'}
  ]}), {count: 3, findings: [
    {id: 'SUPA_anon_security_definer_function_executable', level: 'warn'},
    {id: 'SUPA_authenticated_security_definer_function_executable', level: 'warn'},
    {id: 'SUPA_rls_disabled_in_public', level: 'error'}
  ]});
  assert.deepEqual(normalizeAdvisors({lints: []}), {count: 0, findings: []});
});

test('unreadable responses and missing credentials cannot become an empty successful scan', async () => {
  for (const payload of [{}, [], {lints: [{}]}, {lints: [{name: 'finding', level: 'UNKNOWN'}]}]) assert.throws(() => normalizeAdvisors(payload));
  await assert.rejects(fetchSecurityScan({projectRef: 'example'}), /ACCESS_TOKEN/);
  await assert.rejects(fetchSecurityScan({token: 'private'}), /PROJECT_REF/);
  await assert.rejects(fetchSecurityScan({token: 'private', projectRef: 'example', fetcher: async () => ({ok: false, status: 403})}), /HTTP 403/);
});
