import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const origin='https://weddings.io';
const out='tests/visual-regression/hero-og';
await fs.mkdir(out,{recursive:true});
const posts=JSON.parse(await fs.readFile('src/lib/scheduledBlogPosts.json','utf8'));
const latest=[...posts].sort((a,b)=>b.date.localeCompare(a.date))[0];
if(!latest)throw Error('No actual published article registered');
const runRef=process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`:null;
const build=await (await fetch(origin+'/build-info.json',{signal:AbortSignal.timeout(20000)})).json();
const sot=await fs.readFile('docs/WEDDINGS-IO-SOT.md','utf8');
const receipt={loadedRevision:process.env.GITHUB_SHA||null,loadedHash:createHash('sha256').update(sot).digest('hex'),sotPath:'docs/WEDDINGS-IO-SOT.md',site:'weddings.io',repository:'SHTFTV/weddings.io',sourceCommit:build.commitFull,check:'role:visual-checker',environment:'production',synthetic:false,actorId:'weddings-production-visual-checker',executionProvider:'github-actions',schedulerIdentity:'.github/workflows/hero-og-visual-diff.yml',trigger:process.env.GITHUB_EVENT_NAME||'local',runRef,proofRef:runRef?runRef+'#artifacts':null,observedAt:new Date().toISOString(),status:'failed',pageUrls:[],checks:[],errors:[]};
const browser=await chromium.launch();
try{
 for(const device of [{name:'desktop',width:1440,height:1000},{name:'phone',width:390,height:844}]){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  const page=await context.newPage();
  for(const [label,path] of [['home','/'],['blog','/blog/'],['article',`/blog/${latest.slug}/`]]){
   const url=origin+path;receipt.pageUrls.push(url);
   try{
    const response=await page.goto(url,{waitUntil:'networkidle',timeout:60000});
    if(response.status()!==200)throw Error('Page HTTP '+response.status());
    await page.locator('body').waitFor();
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>{})));});
    const metadata=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogDescription:document.querySelector('meta[property="og:description"]')?.content,ogImage:document.querySelector('meta[property="og:image"]')?.content,twitterCard:document.querySelector('meta[name="twitter:card"]')?.content,twitterImage:document.querySelector('meta[name="twitter:image"]')?.content,icon:document.querySelector('link[rel~="icon"]')?.href,overflow:document.documentElement.scrollWidth>innerWidth+1,bodyFont:parseFloat(getComputedStyle(document.body).fontSize)}));
    if(metadata.bodyFont<16)throw Error('Body text below 16px');
    if(metadata.overflow)throw Error('Horizontal overflow');
    if(!metadata.title||!metadata.description||!metadata.canonical||!metadata.ogTitle||!metadata.ogDescription||!metadata.ogImage||!metadata.twitterImage||!metadata.twitterCard||!metadata.icon)throw Error('Required page or preview metadata missing');
    if(new URL(metadata.canonical).pathname.replace(/\/$/,'')!==new URL(url).pathname.replace(/\/$/,''))throw Error('Canonical mismatch');
    for(const asset of [metadata.ogImage,metadata.twitterImage,metadata.icon])if(!(await page.request.get(asset)).ok())throw Error('Missing preview/icon asset');
    if(label==='article'){
     await page.getByRole('heading',{name:latest.title,exact:true}).waitFor();
     const hero=page.locator('figure img').first();
     await hero.scrollIntoViewIfNeeded();
     const image=await hero.evaluate(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,loaded:i.complete}));
     if(!image.loaded||image.width<1600||image.height<900||!image.src.includes(latest.image))throw Error('Actual article hero identity/resolution mismatch');
     if(!metadata.ogImage.includes(latest.ogImage)||!metadata.twitterImage.includes(latest.ogImage))throw Error('Wrong article-specific social image');
     if(!(await page.locator('figcaption').first().textContent()).includes('illustration'))throw Error('Original illustration credit missing');
     await page.screenshot({path:`${out}/${device.name}-article-hero.png`,fullPage:false});
    }else{
     const card=page.locator(`a[href*="/blog/${latest.slug}"]`).first();await card.waitFor();await card.scrollIntoViewIfNeeded();
     const cardImage=page.locator(`a[href*="/blog/${latest.slug}"] img`).first();
     await cardImage.waitFor();await cardImage.scrollIntoViewIfNeeded();
     const cardMedia=await cardImage.evaluate(async i=>{await i.decode();return {src:i.currentSrc,width:i.naturalWidth};});
     if(!cardMedia.src.includes(latest.image)||cardMedia.width<390)throw Error('Actual latest-story card image mismatch');
     await page.screenshot({path:`${out}/${device.name}-${label}-card.png`,fullPage:false});
    }
    await page.screenshot({path:`${out}/${device.name}-${label}-full.png`,fullPage:true});
    receipt.checks.push({device:device.name,url,status:'passed',metadata});
   }catch(error){receipt.errors.push({device:device.name,url,error:String(error.message)});}
  }
  await context.close();
 }
 receipt.pageUrls=[...new Set(receipt.pageUrls)];
 receipt.desktopRenderRef=receipt.proofRef?receipt.proofRef+'/desktop-article-hero.png':null;
 receipt.phoneRenderRef=receipt.proofRef?receipt.proofRef+'/phone-article-hero.png':null;
 receipt.status=receipt.errors.length?'failed':'passed';
}finally{
 await browser.close();
 await fs.writeFile(out+'/role-receipt.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));
}
if(receipt.status!=='passed')process.exitCode=1;
