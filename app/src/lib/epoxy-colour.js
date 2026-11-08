// Linear-light pigment transfer. Bright specular reflections stay neutral;
// source luminance retains the original fine texture and contact shadows.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const linear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
const srgb=x=>255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055);
const parse=hex=>[1,3,5].map(i=>linear(parseInt(hex.slice(i,i+2),16)/255));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function createEpoxyLut(base,accent){
 if(!/^#[0-9a-f]{6}$/i.test(base)||!/^#[0-9a-f]{6}$/i.test(accent))throw new Error('Invalid epoxy colour');
 const b=parse(base),a=parse(accent),originalB=parse('#D7DCDE'),originalA=parse('#424C50');
 const lum=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722;
 const low=lum(originalA),high=lum(originalB),table=new Float32Array(256*3);
 for(let i=0;i<256;i++){
  const light=linear(i/255),mix=smooth((i/255-.16)/.66);
  const reference=low*(1-mix)+high*mix;
  const exposure=light/Math.max(.015,reference);
  const reflection=smooth((i/255-.67)/.31)*.92;
  for(let c=0;c<3;c++){
   const pigment=(a[c]*(1-mix)+b[c]*mix)*exposure;
   table[i*3+c]=clamp(srgb(clamp(pigment*(1-reflection)+light*reflection)),0,255);
  }
 }
 return table;
}
export function hsvToHex(h,s,v){
 h=((h%360)+360)%360;s=clamp(s);v=clamp(v);
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function hexToHsv(hex){
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),[r,g,b]=rgb;
 const max=Math.max(...rgb),min=Math.min(...rgb),d=max-min;
 let h=d===0?0:max===r?60*((g-b)/d%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4);
 return {h:(h+360)%360,s:max===0?0:d/max,v:max};
}
