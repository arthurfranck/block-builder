/* Block Builder plan engine (BB-7): paces, plan generation, warnings and week checks.
   No DOM and no storage, so it runs in the page and in Node (tests/engine/).
   A classic script, not an ES module, so index.html still works when opened from disk (file://).
   Text comes from the page through BBEngine.setLocale({t, days, fmtDate}); without it, keys come back as-is. */
(function (root) {
"use strict";
const LOCALE = {
  t: (k, v) => (v ? k + " " + JSON.stringify(v) : k),
  days: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  fmtDate: (d) => d.toISOString().slice(0, 10),
};
function t(k, v) { return LOCALE.t(k, v); }
const dayName = (d) => LOCALE.days()[d];
const fmtDate = (d) => LOCALE.fmtDate(d);
const cap = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);

const DISTS = [{k:"5k",km:5},{k:"10k",km:10},{k:"hm",km:21.0975},{k:"m",km:42.195},{k:"custom",km:null}];
const PHASES = ["base","build","peak","taper"];
const DEFAULT_DAYS = {1:[6],2:[3,6],3:[1,3,6],4:[1,2,4,6],5:[0,1,3,4,6],6:[0,1,2,4,5,6],7:[0,1,2,3,4,5,6]};
const uid = () => Math.random().toString(36).slice(2,10);
const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
const r05 = v => Math.round(v*2)/2;
const TYPE_DEFS=[["easy","easy",true,true,null],["long","long",true,false,null],["recovery","recovery",true,false,null],["strides","easy",true,false,null],["tempo","hard",true,false,["build","peak"]],["intervals","hard",true,false,["build","peak"]],["hills","hard",true,false,["base","build"]],["fartlek","hard",false,false,["base","build"]],["progression","hard",false,false,["base","build","peak"]],["racepace","hard",true,false,["peak","taper"]]];
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function parseISO(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d,12);}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function dow(d){return (d.getDay()+6)%7;}
/* ---------- pace model (Daniels/Gilbert VO2 equations) ---------- */
/* Finish time for a recent race. h:mm:ss and mm:ss as written; two parts can also mean h:mm ("1:45" for a half),
   and a lone number means minutes ("52" for a 10K). The reading that gives a plausible result for the race
   distance (VDOT 15-90) wins, mm:ss first. Returns seconds, or null when no reading fits. */
