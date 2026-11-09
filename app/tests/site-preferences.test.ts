import {describe,expect,test} from "bun:test";
import {parseFloorSelection} from "../src/features/site/cookie-storage";
import {pageHead} from "../src/features/site/seo";
import {workPhotos} from "../src/work-photos";
import french from "../src/features/site/fr.json";
const valid={room:"Kitchen",finish:"Flake",palette:-1,base:"#123456",accent:"#ABCDEF",comparison:42};
describe("optional saved floor selections",()=>{
 test("restores valid selections and drops unrelated data",()=>{
  expect(parseFloorSelection(JSON.stringify({...valid,extra:"ignored"}))).toEqual(valid);
 });
 test("rejects malformed, out-of-range and unsupported cookie values",()=>{
  for(const value of [undefined,"invalid","null","{}",JSON.stringify({...valid,room:"Office"}),JSON.stringify({...valid,palette:6}),JSON.stringify({...valid,comparison:101}),JSON.stringify({...valid,comparison:"42"}),JSON.stringify({...valid,accent:"red"})])expect(parseFloorSelection(value)).toBeNull();
 });
});
describe("bilingual discovery",()=>{
 test("both languages have their own canonical and reciprocal alternates",()=>{
  for(const language of ["en","fr"] as const){
   const head=pageHead(language);
   expect(head.links.find(link=>link.rel==="canonical")?.href).toBe("https://www.groupemengistie.com"+(language==="fr"?"/fr":"/"));
   expect(head.links.filter(link=>link.rel==="alternate").map(link=>link.hrefLang)).toEqual(["en-CA","fr-CA","x-default"]);
   const business=JSON.parse(head.scripts[0].children);
   expect(business.areaServed.name).toBe("Montréal");
   expect(business.aggregateRating).toBeUndefined();
  }
 });
 test("every project photo has a French description",()=>{
  for(const photo of workPhotos)expect((french as Record<string,string>)[photo.alt]).toBeTruthy();
 });
});
