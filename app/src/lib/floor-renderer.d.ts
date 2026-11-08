export interface FloorOptions {room:string;finish:string;base:string;accent:string;comparison:number}
export interface FloorRenderer {update(options:FloorOptions):void;orbit(x:number,y:number):void;zoom(delta:number):void;reset():void;getCamera():{yaw:number;elevation:number;distance:number};dispose():void}
export function createFloorRenderer(canvas:HTMLCanvasElement,options:FloorOptions,onError?:(message:string)=>void):FloorRenderer;

