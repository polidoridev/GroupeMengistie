import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useLanguage } from "./language";
import { consentCookie, floorCookie, parseFloorSelection, readCookie, writeCookie, type FloorSelection } from "./cookie-storage";

export function useFloorPreferences(selection:FloorSelection, setSelection:Dispatch<SetStateAction<FloorSelection>>) {
  const [consent,setConsent]=useState<"necessary"|"preferences"|null>(null);
  const [ready,setReady]=useState(false);
  const [open,setOpen]=useState(false);
  const [remember,setRemember]=useState(false);
  const pending=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    const saved=readCookie(consentCookie);
    const choice=saved==="preferences"||saved==="necessary"?saved:null;
    setConsent(choice);
    if(choice==="preferences") {
      const floor=parseFloorSelection(readCookie(floorCookie));
      if(floor)setSelection(floor);
    } else if(readCookie(floorCookie)!==undefined)writeCookie(floorCookie,"",0);
    setReady(true);
  },[setSelection]);
  useEffect(()=>{
    if(!ready||consent!=="preferences")return;
    pending.current=setTimeout(()=>writeCookie(floorCookie,JSON.stringify(selection)),250);
    return ()=>{if(pending.current!==null)clearTimeout(pending.current);};
  },[selection,ready,consent]);
  function choose(choice:"necessary"|"preferences") {
    if(pending.current!==null)clearTimeout(pending.current);
    writeCookie(consentCookie,choice);
    writeCookie(floorCookie,choice==="preferences"?JSON.stringify(selection):"",choice==="preferences"?60*60*24*180:0);
    setConsent(choice);setOpen(false);
  }
  function openSettings(){setRemember(consent==="preferences");setOpen(true);}
  return {consent,ready,open,setOpen,choose,remember,setRemember,openSettings};
}
export function CookiePreferences({preferences:p}:{preferences:ReturnType<typeof useFloorPreferences>}) {
  const {language}=useLanguage();
  const fr=language==="fr";
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    if(!p.open)return;
    const node=dialog.current;
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    node?.showModal();
    return ()=>{node?.close();previousFocus?.focus();};
  },[p.open]);
  return <>
    {p.ready&&p.consent===null&&!p.open&&<section className="cookie-banner" aria-label={fr?"Choix des témoins":"Cookie choices"}>
      <div><h2>{fr?"Votre plancher, vos préférences":"Your floor, your preferences"}</h2><p>{fr?"Avec votre accord, un témoin mémorise vos choix de pièce et de couleurs pendant 180 jours. Aucun témoin publicitaire ou analytique n’est utilisé. Votre décision est enregistrée dans un témoin essentiel.":"With your permission, a cookie remembers your room and colour choices for 180 days. We use no advertising or analytics cookies. An essential cookie saves your decision."}</p></div>
      <div className="cookie-actions"><button onClick={()=>p.choose("necessary")}>{fr?"Essentiels seulement":"Necessary only"}</button><button onClick={()=>p.choose("preferences")}>{fr?"Mémoriser mes choix":"Remember my choices"}</button><button className="cookie-details" onClick={p.openSettings}>{fr?"Personnaliser":"Customize"}</button></div>
    </section>}
    <dialog ref={dialog} className="cookie-dialog" aria-labelledby="cookie-title" onCancel={()=>p.setOpen(false)} onClose={()=>p.setOpen(false)}>
      <button className="cookie-close" autoFocus onClick={()=>p.setOpen(false)} aria-label={fr?"Fermer les préférences":"Close preferences"}>×</button>
      <h2 id="cookie-title">{fr?"Confidentialité et témoins":"Privacy & cookies"}</h2>
      <p>{fr?"Le studio fonctionne sans témoins facultatifs. Nous n’utilisons aucun outil publicitaire ou analytique sur ce site.":"The floor studio works without optional cookies. We use no advertising or analytics tools on this site."}</p>
      <h3>{fr?"Témoin essentiel":"Essential cookie"}</h3>
      <p>{fr?"gm_consent_v1 enregistre votre choix pendant 180 jours afin de ne pas vous le redemander à chaque visite.":"gm_consent_v1 saves your decision for 180 days so we do not ask again on every visit."}</p>
      <label className="cookie-toggle"><input type="checkbox" checked={p.remember} onChange={e=>p.setRemember(e.target.checked)}/><span>{fr?"Mémoriser ma pièce, ma finition et mes couleurs":"Remember my room, finish and colours"}</span></label>
      <p>{fr?"Facultatif : gm_floor_v1 conserve vos choix dans ce navigateur pendant un maximum de 180 jours après votre dernier changement. Désactivez cette option pour supprimer ces choix enregistrés. Vous pouvez revenir ici à tout moment avec le lien en bas de page.":"Optional: gm_floor_v1 stores your selections in this browser for up to 180 days after your last change. Turn this off to delete saved selections. You can reopen these settings from the footer at any time."}</p>
      <h3>{fr?"Nous contacter":"Contacting us"}</h3>
      <p>{fr?"Le bouton de soumission ouvre votre application de courriel. Rien n’est envoyé avant que vous envoyiez le message. Groupe Mengistie reçoit les renseignements que vous choisissez d’inclure pour répondre à votre demande. L’hébergeur peut traiter des données techniques, comme votre adresse IP, pour fournir et sécuriser le site.":"The quote button opens your email app. Nothing is sent until you send the message. Groupe Mengistie receives the information you choose to include to respond to your request. The hosting provider may process technical data, such as your IP address, to deliver and secure the site."}</p>
      <p>{fr?"Pour toute question sur vos renseignements : ":"For questions about your information: "}<a href="mailto:groupemengistie@gmail.com">groupemengistie@gmail.com</a>.</p>
      <div className="cookie-actions"><button onClick={()=>p.choose("necessary")}>{fr?"Essentiels seulement":"Necessary only"}</button><button onClick={()=>p.choose(p.remember?"preferences":"necessary")}>{fr?"Enregistrer mes préférences":"Save preferences"}</button></div>
    </dialog>
  </>;
}
