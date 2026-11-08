import {useEffect,useRef,useState} from "react";
import {createFloorRenderer,type FloorRenderer,type FloorOptions} from "@/lib/floor-renderer";
export function FloorViewer(props:FloorOptions){
 const canvas=useRef<HTMLCanvasElement>(null);
 const renderer=useRef<FloorRenderer|null>(null);
 const initial=useRef(props);
 const [status,setStatus]=useState("loading");
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  setStatus("loading");
  try{
   if(canvas.current){renderer.current=createFloorRenderer(canvas.current,initial.current,()=>setStatus("error"));setStatus("ready");}
  }catch{setStatus("error");}
  return ()=>{renderer.current?.dispose();renderer.current=null;};
 },[attempt]);
 useEffect(()=>{initial.current=props;renderer.current?.update(props);},[props.room,props.finish,props.base,props.accent,props.comparison]);
 return <div className="floor-viewer live-3d-viewer">
  <div className="render-stage">
   <canvas key={attempt} ref={canvas} tabIndex={0} role="img" aria-label={props.room+" in 3D with "+props.finish.toLowerCase()+" epoxy. Drag or use arrow keys to orbit, plus and minus to zoom, Home to reset."} aria-describedby="camera-help"/>
   {status==="loading"&&<div className="viewer-loading" role="status">Building your 3D room…</div>}
   {status==="error"&&<div className="viewer-unavailable" role="status"><p>The 3D view needs a browser with WebGL 2 enabled.</p><button onClick={()=>setAttempt(n=>n+1)}>Reload 3D view</button><a href="tel:+15147025044">Discuss your floor with us</a></div>}
   {status==="ready"&&<div className="camera-hint" id="camera-help">Drag to orbit · Pinch to zoom</div>}
  </div>
  <div className="camera-toolbar" role="group" aria-label="3D camera controls">
   <span>Explore in 3D</span>
   <button aria-label="Orbit left" onClick={()=>renderer.current?.orbit(-.12,0)}>←</button>
   <button aria-label="Orbit right" onClick={()=>renderer.current?.orbit(.12,0)}>→</button>
   <button aria-label="Tilt camera up" onClick={()=>renderer.current?.orbit(0,.05)}>↑</button>
   <button aria-label="Tilt camera down" onClick={()=>renderer.current?.orbit(0,-.05)}>↓</button>
   <div className="camera-separator"/>
   <button aria-label="Zoom in" onClick={()=>renderer.current?.zoom(-.4)}>+</button>
   <button aria-label="Zoom out" onClick={()=>renderer.current?.zoom(.4)}>−</button>
   <button className="reset-camera" onClick={()=>renderer.current?.reset()}>Reset view</button>
  </div>
 </div>;
}
