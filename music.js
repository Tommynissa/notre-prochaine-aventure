const BGM={
 audio:null,enabled:true,started:false,suspended:false,
 init(){this.audio=document.createElement('audio');this.audio.id='background-music';this.audio.src='assets/audio/pixels-ludiques.mp3';this.audio.loop=true;this.audio.preload='auto';this.audio.volume=.10;document.body.append(this.audio);try{this.enabled=localStorage.getItem('aventure-music')!=='off'}catch{}document.addEventListener('visibilitychange',()=>this.sync())},
 sync(){if(this.started&&this.enabled&&!this.suspended&&!document.hidden)this.audio.play().catch(()=>{});else this.audio.pause()},
 start(){this.started=true;this.sync()},
 suspend(value){this.suspended=value;this.sync()},
 toggle(){this.enabled=!this.enabled;if(!this.enabled)RewardAudio.stop();try{localStorage.setItem('aventure-music',this.enabled?'on':'off')}catch{}this.start();this.label()},
 label(){const b=document.querySelector('#music-toggle');if(b){b.innerHTML=controlIcon(this.enabled?'sound-on':'sound-off');b.setAttribute('aria-label',this.enabled?'Couper le son':'Activer le son');b.title=this.enabled?'Couper le son':'Activer le son';b.setAttribute('aria-pressed',String(this.enabled))}}
};BGM.init();
