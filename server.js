import {PLACES,SERVICES,placeEntrance,groundHeight,trafficSpecs,trafficPosition,segmentHitsBox,vehicleRadius} from './public/city-data.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer,WebSocket} from 'ws';
import {randomUUID} from 'node:crypto';
import {CATALOG,JOBS,CRIMES,AIRPORTS,DOCKS,onLand,atPier} from './public/world-data.js';
const base=path.dirname(fileURLToPath(import.meta.url)),publicDir=path.join(base,'public'),dataDir=process.env.DATA_DIR||path.join(base,'data');
fs.mkdirSync(dataDir,{recursive:true});let accounts={};try{accounts=JSON.parse(fs.readFileSync(path.join(dataDir,'accounts.json'),'utf8'));}catch{}
const liveTraffic=trafficSpecs.map((t,i)=>({...trafficPosition(i,Date.now()),speed:t.speed,dir:t.dir}));
const clients=new Map(),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server=http.createServer((req,res)=>{let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400);return res.end();}if(pathname==='/health'){res.writeHead(200);return res.end('ok');}let target;try{target=path.resolve(publicDir,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);return res.end();}if(!target.startsWith(publicDir+path.sep)){res.writeHead(403);return res.end();}fs.readFile(target,(err,body)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(err?'Not found':body);});});
const wss=new WebSocketServer({server,maxPayload:8192});const send=(s,m)=>{if(s.readyState===WebSocket.OPEN)s.send(JSON.stringify(m));};
const save=()=>{try{fs.writeFileSync(path.join(dataDir,'accounts.tmp'),JSON.stringify(accounts));fs.renameSync(path.join(dataDir,'accounts.tmp'),path.join(dataDir,'accounts.json'));}catch(e){console.error(e.message);}};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),toast=(c,text)=>send(c.socket,{type:'toast',text});
function sync(c){send(c.socket,{type:'account',account:c.account,job:c.job});}
function condition(c,j){return j.mode==='any'||c.mode===j.mode;}
function threats(c,n,police=false){c.enemies=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;c.enemies.push({id:i,x:c.x+Math.sin(a)*(police?42:24),z:c.z+Math.cos(a)*(police?42:24),hp:police?3:2,police});}}
function arrest(c){const fine=Math.min(c.account.money,350+(c.account.heat||0)*200);c.account.money-=fine;c.account.heat=0;c.account.health=100;c.job=null;c.enemies=[];c.x=0;c.z=87;c.y=0;c.mode='foot';c.vehicle=null;send(c.socket,{type:'respawn',x:0,z:87});sync(c);save();toast(c,'Recovered at the clinic. Penalty: $'+fine);}
function complete(c){const reward=c.job.reward;c.account.money+=reward;c.account.earnings+=reward;c.account.deliveries++;if(c.job.crime){c.account.crimeXP=(c.account.crimeXP||0)+1;}c.job=null;if(!c.account.heat)c.enemies=[];sync(c);save();toast(c,'Contract complete · +$'+reward);}
wss.on('connection',socket=>{let c=null,windowStart=Date.now(),count=0;socket.on('message',raw=>{
 if(Date.now()-windowStart>1000){windowStart=Date.now();count=0;}if(++count>60)return;
 let m;try{m=JSON.parse(raw);if(!m||typeof m!=='object')return;}catch{return;}
 if(m.type==='hello'&&!c){let token=typeof m.token==='string'&&/^[a-f0-9-]{36}$/.test(m.token)?m.token:randomUUID();if([...clients.values()].some(v=>v.token===token)){send(socket,{type:'error',text:'Profile already open in another tab.'});return socket.close();}
 if(!accounts[token])accounts[token]={name:String(m.name||'Newcomer').replace(/[^a-zA-Z0-9 _-]/g,'').trim().slice(0,18)||'Newcomer',money:1200,owned:[],color:0x7ce6c8,earnings:0,deliveries:0};const a=accounts[token];a.health=100;a.heat=a.heat||0;a.crimeXP=a.crimeXP||0;a.crimeCooldown=a.crimeCooldown||0;
 c={socket,token,id:randomUUID(),account:a,x:0,z:87,y:0,yaw:0,mode:'foot',vehicle:null,job:null,last:Date.now(),enemies:[],guard:false,lastShot:0,evade:0};clients.set(c.id,c);if(a.heat)threats(c,Math.min(5,a.heat+1),true);
 send(socket,{type:'welcome',id:c.id,token,catalog:CATALOG,account:a,time:Date.now()});sync(c);return;}
 if(!c)return;
 if(m.type==='move'){if(![m.x,m.z,m.yaw].every(Number.isFinite))return;const now=Date.now(),dt=Math.min(1,(now-c.last)/1000);c.last=now;const item=CATALOG.find(v=>v.id===m.vehicle);const mode=m.mode;const allowed=mode==='foot'||(item&&c.account.owned.includes(item.id)&&item.type===mode);if(!allowed)return;
 const speed=mode==='foot'?17:mode==='boat'?55:mode==='plane'?190:mode==='helicopter'?85:95;
 if(Math.hypot(m.x-c.x,m.z-c.z)>speed*dt+4){send(socket,{type:'correct',x:c.x,z:c.z,y:c.y});return;}
 const airborne=['plane','helicopter'].includes(mode);let y=airborne&&Number.isFinite(m.y)?Math.max(groundHeight(m.x,m.z),Math.min(260,m.y)):groundHeight(m.x,m.z);if(Math.abs(y-c.y)>45*dt+5)return;
 if(mode==='car'){
 const r=vehicleRadius(item.body);let blocked=liveTraffic.some(t=>segmentHitsBox(c.x,c.z,m.x,m.z,t.x,t.z,1.2+r,2.7+r));
 for(const other of clients.values())if(other!==c&&['car','foot'].includes(other.mode)&&Math.abs(other.y-y)<4){const rr=other.mode==='car'?vehicleRadius(CATALOG.find(i=>i.id===other.vehicle)?.body):.45;if(segmentHitsBox(c.x,c.z,m.x,m.z,other.x,other.z,r+rr,r+rr))blocked=true;}
 for(const p of PLACES)if(segmentHitsBox(c.x,c.z,m.x,m.z,p.x,p.z,p.w/2+r,p.d/2+r))blocked=true;
 if(blocked){send(c.socket,{type:'correct',x:c.x,z:c.z,y:c.y});return;}
 }
 c.x=Math.max(-760,Math.min(1450,m.x));c.z=Math.max(-850,Math.min(850,m.z));c.y=y;c.yaw=m.yaw;c.mode=mode;c.vehicle=mode==='foot'?null:m.vehicle;c.guard=!!m.guard;
 }
 if(m.type==='spawn'){const item=CATALOG.find(i=>i.id===m.id);if(!item||!['car','boat','plane','helicopter'].includes(item.type)||!c.account.owned.includes(item.id))return;
 if(item.type==='boat'){const d=DOCKS.find(d=>dist(c,d)<40);if(!d)return toast(c,'Visit a marina marker to launch your boat.');c.x=d.launchX;c.z=d.launchZ;c.yaw=-Math.PI/2;}
 else if(['plane','helicopter'].includes(item.type)){const a=AIRPORTS.find(a=>dist(c,{x:a.spawnX,z:a.spawnZ})<70);if(!a)return toast(c,'Go to an airport aviation marker to spawn aircraft.');c.x=a.spawnX;c.z=a.spawnZ;c.yaw=0;}
 else{if(!onLand(c.x,c.z))return toast(c,'Return to land to spawn a car.');if(c.x<150){c.x=c.x<-190?Math.max(-624,Math.min(-224,Math.round((c.x+224)/80)*80-224)):Math.max(-144,Math.min(96,Math.round(c.x/48)*48));}}
 c.y=item.type==='car'?groundHeight(c.x,c.z):0;c.mode=item.type;c.vehicle=item.id;c.last=Date.now();send(socket,{type:'spawned',id:item.id,x:c.x,z:c.z,y:c.y,yaw:c.yaw});return;}
 if(m.type==='exit'){if(['plane','helicopter'].includes(c.mode)&&c.y>groundHeight(c.x,c.z)+2)return toast(c,'Land before exiting your aircraft.');if(c.mode==='boat'){const d=DOCKS.find(d=>dist(c,{x:d.launchX,z:d.launchZ})<35);if(!d)return toast(c,'Return to a marina to disembark.');c.x=d.x;c.z=d.z;}if(['plane','helicopter'].includes(c.mode)&&!onLand(c.x,c.z))return toast(c,'Land on dry ground first.');c.mode='foot';c.y=groundHeight(c.x,c.z);c.vehicle=null;c.last=Date.now();send(socket,{type:'exited',x:c.x,z:c.z,y:c.y});return;}
 if(m.type==='buy'){const item=CATALOG.find(i=>i.id===m.id);if(!item)return;if(c.account.owned.includes(item.id))return toast(c,'Already in your collection.');if(c.account.money<item.price)return toast(c,'Not enough cash yet.');c.account.money-=item.price;c.account.owned.push(item.id);if(item.type==='outfit')c.account.color=item.color;sync(c);save();toast(c,item.name+' is yours!');}
 if(m.type==='service'){
 const s=SERVICES.find(s=>s.id===m.id),p=s&&PLACES.find(p=>p.id===s.place);if(!s||!p)return;
 if(dist(c,placeEntrance(p))>19)return toast(c,'Visit '+p.name+' to use this service.');
 if(c.mode!=='foot')return toast(c,'Enter on foot first.');if(Date.now()-(c.lastService||0)<1500)return;
 if(c.account.money<s.price)return toast(c,'Not enough cash for this service.');
 c.lastService=Date.now();c.account.money-=s.price;c.account.health=Math.min(100,(c.account.health||0)+s.heal);sync(c);save();toast(c,s.name+' · paid $'+s.price+(s.heal?' · health restored':' · role-play service complete'));
 }
 if(m.type==='equip'){const i=CATALOG.find(i=>i.id===m.id);if(i?.type==='outfit'&&c.account.owned.includes(i.id)){c.account.color=i.color;sync(c);}}
 if(m.type==='job'){if(c.job)return toast(c,'Finish or cancel your active contract first.');const j=JOBS.find(j=>j.id===m.job);if(!j||dist(c,j)>18)return toast(c,'Visit the matching job marker first.');if(!condition(c,j))return toast(c,'This contract requires mode: '+j.mode+'.');const points=j.sequence?j.points:[j.points[Math.floor(Math.random()*j.points.length)]];c.job={kind:j.id,name:j.name,mode:j.mode,target:{x:points[0][0],z:points[0][1]},points,index:0,reward:j.reward,hold:j.hold,progress:0,defense:!!j.defense,started:Date.now()};if(j.defense)threats(c,5);sync(c);}
 if(m.type==='crime'){if(c.job)return toast(c,'Finish or cancel your current contract.');const d=CRIMES.find(j=>j.id===m.id);if(!d||dist(c,d)>12||c.mode!=='foot')return toast(c,'Approach the red marker on foot.');if((c.account.crimeXP||0)<(d.requiredXP||0))return toast(c,'Build criminal reputation first. Required completed raids: '+d.requiredXP+'.');if(Date.now()<c.account.crimeCooldown)return toast(c,'Criminal contacts are cooling down. Try again shortly.');c.account.crimeCooldown=Date.now()+90000;c.account.heat=Math.min(5,c.account.heat+d.heat);c.job={kind:d.id,name:d.name,mode:'foot',crime:true,phase:'raid',target:{x:d.x,z:d.z},reward:d.reward,hold:d.hold,progress:0,started:Date.now()};threats(c,Math.min(6,c.account.heat+2),true);sync(c);save();toast(c,'Raid started. Hold the red zone; F stuns, Q guards. Then escape to the hideout.');}
 if(m.type==='shoot'){if(Date.now()-c.lastShot<550||c.y>3)return;c.lastShot=Date.now();const e=c.enemies.filter(e=>e.hp>0&&dist(c,e)<32).sort((a,b)=>dist(c,a)-dist(c,b))[0];if(e){e.hp--;e.stunUntil=Date.now()+1600;send(socket,{type:'shot',x:e.x,z:e.z});if(e.hp<=0)toast(c,'Pursuer stunned.');}}
 if(m.type==='complete'&&c.job){const j=c.job;if(j.hold||dist(c,j.target)>12||Date.now()-j.started<6500||!condition(c,j)||c.y>groundHeight(c.x,c.z)+2)return;complete(c);}
 if(m.type==='cancel'){c.job=null;if(!c.account.heat)c.enemies=[];sync(c);}
 if(m.type==='travel'){if(c.mode!=='foot'||c.job||c.account.heat)return toast(c,'Travel requires no active job, no wanted level, and being on foot.');const near=DOCKS.find(d=>dist(c,d)<20);const target=DOCKS.find(d=>d.name===m.name);if(!near||!target||c.account.money<150)return toast(c,'Visit a marina ferry marker; tickets cost $150.');c.account.money-=150;c.x=target.x;c.z=target.z;c.y=0;send(socket,{type:'respawn',x:c.x,z:c.z});sync(c);save();}
 if(m.type==='chat'&&typeof m.text==='string'){const text=m.text.replace(/[\x00-\x1f]/g,'').trim().slice(0,160);if(text&&Date.now()-(c.lastChat||0)>1300){c.lastChat=Date.now();for(const v of clients.values())send(v.socket,{type:'chat',name:c.account.name,text});}}
 });socket.on('close',()=>{if(c){clients.delete(c.id);save();}});socket.on('error',()=>{});});
