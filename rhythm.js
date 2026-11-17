/* Notes follow local audio transients, with progressively denser selection. */
const RHYTHM={duration:125,window:.24,
 chart(buffer){
  const channel=buffer.getChannelData(0),sr=buffer.sampleRate,hop=Math.floor(sr*.02),energy=[];
  for(let k=0;k<Math.min(channel.length,sr*125);k+=hop){let sum=0;for(let j=k+1;j<Math.min(k+hop,channel.length);j++){const v=channel[j]-channel[j-1];sum+=v*v}energy.push(Math.sqrt(sum/hop))}
  const novelty=energy.map((e,k)=>Math.max(0,e-(energy[k-1]||0)*.65-(energy[k-2]||0)*.35));
  const peaks=[];for(let k=2;k<novelty.length-2;k++)if(novelty[k]>novelty[k-1]&&novelty[k]>=novelty[k+1]&&k*.02>2.6&&k*.02<124.3)peaks.push({t:k*hop/sr,p:novelty[k]});
  const notes=[];let cursor=3,sequence=0;
  while(cursor<124){const spacing=cursor<28?2.1:cursor<58?1.1:cursor<91?.66:.42;
   const candidates=peaks.filter(p=>p.t>=cursor&&p.t<Math.min(124.3,cursor+spacing*.7));
   const peak=candidates.sort((a,b)=>b.p-a.p)[0];const t=peak?peak.t:cursor;
   const lane=[0,1,2,1,0,2,0,1,2,0,2,1][sequence%12];notes.push({t,lane});
   if(t>96&&sequence%10===0)notes.push({t,lane:(lane+1)%3});cursor=t+spacing;sequence++;
  }return notes;
 },score(hits,total,errors){return Math.max(0,Math.min(100,Math.round(100*hits/(total+errors*.35))))}
};
let songBufferPromise;
function loadSong(){if(!songBufferPromise)songBufferPromise=(async()=>{const response=await fetch('assets/audio/amour-a-la-plage.mp3');if(!response.ok)throw Error('audio');const bytes=await response.arrayBuffer();const decoder=new OfflineAudioContext(1,1,44100);return decoder.decodeAudioData(bytes)})().catch(e=>{songBufferPromise=null;throw e});return songBufferPromise}
async function rhythm(i){
 panel('<div class="big">🎵</div><h2>Rendez-vous à Chacha Plage</h2><p>La musique et les notes se préparent…</p>');
 let buffer;try{buffer=await loadSong();if(buffer.duration<RHYTHM.duration)throw Error('short audio')}catch{state.attempts[i]=Math.max(0,state.attempts[i]-1);save();panel('<h2>La musique n’a pas pu se charger.</h2><p>Reviens à la carte pour réessayer. Ta tentative est conservée.</p><button class="btn" id="back">Retour à la carte</button>');document.querySelector('#back').onclick=map;return}
 const notes=RHYTHM.chart(buffer).map(n=>({...n,state:'pending'}));
 panel(`<div class="rhythm-screen"><div class="rhythm-header"><div><span class="eyebrow">Chacha Plage · Juan-les-Pins</span><h2>L’amour à la plage</h2></div><div class="rhythm-stats"><strong id="songtime">2:05</strong><span id="songscore">0 note réussie</span></div><button class="btn light" id="pause" disabled>Pause</button></div><div class="rhythm-content"><aside class="beach-story"><div class="beach-card"><strong>Un air de vacances…</strong><p id="difficulty">Quelques notes pour commencer</p><div class="sunmeter"><i id="sunfill"></i></div><small>Objectif : 60 % de réussite</small></div></aside><div class="rhythm-board"><div class="lanes" id="lanes"><div class="lane"></div><div class="lane"></div><div class="lane"></div><div class="hit-line"></div><div id="notes"></div><span id="rhythm-feedback" aria-live="polite"></span></div><div class="pads">${['☀','♥','≈'].map((s,n)=>`<button class="pad pad${n}" data-lane="${n}" aria-label="Piste ${n+1}">${s}<small>${['←','↓','→'][n]}</small></button>`).join('')}</div><div class="rhythm-start" id="songcover"><h3>Prête à danser ?</h3><p>Touche le bon bouton lorsque la note atteint la ligne dorée.</p><p>2 min 05 · trois pistes · difficulté progressive</p><button class="btn" id="songstart">Lancer la musique</button></div></div></div><div class="rhythm-bottom"><span id="combo">À ton rythme ♡</span><button class="btn light" id="leave">Quitter la tentative</button></div></div>`);
 document.querySelector('.panel').classList.add('rhythm-panel');BGM.suspend(true);
 let ctx=null,source=null,start=0,raf=0,ended=false,playing=false,paused=false,busyPause=false,hits=0,errors=0,combo=0,feedbackUntil=0;
 const nodes=new Map(),notesRoot=document.querySelector('#notes'),pads=[...document.querySelectorAll('[data-lane]')];
 function stop(){BGM.suspend(false);ended=true;playing=false;cancelAnimationFrame(raf);if(source){source.onended=null;try{source.stop()}catch{}}if(ctx)ctx.close().catch(()=>{});document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility)}
 cleanup=stop;
 function complete(){if(ended)return;const score=RHYTHM.score(hits,notes.length,errors);finish(i,score>=60,score+' %')}
 function feedback(text,color){const e=document.querySelector('#rhythm-feedback');e.textContent=text;e.style.color=color;feedbackUntil=performance.now()+650}
 function hit(lane){if(!playing||paused||ended)return;const now=ctx.currentTime-start;const n=notes.filter(n=>n.lane===lane&&n.state==='pending'&&Math.abs(n.t-now)<=RHYTHM.window).sort((a,b)=>Math.abs(a.t-now)-Math.abs(b.t-now))[0];
  pads[lane].classList.add('pressed');setTimeout(()=>pads[lane].classList.remove('pressed'),130);
  if(n){n.state='hit';hits++;combo++;feedback(Math.abs(n.t-now)<.1?'Parfait !':'Bien joué !','#ffe88b');nodes.get(n)?.remove();nodes.delete(n)}else{errors++;combo=0;feedback('Suis la ligne…','#fff3dc')}
 }
 function key(e){const lane={ArrowLeft:0,ArrowDown:1,ArrowRight:2,a:0,s:1,d:2}[e.key];if(lane!==undefined){e.preventDefault();if(!e.repeat)hit(lane)}}
 pads.forEach((p,n)=>{p.addEventListener('pointerdown',e=>{e.preventDefault();hit(n)});p.addEventListener('click',e=>{if(e.detail===0)hit(n)})});
 function tick(){if(ended||!playing)return;const t=ctx.currentTime-start;if(t>=RHYTHM.duration){complete();return}
  if(!paused){notes.forEach(n=>{if(n.state!=='pending')return;const delta=n.t-t;if(delta< -RHYTHM.window){n.state='miss';combo=0;nodes.get(n)?.remove();nodes.delete(n);return}if(delta<=2.2){let el=nodes.get(n);if(!el){el=document.createElement('span');el.className='music-note note'+n.lane;el.textContent=['☀','♥','≈'][n.lane];el.style.left=(n.lane*100/3+100/6)+'%';notesRoot.append(el);nodes.set(n,el)}el.style.top=(83-delta/2.2*83)+'%'}});
   const remaining=Math.max(0,Math.ceil(125-t));document.querySelector('#songtime').textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;document.querySelector('#songscore').textContent=hits+' / '+notes.length+' notes';document.querySelector('#sunfill').style.width=Math.min(100,hits/Math.ceil(notes.length*.6)*100)+'%';document.querySelector('#combo').textContent=combo>1?combo+' notes à la suite !':'À ton rythme ♡';document.querySelector('#difficulty').textContent=t<28?'Quelques notes pour commencer':t<58?'On entre dans la danse':t<91?'Le rythme s’accélère !':'Le grand final !';if(performance.now()>feedbackUntil)document.querySelector('#rhythm-feedback').textContent='';
  }raf=requestAnimationFrame(tick)
 }
 async function togglePause(){if(!playing||ended||busyPause)return;busyPause=true;try{if(paused){await ctx.resume();paused=false;document.querySelector('#pause').textContent='Pause';document.querySelector('#songcover').hidden=true}else{await ctx.suspend();paused=true;document.querySelector('#pause').textContent='Reprendre';const cover=document.querySelector('#songcover');cover.hidden=false;cover.innerHTML='<h3>Petite pause au soleil</h3><p>La musique et les notes t’attendent.</p><button class="btn" id="resume">Reprendre</button>';document.querySelector('#resume').onclick=togglePause}}finally{busyPause=false}}
 function visibility(){if(document.hidden&&playing&&!paused)togglePause()}
 document.querySelector('#pause').onclick=togglePause;
 document.querySelector('#leave').onclick=()=>{if(!playing){if(!testMode){state.attempts[i]=Math.max(0,state.attempts[i]-1);save()}map()}else finish(i,false,'Partie interrompue')};
 document.querySelector('#songstart').onclick=async()=>{const b=document.querySelector('#songstart');b.disabled=true;try{ctx=new AudioContext();await ctx.resume();if(ended){ctx.close();return}source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);start=ctx.currentTime+.1;source.start(start,0,125);source.onended=complete;playing=true;document.querySelector('#songcover').hidden=true;document.querySelector('#pause').disabled=false;document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);tick()}catch{b.disabled=false;b.textContent='Réessayer de lancer la musique';if(ctx)ctx.close().catch(()=>{})}};
}
