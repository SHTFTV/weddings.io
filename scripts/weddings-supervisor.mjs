import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const repository='SHTFTV/weddings.io',site='weddings.io';
export async function inspectChecks(checks){
 const results=await Promise.allSettled(checks.map(async([name,check])=>({name,value:await check()})));
 return Object.fromEntries(results.map((r,i)=>[checks[i][0],r.status==='fulfilled'?{status:'passed',value:r.value.value}:{status:'failed',error:String(r.reason?.message||r.reason)}]));
}
export function evaluatePublisher(run,{now=Date.now(),maxAge=8*3600000}={}){
 if(!run)return 'Native scheduled publisher run missing';
 if(run.event!=='schedule')return 'Publisher run was not native scheduled execution';
 const age=now-Date.parse(run.updated_at);
 if(!Number.isFinite(age)||age<0||age>maxAge)return 'Publisher run is stale or has an invalid timestamp';
 if(run.status!=='completed'||run.conclusion!=='success')return 'Latest scheduled publisher is failed or incomplete';
 return null;
}
async function getJson(url){const r=await fetch(url,{headers:{'User-Agent':'Weddings-read-only-supervisor'},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`HTTP ${r.status} at ${new URL(url).pathname}`);return r.json();}
export async function run(){
 const posts=JSON.parse(await fs.readFile('src/lib/scheduledBlogPosts.json','utf8'));
 const latest=[...posts].sort((a,b)=>b.date.localeCompare(a.date))[0];
 const sot=await fs.readFile('docs/WEDDINGS-IO-SOT.md','utf8');
 const checks=[
  ['production',()=>getJson('https://weddings.io/build-info.json')],
  ['publisher',()=>getJson(`https://api.github.com/repos/${repository}/actions/workflows/editorial-publisher.yml/runs?event=schedule&per_page=5`)],
  ['visual',()=>getJson(`https://api.github.com/repos/${repository}/actions/workflows/hero-og-visual-diff.yml/runs?event=schedule&per_page=5`)],
  ['publication',async()=>{
   if(!latest)throw Error('No published article identity in source');
   const slug=latest.slug,url=`https://weddings.io/blog/${slug}/`;
   const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),html=await r.text();
   if(!r.ok||!html.includes(latest.title)||!html.includes('BlogPosting')||!html.includes(latest.image))throw Error('Actual article content/schema/image identity failed');
   for(const path of ['/rss.xml','/sitemap-posts.xml']){const feed=await fetch('https://weddings.io'+path,{signal:AbortSignal.timeout(20000)});if(!feed.ok||!(await feed.text()).includes('/blog/'+slug+'/'))throw Error('Article discovery missing in '+path);}
   return {url,httpStatus:r.status,discoveryVerified:true};
  }]
 ];
 const results=await inspectChecks(checks),blockers=[];
 for(const [name,r] of Object.entries(results))if(r.status!=='passed')blockers.push({check:name,reason:r.error});
 const publisher=results.publisher.value?.workflow_runs?.[0];
 const publisherReason=evaluatePublisher(publisher);if(publisherReason)blockers.push({check:'publisher-runtime',reason:publisherReason});
 const visual=results.visual.value?.workflow_runs?.[0];
 const visualReason=evaluatePublisher(visual);if(visualReason)blockers.push({check:'visual-runtime',reason:visualReason.replaceAll('Publisher','Visual').replaceAll('publisher','visual')});
 // A successful wrapper is not a matching actual publication/queue/SOT receipt.
 if(publisher)blockers.push({check:'worker-receipt',reason:'Provider run status alone is insufficient; approved SOT and durable publication/queue/isolation receipt adapter must match the actual worker run.'});
 const runRef=process.env.GITHUB_RUN_ID?`https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`:null;
 if(!runRef||process.env.GITHUB_EVENT_NAME!=='schedule')blockers.push({check:'supervisor-runtime',reason:'This supervisor execution is not yet a native scheduled run.'});
 const receipt={site,repository,check:'role:supervisor',status:blockers.length?'blocked':'unknown',environment:'production',synthetic:false,observedAt:new Date().toISOString(),sourceCommit:results.production.value?.commitFull||null,observerSourceCommit:process.env.GITHUB_SHA||null,trigger:process.env.GITHUB_EVENT_NAME||'local',actorId:'weddings-read-only-supervisor',executionProvider:runRef?'github-actions':'local',schedulerIdentity:'.github/workflows/hero-og-visual-diff.yml',runRef,proofRef:runRef?runRef+'#artifacts':null,loadedRevision:process.env.GITHUB_SHA||null,loadedHash:createHash('sha256').update(sot).digest('hex'),sotSourceRef:'docs/WEDDINGS-IO-SOT.md',checkedWorkerRunRef:publisher?.html_url||null,checkedVisualRunRef:visual?.html_url||null,actualSourceApiDeploymentPublicationChecks:false,checks:results,blockers};
 await fs.mkdir('tests/visual-regression/supervisor',{recursive:true});await fs.writeFile('tests/visual-regression/supervisor/role-receipt.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));if(blockers.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await run();
