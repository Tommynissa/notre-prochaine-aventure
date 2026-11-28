// Coordinates use the same percentages as the illustrated map, at every screen size.
const MapJourney = {
  controls: [
    [[25,18],[36,20]], [[58,30],[68,20]], [[95,27],[96,49]],
    [[60,61],[41,48]], [[8,56],[8,77]], [[37,77],[53,94]]
  ],
  point(stage) { return stage === 6 ? {x:72,y:83} : LEVELS[stage]; },
  pathMarkup(){
    const start=this.point(0);let d=`M ${start.x} ${start.y}`;
    this.controls.forEach(([c,e],i)=>{const b=this.point(i+1);d+=` C ${c[0]} ${c[1]}, ${e[0]} ${e[1]}, ${b.x} ${b.y}`});
    return `<svg class="journey-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" class="road-shadow"/><path d="${d}" class="road-edge"/><path d="${d}" class="road-fill"/><path d="${d}" class="road-dashes"/></svg>`;
  },
  position(stage, t) {
    const a=this.point(stage), b=this.point(stage+1), [c,d]=this.controls[stage], u=1-t;
    return {x:u*u*u*a.x+3*u*u*t*c[0]+3*u*t*t*d[0]+t*t*t*b.x,
      y:u*u*u*a.y+3*u*u*t*c[1]+3*u*t*t*d[1]+t*t*t*b.y};
  },
  mount(current, journey) {
    const map=document.querySelector('.map');
    const actor=document.createElement('div');
    actor.className='map-traveller';
    actor.setAttribute('aria-hidden','true');
    actor.innerHTML='<img src="assets/anais-route.png" alt="" draggable="false"><span class="journey-sparkles">✦ · ✧</span>';
    map.append(actor);
    let frame=0, stopped=false, highlighted=null;
    const place=p=>{actor.style.left=p.x+'%';actor.style.top=p.y+'%'};
    const arrive=stage=>{
      actor.classList.remove('walking','facing-left');
      highlighted=map.querySelector(stage===6?'#final':`[data-level="${stage}"]`);
      highlighted?.classList.remove('awaiting-unlock');
      highlighted?.classList.add('journey-arrival','unlock-celebration');RewardAudio.cue('level');
    };
    const from=journey?.from, to=journey?.to;
    const moving=Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&to<=6&&to>from;
    let unlockTarget=null;
    if(moving){
      unlockTarget=map.querySelector(to===6?'#final':`[data-level="${to}"]`);
      if(unlockTarget){
        unlockTarget.classList.add('awaiting-unlock');
        const effect=document.createElement('span');effect.className='map-unlock-effect';effect.setAttribute('aria-hidden','true');
        effect.innerHTML='<span class="unlock-padlock"><i></i></span>'+Array.from({length:8},(_,i)=>`<span class="unlock-particle" style="--angle:${i*45}deg">✦</span>`).join('');
        unlockTarget.querySelector('.bubble').append(effect);
      }
    }
    place(this.point(moving?from:current));
    if(moving && !matchMedia('(prefers-reduced-motion: reduce)').matches){
      actor.classList.add('walking');
      let began=null;
      const tick=now=>{
        if(stopped)return;
        if(document.hidden){frame=requestAnimationFrame(tick);began=null;return;}
        if(began===null)began=now;
        const elapsed=(now-began)/1700, segment=Math.min(to-from-1,Math.floor(elapsed));
        const t=Math.min(1,elapsed-segment), eased=t*t*(3-2*t), stage=from+segment;
        const p=this.position(stage,eased), ahead=this.position(stage,Math.min(1,eased+.01));
        actor.classList.toggle('facing-left',ahead.x<p.x);
        place(p);
        if(elapsed>=to-from){place(this.point(to));arrive(to);return;}
        frame=requestAnimationFrame(tick);
      };
      frame=requestAnimationFrame(tick);
    }else if(moving){place(this.point(to));arrive(to);}
    return ()=>{stopped=true;cancelAnimationFrame(frame);actor.remove();highlighted?.classList.remove('journey-arrival','unlock-celebration');unlockTarget?.classList.remove('awaiting-unlock');unlockTarget?.querySelector('.map-unlock-effect')?.remove()};
  }
};

// A reward travels from its game medallion into the player's collection.
const MapReward={
 mount(reward){
  if(!reward||!Number.isInteger(reward.index)||reward.index<0||reward.index>=LEVELS.length)return ()=>{};
  const slot=document.querySelector(`[data-reward-slot="${reward.index}"]`),origin=document.querySelector(`[data-level="${reward.index}"] .bubble`);
  if(!slot||!origin)return ()=>{};
  const wasEarned=slot.classList.contains('earned');
  const flight=document.createElement('div');flight.className='reward-flight';flight.setAttribute('aria-hidden','true');flight.innerHTML=gameIcon(LEVELS[reward.index].type)+'<span class="reward-flight-trail">✦ · ✧</span>';
  document.body.append(flight);RewardAudio.cue('flight');slot.classList.add('receiving');slot.classList.remove('earned');
  let raf=0,last=performance.now(),elapsed=0,arrived=false,stopped=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function arrive(){arrived=true;flight.remove();slot.classList.remove('receiving');slot.classList.add('earned','reward-landed');slot.setAttribute('aria-label',LEVELS[reward.index].name+(reward.preview?' : aperçu de l’objet débloqué':' : objet débloqué'));RewardAudio.cue('arrival')}
  function tick(now){if(stopped)return;if(!document.hidden)elapsed+=Math.min(now-last,80);last=now;
   const a=origin.getBoundingClientRect(),b=slot.getBoundingClientRect();
   if(!b.width||!b.height){arrive();return}
   const t=Math.max(0,Math.min(1,(elapsed-300)/1350)),e=t*t*(3-2*t),size=Math.min(100,a.width*.85);
   const x=a.left+a.width/2+(b.left+b.width/2-a.left-a.width/2)*e,y=a.top+a.height/2+(b.top+b.height/2-a.top-a.height/2)*e-Math.sin(Math.PI*t)*Math.min(100,innerHeight*.2);
   flight.style.left=x+'px';flight.style.top=y+'px';flight.style.width=size+'px';flight.style.height=size+'px';flight.style.transform=`translate(-50%,-50%) scale(${1.15-e*.55}) rotate(${Math.sin(t*Math.PI)*14}deg)`;
   if(elapsed>=1650){arrive();return}raf=requestAnimationFrame(tick)
  }
  if(reduced)arrive();else raf=requestAnimationFrame(tick);
  return ()=>{stopped=true;cancelAnimationFrame(raf);flight.remove();slot.classList.remove('receiving','reward-landed');if(reward.preview&&!wasEarned)slot.classList.remove('earned')};
 }
};
