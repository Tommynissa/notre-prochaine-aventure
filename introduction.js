function introduction(){
 cleanup();round=null;BGM.suspend(false);BGM.start();RewardAudio.unlock();
 const scenes=[
  {who:'thomas',name:'Thomas',title:'J’ai une surprise pour toi…',text:'Mais avant de découvrir ton cadeau, je te propose un petit voyage dans nos souvenirs.',symbol:'gift'},
  {who:'anais',name:state.name,title:'Une nouvelle aventure ?',text:'Des souvenirs, des défis et un cadeau mystérieux… Je crois que je suis prête !',symbol:'travel'},
  {who:'thomas',name:'Thomas',title:'Chaque étape cache un indice.',text:'Retrouve nos photos, revis nos voyages et laisse-toi porter par la musique. Les images gagnées te rapprocheront de la surprise.',symbol:'memory'},
  {who:'both',name:'À nous deux',title:'La prochaine aventure commence ici.',text:'Suis le chemin, amuse-toi… et découvre ce que je t’ai préparé.',symbol:'gift'}
 ];
 let index=0,closed=false;
 app.innerHTML=`<main class="story-intro" aria-label="Introduction de notre aventure"><div class="story-room"></div><div class="story-vignette"></div><div class="story-motes" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--x:${(i*37+9)%100}%;--y:${(i*23+7)%100}%;--delay:${-i*.47}s;--duration:${4+i%4}s">✦</i>`).join('')}</div><header class="story-header"><img src="assets/accueil-logo-transparent.png" alt="En route vers…"><div><button class="story-sound" id="story-sound" aria-label="Activer ou couper le son"></button><button class="story-skip" id="story-skip">Passer l’introduction →</button></div></header><div class="story-stage"><div class="story-person story-thomas"><div class="story-portrait thomas" role="img" aria-label="Avatar de Thomas, en buste"></div><span>Thomas</span></div><div class="story-magic" aria-hidden="true"><div class="story-rays"></div><div class="story-emblem"></div><span class="story-heart">♥</span></div><div class="story-person story-anais"><div class="story-portrait anais" role="img" aria-label="Avatar d’Anaïs, en buste"></div><span>${esc(state.name)}</span></div></div><section class="story-dialogue" aria-label="Dialogue"><span class="story-speaker"></span><div class="story-copy" aria-live="polite" aria-atomic="true"><h1></h1><p></p></div><footer><div class="story-dots" aria-label="Progression de l’introduction"></div><button class="btn" id="story-next">Continuer →</button></footer></section></main>`;
 const root=document.querySelector('.story-intro');
 function soundLabel(){const b=root.querySelector('#story-sound');b.textContent=BGM.enabled?'♫ Son activé':'♫ Son coupé';b.setAttribute('aria-pressed',String(BGM.enabled));}
 function render(){
  const s=scenes[index];root.dataset.speaker=s.who;
  root.querySelector('.story-speaker').textContent=s.name;
  const copy=root.querySelector('.story-copy');copy.querySelector('h1').textContent=s.title;copy.querySelector('p').textContent=s.text;
  // Restart only the dialogue entrance; keep the room and characters in place.
  copy.classList.remove('story-copy-enter');void copy.offsetWidth;copy.classList.add('story-copy-enter');
  root.querySelector('.story-emblem').innerHTML=gameIcon(s.symbol);
  root.querySelector('.story-dots').innerHTML=scenes.map((_,i)=>`<i class="${i===index?'current':''}" aria-label="Étape ${i+1}${i===index?' actuelle':''}"></i>`).join('');
  root.querySelector('#story-next').textContent=index===scenes.length-1?'C’est parti !':'Continuer →';
 }
 function leave(){if(closed)return;closed=true;RewardAudio.stop();map();}
 root.querySelector('#story-skip').onclick=leave;
 root.querySelector('#story-next').onclick=()=>{if(index===scenes.length-1){leave();return;}index++;render();RewardAudio.play(index===scenes.length-1);};
 root.querySelector('#story-sound').onclick=()=>{BGM.toggle();soundLabel();};
 cleanup=()=>{closed=true;RewardAudio.stop();};
 soundLabel();render();RewardAudio.play();root.querySelector('#story-next').focus();
}
