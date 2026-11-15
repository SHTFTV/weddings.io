import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// https://supabase.com/docs/reference/api/v1-get-security-advisors
export function normalizeAdvisors(payload) {
  const lints = payload?.lints;
  if (!Array.isArray(lints)) throw Error('Security advisor response is missing its lints array');
  const findings = [];
  for (const lint of lints) {
    if (!lint || typeof lint.name !== 'string' || !lint.name.trim() || !['INFO', 'WARN', 'ERROR'].includes(lint.level)) throw Error('Unrecognized security advisor finding');
    if (lint.level === 'INFO') continue;
    const name = lint.name.replace(/^\d+_/, '');
    findings.push({id: `SUPA_${name}`, level: lint.level.toLowerCase()});
  }
  return {count: findings.length, findings};
}

export async function fetchSecurityScan({token, projectRef, fetcher = fetch} = {}) {
  if (!token) throw Error('SUPABASE_ACCESS_TOKEN is not configured');
  if (!projectRef) throw Error('SUPABASE_PROJECT_REF is not configured');
  const response = await fetcher(`https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/advisors/security`, {
    headers: {Authorization: `Bearer ${token}`}, signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw Error(`Supabase security advisors returned HTTP ${response.status}; verify the configured project and advisors_read permission`);
  return normalizeAdvisors(await response.json());
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const scan = await fetchSecurityScan({token: process.env.SUPABASE_ACCESS_TOKEN, projectRef: process.env.SUPABASE_PROJECT_REF});
    await fs.writeFile(process.argv[2] || '/tmp/security-scan.json', JSON.stringify(scan, null, 2) + '\n');
    console.log(JSON.stringify(scan, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
