import type { Language } from "./language";
export const siteOrigin = "https://www.groupemengistie.com";
export function pageHead(language: Language) {
  const fr = language === "fr";
  const title = fr ? "Planchers d’époxy à Montréal | Groupe Mengistie" : "Epoxy Flooring in Montreal | Groupe Mengistie";
  const description = fr ? "Planchers d’époxy métalliques et à flocons à Montréal. Explorez les couleurs en 3D pour votre garage, cuisine ou sous-sol et demandez une soumission." : "Metallic and flake epoxy flooring in Montreal. Explore colours in 3D for your garage, kitchen or basement and request a quote from Groupe Mengistie.";
  const url = siteOrigin + (fr ? "/fr" : "/");
  return {
    meta: [{title}, {name:"description",content:description},
      {property:"og:title",content:title}, {property:"og:description",content:description},
      {property:"og:url",content:url}, {property:"og:locale",content:fr?"fr_CA":"en_CA"},
      {property:"og:locale:alternate",content:fr?"en_CA":"fr_CA"},
      {name:"twitter:title",content:title}, {name:"twitter:description",content:description}],
    links: [{rel:"canonical",href:url},
      {rel:"alternate",hrefLang:"en-CA",href:siteOrigin+"/"},
      {rel:"alternate",hrefLang:"fr-CA",href:siteOrigin+"/fr"},
      {rel:"alternate",hrefLang:"x-default",href:siteOrigin+"/"}],
    scripts: [{type:"application/ld+json",children:JSON.stringify({
      "@context":"https://schema.org", "@type":"HomeAndConstructionBusiness",
      "@id":siteOrigin+"/#business",name:"Groupe Mengistie",url:siteOrigin+"/",
      description,telephone:"+1-514-702-5044",email:"groupemengistie@gmail.com",
      image:siteOrigin+"/assets/og-wide.jpg",areaServed:{"@type":"City",name:"Montréal"},
      knowsLanguage:["en","fr"],hasOfferCatalog:{"@type":"OfferCatalog",name:fr?"Planchers d’époxy":"Epoxy flooring",itemListElement:[
        {"@type":"Offer",itemOffered:{"@type":"Service",name:fr?"Planchers d’époxy métalliques":"Metallic epoxy flooring"}},
        {"@type":"Offer",itemOffered:{"@type":"Service",name:fr?"Planchers d’époxy à flocons":"Flake epoxy flooring"}}
      ]}
    })}]
  };
}
