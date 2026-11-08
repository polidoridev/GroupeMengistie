// Genuine WebGL 2 ray-traced room geometry and procedural epoxy materials.
// No photographs, image planes, masks or sampled room textures.
const vertex = `#version 300 es
precision highp float;
void main(){
 vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
 gl_Position=vec4(p*2.0-1.0,0,1);
}`;
const fragment = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 resolution;
uniform vec3 eye,target,baseColour,accentColour;
uniform float finish,comparison;
uniform sampler2D flakeTexture;
vec2 floorDx,floorDy;
uniform int boxCount;
uniform vec3 boundsMin[64],boundsMax[64];
uniform vec4 materials[64];
uniform int shapes[64];

struct Hit {float t; vec3 normal; vec3 colour; float material;};
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+vec2(7.3,2.9);a*=.5;}return n;}
float pigment(vec2 p){
 vec2 q=vec2(fbm(p*.65),fbm(p*.65+vec2(5.2,1.3)));
 vec2 r=vec2(fbm(p+3.1*q+vec2(1.7,9.2)),fbm(p+3.1*q+vec2(8.3,2.8)));
 return fbm(p+4.8*r);
}
bool trace(vec3 ro,vec3 rd,out Hit h){
 h.t=1000.;h.normal=vec3(0);h.colour=vec3(.7);h.material=-1.;
 if(rd.y<-.0001){
  float t=-ro.y/rd.y;vec3 p=ro+rd*t;
  if(t>.001 && abs(p.x)<3.2 && p.z>-4.1 && p.z<6.5){h.t=t;h.normal=vec3(0,1,0);h.material=0.;}
 }
 vec3 inv=1./(rd+vec3(.0000001));
 for(int i=0;i<64;i++){
  if(i>=boxCount)break;
  if(shapes[i]==1){
   vec3 centre=(boundsMin[i]+boundsMax[i])*.5,radius=(boundsMax[i]-boundsMin[i])*.5;
   vec3 o=(ro-centre)/radius,d=rd/radius;
   float aa=dot(d,d),bb=dot(o,d),cc=dot(o,o)-1.,disc=bb*bb-aa*cc;
   if(disc>0.){float t=(-bb-sqrt(disc))/aa;if(t>.001&&t<h.t){h.t=t;h.normal=normalize((ro+rd*t-centre)/(radius*radius));h.colour=materials[i].rgb;h.material=materials[i].a;}}
   continue;
  }
  vec3 a=(boundsMin[i]-ro)*inv,b=(boundsMax[i]-ro)*inv;
  vec3 lo=min(a,b),hi=max(a,b);
  float t=max(max(lo.x,lo.y),lo.z),end=min(min(hi.x,hi.y),hi.z);
  if(t>.001&&t<end&&t<h.t){
   h.t=t;h.colour=materials[i].rgb;h.material=materials[i].a;
   h.normal=lo.x>lo.y && lo.x>lo.z?vec3(-sign(rd.x),0,0):(lo.y>lo.z?vec3(0,-sign(rd.y),0):vec3(0,0,-sign(rd.z)));
  }
 }
 return h.t<999.;
}
vec3 sky(vec3 d){return mix(vec3(.48,.59,.62),vec3(.94,.96,.94),smoothstep(-.25,.6,d.y));}
float shadow(vec3 p,vec3 light){
 vec3 delta=light-p;float dist=length(delta);Hit h;
 if(trace(p,delta/dist,h)&&h.t<dist-.05&&h.material!=5.)return .15;
 return 1.;
}
vec3 surface(Hit h,vec3 p,bool coated){
 vec3 c=h.colour;
 if(h.material==0.){
  if(!coated){float n=noise(p.xz*70.);return vec3(.48,.49,.47)*(.87+.17*n);}
  if(finish<.5){
   float g=pigment(p.xz*.72);
   float veins=smoothstep(.32,.63,g);
   float ribbon=1.-smoothstep(.006,.025,abs(g-.48));
   c=mix(baseColour,accentColour,veins);
   c=mix(c,mix(accentColour,baseColour,.25),ribbon*.22);
   // Pigment swirls are inside a flat resin coat, never a displaced floor.
   c*=.96+.04*noise(p.xz*280.);
  }else{
   // Procedural flake coverage is filtered in world space with explicit ray
   // differentials. Mipmaps and anisotropy smooth subpixel chips without a cutoff.
   vec3 coverage=textureGrad(flakeTexture,p.xz*.85,floorDx*.85,floorDy*.85).rgb;
   vec3 lightChip=mix(baseColour,vec3(.94),.72);
   c=baseColour*coverage.r+accentColour*coverage.g+lightChip*coverage.b;
   c*=.97+.03*noise(p.xz*18.);

  }
 }else if(h.material==3.){
  float grain=noise(vec2(p.x*3.+p.z*2.,p.y*85.));
  c*=.78+.24*grain;
 }else if(h.material==7.){
  c*=.87+.12*noise(p.xz*140.+p.y*35.);
 }else if(h.material==8.){
  float seam=smoothstep(.005,.014,abs(fract(p.y/.43)-.5)*.43);
  c*=mix(.62,1.,seam);
 }else if(h.material==9.){
  c*=.92+.08*noise(p.xz*55.);
 }else{
  c*=.97+.03*noise((p.xy+p.zy)*100.);
 }
 return pow(max(c,vec3(.001)),vec3(2.2));
}
vec3 shade(Hit h,vec3 p,vec3 rd,bool coated){
 if(h.material==5.){
  if(abs(h.normal.x)>.5){
   vec2 w=p.zy;float tree=noise(vec2(w.x*3.,w.y*.8));
   float foliage=1.-smoothstep(1.1+tree,1.3+tree,w.y);
   return mix(vec3(1.2,1.45,1.55),vec3(.24,.43,.19)+noise(w*16.)*.1,foliage*.82);
  }
  return vec3(1.45,1.52,1.49);
 }
 vec3 n=h.normal,c=surface(h,p,coated);
 vec3 key=vec3(-2.5,2.9,2.8);
 vec3 lightDir=normalize(key-p);
 float visibility=shadow(p+n*.009,key);
 float diff=max(dot(n,lightDir),0.);
 float fill=max(dot(n,normalize(vec3(1.,2.,-1.))),0.);
 float ao=1.;
 if(h.material==0.){
  float edge=min(3.2-abs(p.x),p.z+4.1);
  float nearest=2.;
  for(int i=0;i<64;i++){if(i>=boxCount)break;vec3 d=max(max(boundsMin[i]-p,p-boundsMax[i]),0.);nearest=min(nearest,length(d));}
  ao=(.65+.35*smoothstep(0.,.45,edge))*(.58+.42*smoothstep(0.,.34,nearest));
 }else if(abs(n.y)<.5){ao=.75+.25*smoothstep(0.,.5,p.y);}
 vec3 colour=c*(vec3(.38,.43,.46)+vec3(1.35,1.28,1.14)*diff*visibility+fill*.22)*ao;
 vec3 halfDir=normalize(lightDir-rd);
 float gloss=h.material==4.?90.:h.material==9.?60.:22.;
 float spec=pow(max(dot(n,halfDir),0.),gloss)*visibility;
 if(h.material!=0.)colour+=spec*(h.material==4.?.5:.035);
 return colour;
}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 vec2 uv=(2.*gl_FragCoord.xy-resolution)/resolution.y;
 vec3 forward=normalize(target-eye);
 vec3 right=normalize(cross(forward,vec3(0,1,0)));
 vec3 up=cross(right,forward);
 vec3 rawRay=forward*1.8+uv.x*right+uv.y*up;
 vec3 rd=normalize(rawRay);
 vec3 rayX=rawRay+right*(2./resolution.y),rayY=rawRay+up*(2./resolution.y);
 float y0=min(-.001,rawRay.y),yx=min(-.001,rayX.y),yy=min(-.001,rayY.y);
 vec3 floorPoint=eye-rawRay*eye.y/y0;
 floorDx=(eye-rayX*eye.y/yx-floorPoint).xz;
 floorDy=(eye-rayY*eye.y/yy-floorPoint).xz;
 Hit h;vec3 colour=sky(rd);
 bool coated=gl_FragCoord.x/resolution.x<=comparison;
 if(trace(eye,rd,h)){
  vec3 p=eye+rd*h.t;
  colour=shade(h,p,rd,coated);
  if(h.material==0. && coated){
   vec3 n=vec3(0,1,0);
   vec3 refl=reflect(rd,n);
   Hit reflected;vec3 reflectedColour=sky(refl);
   if(trace(p+n*.012,refl,reflected)){
    reflectedColour=shade(reflected,p+n*.012+refl*reflected.t,refl,true);
   }
   float fresnel=.045+.955*pow(1.-max(dot(-rd,n),0.),5.);
   float reflection=finish<.5?(.10+fresnel*.70):(.045+fresnel*.40);
   // A dielectric clear coat: grazing reflections are stronger than face-on ones.
   colour=mix(colour,reflectedColour,reflection);
   vec3 lightDir=normalize(vec3(-2.5,2.9,2.8)-p);
   vec3 halfway=normalize(lightDir-rd);
   float NdotH=max(dot(n,halfway),0.),NdotL=max(dot(n,lightDir),0.);
   float rough=finish<.5?.14:.32,alpha2=rough*rough*rough*rough;
   float denom=NdotH*NdotH*(alpha2-1.)+1.;
   float distribution=alpha2/(3.14159*denom*denom+.00001);
   colour+=vec3(1.,.96,.88)*min(2.,distribution*.012)*NdotL*shadow(p+n*.012,vec3(-2.5,2.9,2.8));
   // Subtle broad ceiling luminance, not liquid ripples or raised resin.
   float glow=pow(max(dot(reflect(rd,n),normalize(vec3(-.45,1.,-.15))),0.),finish<.5?45.:14.);
   colour+=glow*(finish<.5?.12:.035);
  }
 }
 colour=pow(aces(colour*.88),vec3(1./2.2));
 float vignette=1.-.055*dot(uv,uv);
 outColor=vec4(colour*max(.83,vignette),1);
}`;

function colour(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
function roomGeometry(room){
 const boxes=[];
 const add=(lo,hi,hex,material=1,shape=0)=>boxes.push({lo,hi,c:[...colour(hex),material],shape});
 const box=(x,y,z,w,h,d,c,m=1)=>add([x-w/2,y,z-d/2],[x+w/2,y+h,z+d/2],c,m);
 const oval=(x,y,z,w,h,d,c,m=9)=>add([x-w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z+d/2],c,m,1);
 // The floor is a bounded analytic plane at y=0. All furnishing rests on or above it.
 box(0,0,-4.15,6.55,3.25,.15,"#e1e3df");
 box(-3.28,0,.6,.16,3.25,9.5,"#e5e6e2");
 box(3.28,0,.6,.16,3.25,9.5,"#d9ded9");
 box(0,3.24,.3,6.7,.1,9.2,"#f1f0eb");
 box(0,.02,-4.03,6.4,.1,.05,"#b0b6b1");
 box(-3.17,.02,.3,.05,.1,8.6,"#b0b6b1");
 box(3.17,.02,.3,.05,.1,8.6,"#b0b6b1");
 // Window on left, emissive sky panel with dimensional framing.
 box(-3.175,1.05,.1,.025,1.6,3.1,"#eaf0eb",5);
 box(-3.13,1.03,.1,.09,.055,3.2,"#515d58",4);
 box(-3.13,2.65,.1,.09,.055,3.2,"#515d58",4);
 for(const z of [-1.47,.1,1.67])box(-3.12,1.06,z,.09,1.6,.045,"#515d58",4);
 box(-3.12,1.83,.1,.09,.045,3.2,"#515d58",4);
 // Ceiling lights illuminate and reflect at their actual positions.
 for(const x of [-1.5,1.5]){
  box(x,3.19,-.4,.11,.035,2.5,"#eceeea",5);
  box(x,3.19,-3.,.11,.035,1.1,"#eceeea",5);
 }
 const cabinet=(x,z,w,d,height,c)=>{
  box(x,.13,z,w,height,d,c,2);
  box(x,.04,z,w-.12,.1,d-.1,"#262e2c",2);
  const front=z+d/2+.012;
  for(let j=0;j<Math.min(4,Math.round(w/.6));j++){
   const sx=x-w/2+(j+.5)*w/Math.min(4,Math.round(w/.6));
   box(sx,.15,front,.012,height-.03,.015,"#263b33",2);
   box(sx+.13,height-.03,front+.025,.15,.018,.025,"#a0a7a4",4);
  }
 };
 if(room==="Garage"){
  // Closed sectional door and inset windows, workshop cabinetry.
  box(-.6,.03,-4.02,3.7,2.66,.085,"#aab2ad",8);
  box(-2.49,.01,-3.94,.07,2.76,.1,"#65716a",4);
  box(1.29,.01,-3.94,.07,2.76,.1,"#65716a",4);
  for(const x of [-1.95,-1.05,-.15,.75])box(x,2.13,-3.96,.65,.32,.02,"#d6dfda",5);
  cabinet(2.25,-3.52,1.45,.75,2.35,"#304a40");
  cabinet(2.65,-1.65,.9,1.85,.83,"#344c41");
  box(2.64,.96,-1.65,1.03,.055,2.02,"#aaa49a",9);
  box(3.12,1.22,-1.6,.035,.86,1.6,"#7e8982",4);
  // Small wall-mounted tool rails.
  for(const z of [-2.15,-1.85,-1.55,-1.25])box(3.06,1.37,z,.03,.44,.025,"#323b36",4);
 }else if(room==="Kitchen"){
  cabinet(0,-3.65,5.8,.75,.79,"#3e584c");
  box(0,.94,-3.62,5.94,.065,.88,"#dddcd3",9);
  for(const x of [-2.25,-1.35,1.35,2.25])box(x,1.5,-3.8,.87,.96,.45,"#e5e1d5",2);
  box(0,1.45,-4.01,1.4,1.07,.04,"#dfe9df",5);
  box(0,1.44,-3.97,.04,1.1,.04,"#515e53",4);
  box(-1.1,1.006,-3.62,.8,.014,.44,"#596461",4);
  box(-1.1,1.02,-3.91,.025,.27,.025,"#a6afab",4);
  box(-1.1,1.27,-3.8,.025,.025,.24,"#a6afab",4);
  box(1.72,1.01,-3.61,.79,.015,.5,"#222b29",4);
  for(const x of [1.5,1.93])for(const z of [-3.47,-3.75])box(x,1.026,z,.16,.002,.16,"#59615d",4);
  box(1.72,.28,-3.22,.72,.47,.018,"#26312c",4);
  box(1.72,.76,-3.2,.63,.025,.035,"#9ba39f",4);
  box(2.6,0,-2.23,.85,2.25,.8,"#afb6b2",4);
  box(2.6,1.08,-1.81,.83,.018,.015,"#68726c",4);
 }else if(room==="Bathroom"){
  cabinet(-1.4,-3.52,2.4,.85,.63,"#9e896d");
  box(-1.4,.79,-3.5,2.5,.07,.95,"#e7e5db",9);
  oval(-1.4,.92,-3.48,.74,.17,.48,"#f5f4ed");
  oval(-1.4,1.,-3.48,.58,.025,.34,"#aeb9b1");
  box(-1.4,.92,-3.85,.035,.23,.035,"#8e9993",4);
  box(-1.4,1.19,-4.01,2.25,1.2,.04,"#a1bab7",4);
  box(-1.4,2.47,-3.9,2.1,.035,.07,"#f0e9d8",5);
  // Shower backing and tray contained in the rear corner.
  box(2.13,.015,-3.12,1.65,.045,1.8,"#babbb4",9);
  box(2.13,.08,-4.005,1.75,2.6,.04,"#c2c9c1",9);
  box(2.4,1.1,-3.92,.04,1.3,.04,"#87978f",4);
  box(2.4,2.36,-3.67,.3,.03,.4,"#87978f",4);
  oval(.25,.22,-3.5,.42,.44,.54,"#e5e4dd");
  oval(.25,.43,-3.39,.56,.17,.78,"#f3f1e8");
  oval(.25,.51,-3.37,.34,.015,.49,"#b4c0b7");
  box(.25,.51,-3.75,.51,.42,.16,"#e5e4dd",9);
 }else{
  cabinet(0,-3.67,3.3,.63,.36,"#8b7d67");
  box(0,1.12,-4.01,2.4,1.32,.045,"#29342e",4);
  box(0,1.16,-3.98,2.28,1.2,.01,"#354941",2);
  for(const x of [-2.5,2.5]){
   box(x,.14,-3.71,.75,2.45,.54,"#81836f",3);
   for(const y of [.5,1.3,2.1]){
    box(x,y,-3.4,.71,.035,.04,"#c6c3b2",3);
    for(let i=0;i<2;i++)box(x-.19+i*.2,y+.04,-3.41,.07,.31,.18,["#d0c4a9","#6d8775","#b3aaa0"][i],3);
   }
  }
  // Sofa along right wall, grounded feet and upholstery.
  for(const z of [-1.45,.65])for(const x of [2.16,2.94])box(x,.0,z,.07,.16,.07,"#33392f",3);
  box(2.55,.16,-.4,1.0,.3,2.5,"#a2a79c",7);
  box(3.,.43,-.4,.18,.49,2.5,"#989f92",7);
  for(const z of [-1.58,.78])box(2.55,.43,z,1.0,.35,.17,"#9a9f94",7);
  for(const z of [-1.13,-.4,.33])box(2.48,.47,z,.8,.12,.68,"#b7b9ad",7);
 }
 if(boxes.length>64)throw new Error("Scene geometry exceeds renderer capacity");
 return boxes;
}
export function createFloorRenderer(canvas,initial,onError=()=>{}){
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,powerPreference:"high-performance",preserveDrawingBuffer:true});
 if(!gl)throw new Error("3D rendering is unavailable in this browser.");
 const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||"Shader compilation failed");return s;};
 const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||"3D setup failed");
 gl.useProgram(program);
 const names=["resolution","eye","target","baseColour","accentColour","finish","comparison","boxCount","boundsMin[0]","boundsMax[0]","materials[0]","shapes[0]","flakeTexture"];
 const u=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
 // Build a seamless pigment-weight texture, not a photograph. RGB stores
 // base / accent / light-chip coverage, so any colour wheel choice stays exact.
 const tile=document.createElement('canvas');tile.width=tile.height=1024;
 const paint=tile.getContext('2d');paint.fillStyle='rgb(255,0,0)';paint.fillRect(0,0,1024,1024);
 let seed=18473;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<12500;i++){
  const x=random()*1024,y=random()*1024,r=2.5+random()*5,angle=random()*Math.PI*2;
  const type=random();paint.fillStyle=type<.48?'rgb(0,255,0)':type<.70?'rgb(0,0,255)':'rgb(255,0,0)';
  const vertices=Array.from({length:5},(_,j)=>{const a=angle+j*Math.PI*2/5;const radius=r*(.65+random()*.5);return [Math.cos(a)*radius,Math.sin(a)*radius*.65];});
  for(const ox of [-1024,0,1024])for(const oy of [-1024,0,1024]){
   if(x+ox+r<0||x+ox-r>1024||y+oy+r<0||y+oy-r>1024)continue;
   paint.beginPath();vertices.forEach(([vx,vy],j)=>j?paint.lineTo(x+ox+vx,y+oy+vy):paint.moveTo(x+ox+vx,y+oy+vy));paint.closePath();paint.fill();
  }
 }
 const flakes=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,flakes);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,tile);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
 if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
 let options={...initial},yaw=0,elevation=.24,distance=6.3,frame=0,disposed=false;
 function geometry(){
  const b=roomGeometry(options.room);gl.useProgram(program);gl.uniform1i(u.boxCount,b.length);
  gl.uniform3fv(u["boundsMin[0]"],new Float32Array(b.flatMap(x=>x.lo)));
  gl.uniform3fv(u["boundsMax[0]"],new Float32Array(b.flatMap(x=>x.hi)));
  gl.uniform4fv(u["materials[0]"],new Float32Array(b.flatMap(x=>x.c)));
  gl.uniform1iv(u["shapes[0]"],new Int32Array(b.map(x=>x.shape)));
 }
 function draw(){
  frame=0;if(disposed)return;
  const rect=canvas.getBoundingClientRect(),moving=pointers.size>0,ratio=moving?Math.min(window.devicePixelRatio||1,1):Math.min(Math.max(window.devicePixelRatio||1,1.75),2);
  const width=Math.max(1,Math.min(moving?960:1920,Math.round(rect.width*ratio))),height=Math.max(1,Math.round(width*rect.height/Math.max(rect.width,1)));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);gl.useProgram(program);
  const x=Math.max(-2.8,Math.min(2.8,Math.sin(yaw)*distance));
  const y=Math.max(1.15,Math.min(3.08,.5+Math.sin(elevation)*distance));
  const z=-1.2+Math.cos(yaw)*Math.cos(elevation)*distance;
  gl.uniform2f(u.resolution,width,height);gl.uniform3f(u.eye,x,y,z);gl.uniform3f(u.target,0,.55,-1.2);
  gl.uniform3fv(u.baseColour,colour(options.base));gl.uniform3fv(u.accentColour,colour(options.accent));
  gl.uniform1f(u.finish,options.finish==="Metallic"?0:1);gl.uniform1f(u.comparison,options.comparison/100);
  gl.uniform1i(u.flakeTexture,0);gl.drawArrays(gl.TRIANGLES,0,3);
 }
 function invalidate(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}
 function orbit(dx,dy){yaw=Math.max(-.6,Math.min(.6,yaw+dx));elevation=Math.max(.1,Math.min(.52,elevation+dy));invalidate();}
 function zoom(delta){distance=Math.max(3.3,Math.min(7.3,distance+delta));invalidate();}
 function reset(){yaw=0;elevation=.24;distance=6.3;invalidate();}
 const pointers=new Map();let pinch=0;
 function down(e){canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);pinch=0;}
 function move(e){
  if(!pointers.has(e.pointerId))return;
  const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);
  if(pointers.size===2){const [a,b]=[...pointers.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom((pinch-d)*.012);pinch=d;}
  else orbit((old[0]-e.clientX)*.004,(e.clientY-old[1])*.003);
 }
 function up(e){pointers.delete(e.pointerId);pinch=0;invalidate();}
 function wheel(e){if(document.activeElement!==canvas)return;e.preventDefault();zoom(e.deltaY*.003);}
 function key(e){let used=true;if(e.key==="ArrowLeft")orbit(-.08,0);else if(e.key==="ArrowRight")orbit(.08,0);else if(e.key==="ArrowUp")orbit(0,.05);else if(e.key==="ArrowDown")orbit(0,-.05);else if(e.key==="+"||e.key==="=")zoom(-.35);else if(e.key==="-")zoom(.35);else if(e.key==="Home")reset();else used=false;if(used)e.preventDefault();}
 function lost(e){e.preventDefault();onError("The 3D view was interrupted. Reload the viewer to continue.");}
 canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);canvas.addEventListener("lostpointercapture",up);canvas.addEventListener("wheel",wheel,{passive:false});canvas.addEventListener("keydown",key);canvas.addEventListener("webglcontextlost",lost);
 const observer=new ResizeObserver(invalidate);observer.observe(canvas);geometry();invalidate();
 return {
  update(next){const changed=next.room!==options.room;options={...next};if(changed)geometry();invalidate();},
  orbit,zoom,reset,
  getCamera(){return {yaw,elevation,distance};},
  dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();for(const [name,fn] of [["pointerdown",down],["pointermove",move],["pointerup",up],["pointercancel",up],["lostpointercapture",up],["wheel",wheel],["keydown",key],["webglcontextlost",lost]])canvas.removeEventListener(name,fn);gl.deleteTexture(flakes);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}
 };
}

