import fs from 'node:fs';import {pathToFileURL} from 'node:url';
export async function intake(sources,state,{fetcher=fetch,now=new Date(),excludedHosts=[]}={}){
 const failures=[];state.sources??={};state.candidates??=[];
 const excluded=url=>excludedHosts.some(host=>url.hostname===host||url.hostname.endsWith('.'+host));
 for(const source of sources){
  const previous=state.sources[source.id]||{};
  if(previous.status==='blocked'||Date.parse(previous.nextAttemptAt||0)>+now)continue;
  try{
   const base=new URL(source.url);if(base.protocol!=='https:'||excluded(base))throw Error('Source is not eligible');
   const response=await fetcher(base.href,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);
   const html=await response.text(),pattern=new RegExp(source.pathPattern);
   for(const match of html.matchAll(/href=["']([^"']+)["']/g)){
    try{const url=new URL(match[1],base);url.hash='';if(url.protocol!=='https:'||url.hostname!==base.hostname||excluded(url)||!pattern.test(url.pathname))continue;
     if(!state.candidates.some(x=>x.url===url.href))state.candidates.push({url:url.href,sourceId:source.id,firstSeenAt:now.toISOString(),status:'needs-research'});
    }catch(error){failures.push({sourceId:source.id,kind:'link',reason:'Invalid source link'});}
   }
   state.sources[source.id]={status:'ok',attempts:0,checkedAt:now.toISOString()};
  }catch(error){const attempts=(previous.attempts||0)+1;state.sources[source.id]={status:attempts>=3?'blocked':'retry',attempts,checkedAt:now.toISOString(),nextAttemptAt:new Date(+now+Math.min(24,2**attempts)*3600000).toISOString(),error:String(error.message)};failures.push({sourceId:source.id,kind:'feed',reason:String(error.message)});}
 }
 return {failures,state};
}
async function run(){const config=JSON.parse(process.env.WEDDINGS_PRIVATE_SOT_JSON||'null');if(!config?.approved||!config.sources)throw Error('Approved private source configuration is missing');const file='publishing/intake.json',state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{sources:{},candidates:[]};const result=await intake(config.sources,state,{excludedHosts:config.policy?.excludedSourceHosts||[]});fs.writeFileSync(file,JSON.stringify(result.state,null,2)+'\n');console.log(JSON.stringify({failures:result.failures,candidates:result.state.candidates.length,draftingProvider:'not-connected'}));}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await run();
