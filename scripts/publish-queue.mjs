import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { pathToFileURL } from 'node:url';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export async function processQueue(queue, posts, {now = new Date(), validate} = {}) {
  const results=[];
  for (const item of queue) {
    if (!['ready','retry'].includes(item.status)) continue;
    try {
      for (const key of ['notBefore','nextAttemptAt']) {
        if(item[key] && !Number.isFinite(Date.parse(item[key])))throw Error('Invalid '+key);
        if(item[key] && Date.parse(item[key])>+now)throw Object.assign(Error('not due'),{notDue:true});
      }
      if(!item.id || !item.post?.slug)throw Error('Article identity missing');
      if(posts.some(post=>post.slug===item.post.slug)) {
        item.status='released'; results.push({id:item.id,status:'duplicate-skipped'});continue;
      }
      await validate(item);
      posts.push(item.post); item.status='released'; item.sourcePreparedAt=now.toISOString(); delete item.error;
      results.push({id:item.id,status:'released',slug:item.post.slug});
    } catch(error) {
      if(error.notDue)continue;
      item.attempts=(item.attempts||0)+1; item.error=String(error.message).slice(0,500);
      item.status=item.attempts>=3?'blocked':'retry';
      item.nextAttemptAt=new Date(+now+Math.min(24,2**item.attempts)*3600000).toISOString();
      results.push({id:item.id,status:item.status,error:item.error});
    }
  }
  return results;
}
export function writeJsonAtomic(file,value){
 const temp=file+'.tmp-'+process.pid;fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n');fs.renameSync(temp,file);
}
export async function run() {
  fs.mkdirSync('publishing',{recursive:true});
  // Workflow concurrency is the cloud lease. Atomic local lock prevents overlapping local writers.
  const lock='publishing/.writer-lock'; const fd=fs.openSync(lock,'wx');
  try {
    const config=JSON.parse(process.env.WEDDINGS_PRIVATE_SOT_JSON||'null');
    if(config?.approved!==true||!config.revision||!config.canonicalRef||!config.policy||config.contentHash!==hash(JSON.stringify(config.policy)))throw Error('APPROVED_PRIVATE_POLICY_REQUIRED');
    const policy=config.policy;
    const queue=JSON.parse(fs.readFileSync('publishing/queue.json'));
    const posts=JSON.parse(fs.readFileSync('src/lib/scheduledBlogPosts.json'));
    const results=await processQueue(queue,posts,{validate:async item=>{
      const p=item.post;
      const subject=[p?.title,p?.subtitle,p?.excerpt,...(p?.body||[])].join(' ').toLowerCase();
      if(policy.excludedEditorialSubjects.some(x=>subject.includes(x.toLowerCase()))) throw Error('Explicit editorial subject exclusion');
      if(p?.sources?.some(x=>policy.excludedSourceHosts.some(host=>new URL(x.url).hostname===host || new URL(x.url).hostname.endsWith('.'+host)))) throw Error('Explicit source exclusion');
      if(!item.editorialVerifiedAt || !item.sourceCheckedAt) throw Error('Missing factual verification');
      if(!p?.slug?.match(/^[a-z0-9-]+$/) || !p.body?.length || !p.sources?.length || !p.focusKeywords?.length) throw Error('Incomplete article');
      if(!p.imageCredit || /shutterstock/i.test(p.imageCredit)) throw Error('Invalid media credit');
      if(p.image.includes('..') || !p.image.startsWith('/images/')) throw Error('Invalid local media path');
      const media=await sharp('public'+p.image).metadata();
      if(media.width!==1600 || media.height!==900) throw Error('Hero must be native or downscaled 1600x900');
      for(const source of p.sources){
        const url=new URL(source.url); if(url.protocol!=='https:') throw Error('HTTPS primary source required');
        const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
        if(!response.ok) throw Error(`Source HTTP ${response.status}: ${url.hostname}`);
        await response.arrayBuffer();
      }
    }});
    const receipt={at:new Date().toISOString(),event:process.env.GITHUB_EVENT_NAME||'local',runId:process.env.GITHUB_RUN_ID||null,sot:{canonicalRef:config.canonicalRef,approvedRevision:config.revision,loadedRevision:config.revision,approvedHash:config.contentHash,loadedHash:hash(JSON.stringify(policy))},results};
    writeJsonAtomic('publishing/queue.json',queue);
    writeJsonAtomic('src/lib/scheduledBlogPosts.json',posts);
    fs.appendFileSync('publishing/receipts.jsonl',JSON.stringify(receipt)+'\n');
    writeJsonAtomic('publishing/latest-run.json',receipt);
    console.log(JSON.stringify(receipt));
  } finally {fs.closeSync(fd);fs.unlinkSync(lock);}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) await run();
