import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/site/home";
import { pageHead } from "@/features/site/seo";
export const Route = createFileRoute("/")({head:()=>pageHead("en"),component:HomePage});
