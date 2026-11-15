import test from 'node:test';import assert from 'node:assert/strict';
import {inspectChecks,evaluatePublisher,evaluateVisual} from './weddings-supervisor.mjs';
test('failed API check does not suppress a successful publication check',async()=>{let checked=false;const result=await inspectChecks([['bad',async()=>{throw Error('API unavailable');}],['good',async()=>{checked=true;return {httpStatus:200};}]]);assert.equal(result.bad.status,'failed');assert.equal(result.good.status,'passed');assert.equal(checked,true);});
test('manual, missing, stale, future and failed runs cannot establish unattended publishing',()=>{const now=Date.parse('2026-11-12T17:00:00Z'),good={event:'schedule',status:'completed',conclusion:'success',updated_at:'2026-11-12T16:55:00Z'};assert.equal(evaluatePublisher(good,{now}),null);for(const run of [undefined,{...good,event:'push'},{...good,updated_at:'2026-11-11T00:00:00Z'},{...good,updated_at:'2026-11-13T00:00:00Z'},{...good,conclusion:'failure'}])assert.ok(evaluatePublisher(run,{now}));});
test('a completed exact visual job can pass while its shared workflow awaits supervision or has a separate publishing failure',()=>{
 const now=Date.parse('2026-11-14T22:20:00Z');
 const run={id:42,event:'schedule',status:'in_progress',conclusion:null,updated_at:'2026-11-14T22:18:00Z'};
 const jobs=[{run_id:42,name:'visual',status:'completed',conclusion:'success'},{run_id:42,name:'supervisor',status:'in_progress',conclusion:null}];
 assert.equal(evaluateVisual(run,jobs,{now}),null);
 assert.equal(evaluateVisual({...run,status:'completed',conclusion:'failure'},jobs,{now}),null);
 assert.ok(evaluatePublisher({...run,status:'completed',conclusion:'failure'},{now}));
});
test('visual success requires fresh native schedule and exact successful job evidence',()=>{
 const now=Date.parse('2026-11-14T22:20:00Z');
 const run={id:42,event:'schedule',updated_at:'2026-11-14T22:18:00Z'};
 const job={run_id:42,name:'visual',status:'completed',conclusion:'success'};
 for(const [candidate,jobs] of [[undefined,[job]],[{...run,event:'push'},[job]],[{...run,updated_at:'2026-11-13T00:00:00Z'},[job]],[{...run,updated_at:'2026-11-15T00:00:00Z'},[job]],[run,[]],[run,[{...job,run_id:43}]],[run,[{...job,status:'in_progress',conclusion:null}]],[run,[{...job,conclusion:'failure'}]]])assert.ok(evaluateVisual(candidate,jobs,{now}));
});