function raceTimeSec(s,km){
  if(s==null||!(km>0))return null;
  const p=String(s).trim().split(":");
  if(!p.length||p.length>3||p.some(x=>!/^\d{1,3}$/.test(x)))return null;
  const n=p.map(Number);if(n.slice(1).some(x=>x>59))return null;
  const cands=n.length===3?[n[0]*3600+n[1]*60+n[2]]:n.length===2?[n[0]*60+n[1],n[0]*3600+n[1]*60]:[n[0]*60];
  for(const sec of cands){if(sec<=0)continue;const vd=vdotOf(km*1000,sec/60);if(vd>15&&vd<90)return sec;}
  return null;
}
const REC_LBL={"5":"l5k","10":"l10k","21.0975":"lhm","42.195":"lm"}, REC_EX={"5":"25:00","10":"52:00","21.0975":"1:55:00","42.195":"4:00:00"};
/* time typed for a chosen race, but no reading fits: say so instead of quietly dropping the paces */
const badRaceTime=inp=>+inp.recDist>0&&String(inp.recTime||"").trim()!==""&&raceTimeSec(inp.recTime,+inp.recDist)==null;
function badTimeMsg(inp){const k=String(+inp.recDist);return t("wa_badTime",{time:String(inp.recTime).trim(),lbl:t(REC_LBL[k]||"l10k"),ex:REC_EX[k]||"52:00"});}
const vo2 = v => -4.60+0.182258*v+0.000104*v*v;
const pctMax = t => 0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
const vdotOf = (m,tmin) => vo2(m/tmin)/pctMax(tmin);
const velAt = o => (-0.182258+Math.sqrt(0.182258**2+4*0.000104*(4.60+o)))/(2*0.000104);
function raceTimeMin(vd,m){let lo=3,hi=900;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(vdotOf(m,mid)>vd)lo=mid;else hi=mid;}return (lo+hi)/2;}
const fmtPace = sec => {const s=Math.round(sec);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")+"/km";};
function fmtDur(sec){sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0");}
/* pace <-> time (BB-45; shared with BB-58 quick workouts and BB-54 time-based runs): seconds for km at a pace, km in seconds at a pace */
const durSec=(km,secKm)=>km*secKm;
const kmIn=(sec,secKm)=>sec/secKm;
/* long run limits (BB-45): share of the week by runs per week, longest duration at easy pace, growth on the last full long run */
const LONG_SHARE=runs=>runs<=1?1:runs===2?0.5:runs===3?0.45:0.4;
const LONG_MAX_MIN={"hm":150,"m":180};
const LONG_STEP_KM=2, LONG_STEP_MIN=15;
/* experience level (BB-49): missing or unknown = regular, so plans saved before 1.2.0 build as they did */
const LEVELS=["new","regular","experienced"];
function levelOf(inp){return LEVELS.includes(inp&&inp.level)?inp.level:"regular";}
const CUT_EVERY=lv=>lv==="new"?3:4; /* cutback week rhythm */
function distKm(inp){const d=DISTS.find(x=>x.k===inp.dist);return d&&d.km?d.km:clamp(+inp.customKm||10,3,100);}
function missingSetup(I){const m=[];if(!(+I.runs>=1))m.push("needRuns");if(!(+I.curVol>0))m.push("needVol");if(!(+I.curLong>0))m.push("needLong");return m;}
function genInputs(I){return {...I,runs:+I.runs>=1?+I.runs:5,days:+I.runs>=1?I.days:[],curVol:+I.curVol>0?I.curVol:30,curLong:+I.curLong>0?I.curLong:12};}
function distLabel(inp){if(!inp.dist)return "";return inp.dist==="custom"?(+inp.customKm||10)+" km":t("l"+inp.dist);}
function cat(D){return D<=6?"5k":D<=12?"10k":D<=25?"hm":"m";}

function paces(inp){
  const D=distKm(inp)*1000, rd=+inp.recDist, rt=raceTimeSec(inp.recTime,rd);
  if(rd>0&&rt){
    const vd=vdotOf(rd*1000,rt/60);
    if(vd>15&&vd<90){
      const sp=f=>60000/velAt(vd*f);
      const raceMin=raceTimeMin(vd,D), mMin=raceTimeMin(vd,42195);
      const s={easy:sp(0.70),tempo:sp(0.88),interval:sp(0.975),rep:sp(1.04),race:raceMin*60/(D/1000),mp:mMin*60/42.195};
      return {vdot:vd,raceSec:raceMin*60,sec:s,txt:Object.fromEntries(Object.entries(s).map(([k,v])=>[k,fmtPace(v)]))};
    }
  }
  const sec={easy:400,tempo:330,interval:305,rep:290,race:330,mp:345};
  return {vdot:null,sec,txt:Object.fromEntries(["easy","tempo","interval","rep","race","mp"].map(k=>[k,t("pe_"+k)]))};
}

/* ---------- plan engine ---------- */
function effectiveDays(inp){
  const d=[...new Set(inp.days)].filter(x=>x>=0&&x<7).sort((a,b)=>a-b);
  return d.length===inp.runs?d:DEFAULT_DAYS[inp.runs].slice();
}
function cyc(a,b){const x=Math.abs(a-b);return Math.min(x,7-x);}
function* combos(arr,k,start=0,acc=[]){if(acc.length===k){yield acc.slice();return;}for(let i=start;i<arr.length;i++){acc.push(arr[i]);yield* combos(arr,k,i+1,acc);acc.pop();}}
function pickHardDays(cands,k,longD,raceWeek){
  if(k<=0)return [];
  let best=null,bp=Infinity;
  for(const c of combos(cands,Math.min(k,cands.length))){
    let p=0;
    for(let i=0;i<c.length;i++){
      if(cyc(c[i],longD)<=1)p+=(c[i]===(longD+6)%7?6:10);
      for(let j=i+1;j<c.length;j++)if(cyc(c[i],c[j])<=1)p+=12;
      if(raceWeek){const before=(longD-c[i]+7)%7;if(before<3)p+=30;p+=Math.abs(before-4);}
    }
    if(p<bp){bp=p;best=c;}
  }
  return best||[];
}

function workFor(ty,ctx){
  const {p,D,c,taper,P}=ctx; const tf=(taper?0.65:1)*(ctx.scale||1); const S=P.sec;
  switch(ty.id){
    case "tempo":{let mins=Math.round((15+15*p)*tf);if(c==="5k")mins=Math.min(mins,24);
      if(p<0.35&&!taper){const n=Math.max(2,Math.round(mins/8));return {text:t("w_tempoCruise",{n}),km:n*8*60/S.tempo+n*0.25,wucd:4,main:[{n,steps:[{p:'work',g:['t',480],pace:'tempo'},{p:'recovery',g:['t',90],pace:null}]}]};}
      return {text:t("w_tempoCont",{mins}),km:mins*60/S.tempo,wucd:4,main:[{n:1,steps:[{p:'work',g:['t',mins*60],pace:'tempo'}]}]};}
    case "intervals":{const sets={"5k":[400,800,1000],"10k":[800,1000,1200],"hm":[1000,1200,1600],"m":[1000,1600,2000]}[c];
      const rep=sets[p<0.34?0:p<0.67?1:2]; const tot=((c==="5k"||c==="10k")?3+2.5*p:4+3*p)*tf;
      const n=clamp(Math.round(tot*1000/rep),3,12); const rec=t(rep<=800?"jog90":rep<=1200?"jog120":"jog180"); const recS=rep<=800?90:rep<=1200?120:180;
      return {text:t("w_int",{n,rep,rec}),km:n*rep/1000+n*0.3,wucd:4,main:[{n,steps:[{p:'work',g:['d',rep/1000],pace:rep<=400?'rep':'interval'},{p:'recovery',g:['t',recS],pace:null}]}]};}
    case "hills":{const n=Math.round((6+4*p)*tf);return {text:t("w_hills",{n}),km:n*0.55,wucd:4,main:[{n,steps:[{p:'work',g:['t',75],pace:null},{p:'recovery',g:['t',120],pace:null}]}]};}
    case "fartlek":{if(p<0.5){const n=Math.round((8+4*p*2)*tf);return {text:t("w_fart1",{n}),km:n*2*60/S.easy*1.15,wucd:4,main:[{n,steps:[{p:'work',g:['t',60],pace:null},{p:'recovery',g:['t',60],pace:null}]}]};}
      const n=Math.round(6*tf);return {text:t("w_fart2",{n}),km:n*3*60/S.easy*1.2,wucd:4,main:[{n,steps:[{p:'work',g:['t',120],pace:'interval'},{p:'recovery',g:['t',60],pace:null}]}]};}
    case "progression":{const x=Math.round(2+3*p);return {text:t("w_prog",{x}),km:null,wucd:0,fast:x,fastPace:'tempo'};}
    case "racepace":{
      if(c==="m"){const k=Math.max(5,Math.round((8+8*p)*(taper?0.5:1)*(ctx.scale||1)));return {text:t("w_rpM",{k}),km:k,wucd:4,main:[{n:1,steps:[{p:'work',g:['d',k],pace:'mp'}]}]};}
      const blk={"5k":[1,3,2,t("jog90")],"10k":[2,2,2,t("jog120")],"hm":[3,2,1,t("jog120")]}[c];
      const n=Math.max(2,Math.round((blk[1]+blk[2]*p)*tf));
      return {text:t("w_rp",{n,b:blk[0],rec:blk[3]}),km:n*blk[0]+n*0.3,wucd:4,main:[{n,steps:[{p:'work',g:['d',blk[0]],pace:'race'},{p:'recovery',g:['t',blk[0]===1?90:120],pace:null}]}]};}
    case "strides":{const n=6+Math.round(2*p);return {text:t("w_strides",{n}),km:0,wucd:0,strides:n};}
    case "long":{
      if(ctx.phase==="peak"&&(c==="hm"||c==="m")&&!ctx.cut){const x=c==="hm"?Math.round(3+2*p):Math.round(6+4*p);return {text:t("w_longFast",{x}),fast:x,fastPace:'race'};}
      if(c==="m"||c==="hm")return {text:t("w_longFuel")};
      return {text:ctx.phase==="peak"?t("w_longPick"):""};
    }
  }
  return {text:"",km:null,wucd:0};
}
function fill(tpl,tok){return String(tpl||"").replace(/\{(\w+)\}/g,(m,k)=>tok[k]!==undefined?tok[k]:m).replace(/\s+/g," ").replace(/\s+([.,])/g,"$1").replace(/,\s*,/g,",").trim();}

/* structured workout for Apple Watch: {wu,cd,blocks:[{n,steps:[{p,g:['d',km]|['t',sec],pace}]}]} */
function watchPlan(kind,km,w){
  w=w||{};const easy=(k,pace)=>({p:'work',g:['d',r05(Math.max(0.5,k))],pace});
  if(kind==="race")return {blocks:[{n:1,steps:[{p:'work',g:['d',km],pace:'race'}]}]};
  if(w.main){const plan={blocks:w.main.map(b=>({n:b.n,steps:b.steps.map(x=>({...x,g:[...x.g]}))}))};if(w.wucd){plan.wu=['d',w.wucd/2];plan.cd=['d',w.wucd/2];}return plan;}
  if(w.strides)return {blocks:[{n:1,steps:[easy(km,'easy')]},{n:w.strides,steps:[{p:'work',g:['t',20],pace:null},{p:'recovery',g:['t',60],pace:null}]}]};
  if(w.fast&&km>w.fast)return {blocks:[{n:1,steps:[easy(km-w.fast,'easy'),easy(w.fast,w.fastPace)]}]};
  return {blocks:[{n:1,steps:[easy(km,kind==="recovery"?null:'easy')]}]};
}

function generate(inp,types){
  const D=distKm(inp), c=cat(D), P=paces(inp);
  const W=clamp(Math.round(+inp.weeks||12),3,30);
  const runs=clamp(+inp.runs||5,1,7);
  const noRace=inp.goal==="fitness";
  const taperN=noRace?0:Math.min({"5k":1,"10k":1,"hm":2,"m":3}[c],Math.max(1,Math.floor(W/4)));
  const nb=W-taperN;
  const nBase=Math.max(1,Math.round(nb*0.4)), nPeak=Math.max(1,Math.round(nb*0.25)), nBuild=Math.max(0,nb-nBase-nPeak);
  const phaseOf=i=>i>=nb?"taper":i<nBase?"base":i<nBase+nBuild?"build":"peak";
  const lv=levelOf(inp), every=CUT_EVERY(lv);
  const cut=i=>i<nb-1&&nb>=5&&(i+1)%every===0;
  const V0=clamp(+inp.curVol||25,5,200);
  const fac={"5k":1.25,"10k":1.3,"hm":1.4,"m":1.55}[c], floor={"5k":20,"10k":25,"hm":32,"m":45}[c], perRun=c==="m"?16:13;
  let peakV=Math.max(V0,Math.min(Math.max(V0*fac,floor),runs*perRun));
  let nNC=0;for(let i=0;i<nb;i++)if(!cut(i))nNC++;
  const g=nNC>1?Math.min(0.1,Math.pow(peakV/V0,1/(nNC-1))-1):0;
  peakV=Math.min(peakV,V0*Math.pow(1+g,Math.max(0,nNC-1)));
  const vols=[];let k=0,last=V0;
  for(let i=0;i<nb;i++){if(cut(i)){vols.push(last*0.8);}else{last=Math.min(peakV,V0*Math.pow(1+g,k));k++;vols.push(last);}}
  const tm={0:[],1:[0.6],2:[0.75,0.55],3:[0.8,0.65,0.5]}[taperN];
  for(let j=0;j<taperN;j++)vols.push(peakV*tm[j]);
  const L0=clamp(+inp.curLong||10,3,45);
  const Lpk=Math.max(L0,{"5k":12,"10k":16,"hm":19,"m":32}[c]);
  const lfrac=Math.max({"5k":0.33,"10k":0.33,"hm":0.38,"m":0.48}[c],1.25/runs);
  const on=types.filter(t=>t.on);
  const hardTypes=on.filter(t=>t.kind==="hard");
  const recT=on.find(t=>t.kind==="recovery"), stridesT=on.find(t=>t.id==="strides");
  const easyT=types.find(t=>t.id==="easy"), longT=types.find(t=>t.id==="long");
  const raceD=parseISO(inp.raceDate), raceDow=dow(raceD);
  const start=noRace?(d=>addDays(d,(7-dow(d))%7))(parseISO(inp.startDate||nextMonday())):addDays(raceD,-raceDow-7*(W-1));
  const rot={}; const occ={};
  const weeks=[];
  let refKm=null; /* actual km of the last week that was neither a cutback nor taper */
  let longPk=0;
  let lastLong=null; /* long run of the last full (not cutback, not taper) week: BB-45 growth limit */ /* longest long run actually built before the taper: the taper scales from it, not from the target peak (BB-39) */
  for(let i=0;i<W;i++){
    const phase=phaseOf(i), isCut=cut(i), raceWeek=!noRace&&i===W-1;
    const p=nb>1?clamp(i/(nb-1),0,1):1;
    let days=effectiveDays({...inp,runs});
    let longD=+inp.longDay;
    if(!days.includes(longD))longD=days[days.length-1];
    if(raceWeek){if(!days.includes(raceDow)){const idx=days.indexOf(longD);days[idx]=raceDow;days.sort((a,b)=>a-b);}longD=raceDow;}
    let hk=Math.min(maxHardRuns(inp),phase==="base"||phase==="taper"?1:2);
    if(isCut)hk=Math.max(1,hk-1);
    if(lv==="new"&&phase==="base")hk=0; /* BB-49: new runners build the habit first; strides only */
    if(!hardTypes.length)hk=0;
    if(raceWeek&&runs<=3)hk=0;
    const others=days.filter(d=>d!==longD);
    let hardDays=pickHardDays(others,Math.min(hk,others.length),longD,raceWeek);
    /* BB-49: experienced runners get a second hard run at 4 runs only when the days leave a gap around it */
    if(lv==="experienced"&&hardDays.length>1&&hardDays.some((d,j)=>cyc(d,longD)<=1||hardDays.some((e,m)=>m>j&&cyc(d,e)<=1)))hardDays=pickHardDays(others,1,longD,raceWeek);
    const target=vols[i];
    const ctxBase={p:phase==="taper"?0.5:p,D,c,taper:phase==="taper",P,phase,cut:isCut};
    const sessions=[];
    // long / race
    let longKm,mkLong=null;
    if(raceWeek){sessions.push({id:uid(),day:longD,typeId:"race",name:t("raceDay"),kind:"race",km:+D.toFixed(1),desc:raceDesc(inp,P),note:"",watch:watchPlan("race",+D.toFixed(1))});}
    else{
      if(phase==="taper"){const pk=longPk||Lpk;longKm=pk*([0.75,0.6][i-nb]||0.6);}
      else{const nbNC=Math.max(1,nb-1);longKm=L0+(Lpk-L0)*Math.min(1,i/nbNC);longKm=Math.min(longKm,Math.max(L0*0.9,target*lfrac));
        /* BB-45: no bigger step than +2 km or +15 min (the larger) on the last full long run (week 1: on the current longest run) */
        const prevL=lastLong??L0;longKm=Math.min(longKm,prevL+Math.max(LONG_STEP_KM,kmIn(LONG_STEP_MIN*60,P.sec.easy)));
        if(isCut)longKm*=0.75;}
      /* BB-45: at most ~40% of the week (relaxed at 3 runs or fewer), at most 2:30 (half) / 3:00 (marathon) at easy pace */
      longKm=Math.min(longKm,target*LONG_SHARE(runs));
      if(LONG_MAX_MIN[c])longKm=Math.min(longKm,kmIn(LONG_MAX_MIN[c]*60,P.sec.easy));
      longKm=r05(Math.max(longKm,4));
      const lt=longT.on?longT:easyT; /* long run type unticked: that day is a plain easy run */
      const w=longT.on?workFor(longT,ctxBase):{text:""};
      mkLong=km=>({id:uid(),day:longD,typeId:lt.id,name:lt.name,kind:lt.kind,km,desc:fill(lt.tpl,{...P.txt,km,work:fill(w.text,P.txt)}),note:"",watch:watchPlan(lt.kind,km,w)});
      sessions.push(mkLong(longKm));
    }
    // hard
    const elig=hardTypes.filter(t=>t.phases.includes(phase));
    let pool=elig.length?elig:hardTypes;
    if(raceWeek){const rp=hardTypes.filter(t=>t.id==="racepace"||t.id==="tempo");if(rp.length)pool=rp;}
    if(phase==="peak"){pool=[...pool].sort((a,b)=>(b.id==="racepace")-(a.id==="racepace"));}
    const used=new Set();
    const picks=[];
    for(const d of hardDays){
      let t=null;rot[phase]=rot[phase]||0;
      for(let tries=0;tries<pool.length;tries++){const cand=pool[(rot[phase]++)%pool.length];if(!used.has(cand.id)||pool.length<=used.size){t=cand;break;}}
      if(!t)t=pool[0];used.add(t.id);picks.push({d,t});
    }
    const easyN=days.length-1-picks.length;
    const build=scale=>picks.map(({d,t})=>{
      const w=workFor(t,{...ctxBase,scale,taper:phase==="taper"||raceWeek});
      let km;
      if(w.km==null){km=clamp(Math.round(target*0.17*scale),6,16);if(raceWeek)km=Math.min(km,8);}
      else km=w.wucd+w.km;
      if(raceWeek)km=Math.min(km,c==="m"?14:9);
      km=r05(Math.max(km,lv==="new"?4:5));
      return {id:uid(),day:d,typeId:t.id,name:t.name,kind:"hard",km,desc:fill(t.tpl,{...P.txt,km,work:fill(w.text,P.txt)}),note:"",watch:watchPlan("hard",km,w)};
    });
    let hs=build(1),hScale=1;
    let hardKm=hs.reduce((a,x)=>a+x.km,0);
    const room=target*1.04-(longKm||0)-easyN*4;
    if(!raceWeek&&hardKm>room&&hardKm>0){hScale=clamp(room/hardKm,0.55,1);hs=build(hScale);hardKm=hs.reduce((a,x)=>a+x.km,0);}
    // easy
    const easyDays=others.filter(d=>!hardDays.includes(d));
    const roles=easyDays.map(d=>({d,t:easyT}));
    const afterLong=(longD+1)%7;
    if(recT&&runs>=5&&!raceWeek){const r=roles.find(x=>x.d===afterLong)||(roles.length>1?roles.find(x=>cyc(x.d,longD)===1):null);if(r)r.t=recT;}
    if(stridesT){const s=(raceWeek?roles.find(x=>x.d===(longD+6)%7):null)||roles.find(x=>x.t===easyT&&x.d!==afterLong)||roles.find(x=>x.t===easyT);if(s)s.t=stridesT;}
    const wt=x=>x.t.kind==="recovery"?0.7:1;
    const sumW=roles.reduce((a,x)=>a+wt(x),0)||1;
    const rem=Math.max(0,target-(longKm||0)-hardKm);
    const minKm=x=>lv==="new"?(x.t.kind==="recovery"?2.5:3):(x.t.kind==="recovery"?3:4); /* BB-49: shorter minimum runs for new runners */
    const easyKm=roles.map(x=>{
      let km;
      if(raceWeek){km=(x.d===(longD+6)%7)?(c==="m"?5:4):clamp(Math.round(peakV*0.09),4,8);}
      else km=Math.max(minKm(x),rem*wt(x)/sumW);
      if(!raceWeek&&x.t.kind!=="recovery")km=Math.min(km,Math.max(longKm-1,6));
      return r05(km);
    });
    /* Rounding and the minimum distances can push a week well past +10% on the last full week.
       Trim back to that cap: easy runs first (0.5 km steps, longest first), then the hard runs, then the long run. */
    if(!raceWeek&&!isCut&&phase!=="taper"&&refKm!=null){
      const cap=refKm*1.1+0.01;
      const total=()=>(longKm||0)+hardKm+easyKm.reduce((a,b)=>a+b,0);
      while(total()>cap){
        let j=-1;easyKm.forEach((k,i)=>{if(k-0.5>=minKm(roles[i])&&(j<0||k>easyKm[j]))j=i;});
        if(j<0)break;easyKm[j]-=0.5;
      }
      for(let sc=hScale-0.05;total()>cap&&hs.length&&sc>=0.549;sc-=0.05){const h2=build(sc),k2=h2.reduce((a,x)=>a+x.km,0);if(k2<hardKm){hs=h2;hardKm=k2;}}
      if(total()>cap&&mkLong){const nl=Math.max(4,Math.floor((longKm-(total()-cap))*2)/2);if(nl<longKm){longKm=nl;sessions[0]=mkLong(longKm);}}
    }
    sessions.push(...hs);
    roles.forEach((x,i)=>{
      const km=easyKm[i];const w=workFor(x.t,ctxBase);
      sessions.push({id:uid(),day:x.d,typeId:x.t.id,name:x.t.name,kind:x.t.kind,km,desc:fill(x.t.tpl,{...P.txt,km,work:fill(w.text||"",P.txt)}),note:"",watch:watchPlan(x.t.kind,km,w)});
    });
    /* BB-45: share of the week as built (rounding and minimum runs can move it); trim the long run, the km are not moved again */
    if(mkLong&&runs>1){const rest=sessions.reduce((a,x)=>a+x.km,0)-longKm,sh=LONG_SHARE(runs),mx=Math.floor(sh/(1-sh)*rest*2)/2;
      if(longKm>mx&&mx>=4){longKm=mx;const li=sessions.findIndex(x=>x.day===longD);sessions[li]=mkLong(longKm);}}
    if(!isCut&&phase!=="taper"&&longKm)lastLong=longKm;
    if(!isCut&&phase!=="taper")refKm=sessions.reduce((a,x)=>a+x.km,0);
    if(phase!=="taper"&&longKm)longPk=Math.max(longPk,longKm);
    sessions.sort((a,b)=>a.day-b.day);
    weeks.push({n:i+1,phase,cutback:isCut,start:iso(addDays(start,7*i)),target:Math.round(target),note:"",sessions});
  }
  return {weeks,meta:{noRace,D,c,taperN,peakV:Math.round(peakV),start:iso(start),vdot:P.vdot,raceSec:P.raceSec||null,racePace:P.vdot?P.txt.race:null}};
}
function raceDesc(inp,P){
  const lbl=distLabel(inp);
  if(P.vdot)return cap(t("raceDescV",{lbl,time:fmtDur(P.raceSec),pace:P.txt.race}));
  return cap(t("raceDescE",{lbl}));
}

/* ---------- warnings ---------- */
function warnings(inp,types,plan,edited){
  const w=[];const D=distKm(inp),c=cat(D),lbl=distLabel(inp);
  const minW={"5k":6,"10k":8,"hm":10,"m":14}[c];
  if(inp.goal!=="fitness"&&inp.weeks<minW)w.push(t("wa_short",{w:inp.weeks,lbl,min:minW}));
  if(inp.weeks>24)w.push(t("wa_long",{n:Math.min(20,inp.weeks)}));
  const lowVol={"5k":12,"10k":18,"hm":22,"m":32}[c];
  if(inp.goal!=="fitness"&&+inp.curVol<lowVol)w.push(t("wa_lowVol",{v:inp.curVol,lbl}));
  if(inp.goal!=="fitness"&&c==="m"&&+inp.curLong<14)w.push(t("wa_mLong"));
  /* goal readiness (BB-40): longest run before race day and biggest week, against what a half or marathon usually needs */
  if(inp.goal!=="fitness"&&(c==="hm"||c==="m")&&plan.weeks.length){
    const pre=plan.weeks.filter(x=>!x.sessions.some(s=>s.kind==="race"));
    const lr=Math.max(0,...pre.flatMap(x=>x.sessions.map(s=>+s.km||0)));
    const pk=Math.max(0,...pre.map(x=>x.sessions.reduce((a,s)=>a+(+s.km||0),0)));
    const tl=D*(c==="m"?.75:.6),tp=c==="m"?45:30;
    if(lr<tl-.05||pk<tp-.05)w.push(t("wa_ready",{long:+lr.toFixed(1),peak:Math.round(pk),lbl,tl:Math.round(tl),tp}));
  }
  const days=[...new Set(inp.days)];
  if(days.length!==+inp.runs)w.push(t("wa_days",{d:days.length,r:inp.runs}));
  /* BB-44: running days the runner picked that sit 3 or more in a row (Sun runs into Mon); only at 4 runs or fewer, where a gap is possible */
  else if(+inp.runs>=3&&+inp.runs<=4){
    const on=new Set(days);let best=[];
    for(const d0 of days){if(on.has((d0+6)%7))continue;const run=[];for(let d=d0;on.has(d%7)&&run.length<7;d++)run.push(d%7);if(run.length>best.length)best=run;}
    if(best.length>=3)w.push(t("wa_row",{days:best.map(d=>dayName(d)).join(", "),n:best.length}));
  }
  if(+inp.runs===7)w.push(t("wa_noRest7"));
  const hard=types.filter(x=>x.on&&x.kind==="hard");
  const maxHard=maxHardRuns(inp);
  if(hard.length>maxHard*2)w.push(t("wa_tooMany",{h:hard.length,r:inp.runs,m:maxHard,sess:t(maxHard>1?"sessMany":"sessOne")}));
  if(!hard.length)w.push(t("wa_noHard"));
  if(hard.length&&longBoxedIn(inp)){const ds=[...new Set(inp.days)],dd=ds.length===+inp.runs?ds:DEFAULT_DAYS[+inp.runs];w.push(t("wa_noGap",{long:dayName(dd.includes(+inp.longDay)?+inp.longDay:dd[dd.length-1])}));}
  /* +10% a week on the last full week (cutbacks and taper skipped), checked on the weeks as shown */
  const wk=plan.weeks.map(x=>x.sessions.reduce((a,s)=>a+(+s.km||0),0));const steep=[];
  plan.weeks.forEach((x,i)=>{if(i===0||x.cutback||x.phase==="taper")return;const r=plan.weeks[i-1].cutback?wk[i-2]:wk[i-1];if(r>0&&wk[i]>r*1.1+0.05)steep.push(x.n);});
  if(steep.length)w.push(t(edited?"wa_steepEdit":"wa_steep",{w:t(steep.length>1?"wkMany":"wkOne",{n:steep.join(", ")})}));
  w.push(...weekCheckSummary(plan,inp));
  if(badRaceTime(inp))w.push(badTimeMsg(inp));
  else if(!(+inp.recDist>0&&raceTimeSec(inp.recTime,+inp.recDist)))w.push(t("wa_noPace"));
  const startD=parseISO(plan.meta.start);const today=new Date();today.setHours(0,0,0,0);
  if(startD<addDays(today,-6))w.push(t(inp.goal==="fitness"?"wa_pastFit":"wa_past",{d:fmtDate(startD)}));
  return w;
}

/* ---------- week checks (BB-57 hard runs by level BB-49, BB-44 spacing; hard-pace share BB-48 to come) ----------
   Problems the plan or a hand edit can fix, checked on the weeks as shown and reported on the week itself.
   Setup problems stay in warnings() above. */
/* most hard runs in a week: generator, setup warning and week check share it. BB-49: by experience level,
   new = 1 at any number of runs, regular = 2 from 5 runs, experienced = 2 from 4 runs */
function maxHardRuns(inp){const r=+inp.runs,lv=levelOf(inp);return lv==="new"?1:r<=(lv==="experienced"?3:4)?1:2;}
/* the running days leave no day at least 2 days from the long run (Sun next to Mon), so a hard run can't avoid it: a setup warning, not a week one */
function longBoxedIn(inp){
  const r=+inp.runs;if(r<2||r>4)return false;
  const ds=[...new Set(inp.days)],days=ds.length===r?ds:DEFAULT_DAYS[r];
  const L=days.includes(+inp.longDay)?+inp.longDay:days[days.length-1];
  return !days.some(d=>d!==L&&cyc(d,L)>=2);
}
function weekChecks(w,inp,prev){
  const out=[],ss=w.sessions.filter(s=>s.kind!=="race");
  const nHard=ss.filter(s=>s.kind==="hard").length,m=maxHardRuns(inp);
  if(nHard>m)out.push({k:"tooHard",txt:t(levelOf(inp)==="new"?"wk_tooHardNew":"wk_tooHard",{n:nHard,r:inp.runs,m})});
  /* spacing (BB-44): a hard run on the same or the next day as another hard run, the long run or race day,
     including the previous week's Sunday. Days in a row without hard runs are a setup matter (warnings()). */
  const key=s=>s.kind==="hard"?"hard":s.kind==="long"||s.kind==="race"?"long":null;
  const pts=[...(prev?prev.sessions.filter(s=>s.day===6&&key(s)).map(s=>({d:-1,s})):[]),...w.sessions.filter(key).map(s=>({d:s.day,s}))].sort((a,b)=>a.d-b.d);
  const pairs=[],boxed=longBoxedIn(inp);
  pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{if(b.d-a.d<=1&&b.d>=0&&(key(a.s)==="hard"||key(b.s)==="hard")&&!(boxed&&key(a.s)!==key(b.s)))pairs.push(t("wk_pair",{a:a.s.name,da:dayName((a.d+7)%7),b:b.s.name,db:dayName(b.d)}));}));
  if(pairs.length)out.push({k:"b2b",txt:t("wk_b2b",{pairs:pairs.join(", ")})});
  if(+inp.runs<7&&new Set(w.sessions.map(s=>s.day)).size>=7)out.push({k:"noRest",txt:t("wk_noRest")});
  return out;
}
function weekCheckSummary(plan,inp){
  const by={};
  plan.weeks.forEach((w,i)=>weekChecks(w,inp,plan.weeks[i-1]).forEach(c=>(by[c.k]=by[c.k]||[]).push(w.n)));
  const wl=a=>t(a.length>1?"wkLn":"wkL1",{n:a.join(", ")});
  const out=[];
  if(by.tooHard)out.push(t(levelOf(inp)==="new"?"wa_wkTooHardNew":"wa_wkTooHard",{w:wl(by.tooHard),r:inp.runs}));
  if(by.b2b)out.push(t("wa_wkB2B",{w:wl(by.b2b)}));
  if(by.noRest)out.push(t("wa_wkNoRest",{w:wl(by.noRest)}));
  return out;
}

const BBEngine = {
  setLocale(o) { Object.assign(LOCALE, o); },
  DISTS, PHASES, DEFAULT_DAYS, TYPE_DEFS, uid, clamp, r05, iso, parseISO, addDays, dow, raceTimeSec, REC_LBL, REC_EX, badRaceTime, badTimeMsg, vdotOf, velAt, raceTimeMin, fmtPace, fmtDur, durSec, kmIn, LONG_SHARE, LONG_MAX_MIN, LEVELS, levelOf, CUT_EVERY, distKm, missingSetup, genInputs, distLabel, cat, paces, effectiveDays, cyc, pickHardDays, workFor, fill, watchPlan, generate, raceDesc, warnings, maxHardRuns, longBoxedIn, weekChecks, weekCheckSummary
};
root.BBEngine = BBEngine;
if (typeof module === "object" && module.exports) module.exports = BBEngine;
})(typeof globalThis !== "undefined" ? globalThis : this);
