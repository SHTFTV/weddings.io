import { blogPosts } from "../src/lib/blogPosts.ts";
import { readFileSync } from "node:fs";
// These owner-approved articles are published, not scheduled/hidden drafts.
const required = ["wedding-rental-return-plan-last-box","wedding-room-reset-ceremony-reception"];
for (const slug of required) {
 const post=blogPosts.find(p=>p.slug===slug);
 if (!post?.body?.length || post.date!=="2026-10-27") throw new Error("Published October 27 article missing from runtime registry: "+slug);
 for (const file of ["public/rss.xml","public/sitemap-posts.xml"]) {
  if (!readFileSync(file,"utf8").includes("/blog/"+slug)) throw new Error("Published article missing from "+file+": "+slug);
 }
}
console.log("October 27 published-article registry/feed gate passed");
