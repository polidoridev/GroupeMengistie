import {useLanguage} from "@/features/site/language";
import {useEffect,useId,useRef,useState,type PointerEvent} from 'react';
import {hexToHsv,hsvToHex} from '@/lib/epoxy-colour';
interface Props {value:string;label:string;onChange:(value:string)=>void}
export function ColourWheel({value,label,onChange}:Props){
 const {language,t}=useLanguage();
 const id=useId(),wheel=useRef<HTMLDivElement>(null),pending=useRef<number|null>(null);
 const callback=useRef(onChange);callback.current=onChange;
 const latest=useRef(hexToHsv(value));
 const parsed=hexToHsv(value);
 // Remember hue while choosing white/black so brightness does not reset it.
 const rememberedHue=useRef(parsed.h);
 if(parsed.s>.001&&parsed.v>.001)rememberedHue.current=parsed.h;
 const hsv={...parsed,h:parsed.s>.001?parsed.h:rememberedHue.current};latest.current=hsv;
 const [hexDraft,setHexDraft]=useState<string|null>(null);
 const [invalid,setInvalid]=useState(false);
 useEffect(()=>()=>{if(pending.current!==null)cancelAnimationFrame(pending.current);},[]);
 function emit(h:number,s:number,v:number){
  latest.current={h,s,v};rememberedHue.current=h;
  if(pending.current!==null)cancelAnimationFrame(pending.current);
  pending.current=requestAnimationFrame(()=>{pending.current=null;callback.current(hsvToHex(h,s,v));});
 }
 function choose(e:PointerEvent<HTMLDivElement>){
  const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;
  const h=(Math.atan2(x,-y)*180/Math.PI+360)%360,s=Math.min(1,Math.hypot(x,y)/(rect.width/2));
  emit(h,s,latest.current.v||.75);
 }
 function commitHex(){
  if(hexDraft===null)return;
  const normal=hexDraft.startsWith('#')?hexDraft:'#'+hexDraft;
  if(/^#[0-9a-f]{6}$/i.test(normal)){
   if(pending.current!==null){cancelAnimationFrame(pending.current);pending.current=null;}
   onChange(normal.toUpperCase());setHexDraft(null);setInvalid(false);
  }else setInvalid(true);
 }
 const angle=hsv.h*Math.PI/180;
 return <div className="colour-picker">
  <div ref={wheel} className="colour-wheel" role="group" aria-label={label+(language==='fr'?' : utilisez les curseurs ci-dessous pour les commandes au clavier':' wheel; use the sliders below for keyboard control')}
   onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);choose(e);}}
   onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))choose(e);}}
   onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){choose(e);e.currentTarget.releasePointerCapture(e.pointerId);}}}>
   <span className="colour-wheel-shade" style={{opacity:1-hsv.v}}/>
   <span className="colour-wheel-handle" style={{left:(50+Math.sin(angle)*hsv.s*48)+'%',top:(50-Math.cos(angle)*hsv.s*48)+'%',backgroundColor:value}}/>
  </div>
  <label className="colour-slider" htmlFor={id+'-brightness'}><span>{t("Brightness")}</span><input id={id+'-brightness'} type="range" min="0" max="100" value={Math.round(hsv.v*100)} onChange={e=>emit(hsv.h,hsv.s,Number(e.target.value)/100)}/><output>{Math.round(hsv.v*100)}%</output></label>
  <details className="colour-precision"><summary>{t("Fine-tune colour")}</summary>
   <label className="colour-slider" htmlFor={id+'-hue'}><span>{t("Hue")}</span><input id={id+'-hue'} type="range" min="0" max="359" value={Math.round(hsv.h)%360} onChange={e=>emit(Number(e.target.value),hsv.s,hsv.v)}/><output>{Math.round(hsv.h)}°</output></label>
   <label className="colour-slider" htmlFor={id+'-saturation'}><span>{t("Saturation")}</span><input id={id+'-saturation'} type="range" min="0" max="100" value={Math.round(hsv.s*100)} onChange={e=>emit(hsv.h,Number(e.target.value)/100,hsv.v)}/><output>{Math.round(hsv.s*100)}%</output></label>
  </details>
  <label className="colour-hex" htmlFor={id+'-hex'}><span>{label}</span><input id={id+'-hex'} type="text" value={hexDraft??value} spellCheck={false} maxLength={7} aria-invalid={invalid} aria-describedby={invalid?id+'-error':undefined} onChange={e=>{setHexDraft(e.target.value);setInvalid(false);}} onBlur={commitHex} onKeyDown={e=>{if(e.key==='Enter')commitHex();if(e.key==='Escape'){setHexDraft(null);setInvalid(false);}}}/></label>
  {invalid&&<p className="colour-error" id={id+'-error'} role="alert">{t("Enter six hexadecimal digits, such as #405C50.")}</p>}
 </div>;
}
