import {useLanguage} from "@/features/site/language";
import {useEffect,useRef,useState} from 'react';
import {workPhotos} from '@/work-photos';
const categories=['All','Metallic','Flake','Solid'];
export function WorkGallery(){
 const {language,t}=useLanguage();
 const [filter,setFilter]=useState('All');
 const [visible,setVisible]=useState(12);
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const filtered=workPhotos.filter(photo=>filter==='All'||photo.category===filter);
 const photo=selected===null?null:workPhotos[selected];
 const open=selected!==null;
 useEffect(()=>{
  const node=dialog.current;if(!node||!open)return;
  node.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return ()=>{node.close();document.body.style.overflow=previous;};
 },[open]);
 function move(direction:number){setSelected(i=>i===null?null:(i+direction+workPhotos.length)%workPhotos.length);}
 return <>
  <div className="work-gallery-controls"><div className="work-filters" role="group" aria-label={t("Filter project photos")}>{categories.map(category=><button key={category} aria-pressed={filter===category} onClick={()=>{setFilter(category);setVisible(12);}}>{t(category)}</button>)}</div><span aria-live="polite">{filtered.length} photos</span></div>
  <div className="project-photo-grid">{filtered.slice(0,visible).map(item=><figure key={item.id}><button className="project-photo-button" onClick={()=>setSelected(workPhotos.indexOf(item))} aria-label={t('View photo ↗')+': '+t(item.alt)}><img src={item.src} alt={t(item.alt)} width={item.width} height={item.height} loading="lazy" decoding="async"/><span aria-hidden="true">{t("View photo \u2197")}</span></button><figcaption>{t(item.alt)}</figcaption></figure>)}</div>
  {visible<filtered.length&&<div className="work-show-more"><button onClick={()=>setVisible(n=>n+12)}>{language==="fr"?"Afficher":"Show"} {Math.min(12,filtered.length-visible)} {language==="fr"?"photos de plus":"more photos"} <span aria-hidden="true">↓</span></button><p>{Math.min(visible,filtered.length)} {language==="fr"?"sur":"of"} {filtered.length} photos</p></div>}
  <dialog ref={dialog} className="work-lightbox" aria-label={t("Project photo viewer")} onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}}}>
   {photo&&<div className="work-lightbox-content"><div className="work-lightbox-top"><span aria-live="polite">{selected!+1} / {workPhotos.length}</span><button autoFocus onClick={()=>setSelected(null)} aria-label={t("Close photo viewer")}>{t("Close \u00d7")}</button></div><img key={photo.id} src={photo.src} alt={t(photo.alt)} width={photo.width} height={photo.height}/><div className="work-lightbox-bottom"><button onClick={()=>move(-1)} aria-label={t("Previous photo")}>←</button><p aria-live="polite">{t(photo.alt)}</p><button onClick={()=>move(1)} aria-label={t("Next photo")}>→</button></div><a className="work-original" href={photo.src} target="_blank" rel="noopener noreferrer">{t("Open original photo \u2197")}</a></div>}
  </dialog>
 </>;
}
