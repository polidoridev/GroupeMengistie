import { useRouterState } from "@tanstack/react-router";
import french from "./fr.json";
export type Language = "en" | "fr";
export function translate(language: Language, text: string): string {
  return language === "fr" ? (french as Record<string, string>)[text] ?? text : text;
}
export function useLanguage() {
  const language: Language = useRouterState({select: state => state.location.pathname === "/fr" || state.location.pathname.startsWith("/fr/") ? "fr" : "en"});
  return {language, t: (text: string) => translate(language, text)};
}
