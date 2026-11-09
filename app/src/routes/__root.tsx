import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet,createRootRouteWithContext,useRouter,HeadContent,Scripts,type ErrorComponentProps } from "@tanstack/react-router";
import {useEffect,type ReactNode} from "react";
import appCss from "../styles.css?url";
import {reportHiggsfieldError} from "../lib/higgsfield-error-reporting";
import {useLanguage} from "@/features/site/language";
import meta from "../app-meta.json";
import { brandColour } from "../floor-data";
declare const __HF_DESIGN_INSPECTOR__:boolean;
const origin="https://www.groupemengistie.com";
function NotFound(){const {language}=useLanguage();const fr=language==="fr";return <main className="mengistie section-space"><h1>{fr?"Page introuvable":"Page not found"}</h1><p>{fr?"Retournez au studio pour explorer votre finition.":"Return to the floor studio to explore your finish."}</p><a href={fr?"/fr":"/"}>{fr?"Retour à l’accueil":"Back to home"}</a></main>}
function ErrorPage({reset}:ErrorComponentProps){const router=useRouter();const {language}=useLanguage();const fr=language==="fr";return <main className="mengistie section-space"><h1>{fr?"Impossible de charger cette page.":"This page could not load."}</h1><button onClick={()=>{router.invalidate();reset();}}>{fr?"Réessayer":"Try again"}</button><p><a href="tel:+15147025044">{fr?"Appelez le 514-702-5044":"Call 514-702-5044"}</a></p></main>}
export const Route=createRootRouteWithContext<{queryClient:QueryClient}>()({
head:()=>({meta:[
{charSet:"utf-8"},{name:"viewport",content:"width=device-width, initial-scale=1"},
{title:"Groupe Mengistie"},
{name:"author",content:"Groupe Mengistie"},{name:"theme-color",content:brandColour},

{property:"og:type",content:"website"},
{property:"og:site_name",content:"Groupe Mengistie"},
{property:"og:image",content:origin+meta.og_image_url},
{name:"twitter:card",content:"summary_large_image"},{name:"twitter:image",content:origin+meta.og_image_url},
{name:"robots",content:"index, follow, max-image-preview:large"}],
links:[{rel:"stylesheet",href:appCss},{rel:"icon",type:"image/svg+xml",sizes:"any",href:"/assets/company-favicon.svg"},{rel:"manifest",href:"/site.webmanifest"}]}),
shellComponent:RootShell,component:Root,notFoundComponent:NotFound,errorComponent:ErrorPage});
function RootShell({children}:{children:ReactNode}){const {language}=useLanguage();return <html lang={language}><head><HeadContent/></head><body>{children}<Scripts/></body></html>}
function Root(){const {queryClient}=Route.useRouteContext();useEffect(()=>{
if(!__HF_DESIGN_INSPECTOR__)return;
void import("../module/design-inspector/runtime").then(({installHiggsfieldDesignInspector})=>installHiggsfieldDesignInspector()).catch(error=>reportHiggsfieldError(error instanceof Error?error:new Error("Inspector could not load"),{boundary:"design_inspector"}));
},[]);return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>}