let lastTick=Date.now(),lastSync=0;
setInterval(()=>{const now=Date.now(),dt=Math.min(.4,(now-lastTick)/1000);lastTick=now;
 for(const t of liveTraffic){let nz=t.z+t.speed*t.dir*dt;if(Math.abs(nz)>190)nz=-190*t.dir;const occupied=[...clients.values()].some(c=>['car','foot'].includes(c.mode)&&c.y<4&&Math.abs(c.x-t.x)<(c.mode==='car'?vehicleRadius(CATALOG.find(i=>i.id===c.vehicle)?.body)+1.4:1.9)&&Math.abs(c.z-nz)<(c.mode==='car'?vehicleRadius(CATALOG.find(i=>i.id===c.vehicle)?.body)+5:4.5));if(!occupied)t.z=nz;}
 for(const c of clients.values()){
  let nearest=Infinity;for(const e of c.enemies){if(e.hp<=0)continue;const d=dist(c,e);nearest=Math.min(nearest,d);if(now>(e.stunUntil||0)&&d>2.5){const speed=e.police?9:4.5;e.x+=(c.x-e.x)/d*speed*dt;e.z+=(c.z-e.z)/d*speed*dt;}if(d<9&&c.y<3&&now>(e.stunUntil||0)){c.account.health=Math.max(0,c.account.health-dt*(c.guard?2:9));}}
  if(c.account.health<=0){arrest(c);continue;}
  if(c.account.heat){if(nearest>85||c.enemies.every(e=>e.hp<=0))c.evade+=dt;else c.evade=0;if(c.evade>24&&!c.job?.crime){c.account.heat=0;c.enemies=[];c.evade=0;toast(c,'Wanted level cleared.');sync(c);save();}}
  else c.account.health=Math.min(100,c.account.health+dt*1.5);
  const j=c.job;if(j?.hold){const inZone=dist(c,j.target)<12&&c.y<groundHeight(c.x,c.z)+2&&condition(c,j);j.progress=inZone?j.progress+dt:0;
   if(j.progress>=j.hold){if(j.crime&&j.phase==='raid'){j.phase='escape';j.mode='any';j.hold=0;j.progress=0;j.target={x:-624,z:500};sync(c);toast(c,'Loot secured. Reach the gold hideout marker!');}
   else if(j.points&&j.index+1<j.points.length){j.index++;const p=j.points[j.index];j.target={x:p[0],z:p[1]};j.progress=0;sync(c);toast(c,'Stop complete. Next destination marked.');}
   else complete(c);}}
  send(c.socket,{type:'status',health:c.account.health,heat:c.account.heat,evade:c.evade,progress:c.job?.progress||0,enemies:c.enemies.filter(e=>e.hp>0)});
 }
 const players=[...clients.values()].map(c=>({id:c.id,name:c.account.name,x:c.x,z:c.z,y:c.y,yaw:c.yaw,mode:c.mode,vehicle:c.vehicle,color:c.account.color}));for(const c of clients.values())send(c.socket,{type:'world',players,traffic:liveTraffic.map(t=>({x:t.x,z:t.z,yaw:t.yaw})),time:now});
},100);
setInterval(save,30000).unref();server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Coastline Expanded on '+(process.env.PORT||3000)));

export {server,wss,clients};
