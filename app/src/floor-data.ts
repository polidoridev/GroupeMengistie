export const palettes = [
{name:"Silver",base:"#D7DCDE",accent:"#424C50"},
{name:"Graphite",base:"#858D91",accent:"#1C252A"},
{name:"Pearl",base:"#F2F0E7",accent:"#9C9D98"},
{name:"Ocean",base:"#AEC4CE",accent:"#244B65"},
{name:"Sage",base:"#C1CEC1",accent:"#405C50"},
{name:"Copper",base:"#D6B29A",accent:"#6D4232"},
];
export function rgbChannels(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}


export const brandColour = "#173D32";
