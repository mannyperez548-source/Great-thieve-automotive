import {EventEmitter} from 'node:events';export const WebSocket={OPEN:1};export class WebSocketServer extends EventEmitter{constructor(options){super();this.options=options;}}
