import { createElement } from "react";
import type { ScrollScrubScene, ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";
export const scrollScrubTheme: ScrollScrubTheme = {accent:"#D5E6DC",background:"#173D32",ink:"#FFFFFF",muted:"#EDF2EF"};
export const scrollScrubScenes: ScrollScrubScene[] = [{
id:"transformation",label:"The transformation",title:"Epoxy flooring in Montreal.",
body:"From bare concrete to metallic epoxy. A new perspective on the spaces you live in.",
clip:"/assets/world/scene-01-hq.mp4",poster:"/assets/world/scene-01-hq-poster.png",
mobileClip:"/assets/world/scene-01-mobile-hq.mp4",mobilePoster:"/assets/world/scene-01-mobile-hq-poster.png",
scroll:2.6,linger:.15,objectPosition:"50% 55%",mobileObjectPosition:"50% 60%",
actions:createElement("a",{href:"#studio",className:"hero-action"},"Imagine your floor ↗")
}];


export const frenchScrollScrubScenes: ScrollScrubScene[] = scrollScrubScenes.map(scene=>({...scene,
label:"La transformation",title:"Planchers d’époxy à Montréal.",
body:"Du béton brut à l’époxy métallique. Une nouvelle perspective sur vos espaces de vie.",
actions:createElement("a",{href:"#studio",className:"hero-action"},"Imaginez votre plancher ↗")
}));
