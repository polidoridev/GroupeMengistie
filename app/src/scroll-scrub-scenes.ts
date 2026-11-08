import { createElement } from "react";
import type { ScrollScrubScene, ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";
export const scrollScrubTheme: ScrollScrubTheme = {accent:"#D5E6DC",background:"#173D32",ink:"#FFFFFF",muted:"#EDF2EF"};
export const scrollScrubScenes: ScrollScrubScene[] = [{
id:"transformation",label:"The transformation",title:"A different kind of floor.",
body:"From bare concrete to metallic epoxy. A new perspective on the spaces you live in.",
clip:"/assets/world/scene-01-hq.mp4",poster:"/assets/world/scene-01-hq-poster.png",
mobileClip:"/assets/world/scene-01-mobile-hq.mp4",mobilePoster:"/assets/world/scene-01-mobile-hq-poster.png",
scroll:2.6,linger:.15,objectPosition:"50% 55%",mobileObjectPosition:"50% 60%",
actions:createElement("a",{href:"#studio",className:"hero-action"},"Imagine your floor ↗")
}];

