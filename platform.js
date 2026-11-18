const ROUTE={width:960,height:540,ground:425,zoneLength:1500,total:7500,
 zones:[
 {name:'Les Pouilles',sub:'Un petit air d’Italie',sky:'#b8eaff',land:'#d6bc81',color:'#d99954',items:[0,1,2]},
 {name:'Le Monténégro',sub:'Sur les hauteurs de Kotor',sky:'#b8d9e2',land:'#a8ad7d',color:'#909f8a',items:[3,4,5]},
 {name:'La Polynésie',sub:'Au fil du lagon',sky:'#a8eaf3',land:'#f4dda2',color:'#29b9bd',items:[6,7,8]},
 {name:'Le Kenya',sub:'Safari à deux',sky:'#ffe4a7',land:'#dfbc76',color:'#d9a255',items:[9,10,11,12,13]},
 {name:'Londres',sub:'Dernière escale avant le décollage',sky:'#c2dfed',land:'#a4b4a3',color:'#a67257',items:[14,15,16]}
 ],
 create(){const solids=[],gaps=[],items=[],platforms=[];
  for(let z=0;z<5;z++){const base=z*1500;
   [[340,65,65],[710,100,85],[1090,85,60]].forEach(([x,w,h],k)=>solids.push({x:base+x,y:425-h,w,h,kind:'case',z}));
   gaps.push({x:base+890,w:100,z});
   platforms.push({x:base+480,y:335,w:112,h:20,z},{x:base+520,y:245,w:112,h:20,z});
   const symbols=this.zones[z].items;
   [210,365,560,755,930,1120,1330].forEach((x,k)=>items.push({x:base+x,y:425-([1,3,4,5].includes(k)?145:67),icon:symbols[k%symbols.length],taken:false,z}));
  }
  // Append elevated rewards so saved indices of the original souvenirs stay valid.
  for(let z=0;z<5;z++){
   const base=z*this.zoneLength,symbols=this.zones[z].items;
   items[z*7+2].y=300; // The original souvenir now sits on the lower walkway.
   items.push({x:base+592,y:210,icon:symbols[(z+1)%symbols.length],taken:false,z,elevated:true});
  }
  return {solids,gaps,items,platforms};
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
 let loadingCancelled=false;cleanup=()=>{loadingCancelled=true};
 const loadArt=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src});
 let heroine,collectibles;
 try{[heroine,collectibles]=await Promise.all([loadArt('assets/anais-animation-transparent.png'),loadArt('assets/route-collectibles.png')])}catch{if(loadingCancelled)return;panel('<h2>Les illustrations n’ont pas pu se charger.</h2><button class="btn" id="back">Retour à la carte</button>');document.querySelector('#back').onclick=map;return}
 if(loadingCancelled)return;

 panel(`<div class="route-game"><div class="route-head"><div><span class="eyebrow">En route ! · Trois vies au total</span><h2 id="route-country">Les Pouilles</h2></div><div class="route-stats"><span id="route-energy" aria-label="Vies restantes">${'♥ '.repeat(routeTestMode?3:state.routeLives)}${'♡ '.repeat(routeTestMode?0:3-state.routeLives)}</span><strong id="route-collection">0 souvenir</strong></div><button class="btn light" id="route-pause">Pause</button></div><div class="route-window"><canvas id="route-canvas" width="960" height="540" aria-label="Parcours de plateforme à travers cinq destinations"></canvas><div class="route-cover" id="route-cover"><h3>Cinq escales, une aventure.</h3><p>Avance, saute par-dessus les obstacles et ramasse les souvenirs. Tu disposes de trois vies pour tout le parcours.</p><p>Explore aussi les passerelles pour récupérer les souvenirs perchés. À l’arrivée, saute dans l’avion !</p><button class="btn" id="route-start">En route !</button></div><div class="route-message" id="route-message" aria-live="polite"></div></div><div class="route-controls"><div><button class="route-control" id="route-left" aria-label="Aller à gauche">◀</button><button class="route-control" id="route-right" aria-label="Aller à droite">▶</button></div><span id="route-distance">Escales : 1 / 5</span><button class="route-control jump-control" id="route-jump" aria-label="Sauter">Sauter ↑</button></div><div class="route-foot"><small>Clavier : ← → et Espace · Trois vies au total</small><button class="btn light" id="route-leave">Retour à la carte</button>${routeTestMode?'<button class="btn light" id="route-test-ending">Tester l’embarquement</button>':''}</div></div>`);
 document.querySelector('.panel').classList.add('platform-panel');
 const canvas=document.querySelector('#route-canvas'),c=canvas.getContext('2d'),world=ROUTE.create(),input={left:false,right:false};
 const pickupBursts=[];
 let p={x:(routeTestMode?0:state.routeZone*1500)+80,y:ROUTE.ground-79,w:31,h:79,vx:0,vy:0,grounded:true},energy=routeTestMode?3:state.routeLives,collected=routeTestMode?0:state.routeItems.length,zone=routeTestMode?0:state.routeZone,camera=0,raf=0,last=0,started=false,paused=false,ended=false,invulnerable=0,messageUntil=0,runTime=0,boarding=null,facing=1;
 world.items.forEach((item,index)=>item.taken=!routeTestMode&&state.routeItems.includes(index));
 document.querySelector('#route-country').textContent=ROUTE.zones[zone].name;
 function persist(){if(routeTestMode)return;state.routeLives=energy;state.routeZone=zone;state.routeItems=world.items.flatMap((item,index)=>item.taken?[index]:[]);save()}
 function release(){input.left=input.right=false}
 function dispose(){persist();ended=true;cancelAnimationFrame(raf);release();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur)}cleanup=dispose;
 function say(text){document.querySelector('#route-message').textContent=text;messageUntil=runTime+2.4}
 function jump(){if(started&&!paused&&!ended&&!boarding&&p.grounded){p.vy=-745;p.grounded=false}}
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
 function beginBoarding(){
  if(boarding||ended)return;
  boarding={time:0,startX:p.x,startY:p.y+p.h};release();p.vx=p.vy=0;facing=1;
  document.querySelectorAll('.route-control').forEach(b=>b.disabled=true);
  document.querySelector('#route-message').textContent='';RewardAudio.play();
 }
 const endingTest=document.querySelector('#route-test-ending');
 if(endingTest)endingTest.onclick=()=>{if(boarding)return;zone=4;p.x=7195;p.y=425-p.h;p.grounded=true;document.querySelector('#route-country').textContent=ROUTE.zones[4].name;document.querySelector('#route-distance').textContent='Escales : 5 / 5';document.querySelector('#route-cover').hidden=true;started=true;paused=false;document.addEventListener('visibilitychange',visibility);beginBoarding()};
 function sprite(image,cell,cols,rows,x,y,w,h){const sw=image.naturalWidth/cols,sh=image.naturalHeight/rows;c.drawImage(image,(cell%cols)*sw,Math.floor(cell/cols)*sh,sw,sh,x,y,w,h)}
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
 function plane(x){
  c.save();const flight=boarding?Math.max(0,boarding.time-3.8):0;
  c.translate(x+flight*flight*72,258-flight*flight*34);c.rotate(-Math.min(.16,flight*.065));
  // A small, polished passenger jet, drawn in the same warm palette as the game.
  const shape=(points,fill,stroke='#647e91',width=2)=>{c.beginPath();points();c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}};
  const metal=c.createLinearGradient(0,32,0,107);metal.addColorStop(0,'#fffef5');metal.addColorStop(.42,'#edf8fc');metal.addColorStop(1,'#a9c6d7');
  if(!flight)ellipse(-48,164,197,13,'#263e4a30');
  // Far wing and tail fin, behind the cabin.
  shape(()=>{c.moveTo(-48,58);c.lineTo(-145,1);c.quadraticCurveTo(-157,-6,-174,0);c.lineTo(-114,70)},'#b7d4e2');
  const fin=c.createLinearGradient(-220,-47,-170,55);fin.addColorStop(0,'#83d7d9');fin.addColorStop(1,'#237e91');
  shape(()=>{c.moveTo(-216,56);c.lineTo(-235,-42);c.quadraticCurveTo(-235,-50,-223,-49);c.lineTo(-207,-48);c.lineTo(-152,51)},fin);
  c.strokeStyle='#ffe4a2';c.lineWidth=5;c.beginPath();c.moveTo(-227,-24);c.lineTo(-181,40);c.stroke();
  c.fillStyle='#fff6d3';c.font='bold 26px Arial';c.textAlign='center';c.fillText('♥',-214,5);
  // Landing gear and tires.
  for(const wheel of [{x:-94,y:152},{x:101,y:152}]){rounded(wheel.x-3,104,6,48,2,'#718391');ellipse(wheel.x,wheel.y,13,15,'#334959');ellipse(wheel.x,wheel.y,6,7,'#bbd0d8');ellipse(wheel.x-2,wheel.y-2,2,2,'#f5fbfc')}
  shape(()=>{c.moveTo(-232,61);c.quadraticCurveTo(-191,24,-118,28);c.lineTo(77,28);c.quadraticCurveTo(116,28,145,57);c.quadraticCurveTo(181,76,143,92);c.quadraticCurveTo(119,104,64,106);c.lineTo(-129,100);c.quadraticCurveTo(-203,92,-232,61)},metal);
  // Teal ribbon and a narrow warm-gold highlight along the fuselage.
  shape(()=>{c.moveTo(-220,69);c.quadraticCurveTo(-136,86,139,78);c.lineTo(149,88);c.quadraticCurveTo(-90,112,-201,81)},'#348c9c',null);
  c.strokeStyle='#f6cc79';c.lineWidth=3;c.beginPath();c.moveTo(-204,71);c.quadraticCurveTo(-60,91,145,78);c.stroke();
  // Cockpit glazing and reflections.
  shape(()=>{c.moveTo(89,37);c.quadraticCurveTo(112,39,129,55);c.lineTo(100,55);c.closePath()},'#406d85');
  shape(()=>{c.moveTo(76,36);c.lineTo(86,37);c.lineTo(95,55);c.lineTo(76,55)},'#588ba1');
  c.strokeStyle='#c6f3fa';c.lineWidth=2;c.beginPath();c.moveTo(80,39);c.lineTo(85,50);c.moveTo(98,42);c.lineTo(115,51);c.stroke();
  for(let k=0;k<7;k++){const wx=-166+k*28;rounded(wx,43,17,22,7,'#8daebb');rounded(wx+2,45,13,17,5,'#477e97');rounded(wx+4,47,4,9,2,'#b7e9f4')}
  // Swept wing and rounded engine nacelle.
  const wing=c.createLinearGradient(0,83,0,144);wing.addColorStop(0,'#f4faf6');wing.addColorStop(1,'#86b4ca');
  shape(()=>{c.moveTo(-33,80);c.lineTo(-129,132);c.quadraticCurveTo(-142,139,-124,143);c.lineTo(-86,146);c.lineTo(43,91)},wing);
  c.strokeStyle='#f8ffff';c.lineWidth=3;c.beginPath();c.moveTo(-22,87);c.lineTo(-116,135);c.stroke();
  rounded(-88,115,58,29,13,'#719eb4');rounded(-86,115,53,22,10,'#d5e6ed');ellipse(-33,130,12,14,'#4a6b80');ellipse(-32,130,8,10,'#263f52');ellipse(-30,127,3,4,'#83bccd');
  // Open boarding door: aligned with the existing final-jump trigger.
  rounded(-76,37,32,64,9,'#f9e5ad');rounded(-72,40,24,59,7,'#27495b');rounded(-69,43,6,49,3,'#4a7c8e');
  c.save();c.shadowColor='#ffe49a';c.shadowBlur=12+Math.sin(runTime*3)*4;c.strokeStyle='#ffe8a7';c.lineWidth=2;c.strokeRect(-72,42,24,56);c.restore();
  if(boarding&&boarding.time>3.15){rounded(-72,40,24,59,7,'#d7e9ed');rounded(-68,45,16,18,5,'#477e97')}
  c.save();if(boarding)c.globalAlpha=Math.max(0,1-(boarding.time-3.1)*2);
  // Boarding stairs and railings meet the runway.
  shape(()=>{c.moveTo(-78,102);c.lineTo(-43,102);c.lineTo(-89,167);c.lineTo(-135,167)},'#d0dfe4');
  for(let k=0;k<6;k++){const sy=108+k*10,sx=-80-k*8;c.strokeStyle='#7293a2';c.lineWidth=3;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+32+k*2,sy);c.stroke();c.strokeStyle='#fff8de';c.lineWidth=2;c.beginPath();c.moveTo(sx,sy-2);c.lineTo(sx+32+k*2,sy-2);c.stroke()}
  c.strokeStyle='#e7bc6a';c.lineWidth=3;c.beginPath();c.moveTo(-80,86);c.lineTo(-140,151);c.moveTo(-42,86);c.lineTo(-89,151);c.stroke();
  for(let k=0;k<3;k++){c.beginPath();c.moveTo(-80-k*28,87+k*30);c.lineTo(-80-k*28,106+k*30);c.moveTo(-42-k*22,87+k*30);c.lineTo(-42-k*22,106+k*30);c.stroke()}
  c.restore();
  if(!boarding){
  // A restrained boarding cue, readable on phone screens.
  rounded(-178,-91,244,36,16,'#fff3cfeF');c.strokeStyle='#c69851';c.lineWidth=2;c.stroke();
  c.font='bold 18px Arial';c.fillStyle='#745033';c.textAlign='center';c.fillText('Prête pour le décollage ?',-56,-67);
  const pulse=Math.sin(runTime*3)*4;c.fillStyle='#ffe09a';c.beginPath();c.moveTo(-65,-45+pulse);c.lineTo(-54,-33+pulse);c.lineTo(-43,-45+pulse);c.lineTo(-43,-36+pulse);c.lineTo(-54,-24+pulse);c.lineTo(-65,-36+pulse);c.fill();
  }
  c.restore();
 }

 function backdrop(z,alpha){
 c.save();c.globalAlpha=alpha;
 if(scenery.complete&&scenery.naturalWidth){const crops=[0,.15,.39,.26,.33],sy=[0,.2,.405,.6,.8],sh=[.199,.203,.194,.199,.199];const shift=Math.max(0,Math.min(1,(p.x-z*1500)/1500))*.09;c.drawImage(scenery,(crops[z]+shift)*scenery.naturalWidth,sy[z]*scenery.naturalHeight,scenery.naturalWidth*.47,scenery.naturalHeight*sh[z],0,0,960,425)}else{c.fillStyle=ROUTE.zones[z].sky;c.fillRect(0,0,960,425)}
 const earth=c.createLinearGradient(0,425,0,540);earth.addColorStop(0,'#e6c694');earth.addColorStop(1,'#c69b65');c.fillStyle=earth;c.fillRect(0,425,960,115);c.fillStyle='#ffebbb';c.fillRect(0,425,960,6);c.restore();
 }
 function draw(){c.clearRect(0,0,960,540);camera=Math.max(0,Math.min(6540,p.x-260));const base=Math.max(0,Math.min(4,Math.floor((p.x-180)/1500)));const mix=Math.max(0,Math.min(1,(p.x-(base+1)*1500+180)/360));backdrop(base,1);if(base<4&&mix>0)backdrop(base+1,mix);

  for(const gap of world.gaps){
   const x=gap.x-camera;if(x< -gap.w-15||x>975)continue;
   // A recessed chasm with a clear, unbroken collision edge at each bank.
   const depth=c.createLinearGradient(0,425,0,540);depth.addColorStop(0,'#473d44');depth.addColorStop(.6,'#253c48');depth.addColorStop(1,gap.z===2?'#207e91':'#263541');
   c.fillStyle=depth;c.fillRect(x,425,gap.w,115);
   for(const side of [0,1]){const edge=side?x+gap.w:x,dir=side?-1:1;
    c.fillStyle=side?'#9c704d':'#be8f60';c.beginPath();c.moveTo(edge,425);c.lineTo(edge+dir*12,443);c.lineTo(edge+dir*7,461);c.lineTo(edge+dir*15,486);c.lineTo(edge+dir*8,514);c.lineTo(edge,540);c.closePath();c.fill();
    c.strokeStyle='#593f3855';c.lineWidth=2;for(let j=0;j<4;j++){c.beginPath();c.moveTo(edge,445+j*23);c.lineTo(edge+dir*(8+j%2*4),449+j*23);c.stroke()}
    rounded(side?edge:edge-15,422,15,7,2,'#ffdf9a');
    for(let j=0;j<3;j++)ellipse(edge+(side?1:-1)*(6+j*9),434+j%2*5,4,2,'#aa7c50');
   }
   // Water stays far below the banks, so it cannot look like walkable ground.
   const waterY=gap.z===2?501:520;c.fillStyle=gap.z===2?'#37b5c8':'#467e91';c.fillRect(x+12,waterY,gap.w-24,540-waterY);
   c.strokeStyle='#b4f2e6aa';c.lineWidth=2;for(let j=0;j<3;j++){const waveX=x+18+j*23;c.beginPath();c.moveTo(waveX,waterY+5+Math.sin(runTime*2+j)*2);c.quadraticCurveTo(waveX+7,waterY+1,waveX+15,waterY+5);c.stroke()}
   // Cracks in the banks hint at the drop without covering the jump opening.
   c.strokeStyle='#8b6045';c.lineWidth=2;for(const side of [0,1]){const edge=side?x+gap.w:x,dir=side?1:-1;c.beginPath();c.moveTo(edge+dir*5,428);c.lineTo(edge+dir*10,437);c.lineTo(edge+dir*18,440);c.stroke()}
  }
  for(const s of world.solids){const x=s.x-camera;if(x< -s.w||x>960)continue;const fill=c.createLinearGradient(x,s.y,x+s.w,s.y+s.h);fill.addColorStop(0,s.kind==='case'?'#f4c078':s.z===4?'#e59b78':'#f6e5b9');fill.addColorStop(1,s.kind==='case'?'#bf7c3e':s.z===4?'#b75b46':'#bba16d');rounded(x,s.y,s.w,s.h,6,fill);c.strokeStyle='#fff0bd';c.lineWidth=3;c.strokeRect(x+5,s.y+5,s.w-10,s.h-10);if(s.kind==='case'){c.strokeStyle='#815b35';c.lineWidth=5;c.strokeRect(x+s.w/2-10,s.y-8,20,8);rounded(x+12,s.y+10,8,s.h-20,2,'#ba733c');rounded(x+s.w-20,s.y+10,8,s.h-20,2,'#ba733c')}}
  for(const platform of world.platforms){const x=platform.x-camera;if(x+platform.w<0||x>960)continue;ellipse(x+platform.w/2,425,platform.w*.5,5,'#4b3b2922');
   // Wooden brackets and rope-bound planks give the floating walkways depth.
   c.fillStyle='#78452f';for(const bx of [x+16,x+platform.w-28]){c.beginPath();c.moveTo(bx,platform.y+platform.h-2);c.lineTo(bx+13,platform.y+platform.h-2);c.lineTo(bx+6,platform.y+platform.h+14);c.closePath();c.fill()}
   rounded(x+2,platform.y+6,platform.w,platform.h,5,'#694d3d66');rounded(x,platform.y,platform.w,platform.h,5,'#9a542f');rounded(x+3,platform.y+2,platform.w-6,platform.h-6,3,'#e4a65b');c.fillStyle='#f4cc79';c.fillRect(x+4,platform.y+2,platform.w-8,4);for(let j=0;j<platform.w;j+=28){c.strokeStyle='#b66b3c';c.lineWidth=2;c.strokeRect(x+j+2,platform.y+7,24,9);ellipse(x+j+6,platform.y+10,1.5,1.5,'#ffe4a4')}}
  for(const item of world.items){const x=item.x-camera;if(item.taken||x< -50||x>1010)continue;if(item.elevated){c.strokeStyle='#ffe487';c.lineWidth=2;c.beginPath();c.arc(x,item.y,28+Math.sin(runTime*3)*2,0,Math.PI*2);c.stroke()}
   const float=Math.sin(runTime*3+item.x)*3;ellipse(x,item.y,25,25,'#fff6d6b0');
   sprite(collectibles,item.icon,5,4,x-27,item.y-27+float,54,54);
   sprite(collectibles,17,5,4,x+13,item.y-24,20,20);
  }
  for(let j=pickupBursts.length-1;j>=0;j--){const b=pickupBursts[j],age=runTime-b.time;if(age>.65){pickupBursts.splice(j,1);continue}c.save();c.globalAlpha=1-age/.65;for(let k=0;k<6;k++){const angle=k*Math.PI/3;ellipse(b.x-camera+Math.cos(angle)*age*65,b.y+Math.sin(angle)*age*55-age*25,3,3,'#ffe380')}c.restore()}
  if(camera>6200)plane(7320-camera);
  let heroX=p.x+p.w/2,feet=p.y+p.h,pose=!p.grounded?5:p.vx?Math.floor(runTime*10)%4:4,opacity=1;
  if(boarding){const t=boarding.time;
   if(t<.5){const k=t/.5;heroX=boarding.startX+p.w/2+(7203-boarding.startX-p.w/2)*k;feet=boarding.startY+(425-boarding.startY)*k;pose=5}
   else if(t<1.2){heroX=7203;feet=425;pose=6}
   else if(t<2.8){const k=(t-1.2)/1.6;heroX=7203+61*k;feet=425-69*k;pose=Math.floor(runTime*10)%4}
   else{heroX=7264;feet=356;pose=7;opacity=Math.max(0,1-(t-2.8)/.45)}
  }
  const x=heroX-camera,y=feet;
  const support=world.platforms.find(s=>Math.abs(p.y+p.h-s.y)<2&&p.x+p.w>s.x&&p.x<s.x+s.w)||world.solids.find(s=>Math.abs(p.y+p.h-s.y)<2&&p.x+p.w>s.x&&p.x<s.x+s.w);
  if(!boarding&&p.grounded)ellipse(x,support?support.y+2:427,22,4,'#38564633');
  c.save();c.globalAlpha=opacity*(runTime<invulnerable&&Math.floor(runTime*10)%2?.4:1);c.translate(x,y);if(facing<0)c.scale(-1,1);
  // Eight distinct poses, with a shared canvas cell and stable foot baseline.
  sprite(heroine,pose,4,2,-43,-105,86,114);c.restore();
  if(boarding){c.save();c.textAlign='center';c.font='bold 23px Arial';rounded(230,42,500,44,20,'#fff3d9ee');c.fillStyle='#745033';c.fillText(boarding.time<2.8?'Embarquement pour la prochaine aventure…':'Bon voyage, Anaïs !',480,71);c.restore()}

  const progress=p.x/7400;c.fillStyle='#ffffff9e';c.fillRect(20,15,300,8);c.fillStyle='#f7bb32';c.fillRect(20,15,300*progress,8);
 }
 function frame(now){if(ended)return;const dt=last?Math.min((now-last)/1000,.035):0;last=now;
  if(started&&!paused){runTime+=dt;
   if(boarding){boarding.time+=dt;if(boarding.time>=7){finish(i,true,collected+' souvenirs');return}draw();raf=requestAnimationFrame(frame);return;}
   ROUTE.step(p,world,input,dt);if(p.vx)facing=Math.sign(p.vx);const newZone=Math.min(4,Math.floor(p.x/1500));if(newZone!==zone){zone=newZone;document.querySelector('#route-country').textContent=ROUTE.zones[zone].name;persist();say(ROUTE.zones[zone].sub)}
   for(const item of world.items)if(!item.taken&&Math.abs(item.x-(p.x+p.w/2))<40&&Math.abs(item.y-(p.y+p.h/2))<65){item.taken=true;collected++;pickupBursts.push({x:item.x,y:item.y,time:runTime});persist();say(item.elevated?'Un souvenir perché ! ♡':'Un souvenir de plus ! ♡')}
   if(p.y>590){damage();if(ended)return}
   if(p.x>7240&&p.y<345&&!p.grounded)beginBoarding();
   document.querySelector('#route-energy').textContent='♥ '.repeat(energy)+'♡ '.repeat(3-energy);document.querySelector('#route-collection').textContent=collected+' souvenir'+(collected>1?'s':'');document.querySelector('#route-distance').textContent='Escales : '+(zone+1)+' / 5';if(runTime>messageUntil)document.querySelector('#route-message').textContent='';
  }draw();raf=requestAnimationFrame(frame)
 }raf=requestAnimationFrame(frame)
}
