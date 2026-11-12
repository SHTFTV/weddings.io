import fs from 'node:fs';
const queue=JSON.parse(fs.readFileSync('publishing/queue.json'));
const checked=[];
for(const item of queue.filter(x=>['released','published'].includes(x.status) && !x.liveVerifiedAt)) {
 let error;
 for(let attempt=0;attempt<12;attempt++){
  try{
   const url=`https://weddings.io/blog/${item.post.slug}/`;
   const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
   const html=await response.text();
   if(!response.ok || !html.includes(item.post.title) || !html.includes(item.post.image) || !html.includes('BlogPosting')) throw Error(`Production article not ready: HTTP ${response.status}`);
   item.liveVerifiedAt=new Date().toISOString(); item.liveUrl=url; item.status='live';
   checked.push({id:item.id,url,status:'live',at:item.liveVerifiedAt});error=null;break;
  }catch(e){error=e.message;if(attempt<11)await new Promise(resolve=>setTimeout(resolve,20000));}
 }
 if(error)checked.push({id:item.id,status:'not-verified',error});
}
fs.writeFileSync('publishing/queue.json',JSON.stringify(queue,null,2)+'\n');
fs.appendFileSync('publishing/live-receipts.jsonl',JSON.stringify({at:new Date().toISOString(),event:process.env.GITHUB_EVENT_NAME||'local',runId:process.env.GITHUB_RUN_ID||null,checked})+'\n');
console.log(JSON.stringify(checked));
if(checked.some(x=>x.status!=='live'))process.exitCode=1;
