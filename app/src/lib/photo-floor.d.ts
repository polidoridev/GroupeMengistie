export interface FloorOptions {room:string;finish:string;base:string;accent:string;comparison:number}
export interface PhotoFloor {update(options:FloorOptions):void;setView(view:number):void;zoom(delta:number):void;reset():void;retry():void;getState():{view:number;zoom:number;px:number;py:number;ready:boolean};dispose():void}
export function createPhotoFloor(canvas:HTMLCanvasElement,options:FloorOptions,notify?:(status:string)=>void,onView?:(view:number)=>void):PhotoFloor;
