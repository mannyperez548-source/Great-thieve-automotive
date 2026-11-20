import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {EventEmitter} from 'node:events';
import {PLACES,SERVICES,placeEntrance,groundHeight,trafficPosition,segmentHitsBox,vehicleRadius} from '../public/city-data.js';
import {JOBS,onLand} from '../public/world-data.js';
assert.equal(PLACES.length,20);assert.equal(JOBS.length,27);assert.equal(new Set(PLACES.map(p=>p.id)).size,20);
for(const p of PLACES){const e=placeEntrance(p);assert(onLand(e.x,e.z));assert(e.z>p.z+p.d/2);}
for(const service of SERVICES){assert(PLACES.some(p=>p.id===service.place));assert(service.price>0);}
assert.equal(groundHeight(-176,-500),0);assert.equal(groundHeight(0,-355),0);assert(groundHeight(-55,-560)>10);
let maximum=0;for(let x=-175;x<=125;x+=3)for(let z=-705;z<=-355;z+=3){const h=groundHeight(x,z);assert(h>=0&&h<90);maximum=Math.max(maximum,h);}assert(maximum>55);
assert(segmentHitsBox(-10,0,10,0,0,0,1,1));assert(!segmentHitsBox(-10,3,10,3,0,0,1,1));assert(segmentHitsBox(0,0,0,0,0,0,1,1));assert(vehicleRadius('bus')>vehicleRadius('sedan'));
assert.deepEqual(trafficPosition(0,1800000000000),trafficPosition(0,1800000000000));
const data=fs.mkdtempSync(path.join(os.tmpdir(),'city-v4-test-'));process.env.DATA_DIR=data;process.env.PORT='0';
const token='22222222-2222-2222-2222-222222222222';fs.writeFileSync(path.join(data,'accounts.json'),JSON.stringify({[token]:{name:'City tester',money:100000,owned:['sunrunner'],color:0x7ce6c8,earnings:0,deliveries:0}}));
const ticks=[];globalThis.setInterval=(fn,ms)=>{ticks.push({fn,ms});return {unref(){}};};let now=1800000000000;Date.now=()=>now;
const {server,wss,clients}=await import('../server.js');if(!server.listening)await new Promise(r=>server.once('listening',r));
class Socket extends EventEmitter{readyState=1;messages=[];send(s){this.messages.push(JSON.parse(s));}close(){this.emit('close');}}
const socket=new Socket();wss.emit('connection',socket);const send=m=>socket.emit('message',Buffer.from(JSON.stringify(m)));send({type:'hello',token});const c=[...clients.values()][0];const tick=ticks.find(t=>t.ms===100).fn;
const balance=c.account.money;send({type:'service',id:'meal'});assert.equal(c.account.money,balance);
const restaurant=PLACES.find(p=>p.id==='restaurant');Object.assign(c,placeEntrance(restaurant));c.account.health=40;send({type:'service',id:'meal'});assert.equal(c.account.money,balance-35);assert.equal(c.account.health,70);
send({type:'service',id:'meal'});assert.equal(c.account.money,balance-35);
now+=2000;send({type:'service',id:'nonexistent'});assert.equal(c.account.money,balance-35);c.account.money=0;send({type:'service',id:'meal'});assert.equal(c.account.money,0);c.account.money=100000;
c.x=-55;c.z=-560;c.y=groundHeight(c.x,c.z);c.last=now-1000;send({type:'move',x:-54,z:-559,y:999,yaw:0,mode:'foot',vehicle:null});assert.equal(c.y,groundHeight(-54,-559));
c.x=-95;c.z=-353;c.y=0;send({type:'job',job:'ranger'});assert.equal(c.job.kind,'ranger');
for(let stage=0;stage<3;stage++){c.x=c.job.target.x;c.z=c.job.target.z;c.y=groundHeight(c.x,c.z);for(let i=0;i<14;i++){now+=400;tick();}}
assert.equal(c.job,null);assert.equal(c.account.money,102300);
c.mode='car';c.vehicle='sunrunner';c.x=-344;c.z=557;c.y=0;c.last=now-1000;const oldZ=c.z;send({type:'move',x:-344,z:603,y:0,yaw:0,mode:'car',vehicle:'sunrunner'});assert.equal(c.z,oldZ);
tick();let world=socket.messages.filter(m=>m.type==='world').at(-1);assert.equal(world.traffic.length,9);const t=world.traffic[0];c.x=t.x;c.z=t.z-10;c.last=now-1000;send({type:'move',x:t.x,z:t.z+10,y:0,yaw:0,mode:'car',vehicle:'sunrunner'});assert.equal(c.z,t.z-10);
c.mode='foot';c.vehicle=null;c.x=t.x;c.z=t.z-3;now+=400;tick();world=socket.messages.filter(m=>m.type==='world').at(-1);assert.equal(world.traffic[0].z,t.z);
// V4 regression: hills do not block exiting a car or lose server elevation.
c.x=-55;c.z=-560;c.y=groundHeight(c.x,c.z);c.mode='car';c.vehicle='sunrunner';send({type:'exit'});assert.equal(c.mode,'foot');assert.equal(c.y,groundHeight(c.x,c.z));
// V4 regression: swept player collision also rejects passing through a walker.
c.x=0;c.z=100;c.y=0;c.mode='car';c.vehicle='sunrunner';c.last=now-1000;clients.set('obstacle',{id:'obstacle',x:0,z:90,y:0,mode:'foot'});send({type:'move',x:0,z:80,y:0,yaw:0,mode:'car',vehicle:'sunrunner'});assert.equal(c.z,100);clients.delete('obstacle');
const res=await fetch('http://127.0.0.1:'+server.address().port+'/city-data.js');assert.equal(res.status,200);assert((await res.text()).includes('groundHeight'));
console.log('PASS: city services, authoritative terrain, elevated ranger payouts, swept buildings/traffic/player collision, yielding traffic, car exit on hills and module serving. WebSocket transport mocked; not a browser render test.');
server.close();fs.rmSync(data,{recursive:true,force:true});process.exit(0);
