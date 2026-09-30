
(function(){
  "use strict";

  var STORAGE_KEY = "pullupCoachGithubV1";

  var TASKS = {
    hang:{
      title:"稳稳挂住",
      tag:"抓握基础",
      image:"images/hang.webp",
      plans:["4组×6秒","4组×8秒","4组×10秒","4组×12秒","4组×15秒"],
      tip:"不用挂到极限，稳稳完成更重要。"
    },
    scap:{
      title:"肩膀会发力",
      tag:"肩胛控制",
      image:"images/scap.webp",
      plans:["3组×3次","3组×4次","3组×5次","3组×6次","3组×8次"],
      tip:"手臂尽量伸直，只让肩膀发力。"
    },
    row:{
      title:"把自己拉近",
      tag:"拉力基础",
      image:"images/row.webp",
      plans:["3组×5次","3组×6次","3组×8次","3组×10次","4组×8次"],
      tip:"胸口去找杠，身体保持稳定。"
    },
    top:{
      title:"顶端保持",
      tag:"上端控制",
      image:"images/top.webp",
      plans:["3次×2秒","3次×3秒","3次×5秒","3次×8秒","4次×10秒"],
      tip:"下巴过杠后，稳稳停住。"
    },
    ecc:{
      title:"慢慢落下",
      tag:"离心控制",
      image:"images/ecc.webp",
      plans:["3次×2秒","3次×3秒","4次×4秒","4次×6秒","4次×8秒"],
      tip:"越慢越稳越好，不要直接掉下来。"
    },
    plank:{
      title:"身体像一块板",
      tag:"核心稳定",
      image:"images/plank.webp",
      plans:["2组×15秒","2组×20秒","2组×25秒","2组×30秒","3组×30秒"],
      tip:"身体尽量保持一条直线。"
    },
    recovery:{
      title:"恢复也在训练",
      tag:"恢复日",
      image:"images/recovery.webp",
      plans:["轻松活动15分钟","轻松活动15分钟","轻松活动20分钟","散步+肩部活动","恢复日"],
      tip:"今天不冲成绩，让身体恢复。"
    }
  };

  function defaultState(){
    return {
      baseline:null,
      logs:[],
      displayProgress:0,
      baselineReadiness:0,
      draft:{}
    };
  }

  function loadState(){
    try{
      var raw=localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return defaultState();
  }

  var state=loadState();
  if(!state.logs) state.logs=[];
  if(!state.draft) state.draft={};

  function saveState(){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    }catch(e){}
  }

  function el(id){ return document.getElementById(id); }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
  function num(id){ return Number(el(id).value); }

  function optionRange(selectId,start,end,step,selected){
    var select=el(selectId);
    select.innerHTML="";
    var value=start;
    while(value<=end+0.0001){
      var option=document.createElement("option");
      option.value=String(value);
      option.textContent=String(value);
      if(Math.abs(value-selected)<0.0001) option.selected=true;
      select.appendChild(option);
      value=Math.round((value+step)*10)/10;
    }
  }

  function initBaselineOptions(){
    optionRange("weight",20,80,0.5,35);
    optionRange("hang",0,120,1,10);
    optionRange("scap",0,30,1,0);
    optionRange("flex",0,60,1,0);
    optionRange("ecc",0,30,1,0);
    optionRange("pullup",0,20,1,0);
  }

  function norm(v,target){
    return clamp(v/target,0,1.15);
  }

  function baselineReadiness(m){
    if((m.pullup||0)>=1) return 1;
    return clamp(
      0.20*norm(m.hang,30)+
      0.20*norm(m.scap,8)+
      0.25*norm(m.flex,15)+
      0.35*norm(m.ecc,8),
      0,1
    );
  }

  function uniqueLogDays(){
    var seen={},out=[],i,k;
    for(i=0;i<state.logs.length;i++){
      k=state.logs[i].dateKey || state.logs[i].date || "";
      if(!seen[k]){
        seen[k]=true;
        out.push(state.logs[i]);
      }
    }
    return out;
  }

  function averageCompletion(daysBack){
    var logs=uniqueLogDays().slice(-daysBack);
    if(!logs.length) return 0;
    var total=0,count=0,i,k,r;
    for(i=0;i<logs.length;i++){
      r=logs[i].ratings||{};
      for(k in r){
        if(Object.prototype.hasOwnProperty.call(r,k)){
          total += Number(r[k])/5;
          count++;
        }
      }
    }
    return count ? total/count : 0;
  }

  function estimatedReadiness(){
    if(!state.baseline) return 0;
    if((state.baseline.pullup||0)>=1) return 1;

    var base=state.baselineReadiness || baselineReadiness(state.baseline);
    var days=uniqueLogDays().length;
    var avg=averageCompletion(7);

    // Training logs may nudge the estimate upward, but cannot independently "unlock".
    var boost=Math.min(0.12, days*0.004 + Math.max(0,avg-0.55)*0.06);
    return clamp(base+boost,0,0.95);
  }

  function updateDisplayProgress(){
    var raw=Math.round(estimatedReadiness()*100);
    if(state.baseline && state.baseline.pullup>=1) raw=100;
    state.displayProgress=Math.max(state.displayProgress||0,raw);
    if(state.displayProgress>95 && !(state.baseline && state.baseline.pullup>=1)){
      state.displayProgress=95;
    }
    saveState();
  }

  function levelInfo(){
    var p=state.displayProgress||0;
    if(state.baseline && state.baseline.pullup>=1) return ["钻石","已经完成第一个标准引体。"];
    if(p>=82) return ["铂金","准备度已经很高，重点是把力量整合成完整动作。"];
    if(p>=62) return ["黄金","拉力和控制正在成形。"];
    if(p>=38) return ["白银","已经进入动作学习阶段。"];
    return ["青铜","先把“挂住”和“肩膀会发力”练稳。"];
  }

  function etaText(){
    if(state.baseline && state.baseline.pullup>=1) return "已解锁";

    var p=state.displayProgress||0;
    var avg=averageCompletion(7);

    var lo,hi;
    if(p>=88){ lo=3; hi=14; }
    else if(p>=75){ lo=7; hi=28; }
    else if(p>=60){ lo=14; hi=42; }
    else if(p>=40){ lo=28; hi=60; }
    else { lo=45; hi=90; }

    if(avg>=0.85){
      lo=Math.max(2,Math.round(lo*0.85));
      hi=Math.max(lo+5,Math.round(hi*0.9));
    }else if(avg>0 && avg<0.55){
      hi=Math.round(hi*1.15);
    }
    return "约"+lo+"–"+hi+"天";
  }

  function baseDifficulty(){
    var p=state.displayProgress||0;
    if(p<30) return 1;
    if(p<50) return 2;
    if(p<72) return 3;
    return 4;
  }

  function recentTaskRating(taskId){
    var vals=[],i,r;
    for(i=Math.max(0,state.logs.length-3);i<state.logs.length;i++){
      r=state.logs[i].ratings ? state.logs[i].ratings[taskId] : null;
      if(r) vals.push(Number(r));
    }
    if(!vals.length) return null;
    var sum=0;
    for(i=0;i<vals.length;i++) sum+=vals[i];
    return sum/vals.length;
  }

  function difficultyFor(taskId){
    var d=baseDifficulty();
    var rating=recentTaskRating(taskId);

    if(rating!==null){
      if(rating<=2) d-=1;
      else if(rating>=4.5) d+=1;
    }

    var last=state.logs.length ? state.logs[state.logs.length-1] : null;
    if(last && last.pain==="yes") d-=1;
    if(last && last.rpe>=9) d-=1;

    return clamp(d,1,5);
  }

  function taskIds(){
    var last=state.logs.length ? state.logs[state.logs.length-1] : null;
    if(last && last.pain==="yes") return ["recovery"];

    var p=state.displayProgress||0;
    if(p<30) return ["hang","scap","row","plank"];
    if(p<50) return ["hang","scap","top","ecc"];
    if(p<72) return ["scap","top","ecc","plank"];
    return ["top","ecc","hang","plank"];
  }

  function dateKey(date){
    var y=date.getFullYear();
    var m=("0"+(date.getMonth()+1)).slice(-2);
    var d=("0"+date.getDate()).slice(-2);
    return y+"-"+m+"-"+d;
  }

  function logDateSet(){
    var set={},i,k;
    for(i=0;i<state.logs.length;i++){
      k=state.logs[i].dateKey || "";
      if(k) set[k]=true;
    }
    return set;
  }

  function streakCount(){
    var set=logDateSet();
    var count=0;
    var d=new Date();

    if(!set[dateKey(d)]){
      d.setDate(d.getDate()-1);
    }

    while(set[dateKey(d)]){
      count++;
      d.setDate(d.getDate()-1);
    }
    return count;
  }

  function setHidden(id,hidden){
    if(hidden) el(id).classList.add("hidden");
    else el(id).classList.remove("hidden");
  }

  function renderCheckins(){
    if(!state.baseline) return;

    var logs=uniqueLogDays();
    el("totalDays").textContent=logs.length;
    el("streakDays").textContent=streakCount();

    var set=logDateSet();
    var now=new Date();
    var html="";
    var i,d,k,cls;

    for(i=13;i>=0;i--){
      d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);
      k=dateKey(d);
      cls="day-dot";
      if(set[k]) cls+=" done";
      if(i===0) cls+=" today";
      html+='<div class="'+cls+'" title="'+k+'">'+(d.getMonth()+1)+"/"+d.getDate()+'</div>';
    }
    el("recentDays").innerHTML=html;
  }

  function renderTasks(){
    var ids=taskIds();
    var labels=[
      ["太难了","没完成"],
      ["做了","一点"],
      ["完成","一半"],
      ["基本","完成"],
      ["轻松","完成"]
    ];
    var html="";
    var i,n,id,task,diff,checked;

    for(i=0;i<ids.length;i++){
      id=ids[i];
      task=TASKS[id];
      diff=difficultyFor(id);

      html+='<article class="task-card">';
      html+='<img src="'+task.image+'" alt="'+task.title+'">';
      html+='<div class="task-body">';
      html+='<span class="pill">'+task.tag+' · 难度 '+diff+'</span>';
      html+='<div class="task-title">'+task.title+'</div>';
      html+='<div class="task-rx">'+task.plans[diff-1]+'</div>';
      html+='<div class="task-tip">'+task.tip+'</div>';
      html+='<div class="rate-grid">';

      for(n=1;n<=5;n++){
        checked=state.draft[id]===n ? " checked" : "";
        html+='<input type="radio" id="rate_'+id+'_'+n+'" name="rate_'+id+'" value="'+n+'" data-task="'+id+'"'+checked+'>';
        html+='<label for="rate_'+id+'_'+n+'">'+labels[n-1][0]+'<br>'+labels[n-1][1]+'</label>';
      }
      html+='</div></div></article>';
    }

    el("taskList").innerHTML=html;

    var radios=el("taskList").querySelectorAll('input[type="radio"]');
    for(i=0;i<radios.length;i++){
      radios[i].addEventListener("change",function(){
        state.draft[this.getAttribute("data-task")]=Number(this.value);
        saveState();
      });
    }
  }

  function renderProgress(){
    var info=levelInfo();
    el("levelName").textContent=info[0];
    el("levelDesc").textContent=info[1];
    el("etaText").textContent=state.baseline ? etaText() : "先测基线";
    el("progressBar").style.width=(state.displayProgress||0)+"%";

    if(state.baseline){
      el("progressText").textContent=
        "当前引体准备度 "+(state.displayProgress||0)+"%。只有真正完成 1 个标准引体，才算解锁。";
    }else{
      el("progressText").textContent="完成第一次基线后，这里会显示当前引体准备度。";
    }
  }

  function render(){
    var hasBaseline=!!state.baseline;

    setHidden("baselinePanel",hasBaseline);
    setHidden("checkinPanel",!hasBaseline);
    setHidden("trainingPanel",!hasBaseline);
    setHidden("feedbackPanel",!hasBaseline);
    setHidden("managePanel",!hasBaseline);

    renderProgress();

    if(hasBaseline){
      renderCheckins();
      renderTasks();
    }
  }

  function saveBaseline(){
    state.baseline={
      weight:num("weight"),
      hang:num("hang"),
      scap:num("scap"),
      flex:num("flex"),
      ecc:num("ecc"),
      pullup:num("pullup")
    };
    state.baselineReadiness=baselineReadiness(state.baseline);
    updateDisplayProgress();
    saveState();
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function submitDay(){
    var ids=taskIds();
    var i;

    for(i=0;i<ids.length;i++){
      if(!state.draft[ids[i]]){
        alert("请先为每张任务卡选择完成度。");
        return;
      }
    }

    var ratings={};
    var key;
    for(key in state.draft){
      if(Object.prototype.hasOwnProperty.call(state.draft,key)){
        ratings[key]=state.draft[key];
      }
    }

    var now=new Date();
    var today=dateKey(now);
    var record={
      dateKey:today,
      ratings:ratings,
      rpe:num("rpe"),
      pain:el("pain").value
    };

    var replaced=false;
    for(i=0;i<state.logs.length;i++){
      if(state.logs[i].dateKey===today){
        state.logs[i]=record;
        replaced=true;
        break;
      }
    }
    if(!replaced) state.logs.push(record);

    state.draft={};
    updateDisplayProgress();
    saveState();

    el("successBox").style.display="block";
    renderCheckins();
    renderProgress();
  }

  function editBaseline(){
    if(!state.baseline) return;

    el("weight").value=String(state.baseline.weight);
    el("hang").value=String(state.baseline.hang);
    el("scap").value=String(state.baseline.scap);
    el("flex").value=String(state.baseline.flex);
    el("ecc").value=String(state.baseline.ecc);
    el("pullup").value=String(state.baseline.pullup);

    setHidden("baselinePanel",false);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function resetAll(){
    if(confirm("确定清空这台设备上的全部训练记录吗？")){
      try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
      location.reload();
    }
  }

  initBaselineOptions();

  el("saveBaselineBtn").addEventListener("click",saveBaseline);
  el("submitDayBtn").addEventListener("click",submitDay);
  el("editBaselineBtn").addEventListener("click",editBaseline);
  el("resetBtn").addEventListener("click",resetAll);

  render();
})();
