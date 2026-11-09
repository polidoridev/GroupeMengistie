import { useLanguage } from "./language";
import { CookiePreferences, useFloorPreferences } from "./cookies";
import { useState, type CSSProperties } from "react";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, frenchScrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { palettes } from "@/floor-data";
import { ColourWheel } from "@/components/colour-wheel";
import { WorkGallery } from "@/components/work-gallery";
import { FloorViewer } from "@/components/floor-viewer";

const rooms = ["Garage", "Kitchen", "Bathroom", "Basement"] as const;
export function HomePage() {
 const {language,t}=useLanguage();
 const [selection,setSelection]=useState({room:"Garage",finish:"Metallic",palette:0,base:palettes[0].base,accent:palettes[0].accent,comparison:100});
 const {room,finish,palette,base,accent,comparison}=selection;
 const setRoom=(room:string)=>setSelection(s=>({...s,room}));
 const setFinish=(finish:string)=>setSelection(s=>({...s,finish}));
 const setPalette=(palette:number)=>setSelection(s=>({...s,palette}));
 const setBase=(base:string)=>setSelection(s=>({...s,base}));
 const setAccent=(accent:string)=>setSelection(s=>({...s,accent}));
 const setComparison=(comparison:number)=>setSelection(s=>({...s,comparison}));
 const [colourTarget,setColourTarget]=useState<"base"|"accent">("base");
 const preferences=useFloorPreferences(selection,setSelection);
 const summary=t(room)+" / "+t(finish)+" / "+(palette<0?t("Custom colours"):t(palettes[palette].name));
 const quote="mailto:groupemengistie@gmail.com?subject="+encodeURIComponent((language==="fr"?"Soumission pour un plancher d’époxy : ":"Epoxy flooring quote: ")+t(room))+"&body="+encodeURIComponent(language==="fr"?`Bonjour Groupe Mengistie,

J’aimerais une soumission pour la pièce suivante : ${t(room)}.
Finition : ${t(finish)}
Palette : ${palette<0?t("Custom colours"):t(palettes[palette].name)}
Base : ${base}
Accent : ${accent}

Superficie approximative :
Adresse :
Téléphone :
Échéancier souhaité :

Merci !`:`Hello Groupe Mengistie,

I'd like a quote for my ${room.toLowerCase()}.
Finish: ${finish}
Palette: ${palette<0?"Custom colours":palettes[palette].name}
Base: ${base}
Accent: ${accent}

Approximate floor size:
Location:
Phone:
Preferred timeline:

Thank you!`);
 function selectPalette(i:number){setPalette(i);setBase(palettes[i].base);setAccent(palettes[i].accent);}
 return <div className="mengistie">
  <a className="skip-link" href="#studio">{t("Skip to floor studio")}</a>
  <header className="site-header">
   <a className="brand" href="#" aria-label={t("Groupe Mengistie home")}>Groupe Mengistie</a>
   <nav aria-label={t("Main navigation")}><a href="#studio">{t("Floor studio")}</a><a href="#finishes">{t("Finishes")}</a><a href="#previous-work">{t("Previous work")}</a><a className="nav-quote" href="#contact">{t("Get a quote")} <span>↗</span></a><a className="language-switch" href={language==="fr"?"/":"/fr"} hrefLang={language==="fr"?"en":"fr"} lang={language==="fr"?"en":"fr"} aria-label={language==="fr"?"Switch to English":"Passer en français"}>{language==="fr"?"EN":"FR"}</a></nav>
  </header>
  <main>
   <section className="hero" aria-label={t("Concrete to metallic epoxy transformation")}>
    <ScrollScrub scenes={language==="fr"?frenchScrollScrubScenes:scrollScrubScenes} theme={scrollScrubTheme}/>
    <a className="hero-studio" href="#studio">{t("Imagine your floor")} <span>↗</span></a>
   </section>
   <section className="studio section-space" id="studio">
    <div className="studio-heading"><p className="eyebrow">{t("YOUR SPACE. YOUR FINISH.")}</p><h2>{t("Imagine your floor.")}</h2><p>{t("Choose a room and finish. Start with a colour palette, or make it your own with the colour wheel.")}</p></div>
    <div className="studio-layout">
     <div className="preview-column">
      <FloorViewer room={room} finish={finish} base={base} accent={accent} comparison={comparison}/>
      <div className="preview-caption"><span aria-live="polite">{summary}</span><span>{t("Interactive 3D render")}</span></div>
      <label className="comparison" htmlFor="comparison"><span>{t("Compare with concrete")}</span><input id="comparison" type="range" min="0" max="100" value={comparison} onChange={e=>setComparison(Number(e.target.value))} aria-valuetext={comparison+(language==="fr"?" pour cent d’époxy":" percent epoxy")}/><span>{comparison}% {language==="fr"?"époxy":"epoxy"}</span></label>
      <p className="preview-note">{t("Interactive 3D rooms with epoxy materials, lighting and reflections. Drag to orbit and zoom to inspect the finish. Rooms and colours are illustrative; confirm your finish with a physical sample.")}</p>
     </div>
     <div className="studio-controls">
      <fieldset><legend>{t("Choose your room")}</legend><div className="room-options">{rooms.map(r=><button key={r} aria-pressed={r===room} onClick={()=>{setRoom(r);}}>{t(r)}</button>)}</div></fieldset>
      <fieldset><legend>{t("Choose your finish")}</legend><div className="finish-options">{(["Metallic","Flake"] as const).map(f=><button key={f} aria-pressed={finish===f} onClick={()=>setFinish(f)}>{t(f)}</button>)}</div><p className="control-note">{finish==="Metallic"?t("Fluid movement. Reflective depth. Every pattern is individual."):t("A layered blend of small chips for a finely textured appearance.")}</p></fieldset>
      <fieldset><legend>{t("Explore a palette")}</legend><div className="swatches">{palettes.map((p,i)=><button key={p.name} aria-pressed={palette===i} aria-label={t(p.name)} onClick={()=>selectPalette(i)}><span style={{"--swatch-base":p.base,"--swatch-accent":p.accent} as CSSProperties} className={"swatch "+finish.toLowerCase()}/><span>{t(p.name)}</span></button>)}</div></fieldset>
      <fieldset className="custom-finish"><legend>{t("Make it your own")}</legend><div className="colour-target" role="group" aria-label={t("Colour to adjust")}><button aria-pressed={colourTarget==="base"} onClick={()=>setColourTarget("base")}><span style={{backgroundColor:base}}/>{t("Base colour")}</button><button aria-pressed={colourTarget==="accent"} onClick={()=>setColourTarget("accent")}><span style={{backgroundColor:accent}}/>{finish==="Metallic"?t("Vein colour"):t("Flake colour")}</button></div><ColourWheel key={colourTarget} value={colourTarget==="base"?base:accent} label={colourTarget==="base"?t("Base colour"):finish==="Metallic"?t("Vein colour"):t("Flake colour")} onChange={colour=>{setPalette(-1);if(colourTarget==="base")setBase(colour);else setAccent(colour);}}/><p className="control-note">{t("Choose a colour on the wheel. Adjust brightness for lighter or darker tones.")}</p></fieldset>
      <a className="studio-quote" href={quote}>{t("Get a quote")} <span>↗</span><small>{t("Opens your email with this selection")}</small></a>
     </div>
    </div>
   </section>
   <section className="finishes section-space" id="finishes">
    <h2>{t("Two finishes.")}<br/>{t("Endless possibilities.")}</h2>
    <div className="finish-gallery">
     <article className="metallic-feature"><img src="/assets/metallic.webp" alt={t("Silver and graphite flowing metallic epoxy texture")} width="1600" height="900" loading="lazy"/><div><h3>{t("Metallic")}</h3><p>{t("Swirling pigments create depth and movement, with a finish that makes the floor part of the room\u2019s character.")}</p><button onClick={()=>{setFinish("Metallic");document.getElementById("studio")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}>{t("Try metallic")} <span>↗</span></button></div></article>
     <article className="flake-feature"><img src="/assets/flake.webp" alt={t("Grey, white and charcoal flake epoxy texture")} width="1600" height="900" loading="lazy"/><div><h3>{t("Flake")}</h3><p>{t("Contrasting chips bring a balanced, textured look. Explore subtle neutrals or a bolder blend for your everyday spaces.")}</p><button onClick={()=>{setFinish("Flake");document.getElementById("studio")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}>{t("Try flake")} <span>↗</span></button></div></article>
    </div>
   </section>
   <section className="approach section-space" id="approach"><h2>{t("A considered approach.")}<br/>{t("From the ground up.")}</h2><p className="approach-intro">{t("Groupe Mengistie focuses on epoxy flooring in Montreal, with care for your home and clear communication from the first conversation.")}</p>
    <div className="process-row"><span>01</span><h3>{t("Assess your space")}</h3><p>{t("Discuss how you use the room, your preferred finish and the condition of the existing surface.")}</p></div>
    <div className="process-row"><span>02</span><h3>{t("Prepare the foundation")}</h3><p>{t("Surface preparation matters. Your project assessment determines the preparation and repairs needed before coating.")}</p></div>
    <div className="process-row"><span>03</span><h3>{t("Apply your finish")}</h3><p>{t("Bring your selected look to life, with care instructions and return-to-use timing tailored to your flooring system.")}</p></div>
   </section>
   <section className="previous-work section-space" id="previous-work" aria-labelledby="previous-work-heading">
    <div className="work-heading"><div><p className="eyebrow">{t("GROUPE MENGISTIE \u00b7 IN DETAIL")}</p><h2 id="previous-work-heading">{t("Previous work.")}</h2></div><p>{t("A closer look at our floors, from flowing metallic colour to a polished, marble-inspired finish.")}</p></div>
    <WorkGallery/>
   </section>
   <section className="contact section-space" id="contact"><div><p className="eyebrow">{t("GROUPE MENGISTIE \u00b7 EPOXY FLOORING IN MONTREAL")}</p><h2>{t("Let\u2019s talk")}<br/>{t("floors.")}</h2><p>{t("Tell us about your room and the finish you have in mind.")}</p><a className="phone-link" href="tel:+15147025044">514-702-5044 <span>↗</span></a><a className="email-link" href="mailto:groupemengistie@gmail.com">groupemengistie@gmail.com</a></div><img src="/assets/garage.webp" alt={t("Illustrative garage interior ready for a new floor")} loading="lazy" width="1600" height="900"/></section>
  </main>
  <footer><a className="footer-brand" href="#" aria-label={t("Groupe Mengistie home")}>Groupe Mengistie</a><p>{t("Epoxy flooring. Made personal.")}</p><span>© 2026 Groupe Mengistie</span><button className="privacy-link" onClick={preferences.openSettings}>{t("Privacy & cookies")}</button></footer>
  <CookiePreferences preferences={preferences}/>
 </div>;
}

