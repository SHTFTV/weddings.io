import {test} from 'node:test';import assert from 'node:assert/strict';
import {processQueue} from './publish-queue.mjs';
const at=()=>new Date('2026-11-12T12:00:00Z');
test('failed first item does not stall same-run release; retry bound and dedup survive persisted state',async()=>{
 const queue=[{id:'bad',status:'ready',post:{slug:'bad'}},{id:'good',status:'ready',post:{slug:'good'}}];
 const posts=[];const validate=async item=>{if(item.id==='bad')throw Error('source unavailable');};
 const r=await processQueue(queue,posts,{now:at(),validate});assert.deepEqual(r.map(x=>x.status),['retry','released']);
 // Source release is explicitly not a live publication claim.
 assert.equal(queue[1].liveVerifiedAt,undefined);
 let restored=JSON.parse(JSON.stringify(queue)),savedPosts=JSON.parse(JSON.stringify(posts));
 for(const day of [13,14,15])await processQueue(restored,savedPosts,{now:new Date(`2026-11-${day}T12:00:00Z`),validate});
 assert.equal(restored[0].status,'blocked');assert.equal(restored[0].attempts,3);assert.equal(savedPosts.length,1);
 restored[1].status='ready';assert.equal((await processQueue(restored,savedPosts,{now:at(),validate}))[0].status,'duplicate-skipped');
});
test('invalid timing or identity is isolated; a future retry does not starve healthy work',async()=>{
 const queue=[{id:'invalid-date',status:'ready',notBefore:'invalid',post:{slug:'one'}},{id:'later',status:'retry',nextAttemptAt:'2026-12-01T00:00:00Z',post:{slug:'later'}},{id:'missing',status:'ready'},{id:'healthy',status:'ready',post:{slug:'healthy'}}],posts=[];
 const r=await processQueue(queue,posts,{now:at(),validate:async()=>{}});assert.deepEqual(r.map(x=>x.id),['invalid-date','missing','healthy']);assert.equal(posts.length,1);assert.equal(posts[0].slug,'healthy');assert.equal(queue[1].attempts,undefined);
});
test('two queued entries for one source article release once',async()=>{const q=[1,2].map(id=>({id:String(id),status:'ready',post:{slug:'same'}})),p=[];await processQueue(q,p,{now:at(),validate:async()=>{}});assert.equal(p.length,1);});
