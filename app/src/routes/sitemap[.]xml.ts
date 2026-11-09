import { createFileRoute } from "@tanstack/react-router";
import sitemap from "../../public/sitemap.xml?raw";
export const Route = createFileRoute("/sitemap.xml")({server:{handlers:{GET:async()=>new Response(sitemap,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600"}})}}});
