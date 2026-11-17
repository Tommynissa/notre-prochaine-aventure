const ROUTE={width:960,height:540,ground:425,zoneLength:1500,total:7500,
 zones:[
 {name:'Les Pouilles',sub:'Un petit air d’Italie',sky:'#b8eaff',land:'#d6bc81',color:'#d99954',items:['🍕','🫒','🍋']},
 {name:'Le Monténégro',sub:'Sur les hauteurs de Kotor',sky:'#b8d9e2',land:'#a8ad7d',color:'#909f8a',items:['🏔️','📷','🧭']},
 {name:'La Polynésie',sub:'Au fil du lagon',sky:'#a8eaf3',land:'#f4dda2',color:'#29b9bd',items:['🐋','🦈','ray']},
 {name:'Le Kenya',sub:'Safari à deux',sky:'#ffe4a7',land:'#dfbc76',color:'#d9a255',items:['🦁','🐘','🦏','🐆','🐃']},
 {name:'Londres',sub:'Dernière escale avant le décollage',sky:'#c2dfed',land:'#a4b4a3',color:'#a67257',items:['🪄','🦉','🧳']}
 ],
 create(){const solids=[],gaps=[],items=[],platforms=[];
  for(let z=0;z<5;z++){const base=z*1500;
   [[340,65,65],[710,100,85],[1090,85,60]].forEach(([x,w,h],k)=>solids.push({x:base+x,y:425-h,w,h,kind:'case',z}));
   gaps.push({x:base+890,w:100,z});
   platforms.push({x:base+480,y:335,w:112,h:20,z},{x:base+520,y:245,w:112,h:20,z});
   const symbols=this.zones[z].items;
   [210,365,560,755,930,1120,1330].forEach((x,k)=>items.push({x:base+x,y:425-([1,3,4,5].includes(k)?145:67),icon:symbols[k%symbols.length],taken:false,z}));
  }return {solids,gaps,items,platforms};
 },overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y},
 step(p,world,input,dt){
  const previous={x:p.x,y:p.y};p.vx=(Number(input.right)-Number(input.left))*260;p.x=Math.max(0,Math.min(7470,p.x+p.vx*dt));
  for(const s of world.solids)if(this.overlap(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w}
  p.vy+=1850*dt;p.y+=p.vy*dt;p.grounded=false;
  for(const s of world.solids)if(this.overlap(p,s)){if(p.vy>=0&&previous.y+p.h<=s.y+8){p.y=s.y-p.h;p.vy=0;p.grounded=true}else if(p.vy<0&&previous.y>=s.y+s.h-8){p.y=s.y+s.h;p.vy=0}}
  for(const bridge of world.platforms||[])if(p.vy>=0&&previous.y+p.h<=bridge.y&&p.y+p.h>=bridge.y&&p.x+p.w>bridge.x&&p.x<bridge.x+bridge.w){p.y=bridge.y-p.h;p.vy=0;p.grounded=true}
  const center=p.x+p.w/2,hole=world.gaps.some(g=>center>g.x&&center<g.x+g.w);
  if(!hole&&p.y+p.h>=this.ground&&previous.y+p.h<=this.ground+12&&p.vy>=0){p.y=this.ground-p.h;p.vy=0;p.grounded=true}
  return p;
 }
};
async function platform(i){
 const routeTestMode=testMode;
 panel('<div class="big">✈️</div><h2>Anaïs prépare sa valise…</h2><p>Le parcours arrive.</p>');
 const scenery=new Image();scenery.src='assets/route-worlds.png';
 const heroine=new Image();heroine.src='assets/anais-route.png';
 try{await new Promise((resolve,reject)=>{heroine.onload=resolve;heroine.onerror=reject})}catch{save();panel('<h2>Le personnage n’a pas pu se charger.</h2><button class="btn" id="back">Retour à la carte</button>');document.querySelector('#back').onclick=map;return}
 panel(`<div class="route-game"><div class="route-head"><div><span class="eyebrow">En route ! · Trois vies au total</span><h2 id="route-country">Les Pouilles</h2></div><div class="route-stats"><span id="route-energy" aria-label="Vies restantes">${'♥ '.repeat(routeTestMode?3:state.routeLives)}${'♡ '.repeat(routeTestMode?0:3-state.routeLives)}</span><strong id="route-collection">0 souvenir</strong></div><button class="btn light" id="route-pause">Pause</button></div><div class="route-window"><canvas id="route-canvas" width="960" height="540" aria-label="Parcours de plateforme à travers cinq destinations"></canvas><div class="route-cover" id="route-cover"><h3>Cinq escales, une aventure.</h3><p>Avance, saute par-dessus les obstacles et ramasse les souvenirs. Tu disposes de trois vies pour tout le parcours.</p><p>Les animaux sont tes compagnons de voyage. À l’arrivée, saute dans l’avion !</p><button class="btn" id="route-start">En route !</button></div><div class="route-message" id="route-message" aria-live="polite"></div></div><div class="route-controls"><div><button class="route-control" id="route-left" aria-label="Aller à gauche">◀</button><button class="route-control" id="route-right" aria-label="Aller à droite">▶</button></div><span id="route-distance">Escales : 1 / 5</span><button class="route-control jump-control" id="route-jump" aria-label="Sauter">Sauter ↑</button></div><div class="route-foot"><small>Clavier : ← → et Espace · Trois vies au total</small><button class="btn light" id="route-leave">Retour à la carte</button></div></div>`);
 document.querySelector('.panel').classList.add('platform-panel');
 const canvas=document.querySelector('#route-canvas'),c=canvas.getContext('2d'),world=ROUTE.create(),input={left:false,right:false};
 let p={x:(routeTestMode?0:state.routeZone*1500)+80,y:ROUTE.ground-79,w:31,h:79,vx:0,vy:0,grounded:true},energy=routeTestMode?3:state.routeLives,collected=routeTestMode?0:state.routeItems.length,zone=routeTestMode?0:state.routeZone,camera=0,raf=0,last=0,started=false,paused=false,ended=false,invulnerable=0,messageUntil=0,runTime=0;
 world.items.forEach((item,index)=>item.taken=!routeTestMode&&state.routeItems.includes(index));
 document.querySelector('#route-country').textContent=ROUTE.zones[zone].name;
 function persist(){if(routeTestMode)return;state.routeLives=energy;state.routeZone=zone;state.routeItems=world.items.flatMap((item,index)=>item.taken?[index]:[]);save()}
 function release(){input.left=input.right=false}
 function dispose(){persist();ended=true;cancelAnimationFrame(raf);release();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur)}cleanup=dispose;
 function say(text){document.querySelector('#route-message').textContent=text;messageUntil=runTime+2.4}
 function jump(){if(started&&!paused&&!ended&&p.grounded){p.vy=-745;p.grounded=false}}
 function pause(){if(!started||ended)return;paused=!paused;release();const cover=document.querySelector('#route-cover');cover.hidden=!paused;document.querySelector('#route-pause').textContent=paused?'Reprendre':'Pause';if(paused){cover.innerHTML='<h3>Une petite escale ?</h3><p>Ton aventure t’attend.</p><button class="btn" id="route-resume">Reprendre</button>';document.querySelector('#route-resume').onclick=pause}last=0}
 function keydown(e){if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft'||e.key==='a')input.left=true;if(e.key==='ArrowRight'||e.key==='d')input.right=true;if(['ArrowUp',' ','w'].includes(e.key)&&!e.repeat)jump()}}
 function keyup(e){if(e.key==='ArrowLeft'||e.key==='a')input.left=false;if(e.key==='ArrowRight'||e.key==='d')input.right=false}
 function visibility(){if(document.hidden&&started&&!paused)pause()}
 function blur(){release()}
 for(const dir of ['left','right']){const b=document.querySelector('#route-'+dir);b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input[dir]=true};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>input[dir]=false}
 const jumpButton=document.querySelector('#route-jump');jumpButton.onpointerdown=e=>{e.preventDefault();jump()};jumpButton.onclick=e=>{if(e.detail===0)jump()};
 document.querySelector('#route-pause').onclick=pause;
 document.querySelector('#route-leave').onclick=()=>{persist();map()};
 document.querySelector('#route-start').onclick=()=>{started=true;document.querySelector('#route-cover').hidden=true;document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);say('Ramasse les souvenirs et saute avec ↑ !')};
 function damage(){if(runTime<invulnerable)return;energy--;persist();if(!energy){finish(i,false,collected+' souvenirs');return}const safe=zone*1500+70;p={...p,x:safe,y:425-p.h,vy:0,vx:0,grounded:true};invulnerable=runTime+1.5;release();say('Une petite chute… on repart de cette escale !')}
 function rounded(x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
 function ellipse(x,y,rx,ry,fill){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
 function tree(x,y,size=1,palm=false){c.save();c.translate(x,y);c.scale(size,size);rounded(-7,-85,14,85,5,'#9d6a3d');if(palm){for(let k=0;k<7;k++){c.save();c.translate(0,-80);c.rotate(k*.8);ellipse(30,0,42,10,'#4b9d4b');c.restore()}}else{ellipse(0,-90,72,22,'#648c3f');ellipse(-35,-103,42,14,'#78a249');ellipse(34,-100,40,14,'#719945')}c.restore()}
 function house(x,y,kind){c.save();c.translate(x,y);if(kind==='trullo'){rounded(-42,-68,84,68,7,'#fff0d4');c.fillStyle='#b9a693';c.beginPath();c.moveTo(-49,-68);c.lineTo(0,-142);c.lineTo(49,-68);c.closePath();c.fill();for(let j=0;j<5;j++){c.strokeStyle='#8b8577';c.beginPath();c.moveTo(-36+j*7,-83-j*11);c.lineTo(36-j*7,-83-j*11);c.stroke()}rounded(-12,-38,24,38,10,'#5d7574')}else{rounded(-48,-70,96,70,2,'#bb936b');c.fillStyle='#986947';c.beginPath();c.moveTo(-65,-70);c.lineTo(0,-115);c.lineTo(65,-70);c.closePath();c.fill();rounded(-13,-39,26,39,3,'#716149');for(let k of [-1,1])rounded(k*30-8,-47,16,18,2,'#abd4d6')}c.restore()}
 function landscape(z,ox){const data=ROUTE.zones[z];c.save();c.beginPath();c.rect(ox,0,1500,540);c.clip();if(scenery.complete&&scenery.naturalWidth){const crops=[0,.15,.39,.26,.33],sy=[0,.2,.405,.6,.8],sh=[.199,.203,.194,.199,.199];c.drawImage(scenery,crops[z]*scenery.naturalWidth,sy[z]*scenery.naturalHeight,scenery.naturalWidth*.47,scenery.naturalHeight*sh[z],ox,0,1500,425);const earth=c.createLinearGradient(0,425,0,540);earth.addColorStop(0,'#e6c694');earth.addColorStop(1,'#c69b65');c.fillStyle=earth;c.fillRect(ox,425,1500,115);c.fillStyle='#ffebbb';c.fillRect(ox,425,1500,6);for(let k=0;k<60;k++)ellipse(ox+k*27,449+(k%5)*19,3+k%3,2,'#a77e4433');c.restore();return}const g=c.createLinearGradient(0,0,0,425);g.addColorStop(0,data.sky);g.addColorStop(1,'#fff5d5');c.fillStyle=g;c.fillRect(ox,0,1500,540);ellipse(ox+210,70,37,37,'#fff2b6');
  for(let k=0;k<6;k++){ellipse(ox+120+k*270,70+(k%3)*25,70,18,'#ffffffb0')}
  if(z===0){c.fillStyle='#83c8bf';c.fillRect(ox,300,1500,125);for(let k=0;k<6;k++){ellipse(ox+100+k*280,360,200,100,'#a8c581');house(ox+130+k*260,360,'trullo');tree(ox+40+k*270,370,.45)}}
  if(z===1){for(let k=0;k<6;k++){c.fillStyle=k%2?'#809f9a':'#a0b6a4';c.beginPath();c.moveTo(ox+k*280-100,390);c.lineTo(ox+k*280+130,80+(k%3)*40);c.lineTo(ox+k*280+350,390);c.fill()}c.fillStyle='#8bc7cc';c.fillRect(ox,355,1500,70);for(let k=0;k<5;k++){rounded(ox+70+k*330,260,110,105,4,'#c9ba95');for(let j=0;j<5;j++)rounded(ox+68+k*330+j*24,250,16,20,2,'#c9ba95');rounded(ox+110+k*330,315,25,50,12,'#7c8b85')}}
  if(z===2){c.fillStyle='#52c6d0';c.fillRect(ox,240,1500,190);for(let k=0;k<9;k++){c.strokeStyle='#b6f6e5';c.lineWidth=3;c.beginPath();c.moveTo(ox+k*190,290+(k%3)*35);c.quadraticCurveTo(ox+k*190+35,278+(k%3)*35,ox+k*190+70,290+(k%3)*35);c.stroke()}for(let k=0;k<5;k++){rounded(ox+100+k*340,330,8,90,2,'#9f774c');rounded(ox+175+k*340,330,8,90,2,'#9f774c');house(ox+142+k*340,340,'bungalow');tree(ox+270+k*340,412,.9,true)}}
  if(z===3){ellipse(ox+700,420,1100,135,'#e6c991');for(let k=0;k<5;k++)tree(ox+110+k*330,385,1.15);c.font='60px serif';c.fillText('🦒',ox+550,385);c.fillText('🐘',ox+1050,375)}
  if(z===4){c.fillStyle='#9bb8ba';for(let k=0;k<15;k++)rounded(ox+k*110,230-(k%3)*25,88,180,3,'#9bb8ba');for(let k=0;k<3;k++){const x=ox+200+k*550;rounded(x,140,60,280,3,'#bd9a68');c.fillStyle='#6e8c87';c.beginPath();c.moveTo(x-9,140);c.lineTo(x+30,65);c.lineTo(x+69,140);c.fill();ellipse(x+30,180,21,21,'#fff2b5');c.strokeStyle='#816543';c.lineWidth=3;c.beginPath();c.moveTo(x+30,163);c.lineTo(x+30,180);c.lineTo(x+43,188);c.stroke();rounded(x+105,353,110,60,12,'#d75e4a');for(let row=0;row<2;row++)for(let col=0;col<4;col++)rounded(x+113+col*24,360+row*22,17,15,3,'#b6deec')}}
  c.fillStyle=data.land;c.fillRect(ox,425,1500,115);c.fillStyle='#fff0bf';c.fillRect(ox,425,1500,12);for(let k=0;k<30;k++){ellipse(ox+k*62,460+(k%3)*19,5,2,'#b6a77766')}c.restore();
 }
 function plane(x){c.save();c.translate(x,300);ellipse(0,115,120,11,'#52696c33');c.fillStyle='#ecf7f6';c.beginPath();c.moveTo(-120,0);c.quadraticCurveTo(-70,-30,100,-10);c.quadraticCurveTo(160,0,100,20);c.lineTo(-115,20);c.closePath();c.fill();c.fillStyle='#e8796f';c.beginPath();c.moveTo(-100,0);c.lineTo(-130,-60);c.lineTo(-100,-60);c.lineTo(-55,5);c.fill();c.fillStyle='#bad4df';c.beginPath();c.moveTo(-20,5);c.lineTo(-80,65);c.lineTo(-30,65);c.lineTo(55,8);c.fill();for(let k=0;k<6;k++)rounded(-65+k*25,-8,14,13,4,'#76bacf');rounded(77,-5,22,29,5,'#527e8f');c.strokeStyle='#e9c483';c.lineWidth=5;c.beginPath();c.moveTo(88,23);c.lineTo(28,122);c.stroke();for(let k=0;k<5;k++){c.beginPath();c.moveTo(70-k*9,40+k*15);c.lineTo(94-k*9,40+k*15);c.stroke()}c.font='bold 18px Arial';c.fillStyle='#724f31';c.textAlign='center';c.fillText('Saute dans l’avion !',0,-82);c.restore()}
 function backdrop(z,alpha){
 c.save();c.globalAlpha=alpha;
 if(scenery.complete&&scenery.naturalWidth){const crops=[0,.15,.39,.26,.33],sy=[0,.2,.405,.6,.8],sh=[.199,.203,.194,.199,.199];const shift=Math.max(0,Math.min(1,(p.x-z*1500)/1500))*.09;c.drawImage(scenery,(crops[z]+shift)*scenery.naturalWidth,sy[z]*scenery.naturalHeight,scenery.naturalWidth*.47,scenery.naturalHeight*sh[z],0,0,960,425)}else{c.fillStyle=ROUTE.zones[z].sky;c.fillRect(0,0,960,425)}
 const earth=c.createLinearGradient(0,425,0,540);earth.addColorStop(0,'#e6c694');earth.addColorStop(1,'#c69b65');c.fillStyle=earth;c.fillRect(0,425,960,115);c.fillStyle='#ffebbb';c.fillRect(0,425,960,6);c.restore();
 }
 function draw(){c.clearRect(0,0,960,540);camera=Math.max(0,Math.min(6540,p.x-260));const base=Math.max(0,Math.min(4,Math.floor((p.x-180)/1500)));const mix=Math.max(0,Math.min(1,(p.x-(base+1)*1500+180)/360));backdrop(base,1);if(base<4&&mix>0)backdrop(base+1,mix);

  for(const gap of world.gaps){const x=gap.x-camera;if(x< -gap.w||x>960)continue;c.fillStyle='#4fa9ba';c.fillRect(x,425,gap.w,115);c.fillStyle='#b3ede8';c.fillRect(x+5,443,gap.w-10,4)}
  for(const s of world.solids){const x=s.x-camera;if(x< -s.w||x>960)continue;const fill=c.createLinearGradient(x,s.y,x+s.w,s.y+s.h);fill.addColorStop(0,s.kind==='case'?'#f4c078':s.z===4?'#e59b78':'#f6e5b9');fill.addColorStop(1,s.kind==='case'?'#bf7c3e':s.z===4?'#b75b46':'#bba16d');rounded(x,s.y,s.w,s.h,6,fill);c.strokeStyle='#fff0bd';c.lineWidth=3;c.strokeRect(x+5,s.y+5,s.w-10,s.h-10);if(s.kind==='case'){c.strokeStyle='#815b35';c.lineWidth=5;c.strokeRect(x+s.w/2-10,s.y-8,20,8);rounded(x+12,s.y+10,8,s.h-20,2,'#ba733c');rounded(x+s.w-20,s.y+10,8,s.h-20,2,'#ba733c')}}
  for(const platform of world.platforms){const x=platform.x-camera;if(x+platform.w<0||x>960)continue;rounded(x+2,platform.y+6,platform.w,platform.h,5,'#694d3d66');rounded(x,platform.y,platform.w,platform.h,5,'#9a542f');rounded(x+3,platform.y+2,platform.w-6,platform.h-6,3,'#e4a65b');c.fillStyle='#f4cc79';c.fillRect(x+4,platform.y+2,platform.w-8,4);for(let j=0;j<platform.w;j+=28){c.strokeStyle='#b66b3c';c.lineWidth=2;c.strokeRect(x+j+2,platform.y+7,24,9);ellipse(x+j+6,platform.y+10,1.5,1.5,'#ffe4a4')}}
  for(const item of world.items){const x=item.x-camera;if(item.taken||x< -50||x>1010)continue;ellipse(x,item.y,24,24,'#fff6d6d9');c.textAlign='center';c.font='30px serif';if(item.icon==='ray'){c.save();c.translate(x,item.y);c.fillStyle='#6896a8';c.beginPath();c.moveTo(0,-13);c.quadraticCurveTo(-12,-9,-22,7);c.quadraticCurveTo(-8,4,0,12);c.quadraticCurveTo(8,4,22,7);c.quadraticCurveTo(12,-9,0,-13);c.fill();c.strokeStyle='#507f93';c.lineWidth=2;c.beginPath();c.moveTo(0,9);c.quadraticCurveTo(3,20,10,23);c.stroke();c.restore()}else c.fillText(item.icon,x,item.y+10+Math.sin(runTime*3+item.x)*3);c.font='14px serif';c.fillStyle='#e2757b';c.fillText('♥',x+19,item.y-13)}
  if(camera>6200)plane(7320-camera);
  const x=p.x-camera+p.w/2,y=p.y+p.h;ellipse(x,427,24,5,'#38564633');c.save();c.globalAlpha=runTime<invulnerable&&Math.floor(runTime*10)%2?.4:1;const bob=p.grounded&&p.vx?Math.sin(runTime*18)*3:0;c.translate(x,y+bob);if(p.vx<0)c.scale(-1,1);const spriteH=105,spriteW=spriteH*heroine.naturalWidth/heroine.naturalHeight;c.drawImage(heroine,-spriteW/2,-spriteH,spriteW,spriteH);c.restore();
  const progress=p.x/7400;c.fillStyle='#ffffff9e';c.fillRect(20,15,300,8);c.fillStyle='#f7bb32';c.fillRect(20,15,300*progress,8);
 }
 function frame(now){if(ended)return;const dt=last?Math.min((now-last)/1000,.035):0;last=now;
  if(started&&!paused){runTime+=dt;ROUTE.step(p,world,input,dt);const newZone=Math.min(4,Math.floor(p.x/1500));if(newZone!==zone){zone=newZone;document.querySelector('#route-country').textContent=ROUTE.zones[zone].name;persist();say(ROUTE.zones[zone].sub)}
   for(const item of world.items)if(!item.taken&&Math.abs(item.x-(p.x+p.w/2))<40&&Math.abs(item.y-(p.y+p.h/2))<65){item.taken=true;collected++;persist();say('Un souvenir de plus ! ♡')}
   if(p.y>590){damage();if(ended)return}
   if(p.x>7240&&p.y<345&&!p.grounded){finish(i,true,collected+' souvenirs');return}
   document.querySelector('#route-energy').textContent='♥ '.repeat(energy)+'♡ '.repeat(3-energy);document.querySelector('#route-collection').textContent=collected+' souvenir'+(collected>1?'s':'');document.querySelector('#route-distance').textContent='Escales : '+(zone+1)+' / 5';if(runTime>messageUntil)document.querySelector('#route-message').textContent='';
  }draw();raf=requestAnimationFrame(frame)
 }raf=requestAnimationFrame(frame)
}
