const $=id=>document.getElementById(id);
const ORES={
 stone:{name:"Stone",value:1,color:"#65747d",icon:"▪",power:1},
 coal:{name:"Coal",value:3,color:"#303941",icon:"●",power:1},
 copper:{name:"Copper",value:5,color:"#a65e3d",icon:"◆",power:1},
 silver:{name:"Silver",value:12,color:"#a9b9c7",icon:"✦",power:2},
 gold:{name:"Gold",value:18,color:"#d4a52e",icon:"✦",power:2},
 diamond:{name:"Diamond",value:45,color:"#39bddd",icon:"◆",power:3},
 whitetin:{name:"White Tin",value:65,color:"#f0f2f3",icon:"✧",power:3},
 amethyst:{name:"Amethyst",value:110,color:"#9865d8",icon:"✦",power:4},
 netherite:{name:"Netherite",value:180,color:"#544956",icon:"⬟",power:4}
};
const LEVELS=[
 {name:"Stone Cavern",unlock:0,ores:["stone","coal","copper"],desc:"Stone, copper and coal",depth:0},
 {name:"Gold & Silver",unlock:80,ores:["stone","coal","silver","gold"],desc:"Gold and silver",depth:100},
 {name:"Crystal Depths",unlock:350,ores:["stone","diamond","whitetin"],desc:"Diamond and custom white tin",depth:250},
 {name:"Amethyst Core",unlock:1000,ores:["stone","amethyst","netherite"],desc:"Amethyst and Netherite",depth:500}
];
const fresh=()=>({coins:0,depth:0,best:0,blocks:0,level:0,mining:1,flight:1,power:1,bag:Object.fromEntries(Object.keys(ORES).map(k=>[k,0]))});
let s;try{s={...fresh(),...JSON.parse(localStorage.getItem("deepDiggerSave")||"{}")};s.bag={...fresh().bag,...s.bag}}catch{s=fresh()}
let blocks=[],flying=false;
function save(){try{localStorage.setItem("deepDiggerSave",JSON.stringify(s))}catch{}}
function say(m){$("toast").textContent=m;$("toast").classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),1900)}
function currentOres(){return LEVELS[s.level].ores}
function generate(){blocks=Array.from({length:40},()=>{const list=currentOres();let id=list[Math.random()<.42?0:list[Math.floor(Math.random()*list.length)]];return{id,hp:ORES[id].power*2}});renderBlocks()}
function renderBlocks(){$("minefield").innerHTML="";blocks.forEach((b,i)=>{let el=document.createElement("button");el.className="block";if(!b){el.classList.add("empty");el.disabled=true;el.setAttribute("aria-label","Mined block");$("minefield").appendChild(el);return}let o=ORES[b.id];el.style.background=o.color;el.style.color=b.id==="whitetin"?"#52616b":"white";el.textContent=o.icon;el.title=o.name+" · "+o.value+" coins · "+b.hp+" strength left";el.setAttribute("aria-label","Mine "+o.name);el.onclick=()=>mine(i);$("minefield").appendChild(el)})}
function mine(i){if(flying)return;let b=blocks[i];if(!b)return;let o=ORES[b.id];if(s.power<o.power){say("Need pickaxe power "+o.power+" for "+o.name+"!");return}b.hp-=s.mining;const el=$("minefield").children[i];el.classList.remove("hit");void el.offsetWidth;el.classList.add("hit");if(b.hp>0){el.title=o.name+" · "+b.hp+" strength left";say(o.name+" cracked!");return}s.bag[b.id]++;s.blocks++;s.depth+=5;s.best=Math.max(s.best,s.depth);blocks[i]=null;el.classList.add("empty");el.textContent="";el.disabled=true;render();save();if(blocks.every(x=>!x)){say("Cavern cleared! New blocks incoming…");setTimeout(generate,350)}}
function sell(){let n=0;for(let id in s.bag){n+=s.bag[id]*ORES[id].value;s.bag[id]=0}if(!n){say("Your backpack is empty!");return}s.coins+=n;say("Sold your haul for "+n+" coins!");render();save()}
function upgrade(type){let cost=({mining:()=>50*s.mining,flight:()=>40*s.flight,power:()=>100*s.power})[type]();if(s.coins<cost){say("Not enough coins — mine and sell more!");return}if(type==="power"&&s.power>=4){say("Your pickaxe is already max level!");return}if(type==="mining"&&s.mining>=8){say("Mining speed is maxed!");return}if(type==="flight"&&s.flight>=8){say("Flight speed is maxed!");return}s.coins-=cost;s[type]++;say(type==="power"?"Pickaxe power upgraded!":type==="flight"?"Flight thrusters upgraded!":"Mining speed upgraded!");render();save()}
function render(){
$("coins").textContent=s.coins;$("depth").textContent=s.depth;$("blocks").textContent=s.blocks;$("best").textContent=s.best+"m";$("value").textContent=Object.keys(s.bag).reduce((n,id)=>n+s.bag[id]*ORES[id].value,0)+" coins";
$("power").textContent=["Basic","Copper","Silver","Diamond","Netherite"][Math.min(s.power-1,4)];
$("levelTitle").textContent="Level "+(s.level+1)+" · "+LEVELS[s.level].name;$("levelPill").textContent="LEVEL "+(s.level+1);
$("miningLevel").textContent="Level "+s.mining+" · "+s.mining+"× power";$("flightLevel").textContent="Level "+s.flight+" · "+s.flight+"× speed";$("powerLevel").textContent="Level "+s.power;
$("miningBuy").textContent=s.mining>=8?"MAX LEVEL":"Upgrade · "+50*s.mining;$("flightBuy").textContent=s.flight>=8?"MAX LEVEL":"Upgrade · "+40*s.flight;$("powerBuy").textContent=s.power>=4?"MAX LEVEL":"Upgrade · "+100*s.power;
$("miningBuy").disabled=s.mining>=8;$("flightBuy").disabled=s.flight>=8;$("powerBuy").disabled=s.power>=4;
$("inventory").innerHTML=Object.keys(ORES).map(id=>'<div class="oreitem"><span>'+ORES[id].icon+" "+ORES[id].name+'</span><strong>'+s.bag[id]+' · '+s.bag[id]*ORES[id].value+'c</strong></div>').join("");
$("levelCards").innerHTML=LEVELS.map((l,i)=>{let unlocked=i===0||s.coins>=l.unlock||s.level>=i;return '<article class="card '+(s.level===i?"active":"")+'"><small>LEVEL '+(i+1)+'</small><h3>'+l.name+'</h3><p>'+l.desc+'</p><p>Unlock: '+l.unlock+' coins</p><button '+(s.level===i||!unlocked?"disabled":"")+' data-level="'+i+'">'+(s.level===i?"Current level":unlocked?"Enter level":"Locked")+'</button></article>'}).join("");
document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>{let i=+b.dataset.level;if(i>0&&s.coins<LEVELS[i].unlock){say("You need "+LEVELS[i].unlock+" coins to unlock this cavern.");return}if(i>s.level)s.coins-=LEVELS[i].unlock;s.level=i;s.depth=Math.max(s.depth,LEVELS[i].depth);generate();render();save();say("Entered "+LEVELS[i].name+"!")});
}
function flyToSurface(){if(flying||s.depth===0){say(s.depth===0?"You're already at the surface!":"Flight in progress…");return}flying=true;const distance=s.depth;const duration=Math.max(500,Math.min(5000,distance/(25*s.flight)*1000));$("surfaceBtn").disabled=true;$("minerFlight")?.classList.add("flying");document.body.classList.add("flight-mode");say("Thrusters on! Returning from "+distance+"m…");setTimeout(()=>{s.depth=0;flying=false;$("surfaceBtn").disabled=false;document.body.classList.remove("flight-mode");say("Back at the surface! Flight speed ×"+s.flight);render();save()},duration)}
$("digBtn").onclick=()=>{let i=blocks.findIndex(Boolean);if(i>=0)mine(i)};$("sellBtn").onclick=sell;$("surfaceBtn").onclick=flyToSurface;
$("miningBuy").onclick=()=>upgrade("mining");$("flightBuy").onclick=()=>upgrade("flight");$("powerBuy").onclick=()=>upgrade("power");
$("resetBtn").onclick=()=>{if(confirm("Reset all progress? This also clears your saved game.")){s=fresh();generate();render();save();say("New adventure started!")}};
generate();render();
