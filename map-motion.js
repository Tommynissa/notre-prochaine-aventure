// Coordinates use the same percentages as the illustrated map, at every screen size.
const MapJourney = {
  controls: [
    [[17,69],[24,69]], [[46,66],[34,57]], [[51,42],[60,53]],
    [[84,32],[58,33]], [[66,29],[73,26]], [[84,22],[87,19]]
  ],
  point(stage) { return stage === 6 ? {x:89,y:14} : LEVELS[stage]; },
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
      highlighted?.classList.add('journey-arrival');
    };
    const from=journey?.from, to=journey?.to;
    const moving=Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&to<=6&&to>from;
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
    return ()=>{stopped=true;cancelAnimationFrame(frame);actor.remove();highlighted?.classList.remove('journey-arrival')};
  }
};
