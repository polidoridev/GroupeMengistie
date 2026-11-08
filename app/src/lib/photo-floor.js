// Photographic epoxy shader: preserve architecture, surface detail and reflected light.
import {createEpoxyLut} from "./epoxy-colour.js";
const bounds={
 Garage:[
 [[0,.94],[.095,.575],[.58,.515],[.63,.54],[.68,.55],[.68,.59],[.78,.61],[.84,.62],[.91,.64],[1,.685],[1,1],[0,1]],
 [[0,.74],[.125,.57],[.565,.515],[.64,.55],[.72,.58],[.83,.63],[.90,.67],[1,.73],[1,1],[0,1]]
 ],
 Kitchen:[
 [[0,1],[.18,.765],[.35,.515],[.52,.52],[.65,.52],[.83,.535],[1,.54],[1,1],[0,1]],
 [[0,.73],[.265,.54],[.39,.55],[.58,.575],[.84,.59],[.95,.75],[1,.83],[1,1],[0,1]]
 ],
 Bathroom:[
 [[0,1],[.235,.60],[.61,.58],[.65,.62],[.95,.63],[1,.67],[1,1],[0,1]],
 [[0,.76],[.14,.625],[.425,.63],[.46,.60],[.765,.605],[1,.96],[1,1],[0,1]]
 ],
 Basement:[
 [[0,.92],[.04,.83],[.145,.835],[.27,.625],[.33,.64],[.70,.64],[.73,.605],[.87,.69],[1,.76],[1,1],[0,1]],
 [[0,.73],[.11,.665],[.23,.625],[.62,.625],[.67,.75],[.85,.76],[1,.94],[1,1],[0,1]]
 ]
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createPhotoFloor(canvas, initial, notify=()=>{}, onView=()=>{}){
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw new Error('Photo viewer unavailable');
 let options={...initial}, view=0, zoom=1, px=0,py=0, disposed=false, token=0;
 let before=null, after=null, frame=0, drag=null, pinch=0;
 let source=null,maskData=null,output=null,colourKey='';
 const surface=document.createElement('canvas'),mask=document.createElement('canvas');
 const surfaceCtx=surface.getContext('2d',{willReadFrequently:true});
 const cache=new Map(), points=new Map();
 function request(){if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;draw();});}
 function draw(){
  if(!after||!before||disposed)return;
  const w=canvas.width,h=canvas.height;
  ctx.fillStyle='#e5e4df';ctx.fillRect(0,0,w,h);
  const key=options.base+options.accent;
  if(colourKey!==key){
   output.data.set(source.data);
   if(options.base.toUpperCase()!=='#D7DCDE'||options.accent.toUpperCase()!=='#424C50'){
    const lut=createEpoxyLut(options.base,options.accent),d=output.data,src=source.data;
    for(let i=0;i<d.length;i+=4){
     const alpha=maskData[i+3]/255;if(!alpha)continue;
     const l=Math.round(src[i]*.2126+src[i+1]*.7152+src[i+2]*.0722),k=l*3;
     for(let c=0;c<3;c++)d[i+c]=src[i+c]*(1-alpha)+Math.max(0,Math.min(255,lut[k+c]+(src[i+c]-l)*.35))*alpha;
    }
   }
   surfaceCtx.putImageData(output,0,0);colourKey=key;
  }
  const cellW=after.width,cellH=after.height;
  const fit=Math.min(w/cellW,h/cellH), dw=cellW*fit*zoom,dh=cellH*fit*zoom;
  const x=(w-dw)/2+px*w,y=(h-dh)/2+py*h;
  ctx.drawImage(before,x,y,dw,dh);
  ctx.save();ctx.beginPath();ctx.rect(0,0,w*options.comparison/100,h);ctx.clip();ctx.drawImage(surface,x,y,dw,dh);ctx.restore();
  if(options.comparison>0&&options.comparison<100){
   ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*options.comparison/100,0);ctx.lineTo(w*options.comparison/100,h);ctx.stroke();
  }
 }
 function load(url){
  if(cache.has(url))return cache.get(url);
  const promise=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{cache.delete(url);reject(new Error('Image unavailable'));};img.src=url;});
  cache.set(url,promise);
  if(cache.size>6)cache.delete(cache.keys().next().value);
  return promise;
 }
 async function refresh(){
  const id=++token;notify('loading');
  // Hide the previous room while the new selection loads.
  before=null;after=null;
  const root='/assets/rooms/'+options.room.toLowerCase();
  try{
   const images=await Promise.all([load(root+'-concrete-'+view+'.webp'),load(root+'-'+options.finish.toLowerCase()+'-'+view+'.webp')]);
   if(disposed||id!==token)return;
   [before,after]=images;
   surface.width=after.width;surface.height=after.height;
   surfaceCtx.drawImage(after,0,0);source=surfaceCtx.getImageData(0,0,after.width,after.height);output=surfaceCtx.createImageData(after.width,after.height);
   mask.width=after.width;mask.height=after.height;
   const m=mask.getContext('2d',{willReadFrequently:true});m.beginPath();
   bounds[options.room][view].forEach(([x,y],i)=>i?m.lineTo(x*mask.width,y*mask.height):m.moveTo(x*mask.width,y*mask.height));
   m.closePath();m.fill();maskData=m.getImageData(0,0,mask.width,mask.height).data;colourKey='';
   notify('ready');request();
  }catch{if(!disposed&&id===token)notify('error');}
 }
 function resize(){canvas.width=Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2));canvas.height=Math.round(canvas.clientHeight*Math.min(devicePixelRatio||1,2));request();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 function setView(v){const next=clamp(v,0,1);if(next===view)return;view=next;zoom=1;px=py=0;onView(view);refresh();}
 function setZoom(delta){zoom=clamp(zoom+delta,1,2);const max=(zoom-1)/2;px=clamp(px,-max,max);py=clamp(py,-max,max);request();}
 const distance=()=>{const p=[...points.values()];return p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;};
 function down(e){canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY,start:e.clientX};pinch=distance();}
 function move(e){
  if(!points.has(e.pointerId))return;
  points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(points.size===2){const next=distance();if(pinch)setZoom((next-pinch)/250);pinch=next;return;}
  if(drag&&zoom>1){const max=(zoom-1)/2;px=clamp(px+(e.clientX-drag.x)/canvas.clientWidth,-max,max);py=clamp(py+(e.clientY-drag.y)/canvas.clientHeight,-max,max);request();}
  if(drag){drag.x=e.clientX;drag.y=e.clientY;}
 }
 function up(e){if(drag&&points.size===1&&zoom===1&&Math.abs(e.clientX-drag.start)>55)setView(e.clientX<drag.start?1:0);points.delete(e.pointerId);drag=null;pinch=0;}
 function cancel(e){points.delete(e.pointerId);drag=null;pinch=0;}
 function key(e){
  if(e.key==='ArrowLeft'){e.preventDefault();setView(0);}
  if(e.key==='ArrowRight'){e.preventDefault();setView(1);}
  if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(.2);}
  if(e.key==='-'){e.preventDefault();setZoom(-.2);}
  if(e.key==='Home'){e.preventDefault();reset();}
 }
 function reset(){zoom=1;px=py=0;request();}
 const events={pointerdown:down,pointermove:move,pointerup:up,pointercancel:cancel,keydown:key};
 Object.entries(events).forEach(([name,fn])=>canvas.addEventListener(name,fn));
 resize();refresh();
 return {
  update(next){const change=next.room!==options.room||next.finish!==options.finish;options={...next};if(change)refresh();else request();},
  setView,zoom:setZoom,reset,retry:refresh,
  getState:()=>({view,zoom,px,py,ready:!!after}),
  dispose(){disposed=true;token++;observer.disconnect();cancelAnimationFrame(frame);Object.entries(events).forEach(([name,fn])=>canvas.removeEventListener(name,fn));cache.clear();}
 };
}
