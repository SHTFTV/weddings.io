import fs from 'node:fs';
const file='src/lib/blogPosts.ts';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('import scheduledBlogPosts from'))source='import scheduledBlogPosts from "./scheduledBlogPosts.json" with { type: "json" };\n'+source;
if(!source.includes('...(scheduledBlogPosts as BlogPost[])'))source=source.replace('const allBlogPosts: BlogPost[] = [','const allBlogPosts: BlogPost[] = [\n  ...(scheduledBlogPosts as BlogPost[]),');
if(!source.includes('...scheduledBlogPosts.map(post => post.slug)'))source=source.replace('const visibleBlogSlugs = [','const visibleBlogSlugs = [\n  ...scheduledBlogPosts.map(post => post.slug),');
fs.writeFileSync(file,source);
