import { createFileRoute } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { palettes } from "@/floor-data";
import { ColourWheel } from "@/components/colour-wheel";
import { WorkGallery } from "@/components/work-gallery";
import { FloorViewer } from "@/components/floor-viewer";

export const Route = createFileRoute("/")({component: Index});
const rooms = ["Garage", "Kitchen", "Bathroom", "Basement"] as const;
type Room = typeof rooms[number];
type Finish = "Metallic" | "Flake";
function Index() {
 const [room,setRoom]=useState<Room>("Garage");
 const [finish,setFinish]=useState<Finish>("Metallic");
 const [palette,setPalette]=useState(0);
 const [base,setBase]=useState(palettes[0].base);
 const [accent,setAccent]=useState(palettes[0].accent);
 const [colourTarget,setColourTarget]=useState<"base"|"accent">("base");
 const [comparison,setComparison]=useState(100);
 const summary=room+" / "+finish+" / "+(palette<0?"Custom colours":palettes[palette].name);
 const quote="mailto:groupemengistie@gmail.com?subject="+encodeURIComponent("Epoxy flooring quote: "+room)+"&body="+encodeURIComponent("Hello Groupe Mengistie,\n\nI'd like a quote for my "+room.toLowerCase()+".\nFinish: "+finish+"\nPalette: "+(palette<0?"Custom colours":palettes[palette].name)+"\nBase: "+base+"\nAccent: "+accent+"\n\nApproximate floor size:\nLocation:\nPhone:\nPreferred timeline:\n\nThank you!");
 function selectPalette(i:number){setPalette(i);setBase(palettes[i].base);setAccent(palettes[i].accent);}
 return <div className="mengistie">
  <a className="skip-link" href="#studio">Skip to floor studio</a>
  <header className="site-header">
   <a className="brand" href="#" aria-label="Groupe Mengisite home">Groupe Mengisite</a>
   <nav aria-label="Main navigation"><a href="#studio">Floor studio</a><a href="#finishes">Finishes</a><a href="#previous-work">Previous work</a><a href="#reviews">Reviews</a><a className="nav-quote" href="#contact">Get a quote <span>↗</span></a></nav>
  </header>
  <main>
   <section className="hero" aria-label="Concrete to metallic epoxy transformation">
    <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme}/>
    <a className="hero-studio" href="#studio">Imagine your floor <span>↗</span></a>
   </section>
   <section className="studio section-space" id="studio">
    <div className="studio-heading"><p className="eyebrow">YOUR SPACE. YOUR FINISH.</p><h2>Imagine your floor.</h2><p>Choose a room and finish. Start with a colour palette, or make it your own with the colour wheel.</p></div>
    <div className="studio-layout">
     <div className="preview-column">
      <FloorViewer room={room} finish={finish} base={base} accent={accent} comparison={comparison}/>
      <div className="preview-caption"><span aria-live="polite">{summary}</span><span>Interactive 3D render</span></div>
      <label className="comparison" htmlFor="comparison"><span>Compare with concrete</span><input id="comparison" type="range" min="0" max="100" value={comparison} onChange={e=>setComparison(Number(e.target.value))} aria-valuetext={comparison+" percent epoxy"}/><span>{comparison}% epoxy</span></label>
      <p className="preview-note">Interactive 3D rooms with epoxy materials, lighting and reflections. Drag to orbit and zoom to inspect the finish. Rooms and colours are illustrative; confirm your finish with a physical sample.</p>
     </div>
     <div className="studio-controls">
      <fieldset><legend>Choose your room</legend><div className="room-options">{rooms.map(r=><button key={r} aria-pressed={r===room} onClick={()=>{setRoom(r);}}>{r}</button>)}</div></fieldset>
      <fieldset><legend>Choose your finish</legend><div className="finish-options">{(["Metallic","Flake"] as const).map(f=><button key={f} aria-pressed={finish===f} onClick={()=>setFinish(f)}>{f}</button>)}</div><p className="control-note">{finish==="Metallic"?"Fluid movement. Reflective depth. Every pattern is individual.":"A layered blend of small chips for a finely textured appearance."}</p></fieldset>
      <fieldset><legend>Explore a palette</legend><div className="swatches">{palettes.map((p,i)=><button key={p.name} aria-pressed={palette===i} aria-label={p.name} onClick={()=>selectPalette(i)}><span style={{"--swatch-base":p.base,"--swatch-accent":p.accent} as CSSProperties} className={"swatch "+finish.toLowerCase()}/><span>{p.name}</span></button>)}</div></fieldset>
      <fieldset className="custom-finish"><legend>Make it your own</legend><div className="colour-target" role="group" aria-label="Colour to adjust"><button aria-pressed={colourTarget==="base"} onClick={()=>setColourTarget("base")}><span style={{backgroundColor:base}}/>Base colour</button><button aria-pressed={colourTarget==="accent"} onClick={()=>setColourTarget("accent")}><span style={{backgroundColor:accent}}/>{finish==="Metallic"?"Vein colour":"Flake colour"}</button></div><ColourWheel key={colourTarget} value={colourTarget==="base"?base:accent} label={colourTarget==="base"?"Base colour":finish==="Metallic"?"Vein colour":"Flake colour"} onChange={colour=>{setPalette(-1);if(colourTarget==="base")setBase(colour);else setAccent(colour);}}/><p className="control-note">Choose a colour on the wheel. Adjust brightness for lighter or darker tones.</p></fieldset>
      <a className="studio-quote" href={quote}>Get a quote <span>↗</span><small>Opens your email with this selection</small></a>
     </div>
    </div>
   </section>
   <section className="finishes section-space" id="finishes">
    <h2>Two finishes.<br/>Endless possibilities.</h2>
    <div className="finish-gallery">
     <article className="metallic-feature"><img src="/assets/metallic.webp" alt="Silver and graphite flowing metallic epoxy texture" width="1600" height="900" loading="lazy"/><div><h3>Metallic</h3><p>Swirling pigments create depth and movement, with a finish that makes the floor part of the room’s character.</p><button onClick={()=>{setFinish("Metallic");document.getElementById("studio")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}>Try metallic <span>↗</span></button></div></article>
     <article className="flake-feature"><img src="/assets/flake.webp" alt="Grey, white and charcoal flake epoxy texture" width="1600" height="900" loading="lazy"/><div><h3>Flake</h3><p>Contrasting chips bring a balanced, textured look. Explore subtle neutrals or a bolder blend for your everyday spaces.</p><button onClick={()=>{setFinish("Flake");document.getElementById("studio")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}>Try flake <span>↗</span></button></div></article>
    </div>
   </section>
   <section className="approach section-space" id="approach"><h2>A considered approach.<br/>From the ground up.</h2><p className="approach-intro">Groupe Mengistie focuses on epoxy flooring, with care for your home and clear communication from the first conversation.</p>
    <div className="process-row"><span>01</span><h3>Assess your space</h3><p>Discuss how you use the room, your preferred finish and the condition of the existing surface.</p></div>
    <div className="process-row"><span>02</span><h3>Prepare the foundation</h3><p>Surface preparation matters. Your project assessment determines the preparation and repairs needed before coating.</p></div>
    <div className="process-row"><span>03</span><h3>Apply your finish</h3><p>Bring your selected look to life, with care instructions and return-to-use timing tailored to your flooring system.</p></div>
   </section>
   <section className="previous-work section-space" id="previous-work" aria-labelledby="previous-work-heading">
    <div className="work-heading"><div><p className="eyebrow">GROUPE MENGISTIE · IN DETAIL</p><h2 id="previous-work-heading">Previous work.</h2></div><p>A closer look at our floors, from flowing metallic colour to a polished, marble-inspired finish.</p></div>
    <WorkGallery/>
    <h3 className="work-video-heading">A closer look, in motion.</h3>
    <div className="work-gallery work-videos">
    </div>
   </section>
   <section className="reviews section-space" id="reviews" aria-labelledby="reviews-heading" aria-describedby="reviews-note">
    <div className="reviews-heading"><div><p className="eyebrow">4.8 stars · 200+ reviews</p><h2 id="reviews-heading">A fresh look.<br/>A lasting impression.</h2></div><p className="reviews-note" id="reviews-note">Sample testimonials for illustration. These are fictional reviews, not verified customer feedback.</p></div>
    <div className="reviews-grid">
     {[
      {name:"Camille R.",rating:5,project:"Garage · Flake finish",quote:"Our garage feels like a whole new space. The flake finish looks clean and brings everything together."},
      {name:"Alex M.",rating:4,project:"Basement · Metallic finish",quote:"The metallic finish adds so much depth to our basement. We love how the pattern catches the light."},
      {name:"Sophie L.",rating:5,project:"Kitchen · Metallic finish",quote:"The colour combination is exactly the look we imagined. Our new floor has become our favourite detail in the kitchen."},
     ].map(review=><figure className="review" key={review.name}>
      <div className="review-stars" role="img" aria-label={`Sample rating: ${review.rating} out of 5 stars`}><span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div>
      <blockquote><p>“{review.quote}”</p></blockquote>
      <figcaption><strong>{review.name}</strong><span>{review.project}</span><small>Sample review</small></figcaption>
     </figure>)}
    </div>
   </section>
   <section className="contact section-space" id="contact"><div><p className="eyebrow">GROUPE MENGISTIE · EPOXY FLOORING</p><h2>Let’s talk<br/>floors.</h2><p>Tell us about your room and the finish you have in mind.</p><a className="phone-link" href="tel:+15147025044">514-702-5044 <span>↗</span></a><a className="email-link" href="mailto:groupemengistie@gmail.com">groupemengistie@gmail.com</a></div><img src="/assets/garage.webp" alt="Illustrative garage interior ready for a new floor" loading="lazy" width="1600" height="900"/></section>
  </main>
  <footer><a className="footer-brand" href="#" aria-label="Groupe Mengisite home">Groupe Mengisite</a><p>Epoxy flooring. Made personal.</p><span>© 2026 Groupe Mengistie</span></footer>
 </div>;
}

