import {useLanguage} from "@/features/site/language";
import {useEffect,useRef,useState} from "react";
import {createFloorRenderer,type FloorRenderer,type FloorOptions} from "@/lib/floor-renderer";
export function FloorViewer(props:FloorOptions){
 const {language,t}=useLanguage();
 const canvas=useRef<HTMLCanvasElement>(null);
 const renderer=useRef<FloorRenderer|null>(null);
 const initial=useRef(props);
 const [status,setStatus]=useState("loading");
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  setStatus("loading");
  const node=canvas.current;
  if(!node)return;
  let initialized=false;
  function initialize(){
   if(initialized)return;
   initialized=true;
   try{renderer.current=createFloorRenderer(node!,initial.current,()=>setStatus("error"));setStatus("ready");}
   catch{setStatus("error");}
  }
  const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){initialize();observer?.disconnect();}
  },{rootMargin:"300px"}):null;
  if(observer)observer.observe(node);else initialize();
  return ()=>{observer?.disconnect();renderer.current?.dispose();renderer.current=null;};
 },[attempt]);
 useEffect(()=>{initial.current=props;renderer.current?.update(props);},[props.room,props.finish,props.base,props.accent,props.comparison]);
 return <div className="floor-viewer live-3d-viewer">
  <div className="render-stage">
   <canvas key={attempt} ref={canvas} tabIndex={0} role="img" aria-label={language==="fr"?`${t(props.room)} en 3D, époxy ${t(props.finish)}. Glissez ou utilisez les flèches pour tourner, plus et moins pour zoomer, Début pour réinitialiser.`:props.room+" in 3D with "+props.finish.toLowerCase()+" epoxy. Drag or use arrow keys to orbit, plus and minus to zoom, Home to reset."} aria-describedby="camera-help"/>
   {status==="loading"&&<div className="viewer-loading" role="status">{t("Building your 3D room\u2026")}</div>}
   {status==="error"&&<div className="viewer-unavailable" role="status"><p>{t("The 3D view needs a browser with WebGL 2 enabled.")}</p><button onClick={()=>setAttempt(n=>n+1)}>{t("Reload 3D view")}</button><a href="tel:+15147025044">{t("Discuss your floor with us")}</a></div>}
   {status==="ready"&&<div className="camera-hint" id="camera-help">{t("Drag to orbit \u00b7 Pinch to zoom")}</div>}
  </div>
  <div className="camera-toolbar" role="group" aria-label={t("3D camera controls")}>
   <span>{t("Explore in 3D")}</span>
   <button aria-label={t("Orbit left")} onClick={()=>renderer.current?.orbit(-.12,0)}>←</button>
   <button aria-label={t("Orbit right")} onClick={()=>renderer.current?.orbit(.12,0)}>→</button>
   <button aria-label={t("Tilt camera up")} onClick={()=>renderer.current?.orbit(0,.05)}>↑</button>
   <button aria-label={t("Tilt camera down")} onClick={()=>renderer.current?.orbit(0,-.05)}>↓</button>
   <div className="camera-separator"/>
   <button aria-label={t("Zoom in")} onClick={()=>renderer.current?.zoom(-.4)}>+</button>
   <button aria-label={t("Zoom out")} onClick={()=>renderer.current?.zoom(.4)}>−</button>
   <button className="reset-camera" onClick={()=>renderer.current?.reset()}>{t("Reset view")}</button>
  </div>
 </div>;
}
