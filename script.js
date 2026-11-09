(function(){
const BT = "https://boringtask.ru";
const store = {
  get(k,d){try{const v=localStorage.getItem("nd_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("nd_"+k,JSON.stringify(v))}catch(e){}}
};
let done = store.get("done",{});
const fmt = n => Math.round(n).toLocaleString("ru-RU") + " ₽";
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function copyText(text, btn){
  const ok=()=>{const t=btn.textContent;btn.textContent="Скопировано";setTimeout(()=>btn.textContent=t,1400)};
  try{navigator.clipboard.writeText(text).then(ok,()=>fallback())}catch(e){fallback()}
  function fallback(){const pre=btn.closest(".panel").querySelector(".out");if(pre){const r=document.createRange();r.selectNodeContents(pre);const s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent="Выделено — нажмите Ctrl+C"}}
}

/* ---------- данные ---------- */
const SERVICES = [
  {id:"wb",name:"Карточки товаров для WB/Ozon",unit:"за карточку",min:700,max:2500,tool:"Генерация + удаление фона + текст на доске"},
  {id:"info",name:"Инфографика (пакет 5 слайдов)",unit:"за пакет",min:3000,max:10000,tool:"Генерация фона, слои, UI-элементы для плашек"},
  {id:"cover",name:"Обложки YouTube / VK Видео",unit:"за обложку",min:500,max:2000,tool:"Генерация, Маска для AI, цветокоррекция"},
  {id:"ads",name:"Рекламные креативы (10 шт.)",unit:"за пакет",min:3000,max:12000,tool:"Сравнение нескольких моделей в одном запросе"},
  {id:"photo",name:"AI-фотосессия для эксперта (20 фото)",unit:"за сессию",min:2500,max:8000,tool:"Стилизация портретов, детализация лица"},
  {id:"brand",name:"Логотип + мини-брендбук",unit:"за проект",min:6000,max:25000,tool:"Генерация, слои, доска-презентация"},
  {id:"video",name:"AI-ролик / Reels 10–15 сек",unit:"за ролик",min:3000,max:15000,tool:"Kling, Seedance, Wan — картинка в видео"},
  {id:"interior",name:"Визуализация интерьера",unit:"за ракурс",min:2000,max:8000,tool:"Генерация + Outpainting"},
  {id:"smm",name:"Ведение визуала соцсетей",unit:"в месяц",min:15000,max:45000,tool:"Пакетная генерация, шаблоны на доске"},
  {id:"proto",name:"Прототип лендинга / приложения",unit:"за проект",min:10000,max:35000,tool:"UI-компоненты, hover/focus события"}
];

const ART = {"car": "img/art-car.jpg", "lake": "img/art-lake.webp", "astro": "img/art-astro.jpg", "catA": "img/art-catA.jpg", "catB": "img/art-catB.jpg", "jetcat": "img/art-jetcat.jpg", "spacecat": "img/art-spacecat.jpg", "bwcar": "img/art-bwcar.jpg", "forest": "img/art-forest.jpg", "girl": "img/art-girl.jpg", "lambo": "img/art-lambo-card.jpg", "unicorn": "img/art-unicorn.webp", "peacock": "img/art-peacock.webp", "travel": "img/art-travel.jpg", "moodboard": "img/art-moodboard.jpg", "brandkit": "img/art-brandkit.jpg", "batch": "img/art-batch.jpg", "stairs": "img/art-stairs.jpg"};
const TRACKS = [
 {id:"A",name:"Старт и инструмент",color:"var(--sky)",text:"Разберётесь, за что платят нейродизайнеру, освоите Boringtask и научитесь писать промпты, которые слушаются."},
 {id:"B",name:"Практика: работы под заказ",color:"var(--sun)",text:"Сделаете реальные заказы: картинки, редактирование, видео — и соберёте из них портфолио."},
 {id:"C",name:"Деньги и свобода",color:"var(--hot)",ink:"#FFFFFF",text:"Найдёте первых клиентов, запустите блог, который приводит заявки, и спланируете уход с работы."}
];
const MODULES = [
 {id:"m0",track:"A",time:"20 мин",img:"astro",short:"Старт",title:"Карта пути: от зарплаты к своему делу",render:mStart,
  learn:["Как выглядит путь от первых заказов до ухода с работы","Сколько заказов заменят вашу зарплату — калькулятор","Лестница дохода на 6 месяцев"]},
 {id:"m1",track:"A",time:"30 мин",img:"unicorn",short:"Профессия",title:"Кто такой нейродизайнер и за что платят",render:m1,
  learn:["Какие услуги покупают чаще всего","Цены на 10 услуг для старта","Тест: какая ниша подходит именно вам"]},
 {id:"m2",track:"A",time:"45 мин",img:"compare",short:"Boringtask",title:"Мастерская: всё в одном окне Boringtask",render:m2,
  learn:["Экскурсия по интерфейсу онлайн-редактора","Генерация сразу в нескольких моделях","Шпаргалка по всем иконкам"]},
 {id:"ad",track:"A",time:"45 мин",img:"moodboard",short:"Арт-дирекшн",title:"Насмотренность и арт-дирекшн",render:mArt,
  learn:["Как тренировать насмотренность за 15 минут в день","Мудборд на доске Boringtask","Разбор референса по 6 осям и словарь стиля"]},
 {id:"pr",track:"A",time:"40 мин",img:"forest",short:"Промпты",title:"Промпты, которые слушаются с первого раза",render:mPrompt,
  learn:["Формула промпта из шести частей","Конструктор промптов под задачу","20 стилевых ядер и разбор ошибок"]},
 {id:"li",track:"B",time:"60 мин",img:"catB",short:"Изображения",title:"Практикум 1. Генерация изображений под заказ",render:()=>mLab("img"),
  learn:["Три реальных заказа шаг за шагом","Настройки «Опций» под каждую задачу","Как выбрать лучший вариант для клиента"]},
 {id:"le",track:"B",time:"60 мин",img:"car",short:"Редактирование",title:"Практикум 2. Редактор: доводим до уровня «можно продавать»",render:()=>mLab("edit"),
  learn:["Слои и корректирующие слои","Маска для AI, удаление фона, AI-масштаб","AI-функции, которые продаются отдельно"]},
 {id:"lv",track:"B",time:"50 мин",img:"jetcat",short:"Видео",title:"Практикум 3. Видео и Reels из картинки и текста",render:()=>mLab("video"),
  learn:["Текст в видео и картинка в видео","Промпт движения, который работает","Сборка Reels из нескольких сцен"]},
 {id:"bk",track:"B",time:"50 мин",img:"brandkit",short:"Бренд-кит",title:"Бренд-кит клиента: палитра, ядро стиля, шаблоны",render:mBrand,
  learn:["Из чего состоит бренд-кит и сколько он стоит","Палитра из референса пипеткой","Шаблоны постов на доске"]},
 {id:"ui",track:"B",time:"55 мин",img:"travel",short:"UI-прототипы",title:"UI и прототипы сайтов без кода",render:mUI,
  learn:["Вкладка «Генерировать UI» и дизайнерское пространство","Экран из UI-элементов","Кликабельный прототип"]},
 {id:"m3",track:"B",time:"40 мин",img:"lake",short:"Портфолио",title:"Портфолио, которое продаёт, за 7 дней",render:m3,
  learn:["Какие работы можно сделать для портфолио","Кейс «было → стало» для каждой","Где разместить портфолио"]},
 {id:"m4",track:"C",time:"60 мин",img:"catA",short:"Клиенты",title:"Первые клиенты и первые 30 000 ₽",render:m4,
  learn:["Где искать первых заказчиков","Холодное сообщение, на которое отвечают","Как назначать цену и брать предоплату"]},
 {id:"m5",track:"C",time:"50 мин",img:"peacock",short:"Блог",title:"Блог на ИИ, который приводит заказы",render:m5,
  learn:["Контент-план на 14 дней","Сценарии Reels для четырёх ниш","Как блог превращается в заявки"]},
 {id:"au",track:"C",time:"45 мин",img:"batch",short:"Автоматизация",title:"Автоматизация: 50 карточек за вечер",render:mAuto,
  learn:["Шаблоны пространств в Boringtask","Конвейер пакетной генерации","Библиотека промптов"]},
 {id:"m6",track:"C",time:"45 мин",img:"stairs",short:"Масштаб",title:"Масштабирование и уход с работы без риска",render:m6,
  learn:["Расчет стоимости абонементов и пакетов услуг","Зарубежные клиенты: что реально","Условия, при которых пора уходить"]},
 {id:"m7",track:"C",time:"30 мин",img:"bwcar",short:"Экзамен",title:"Экзамен и ваш план на 90 дней",render:m7,
  learn:["Тестирование по всему курсу и построение плана действий","Чек-лист готовности к заказам","Личный план на 90 дней"]}
];
const pic = k => ART[k]||SHOTS[k];
const trackOf = m => TRACKS.find(t=>t.id===m.track);
const idx = m => MODULES.indexOf(m);
const nn = i => String(i+1).padStart(2,"0");
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- shell ---------- */
const main=document.getElementById("main"), drawer=document.getElementById("drawer");
function progress(){
  const n=MODULES.filter(m=>done[m.id]).length;
  document.getElementById("progTxt").textContent=n+"/"+MODULES.length;
  document.getElementById("ringFg").style.strokeDashoffset=94.25*(1-n/MODULES.length);
  return n;
}
function nextUp(){return MODULES.find(m=>!done[m.id])||MODULES[MODULES.length-1]}
function drawDrawer(cur){
  document.getElementById("drawerList").innerHTML = TRACKS.map(t=>`<div class="dtrack" style="--tc:${t.color};--ti:${t.ink||'var(--tile-ink)'}"><h3><i></i>${t.name}</h3>
   ${MODULES.filter(m=>m.track===t.id).map(m=>`<button class="drow" data-go="${m.id}" aria-current="${m.id===cur}"><span class="dnum">${nn(idx(m))}</span><span><span class="dn">Модуль ${nn(idx(m))} · ${m.time}</span><br><span class="dt">${m.title}</span></span><span class="okdot ${done[m.id]?"done":""}">${done[m.id]?"✓":""}</span></button>`).join("")}</div>`).join("");
  document.querySelectorAll("#drawerList [data-go]").forEach(b=>b.onclick=()=>{closeDrawer();go(b.dataset.go)});
}
function openDrawer(){drawer.hidden=false;document.body.style.overflow="hidden";const c=drawer.querySelector('[aria-current="true"]')||drawer.querySelector(".drow");c&&c.focus()}
function closeDrawer(){drawer.hidden=true;document.body.style.overflow="";document.getElementById("progBtn").focus({preventScroll:true})}
document.getElementById("progBtn").onclick=openDrawer;
drawer.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeDrawer);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!drawer.hidden)closeDrawer()});
document.getElementById("homeBtn").onclick=()=>go("home");

function mcard(m){
  const i=idx(m), nx=nextUp();
  const st = done[m.id]?`<span class="st">✓ Пройден</span>`:(m.id===nx.id?`<span class="st now">Следующий</span>`:"");
  return `<button class="mcard rv" data-go="${m.id}"><span class="ph"><img src="${pic(m.img)}" alt="" loading="lazy"><span class="num">${nn(i)}</span>${st}</span>
   <span class="bd"><b>${m.title}</b><span>${m.learn[0]} · ${m.time}</span></span></button>`;
}

/* ---------- главная курса ---------- */
function home(){
  progress(); const nx=nextUp();
  return `<div class="view">
  <section class="hhero">
    <div class="hcopy">
      <span class="eyebrow">Онлайн-курс · 12 модулей · практика в Boringtask</span>
      <h1>Нейродизайнер.<span class="l2">Как заработать <span class="grad">деньги</span> на нейросетях</span></h1>
      <p class="lead">Нажать «Создать» может каждый, а сделать картинку, которая продаёт, — единицы. За 90 дней вы станете одним из них: научитесь доводить работы до уровня «можно продавать» и находить тех, кто за это заплатит.</p>
      <div class="row">
        <button class="btn line-n" id="openProg">Смотреть программу</button>
        <button class="btn sun" data-go="${nx.id}">${done[MODULES[0].id]?"Продолжить курс":"Начать курс"} →</button>
      </div>
      <div class="hstats"><span><b>12</b> модулей</span><span><b>6</b> тренажёров</span><span><b>3</b> практикума</span></div>
    </div>
    <div class="collage" aria-label="Работы, созданные в Boringtask">
      <figure class="c1 frame"><img src="${ART.astro}" alt="Портрет девушки-астронавта в разрушенном городе"></figure>
      <figure class="c3"><img src="${ART.spacecat}" alt="Кот в скафандре"></figure>
      <figure class="c2"><img src="${ART.lambo}" alt="Карточка товара: коллекционная модель Lamborghini"></figure>
      <figure class="c4"><img src="${ART.car}" alt="Неоновый спорткар"></figure>
      <figure class="c5"><img src="${ART.catA}" alt="Рыжий кот в снегу"></figure>
      <div class="gen-chip"><b>Сгенерировано в Boringtask</b><span class="typing" id="typer"></span></div>
    </div>
  </section>

  ${projHome()}
  <section class="shead rv" id="program"><div style="display:flex;flex-direction:column;gap:.5rem"><span class="eyebrow">Программа</span><h2>Три шага: инструмент → работы → деньги</h2></div>
   <p>Модули идут по порядку, но можно открыть любой. Прогресс сохраняется в этом браузере.</p></section>
  ${TRACKS.map((t,ti)=>{const ms=MODULES.filter(m=>m.track===t.id),d=ms.filter(m=>done[m.id]).length;return `
  <section class="track" style="--tc:${t.color};--ti:${t.ink||'var(--tile-ink)'}">
    <div class="ttile rv"><span class="eyebrow">Шаг ${ti+1} · ${ms.length} ${ms.length<5?"модуля":"модулей"}</span><h3>${t.name}</h3><p>${t.text}</p>
      <div class="tbar"><b style="width:${d/ms.length*100}%"></b></div><span class="tn">${ti+1}</span></div>
    <div class="cards">${ms.map(mcard).join("")}</div>
  </section>`}).join("")}

  <section class="shead rv"><div style="display:flex;flex-direction:column;gap:.5rem"><span class="eyebrow">Результат</span><h2>Что у вас будет в конце курса</h2></div></section>
  <div class="results">
    <div class="res rv"><img src="${ART.lake}" alt="" loading="lazy"><div><b>Портфолио</b><span>Работы с кейсами «было → стало»</span></div></div>
    <div class="res rv"><img src="${ART.catB}" alt="" loading="lazy"><div><b>Система поиска клиентов</b><span>Где искать, что писать и как рассчитать стоимость</span></div></div>
    <div class="res rv"><img src="${ART.forest}" alt="" loading="lazy"><div><b>Блог-витрина</b><span>Контент-план и сценарии Reels</span></div></div>
    <div class="res rv"><img src="${ART.bwcar}" alt="" loading="lazy"><div><b>План на 90 дней</b><span>Цифры, при которых можно уходить с работы</span></div></div>
  </div>

  <section class="toolblock rv">
    <div style="display:flex;flex-direction:column;gap:1rem;min-width:0">
      <span class="eyebrow">Рабочий инструмент курса</span>
      <h2>Всё делаете в одном окне Boringtask</h2>
      <ul>
        <li><span><b>Десятки нейросетей сразу.</b> Flux, Seedream, Nano Banana, GPT Image, Stable Diffusion — отметили галочками и сравнили.</span></li>
        <li><span><b>Редактор со слоями.</b> Маска для AI, удаление фона, AI-масштаб, цветокоррекция.</span></li>
        <li><span><b>Видео.</b> Текст в видео, картинка в видео, склейка роликов.</span></li>
        <li><span><b>Доски для клиентов.</b> ТЗ, правки и сдача работы по одной ссылке.</span></li>
      </ul>
      <div class="row"><a class="btn" href="${BT}" target="_blank" rel="noopener">Зарегистрироваться в Boringtask ↗</a></div>
    </div>
    <figure class="shot frame" style="margin:12px"><img src="${SHOTS.compare}" alt="Окно генерации Boringtask с двумя вариантами от разных моделей"></figure>
  </section>

  <section class="rv" style="display:flex;flex-direction:column;gap:1.2rem"><span class="eyebrow">Как проходит обучение</span>
   <div class="howto">
    <div><b>Читаете урок</b><span class="foot">Коротко и по делу, со скриншотами реального интерфейса.</span></div>
    <div><b>Повторяете в Boringtask</b><span class="foot">Промпты копируются в один клик, настройки расписаны по шагам.</span></div>
    <div><b>Считаете в тренажёрах</b><span class="foot">Калькулятор свободы, прайс, отклик клиенту, контент-план.</span></div>   </div></section>
  </div>`;
}

/* ---------- роутер ---------- */
let tocObs=null, tmr=null;
const NEED=60;
function markDone(m){
  done[m.id]=true; store.set("done",done); progress(); drawDrawer(m.id);
  const cm=main.querySelector(".cmeta"); if(cm&&!cm.querySelector(".pdone")) cm.insertAdjacentHTML("beforeend",`<span class="pill pdone" style="background:var(--money-soft);color:var(--money)">✓ Пройден</span>`);
  toast("Модуль «"+m.short+"» засчитан");
}
function startTimer(m){
  const el=main.querySelector("#timer");
  const draw=(sec)=>{ if(!el) return;
    el.hidden=!done[m.id];
    if(done[m.id]){el.className="timer ok";el.innerHTML="✓ Модуль пройден"}
  };
  let sec=0; draw(0);
  if(done[m.id]) return;
  tmr=setInterval(()=>{ if(document.hidden) return; sec++; if(sec>=NEED){clearInterval(tmr);tmr=null;markDone(m)} draw(sec) },1000);
}
function toast(t){
  let el=document.getElementById("toast"); if(!el){el=document.createElement("div");el.id="toast";el.className="toast";el.setAttribute("role","status");document.body.appendChild(el)}
  el.textContent=t; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
}
function go(id){
  if(tocObs){tocObs.disconnect();tocObs=null}
  if(tmr){clearInterval(tmr);tmr=null}
  if(String(id).startsWith("cert-")){
    const code=id.slice(5);
    main.innerHTML=certPage(code);
    try{history.replaceState(null,"","#"+id)}catch(e){}
    fillCert(code); progress(); drawDrawer(id); window.scrollTo({top:0}); return;
  }
  if(id==="home"){
    main.innerHTML=home();
    try{history.replaceState(null,"","#home")}catch(e){}
    store.set("last","home");
    const op=main.querySelector("#openProg"); if(op) op.onclick=()=>document.getElementById("program").scrollIntoView({behavior:reduce()?"auto":"smooth"});
    typer();
  } else {
    const m = MODULES.find(x=>x.id===id)||MODULES[0];
    const i = idx(m), t=trackOf(m);
    try{history.replaceState(null,"","#"+m.id)}catch(e){}
    store.set("last",m.id);
    main.innerHTML = `<div class="view" style="--tc:${t.color};--ti:${t.ink||'var(--tile-ink)'}">
     <header class="cover">
       <div class="ctext">
         <div class="cmeta"><span class="pill t">${t.name}</span><span class="pill">Модуль ${nn(i)} из ${MODULES.length}</span><span class="pill">⏱ ${m.time}</span>${done[m.id]?`<span class="pill" style="background:var(--money-soft);color:var(--money)">✓ Пройден</span>`:""}</div>
         <h1>${m.title}</h1>
         <ul class="learn">${m.learn.map(l=>`<li>${l}</li>`).join("")}</ul>
       </div>
       <div class="cimg frame"><div class="clip"><img src="${pic(m.img)}" alt=""></div></div>
     </header>
     <div class="mbody">
       <div class="lesson">${videoBlock(m)}${withExtra(m.id,m.render())}${m.id==="m7"?finalBlock():projectBlock(m)}${feedBlock(m)}</div>
       <aside class="toc" id="toc" aria-label="Разделы модуля"><span class="eyebrow toc-h">В этом модуле</span><div class="toc-list" id="tocList"></div>
         <div class="timer" id="timer"></div></aside>
     </div>
     ${footer(i)}
    </div>`;
    main.querySelectorAll(".lesson > section, .lesson > .panel").forEach(s=>s.classList.add("rv"));
    const hs=[...main.querySelectorAll(".lesson section h2")];
    const toc=main.querySelector("#toc");
    if(hs.length>1){
      hs.forEach((h,j)=>h.id="s"+j);
      main.querySelector("#tocList").innerHTML=hs.map((h,j)=>`<button data-to="s${j}"><span>${String(j+1).padStart(2,"0")}</span>${esc(h.textContent)}</button>`).join("");
      toc.querySelectorAll("[data-to]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.to).scrollIntoView({behavior:reduce()?"auto":"smooth",block:"start"}));
      let raf=0;
      const spy=()=>{raf=0;let cur=hs[0];for(const h of hs){if(h.getBoundingClientRect().top<160)cur=h;else break}
        toc.querySelectorAll("[data-to]").forEach(b=>b.classList.toggle("on",b.dataset.to===cur.id));
        const a=toc.querySelector(".on");if(a&&matchMedia("(max-width:1020px)").matches){toc.scrollLeft=a.offsetLeft-40}};
      const onS=()=>{if(!raf)raf=requestAnimationFrame(spy)};
      addEventListener("scroll",onS,{passive:true}); spy();
      tocObs={disconnect(){removeEventListener("scroll",onS)}};
    } else main.querySelector("#tocList").remove();
    main.querySelectorAll("[data-init]").forEach(el=>INIT[el.dataset.init](el));
    main.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copyText(document.getElementById(b.dataset.copy).textContent,b));
    startTimer(m);
  }
  progress();
  drawDrawer(id);
  main.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{go(b.dataset.go)});
  if(arguments[1]!==false) window.scrollTo({top:0});
}
function footer(i){
  const next=MODULES[i+1];
  const nx = next?`<button class="nextcard" data-go="${next.id}"><img src="${pic(next.img)}" alt="" loading="lazy"><div><span class="nx-h">Далее</span><span class="eyebrow" style="color:#fff;opacity:.8">Модуль ${nn(i+1)} · ${next.time}</span><b>${next.title}</b><span class="go">Перейти →</span></div></button>`
    :`<button class="nextcard" data-go="home"><img src="${ART.astro}" alt="" loading="lazy"><div><span class="eyebrow" style="color:#fff;opacity:.8">Курс пройден</span><b>Вернуться на главную курса и открыть Boringtask</b><span class="go">На главную →</span></div></button>`;
  return `<div class="endbar">${nx}</div>`;
}
let typerT=null;
function typer(){
  const el=document.getElementById("typer"); if(!el)return;
  const P=["Seedream 5 Lite · портрет, мягкий свет","Nano Banana 2 Lite · кот в снегу","GPT Image 2 · неоновый спорткар","Flux 1.1 Pro · астронавт на закате"];
  clearTimeout(typerT);
  if(reduce()){el.textContent=P[0];return}
  let p=0,c=0,del=false;
  (function tick(){ if(!document.body.contains(el))return;
    const s=P[p]; c+=del?-1:1; el.textContent=s.slice(0,c);
    let d=del?25:55; if(!del&&c===s.length){del=true;d=1800} else if(del&&c===0){del=false;p=(p+1)%P.length;d=300}
    typerT=setTimeout(tick,d)})();
}

/* ---------- модули ---------- */
function mStart(){return `
<section class="hero">
  <div class="panel">
    <p class="lead">Компании, селлеры и блогеры каждый день платят за картинки, карточки товаров и ролики. Нейросеть делает черновик за минуту — платят тому, кто доводит его до результата. Этот курс учит быть этим человеком и собрать поток заказов через свой блог.</p>
    <div class="grid">
      <div class="cell"><span class="k">Инструмент</span><span class="v">1 окно</span><span class="k">40+ нейросетей, редактор, видео и доски в Boringtask</span></div>
      <div class="cell"><span class="k">Практика</span><span class="v">12 модулей</span><span class="k">в каждом — тренажёр или рабочий инструмент</span></div>
      <div class="cell"><span class="k">Результат</span><span class="v">90 дней</span><span class="k">портфолио, первые клиенты, блог и план выхода</span></div>
    </div>
    <div class="row"><a class="btn ghost" href="${BT}" target="_blank" rel="noopener">Зарегистрироваться в Boringtask</a></div>
  </div>
  <div class="ticket" aria-label="Пример первого месяца">
    <span class="eyebrow" style="color:inherit;opacity:.7">Пример: первый месяц новичка</span>
    <div class="line"><span>8 карточек WB × 1 200</span><span>9 600 ₽</span></div>
    <div class="line"><span>2 пакета креативов × 5 000</span><span>10 000 ₽</span></div>
    <div class="line"><span>1 AI-фотосессия эксперта</span><span>4 000 ₽</span></div>
    <div class="line"><span>4 обложки YouTube × 900</span><span>3 600 ₽</span></div>
    <div class="line"><span>Тариф Boringtask</span><span>— расход</span></div>
    <span class="tot">≈ 27 200 ₽</span>
    <small>Расчёт по средним ценам из модуля 1. Это ориентир, а не обещание: доход зависит от вашей ниши, качества работ и числа откликов.</small>
  </div>
</section>

<section class="panel">
  <span class="tag">Лестница дохода</span>
  <h2>Четыре ступени, а не прыжок в пропасть</h2>
  <p class="prose">Уходить с работы в первый месяц — плохая идея. Мы идём по ступеням и переходим на следующую только по фактам.</p>
  <div class="ladder">
    <div class="rung"><span class="s">Недели 1–2</span><h3>Навык</h3><span>Осваиваете Boringtask, собираете 6–9 работ в портфолио.</span></div>
    <div class="rung"><span class="s">Недели 3–6</span><h3>Первые деньги</h3><span>3–5 клиентов, цель — 30 000 ₽ в месяц вечерами.</span></div>
    <div class="rung"><span class="s">Месяцы 2–3</span><h3>Поток</h3><span>Блог даёт входящие заявки, появляются постоянные клиенты.</span></div>
    <div class="rung"><span class="s">Месяцы 4–6+</span><h3>Свобода</h3><span>Доход 3 месяца подряд ≥ зарплаты и подушка на 3–6 месяцев.</span></div>
  </div>
</section>

<section class="panel tool" data-init="freedom">
  <span class="tag m">Калькулятор свободы</span>
  <h2>Сколько заказов нужно, чтобы заменить зарплату</h2>
  <div class="form">
    <label class="f">Ваша зарплата на руки, ₽/мес<input id="fz" type="number" min="0" step="1000" value="70000"></label>
    <label class="f">Средний чек заказа, ₽<input id="fc" type="number" min="0" step="100" value="4000"></label>
    <label class="f">Часов на один заказ<input id="fh" type="number" min="0.5" step="0.5" value="3"></label>
    <label class="f">Тариф Boringtask, ₽/мес<input id="ft" type="number" min="0" step="100" value="2500"></label>
  </div>
  <div class="grid" id="fout"></div>
  <p class="foot">Значения по умолчанию — пример. Подставьте стоимость своего тарифа с boringtask.ru и свой реальный чек. Налог самозанятого (4% с физлиц, 6% с компаний) учтён по ставке 6%.</p>
</section>`}

function m1(){return `
<section class="panel"><div class="prose">
  <p class="lead">Нейродизайнер продаёт не «картинку из нейросети», а готовый результат для бизнеса: карточку, которая продаёт, обложку, которую кликают, ролик, который смотрят.</p>
  <p>Клиенту неважно, чем вы работаете. Ему важно три вещи: <b>быстро</b>, <b>в его стиле</b> и <b>без переделок</b>. Нейросеть даёт скорость. Редактор Boringtask — контроль над деталями: убрать лишний палец, поправить свет, вписать текст. Именно этот второй шаг отличает профессионала от человека, который просто нажал «Создать».</p>
</div></section>

<section class="panel">
  <span class="tag m">Что продавать</span>
  <h2>10 услуг и рыночные цены</h2>
  <div class="tablewrap"><table>
    <thead><tr><th>Услуга</th><th>Цена новичка → опытного</th><th>Как делать в Boringtask</th></tr></thead>
    <tbody>${SERVICES.map(s=>`<tr><td>${s.name}</td><td class="num">${s.min.toLocaleString("ru-RU")}–${s.max.toLocaleString("ru-RU")} ₽ <span style="color:var(--muted);font-weight:400">${s.unit}</span></td><td>${s.tool}</td></tr>`).join("")}</tbody>
  </table></div>
  <p class="foot">Диапазоны — ориентиры по фриланс-биржам и Telegram-чатам. Перед стартом откройте 10 объявлений в своей нише и поставьте цену в нижней трети рынка.</p>
</section>

<section class="panel tool" data-init="niche">
  <span class="tag">Тест · 4 вопроса</span>
  <h2>Какая ниша принесёт вам деньги быстрее</h2>
  <div id="nicheQ" style="display:flex;flex-direction:column;gap:1.2rem"></div>
  <button class="btn" id="nicheBtn" style="align-self:flex-start">Показать мою нишу</button>
  <div id="nicheOut"></div>
</section>`}

function m2(){return `
<section class="panel"><div class="prose">
  <p class="lead">Boringtask заменяет нейродизайнеру четыре сервиса: генератор картинок, генератор видео, фоторедактор и онлайн-доску для клиентов. В этом модуле вы настроите рабочее место так, чтобы каждый заказ шёл по одному маршруту.</p>
</div></section>

<section class="panel">
  <span class="tag">Шаг 1</span><h2>Регистрация за 2 минуты</h2>
  <ol class="steps">
    <li><div>Откройте <a href="${BT}" target="_blank" rel="noopener">boringtask.ru</a> и нажмите <b>«Регистрация»</b> в правом верхнем углу.</div></li>
    <li><div>Введите имя (реальное или псевдоним) и email, нажмите «Регистрация». Система покажет пароль — сохраните его в менеджер паролей.</div></li>
    <li><div>Нажмите <b>«Click to continue»</b> — откроется рабочее пространство.</div></li>
  </ol>
</section>

<section class="panel">
  <span class="tag">Шаг 2</span><h2>Экскурсия по интерфейсу</h2>
  <div class="tablewrap"><table><thead><tr><th>Где</th><th>Кнопка</th><th>Зачем нейродизайнеру</th></tr></thead><tbody>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-image.png" alt="">Изображение</span></td><td>Генератор: изображения, видео, загрузка своих файлов, история запросов</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-modify.png" alt="">Редактирование изображения</span></td><td>Слои, кисти, Маска для AI, цветокоррекция, удаление фона</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-arrow.png" alt=""><img class="btn-ico" src="img/btn-frame.png" alt="">Стрелка / Рамка</span></td><td>Выбрать один объект или выделить несколько</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-stics.png" alt="">Стикеры</span></td><td>Комментарии клиента, ТЗ, отметки «этот вариант»</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-fig.png" alt="">Формы</span></td><td>Рамки под слайды, стрелки, схемы; есть даже игральная кость</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-text.png" alt="">Текст</span></td><td>Надписи на карточках и обложках на русском без ошибок</td></tr>
   <tr><td>Левая панель (волшебная палочка)</td><td><span class="btncell"><img class="btn-ico" src="img/btn-ui.png" alt="">UI-элементы</span></td><td>Панели, кнопки, баджи, поля — плашки для инфографики и прототипы сайтов</td></tr>
   <tr><td>Левая панель</td><td><span class="btncell"><img class="btn-ico" src="img/btn-img_gal.png" alt=""><img class="btn-ico" src="img/btn-templates.png" alt="">Галерея / Шаблоны</span></td><td>Готовые стикеры и структуры досок</td></tr>
   <tr><td>Верхняя панель</td><td><span class="btncell"><img class="btn-ico wide" src="img/btn-space.png" alt=""><img class="btn-ico" src="img/btn-new_space.png" alt="">Название пространства, создание нового пространства</span></td><td>Переименовать доску, создать новую под клиента</td></tr>
   <tr><td>Верхняя панель</td><td><span class="btncell"><img class="btn-ico wide" src="img/btn-scale.png" alt="">Масштаб</span></td><td>Проверить, как работа выглядит в маленьком размере</td></tr>
   <tr><td>Верхняя панель</td><td><span class="btncell"><img class="btn-ico wide" src="img/btn-share.png" alt="">Поделиться</span></td><td>Отправить клиенту ссылку на доску с работами</td></tr>
  </tbody></table></div>
</section>

<section class="panel">
  <span class="tag">Экскурсия по скриншотам</span><h2>Интерфейс Boringtask: где что нажимать</h2>
  <p class="prose">Откройте Boringtask во второй вкладке и пройдите по шагам — за 10 минут вы будете ориентироваться в нём уверенно.</p>
  <h3 class="ico-h">1. Регистрация за минуту</h3>
  <div class="shot-pair">
   ${SHOT("reg","На главной нажмите «РЕГИСТРАЦИЯ»: имя и e-mail → «РЕГИСТРАЦИЯ».")}
   ${SHOT("reg2","Сервис выдаст временный пароль. Сохраните его и нажмите «CLICK TO CONTINUE».")}
  </div>
  <div class="callout">Сразу смените временный пароль: «ПРОФИЛЬ» → Account Settings. Потом нажимайте «МОЁ ПРОСТРАНСТВО» на главной — откроется ваша доска.</div>
  <h3 class="ico-h">2. Доска</h3>
  ${SHOT("board","Пустое пространство. Сверху: название пространства с карандашом, создание нового пространства, изменение масштаба доски, кнопки «ПОДЕЛИТЬСЯ» и «ПРОФИЛЬ». Слева: инструменты доски.")}
  <h3 class="ico-h">2.1. Левая панель: стикеры, формы, текст, UI-элементы, галерея, шаблоны</h3>
  <div class="shot-pair">
   ${SHOT("stickers","«Стикеры»: 12 цветов. Удобно закрепить за каждым цветом смысл: жёлтый — идея, красный — правка клиента, зелёный — готово.")}
   ${SHOT("shapes","«Формы»: квадрат, треугольник, стрелка, звезда, многоугольники, круг, ромб, сердце, кубик.")}
  </div>
  ${SHOT("textbar","Текст можно писать прямо в стикере или форме. Панель: шрифт, размер, регистр «Aa», цвет, жирный/курсив/подчёркнутый, выравнивание и прочий функционал.")}
  <div class="shot-pair">
   ${SHOT("gallery","Кнопка с «диафрагмой» открывает галерею готовых картинок: эмодзи, сердце, домик, флажок.")}
   ${SHOT("templates","«Шаблоны»: готовые доски — Retro Template 1, Sprint Review with Target, Product Gap Analysis.")}
  </div>
  <div class="callout money">Шаблоны и стикеры — готовая основа для доски «ТЗ клиента»: колонки «Задача → Референсы → Черновики → Правки → Готово». Клиент видит процесс, и вам легче продать пакет вместо разовой картинки.</div>
  <h3 class="ico-h">3. Настройки пространства</h3>
  ${SHOT("space","Карандаш рядом с названием открывает «Настройки Пространства»: имя, тип пространства и кнопка «КЛОНИРОВАТЬ».")}
  <div class="prose"><ul>
   <li><b>Пространство для совместной работы</b> — для досок с клиентом и командой. Дизайн интерфейсов (UI-элементы) здесь недоступен.</li>
   <li><b>Дизайнерское пространство</b> — открыты все функции. Выбирайте его, если собираете макеты сайтов, инфографику с плашками, прототипы.</li>
  </ul></div>
  <div class="callout money"><b>Лайфхак.</b> Соберите одно «эталонное» пространство: доска для ТЗ, стикеры-этапы, шаблон портфолио. Под каждого нового клиента нажимайте «КЛОНИРОВАТЬ» и меняйте имя — онбординг занимает 2 минуты вместо 30.</div>
  <h3 class="ico-h">4. Окно «Создать Медиа Контент»</h3>
  ${SHOT("gen","Кнопка «Изображение» на левой панели открывает генератор. Слева — категории нейросетей, сверху — вкладки и баланс.")}
  <div class="prose"><ul>
   <li><b>Категории слева:</b> Основной Генератор, Текст в Видео, Картинка в Видео, Картинка в Картинку, Склеить Видео и другие — прокрутите список.</li>
   <li><b>Вкладки:</b> «Генерировать с AI» (картинка по промпту), «Локальный Файл» (загрузить своё), «Генерировать UI» (экраны интерфейсов), «Генерировать Видео».</li>
   <li><b>Под промптом:</b> «СОЗДАТЬ», «Опции» (модели и настройки), «История запросов». Ниже — «Галерея» с «Фильтрами».</li>
   <li><b>«БАЛАНС» и «ПОПОЛНИТЬ»</b> — генерации списываются с баланса. Когда пойдут заказы, считайте баланс расходником, как краски у художника: он окупается первым же клиентом.</li>
  </ul></div>
  <h3 class="ico-h">5. «Опции»: модели и настройки</h3>
  <div class="shot-pair">
   ${SHOT("opts","Отметьте галочками модели. Под каждой — свои настройки: соотношение сторон (Aspect Ratio), качество (Quality).")}
   ${SHOT("opts2","«Общие Настройки»: негативный промпт, ширина и высота. У Flux 1.1 Pro есть «Улучшение промпта» и «Начальное значение» (seed).")}
  </div>
  <p class="prose">В списке: Seedream5 Pro, Seedream 5 Lite, Nano Banana 2 и 2 Lite, GPT Image 2 и 1.5, Wan2.7 Text to Image, Qwen Text To Image, Flux 1.1 Pro, Stable Diffusion 3.5 и другие. Отметьте несколько — получите по варианту от каждой.</p>
  <h3 class="ico-h">6. Сравнение моделей в один клик</h3>
  ${SHOT("compare","Один промпт — две модели. Под каждой картинкой подписано, кто её сделал: nano-banana-2-lite и gpt-image-2-text-to-image.")}
  ${SHOT("gallery2","Все генерации сохраняются в «Галерее» под промптом. Подпись помогает найти удачный промпт и повторить его.")}
  <div class="callout">Покажите клиенту оба варианта — это выглядит как работа двух дизайнеров, а вы потратили одну минуту. Выбранный вариант кликом добавляете на доску.</div>
  <h3 class="ico-h">7. Загрузка своих файлов</h3>
  ${SHOT("local","Вкладка «Локальный Файл»: «Выберите файл» или перетащите файлы → «ЗАГРУЗИТЬ». Так добавляют фото товара или референсы клиента.")}
  <h3 class="ico-h">8. Панель над выбранной картинкой</h3>
  ${SHOT("toolbar","Клик по картинке на доске открывает панель: координаты, ширина и высота, кнопка редактирования (палитра), видео, скачивание, цвет холста и толщина рамки, скругление углов и прочий функционал.")}
  <div class="prose"><ul>
   <li><b>Вкладки:</b> Основное, Наведение, Фокус, Вне Фокуса, Действие, Переменные, Процесс — поведение элемента для интерактивных досок и прототипов.</li>
   <li><b>Палитра</b> открывает редактор изображения, прочие функции для редактирования изображения.</li>
   <li><b>Стрелка вниз</b> скачивает файл — его вы отправляете клиенту.</li>
  </ul></div>
  <h3 class="ico-h">9. Редактор изображения</h3>
  ${SHOT("editor","Палитра на панели картинки открывает редактор. Справа: «ПРИМЕНИТЬ»/«ОТМЕНИТЬ», два ряда инструментов, цвет и координаты, настройки инструмента, панель слоёв. Сверху появились стрелки отмены и повтора действия.")}
  <div class="shot-pair">
   ${SHOT("crop","Инструмент «Выбор»: выберите тип выделения (прямоугольник, круг, эллипс, свободная форма), выделите нужную область на изображении и нажмите «ОБРЕЗАТЬ».")}   ${SHOT("newlayer","Первая кнопка панели слоёв создаёт новый пустой слой: имя → «СОЗДАТЬ».")}
   ${SHOT("aimenu","«⋯» открывает AI-функции слоя: In-Paint, удаление фона, апскейл, замена освещения и материала, Out-Painting.")}
  </div>
</section>

<section class="panel">
  <span class="tag">Шпаргалка</span><h2>Иконки Boringtask: что за что отвечает</h2>
  <p class="prose">Так кнопки выглядят в интерфейсе. Эти же иконки стоят в шагах практикумов, чтобы вы сразу находили нужную.</p>
  <h3 class="ico-h">Верхняя панель</h3>${iconLegend(["Верхняя панель"])}
  <h3 class="ico-h">Левая панель доски</h3>${iconLegend(["Левая панель"])}
  <h3 class="ico-h">Редактор изображения</h3>${iconLegend(["Редактор","Панель над изображением"])}
  <h3 class="ico-h">Панель слоёв (под инструментами редактора)</h3>${iconLegend(["Панель слоёв"])}
  <h3 class="ico-h">UI-элементы — для макетов сайтов и приложений</h3>
  <div class="prose"><p>Собирайте из них экраны лендингов и приложений прямо на доске: это отдельная услуга — «прототип за день» для экспертов и малого бизнеса. UI-элементы работают в <b>Дизайнерском пространстве</b> — переключите тип в настройках пространства.</p></div><div class="shot-sm">${SHOT("uipanel","Кнопка с волшебной палочкой на левой панели открывает палитру UI-элементов.")}</div>
  ${iconLegend(["UI-элементы"])}
  ${SHOT("uilanding","Пример: главная страница турагентства, собранная на доске Boringtask. Шапка с меню, поле поиска, карточки направлений — такой прототип продаётся как отдельная услуга.")}
</section>

<section class="panel">
  <span class="tag">Шаг 3</span><h2>Настройте 4 пространства — и больше никакого хаоса</h2>
  <div class="grid">
    <div class="cell"><b>Референсы</b><span class="k">Скриншоты конкурентов и работ, которые нравятся. Пополняйте каждую неделю.</span></div>
    <div class="cell"><b>Портфолио</b><span class="k">Лучшие работы с подписями «задача → решение → срок». Ссылку ставите в блог.</span></div>
    <div class="cell"><b>Клиент: имя</b><span class="k">Одно пространство на одного клиента: бриф стикерами, варианты, финал.</span></div>
    <div class="cell"><b>Контент</b><span class="k">Посты и Reels для своего блога: до/после, обложки, черновики.</span></div>
  </div>
</section>

<section class="panel">
  <span class="tag">Шаг 4</span><h2>Маршрут любого заказа</h2>
  <ol class="steps">
    <li><div><b>Бриф.</b> Создайте пространство клиента, запишите ТЗ стикерами, вставьте его референсы через «Локальный Файл».</div></li>
    <li><div><b>Генерация.</b> Кнопка «Изображение» → промпт → «Опции» → 2–3 модели → «Создать».</div></li>
    <li><div><b>Отбор.</b> Лучшие варианты кликом добавляете на доску. Остальные доступны во вкладке «История запросов».</div></li>
    <li><div><b>Доработка.</b> Редактор: детали Маской для AI, фон, цвет, текст.</div></li>
    <li><div><b>Видео (по желанию).</b> Лучший кадр → «Картинка в видео» → увеличение до FHD.</div></li>
    <li><div><b>Показ.</b> «Поделиться» → клиент ставит стикер на выбранный вариант → 1–2 круга правок.</div></li>
    <li><div><b>Сдача.</b> После оплаты сохраняете финальные файлы и отправляете клиенту.</div></li>
  </ol>
  <div class="callout">Иногда деньги приносит вариант, который клиент не просил. Делайте одну дополнительную версию в другом стиле — это повышает шанс повторного заказа.</div>
</section>

<section class="panel">
  <span class="tag">Шаг 5</span><h2>Какую модель выбрать под задачу</h2>
  <div class="tablewrap"><table>
    <thead><tr><th>Задача</th><th>С чего начать</th><th>Совет</th></tr></thead>
    <tbody>
      <tr><td>Фото товара, реалистичный портрет</td><td>Flux 1.1 Pro, Seedream, Realistic Vision</td><td>Добавьте в промпт текст: "студийный свет, объектив 85 мм и мягкие тени" (studio lighting, 85mm, soft shadows).</td></tr>
      <tr><td>Текст и надписи на изображении</td><td>GPT Image, Nano Banana</td><td>Пишите текст в кавычках, коротко.</td></tr>
      <tr><td>Иллюстрация, арт, фэнтези</td><td>Stable Diffusion 3.5, DreamShaper</td><td>Снизьте CFG до 4–6 ради художественности.</td></tr>
      <tr><td>Мультяшный 3D-персонаж</td><td>Cartoon Samaritan 3D</td><td>CFG около 7.5 — золотая середина.</td></tr>
      <tr><td>Киберпанк, неон</td><td>Cyber Realistic</td><td>Сэмплер DPM2 a Karras подчёркивает детали.</td></tr>
      <tr><td>Короткий ролик, Reels</td><td>Kling, Seedance, Wan</td><td>Сначала идеальный кадр, потом «картинка в видео».</td></tr>
    </tbody></table></div>
  <div class="row"><button class="btn" data-go="pr">Далее: учимся писать промпты →</button></div>
</section>`}
const ICONS=[{"k": "space", "src": "img/icon-space.png", "l": "Пространство", "w": "Верхняя панель", "d": "Название рабочего пространства — нажмите карандаш, чтобы переименовать"}, {"k": "lang", "src": "img/icon-lang.png", "l": "Новое пространство", "w": "Верхняя панель", "d": "Создаёт новое пространство — например, отдельную доску под нового клиента"}, {"k": "zoom", "src": "img/icon-zoom.png", "l": "Масштаб доски", "w": "Верхняя панель", "d": "Приблизить/отдалить доску: − 100% +"}, {"k": "share", "src": "img/icon-share.png", "l": "ПОДЕЛИТЬСЯ", "w": "Верхняя панель", "d": "Ссылка на доску для клиента или команды"}, {"k": "profile", "src": "img/icon-profile.png", "l": "ПРОФИЛЬ", "w": "Верхняя панель", "d": "Аккаунт, тариф и баланс"}, {"k": "image", "src": "img/icon-image.png", "l": "Изображение", "w": "Левая панель", "d": "Генератор: картинки, видео, загрузка своих файлов, история запросов"}, {"k": "edit", "src": "img/icon-edit.png", "l": "Редактирование изображения", "w": "Левая панель", "d": "Открывает редактор со слоями и инструментами"}, {"k": "arrow", "src": "img/icon-arrow.png", "l": "Стрелка", "w": "Левая панель", "d": "Выбор объекта на доске"}, {"k": "select", "src": "img/icon-select.png", "l": "Рамка", "w": "Левая панель", "d": "Выделение нескольких объектов на доске сразу"}, {"k": "stickers", "src": "img/icon-stickers.png", "l": "Стикеры", "w": "Левая панель", "d": "Цветные стикеры (12 цветов) для идей, правок клиента и статусов"}, {"k": "shapes", "src": "img/icon-shapes.png", "l": "Формы", "w": "Левая панель", "d": "Квадрат, треугольник, стрелка, звезда, круг, ромб, многоугольники, сердце, кубик"}, {"k": "text", "src": "img/icon-text.png", "l": "Текст", "w": "Левая панель", "d": "Текст на доске или в стикере: шрифт, размер, цвет, жирный/курсив, выравнивание"}, {"k": "uiwand", "src": "img/icon-uiwand.png", "l": "UI-элементы", "w": "Левая панель", "d": "Палитра UI-компонентов: панель, кнопка, поле ввода, чек-бокс, радиокнопка, меню, ссылка, список, изображение, бадж, разделитель"}, {"k": "gallery", "src": "img/icon-gallery.png", "l": "Галерея изображений", "w": "Левая панель", "d": "Готовые картинки: эмодзи, сердце, домик, флажок — для живых досок"}, {"k": "templates", "src": "img/icon-templates.png", "l": "Шаблоны", "w": "Левая панель", "d": "Готовые доски: Retro Template, Sprint Review, Product Gap Analysis"}, {"k": "picker", "src": "img/icon-picker.png", "l": "Выбор цвета", "w": "Редактор", "d": "Пипетка: клик по картинке берёт цвет, значение видно в RGB. Клик по чёрному квадрату открывает палитру"}, {"k": "pick", "src": "img/icon-pick.png", "l": "Выбор", "w": "Редактор", "d": "Выделение: Прямоугольник, Круг, Эллипс, Произвольно → «ОБРЕЗАТЬ» или «УДАЛИТЬ»"}, {"k": "brush", "src": "img/icon-brush.png", "l": "Кисть", "w": "Редактор", "d": "Настройки: Размер (px), Жесткость (%), Скорость"}, {"k": "mask", "src": "img/icon-mask.png", "l": "Маска для AI", "w": "Редактор", "d": "Режимы In-Paint и Удаление Переднего Плана: закрасьте область → «ПРОДОЛЖИТЬ»"}, {"k": "fill", "src": "img/icon-fill.png", "l": "Заливка", "w": "Редактор", "d": "Заливка области, режим Solid"}, {"k": "line", "src": "img/icon-line.png", "l": "Линия", "w": "Редактор", "d": "Прямые линии: ширина в px, край «Сглаженная»"}, {"k": "eraser", "src": "img/icon-eraser.png", "l": "Ластик", "w": "Редактор", "d": "Настройки: Размер (px), Жесткость (%)"}, {"k": "move", "src": "img/icon-move.png", "l": "Перемещение", "w": "Редактор", "d": "Сдвиг слоя точно по X и Y в пикселях"}, {"k": "scale", "src": "img/icon-scale.png", "l": "Масштаб", "w": "Редактор", "d": "AI-масштаб (×2 и больше), Пропорциональный или Свободный → «МАСШТАБ»"}, {"k": "rotate", "src": "img/icon-rotate.png", "l": "Вращение", "w": "Редактор", "d": "Угол в градусах, по часовой или против → «ПОВОРОТ»"}, {"k": "dodge", "src": "img/icon-dodge.png", "l": "Просветление/затемнение", "w": "Редактор", "d": "Затемнить / Просветлить (есть режимы «Сохранение света»), Размер, Жесткость, Значение"}, {"k": "noise", "src": "img/icon-noise.png", "l": "Шум", "w": "Редактор", "d": "Цвет Переднего Плана или Оттенки Серого, Значение, Непрозрачность → «ШУМ»"}, {"k": "blur", "src": "img/icon-blur.png", "l": "Размытие", "w": "Редактор", "d": "Тип «Гаусс», Значение → «РАЗМЫТЬ»"}, {"k": "copy", "src": "img/icon-copy.png", "l": "Копия слоя", "w": "Редактор", "d": "Дубликат слоя для безопасных правок"}, {"k": "apply", "src": "img/icon-apply.png", "l": "ПРИМЕНИТЬ", "w": "Редактор", "d": "Сохранить изменения в изображении"}, {"k": "cancel", "src": "img/icon-cancel.png", "l": "ОТМЕНИТЬ", "w": "Редактор", "d": "Выйти без сохранения изменений"}, {"k": "save", "src": "img/icon-save.png", "l": "Сохранить", "w": "Панель над изображением", "d": "Скачать файл на компьютер"}, {"k": "newlayer", "src": "img/icon-newlayer.png", "l": "Новый слой", "w": "Панель слоёв", "d": "Пустой слой: введите имя → «СОЗДАТЬ»"}, {"k": "adjlayer", "src": "img/icon-adjlayer.png", "l": "Корректирующий слой", "w": "Панель слоёв", "d": "Цветокоррекция: Яркость/Контраст, Свет/Тени, Черное и Белое"}, {"k": "imglayer", "src": "img/icon-imglayer.png", "l": "Слой-изображение", "w": "Панель слоёв", "d": "Добавить картинку отдельным слоем"}, {"k": "more", "src": "img/icon-more.png", "l": "Ещё «⋯»", "w": "Панель слоёв", "d": "AI-функции слоя: In-Paint, удаление фона, апскейл, замена освещения и материала, Out-Painting"}, {"k": "trash", "src": "img/icon-trash.png", "l": "Удалить слой", "w": "Панель слоёв", "d": "Удаляет выбранный слой"}, {"k": "ui-panel", "src": "img/icon-ui-panel.png", "l": "Панель", "w": "UI-элементы", "d": "Карточка или блок экрана — основа макета"}, {"k": "ui-button", "src": "img/icon-ui-button.png", "l": "Кнопка", "w": "UI-элементы", "d": "Кнопка действия: «Купить», «Записаться», «Отправить»"}, {"k": "ui-input", "src": "img/icon-ui-input.png", "l": "Поле ввода", "w": "UI-элементы", "d": "Однострочное поле: e-mail, имя, поиск"}, {"k": "ui-textarea", "src": "img/icon-ui-textarea.png", "l": "Текстовая область", "w": "UI-элементы", "d": "Многострочное поле: комментарий, отзыв, сообщение"}, {"k": "ui-list", "src": "img/icon-ui-list.png", "l": "Список", "w": "UI-элементы", "d": "Выпадающий список / меню из нескольких пунктов"}, {"k": "ui-check", "src": "img/icon-ui-check.png", "l": "Чек-бокс", "w": "UI-элементы", "d": "Выбор нескольких значений из списка"}, {"k": "ui-radio", "src": "img/icon-ui-radio.png", "l": "Радиокнопка", "w": "UI-элементы", "d": "Выбор одного значения из нескольких"}, {"k": "ui-badge", "src": "img/icon-ui-badge.png", "l": "Бадж", "w": "UI-элементы", "d": "Метка статуса: «Новинка», «−20%», «Хит»"}, {"k": "ui-link", "src": "img/icon-ui-link.png", "l": "Ссылка", "w": "UI-элементы", "d": "Текст с гиперссылкой на другую страницу"}, {"k": "ui-image", "src": "img/icon-ui-image.png", "l": "Изображение", "w": "UI-элементы", "d": "Место под фото или иллюстрацию в макете"}, {"k": "ui-menu", "src": "img/icon-ui-menu.png", "l": "Меню", "w": "UI-элементы", "d": "Кнопка-«гамбургер» для навигации в мобильной версии"}, {"k": "ui-line", "src": "img/icon-ui-line.png", "l": "Разделитель", "w": "UI-элементы", "d": "Тонкая линия между блоками интерфейса"}];
/* ---------- практикум: данные ---------- */
const ALIAS={"UI-элементы":"uiwand","Маска для AI":"mask","Новый слой":"newlayer","⋯":"more","⋮":"more","Рамкой":"select","Рамка":"select","Перемещение":"move","Масштаб":"scale","Вращение":"rotate","Выбор цвета":"picker","Текст":"text","Стикеры":"stickers","Поделиться":"share","ПОДЕЛИТЬСЯ":"share","Профиль":"profile","Панель":"ui-panel","Кнопка":"ui-button","Меню":"ui-menu","Новое пространство":"lang","Поле ввода":"ui-input","Чек-бокс":"ui-check","Радиокнопка":"ui-radio","Бадж":"ui-badge","Ссылка":"ui-link","Выбор":"pick","Изображение":"image","Формы":"shapes","Ластиком":"eraser","Ластик":"eraser","Кисть":"brush","Цветокоррекция":"adjlayer","Корректирующий слой":"adjlayer","Галерея":"gallery","Шаблоны":"templates","Просветление/затемнение":"dodge","Копия слоя":"copy","Сохранить":"save","ПРИМЕНИТЬ":"apply","ОТМЕНИТЬ":"cancel","Стрелка":"arrow","Заливка":"fill","Линия":"line","Размытие":"blur","Шум":"noise","Редактирование":"edit"};
const SHOTS={"board": "img/shot-board.jpg", "space": "img/shot-space.jpg", "gen": "img/shot-gen.jpg", "opts": "img/shot-opts.jpg", "opts2": "img/shot-opts2.jpg", "compare": "img/shot-compare.jpg", "local": "img/shot-local.jpg", "toolbar": "img/shot-toolbar.jpg", "forest": "img/art-forest.jpg", "girl": "img/shot-girl.jpg", "reg": "img/shot-reg.jpg", "reg2": "img/shot-reg2.jpg", "stickers": "img/shot-stickers.jpg", "shapes": "img/shot-shapes.jpg", "textbar": "img/shot-textbar.jpg", "templates": "img/shot-templates.jpg", "gallery": "img/shot-gallery.jpg", "editor": "img/shot-editor.jpg", "crop": "img/shot-select-tool.png", "adj1": "img/shot-adj1.jpg", "adj2": "img/shot-adj2.jpg", "bw1": "img/shot-bw1.jpg", "bw2": "img/shot-bw2.jpg", "selmode": "img/shot-selmode.jpg", "brushset": "img/shot-brushset.jpg", "colorpick": "img/shot-colorpick.jpg", "inpaint": "img/shot-inpaint.jpg", "aimenu": "img/shot-aimenu.jpg", "newlayer": "img/shot-newlayer.jpg", "rmbg": "img/shot-rmbg.jpg", "sdopts": "img/shot-sdopts.jpg", "uilanding": "img/shot-uilanding.jpg", "t2v": "img/shot-t2v.jpg", "gallery2": "img/shot-gallery2.jpg", "lineset": "img/shot-lineset.jpg", "scalemenu": "img/shot-scalemenu.jpg", "scaleai": "img/shot-scaleai.jpg", "scaleprop": "img/shot-scaleprop.jpg", "rotate": "img/shot-rotate.jpg", "dodgemenu": "img/shot-dodgemenu.jpg", "dodgeset": "img/shot-dodgeset.jpg", "blurset": "img/shot-blurset.jpg", "noisemenu": "img/shot-noisemenu.jpg", "noiseset": "img/shot-noiseset.jpg", "uipanel": "img/shot-uipanel.jpg"};
const SHOT=(k,cap,alt)=>`<figure class="shot"><img src="${SHOTS[k]}" alt="${alt||cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
const ICON=k=>ICONS.find(i=>i.k===k);
const K = t => {const i=ICON(ALIAS[t]);if(!i)return `<span class="kbd">${t}</span>`;
  if(["apply","cancel","share","profile","space","zoom"].includes(i.k))return `<img class="ico-btn" src="${i.src}" alt="${i.l}">`;
  return `<span class="kbd ico"><img src="${i.src}" alt="">${t}</span>`};
const iconLegend=(filter)=>`<div class="ico-grid">${ICONS.filter(i=>!filter||filter.includes(i.w)).map(i=>`<div class="ico-card"><img src="${i.src}" alt="" class="${["apply","cancel","share","profile","space","zoom"].includes(i.k)?"wide":""}"><div><b>${i.l}</b><span>${i.w}</span><p>${i.d}</p></div></div>`).join("")}</div>`;
const LAB = {
 img:{label:"Генерация изображений",intro:"Три заказа, которые чаще всего покупают новички. Повторите каждый в Boringtask: промпт копируется кнопкой, настройки — как в окне генератора.",items:[
  {t:"Карточка товара для Wildberries",who:"Селлер посуды",price:"1 200 ₽ за карточку",time:"15 минут",
   prompt:"handmade ceramic coffee mug, matte sage green glaze, standing on light oak table, steam rising, scattered coffee beans, commercial product photography, soft window light from the left, clean background, highly detailed, sharp focus, vertical composition 3:4",
   neg:"blurry, low quality, text, watermark, distorted handle, extra objects",
   set:[["Модели в «Опциях»","Flux 1.1 Pro + Seedream"],["Соотношение сторон","3:4"],["Негативный промпт","есть"],["Seed","случайный"]],
   steps:[
    ["Откройте генератор",`На левой панели нажмите кнопку ${K("Изображение")}. Откроется окно: сверху поле «Промпт», справа лента способов генерации, снизу область результатов.`],
    ["Вставьте промпт",`Скопируйте промпт из блока слева и вставьте в поле «Промпт». Описывайте товар материалом, цветом и фактурой — так нейросеть не придумает чужой дизайн.`],
    ["Выберите 2 модели",`Откройте вкладку ${K("Опции ›")}. Отметьте галочками Flux 1.1 Pro и Seedream 5 Lite, с остальных моделей галочки снимите. У каждой поставьте соотношение 3:4.`],
    ["Негативный промпт",`В поле «Негативный промпт» вставьте строку из блока слева. Она убирает размытие, случайный текст и кривые ручки у кружки.`],
    ["Создайте и сравните",`Нажмите ${K("Создать")}. Через 10–60 секунд под каждой картинкой появится название модели. Сравните: у Flux обычно точнее фактура, у Seedream — свет.`],
    ["Добавьте на доску",`Кликните на лучший вариант — он встанет на доску. Дальше его можно доработать в редакторе (вкладка «Редактирование» этого практикума) и добавить текст инструментом ${K("Текст")}.`]]},
  {t:"AI-фотосессия для эксперта",who:"Психолог, коуч, тренер",price:"4 000 ₽ за 20 фото",time:"40 минут",
   prompt:"professional portrait of a confident woman in her 30s, psychologist, warm smile, beige linen blazer, sitting in a cozy bright office with plants, soft natural light, shallow depth of field, 85mm lens, cinematic, 4k, editorial photography",
   neg:"plastic skin, extra fingers, deformed face, oversaturated, cartoon",
   set:[["Модель","Seedream 5 Lite"],["Качество","Высокое"],["Соотношение","4:3 и 9:16"],["Серия","3 образа × 7 фото"]],
   steps:[
    ["Соберите бриф",`Спросите клиента: возраст, профессия, 3 образа (офис, улица, студия), цвета бренда. Запишите на доску клиента стикерами ${K("Стикеры")} — это будет ваше ТЗ.`],
    ["Первый образ",`В генераторе выберите в «Опциях» модель Seedream 5 Lite, качество «Высокое», соотношение 4:3. Вставьте промпт и нажмите ${K("Создать")}.`],
    ["Зафиксируйте стиль",`Понравившийся вариант — эталон. Не меняйте модель и ядро стиля промпта, меняйте только позу и место: «standing near window», «holding a cup of tea». Так серия выглядит как одна съёмка.`],
    ["Вертикальные версии",`Повторите 3–4 лучших кадра в 9:16 — это аватар и обложки для Stories. Клиенты ценят готовые форматы под соцсети.`],
    ["Подберите лучшие 20",`Откройте вкладку ${K("История запросов")}: все генерации сохранены. Кликом добавьте лучшие на доску клиента и покажите ему по ссылке ${K("Поделиться")}.`]]},
  {t:"Обложка YouTube с надписью",who:"Автор канала о финансах",price:"900 ₽ за обложку",time:"15 минут",
   prompt:"YouTube thumbnail, surprised young man pointing at a large glowing stack of coins, bold yellow text \"КАК Я СЭКОНОМИЛ 100 000\", dark blue gradient background, high contrast, rim light, sharp, 16:9",
   neg:"misspelled text, extra letters, blurry face, low contrast",
   set:[["Модели","GPT Image + Nano Banana"],["Соотношение","16:9"],["Текст","в кавычках, до 5 слов"]],
   steps:[
    ["Модели, которые пишут текст",`В «Опциях» отметьте GPT Image и Nano Banana — они лучше остальных выводят надписи. Соотношение 16:9.`],
    ["Текст в кавычках",`Надпись пишите в промпте в двойных кавычках и коротко. Если буквы «поплыли», уберите текст из промпта и добавьте его потом инструментом ${K("Текст")} на доске.`],
    ["Сравните на маленьком размере",`Уменьшите масштаб доски кнопками масштаба сверху: обложку видят размером с ноготь. Выигрывает вариант, где лицо и цифра читаются на маленьком размере.`],
    ["Сохраните файл",`Нажмите на изображение и в появившейся сверху панели нажмите кнопку ${K("Сохранить")} — файл скачается на компьютер.`]]},
  {t:"Инфографика для карточки: 5 слайдов",who:"Селлер косметики",price:"5 000 ₽ за пакет",time:"60 минут",
   prompt:"glass serum bottle with golden dropper on a pale pink podium, water droplets, fresh rose petals around, soft studio light, minimalist premium beauty product photography, empty space on the left for text, vertical 3:4",
   neg:"text, letters, watermark, clutter, harsh shadows",
   set:[["Модели","Flux 1.1 Pro + Seedream"],["Соотношение","3:4"],["Фон под текст","«empty space on the left»"],["Плашки","UI-элементы: Панель, Бадж"]],
   steps:[
    ["Разложите структуру",`Классический пакет: 1 — главное фото, 2 — 3 преимущества, 3 — состав, 4 — как применять, 5 — размер и комплект. Набросайте 5 рамок на доске инструментом ${K("Формы")} → прямоугольник.`],
    ["Фото без текста",`Генерируйте сцены без надписей: в промпте «empty space on the left for text», в негативном — «text, letters». Текст нейросети на русском почти всегда с ошибками, поэтому его кладём сами.`],
    ["Серия в одном стиле",`Для слайдов 2–5 меняйте только ракурс и окружение: «top view», «close-up of dropper», «hand holding bottle». Ядро стиля (pale pink, soft studio light) не трогайте — получится единая серия.`],
    ["Плашки и иконки",`Проверьте, что пространство дизайнерское (карандаш у названия → «Дизайнерское пространство»). Нажмите на левой панели ${K("UI-элементы")} (волшебная палочка) → ${K("Панель")} для полупрозрачной подложки под текст и ${K("Бадж")} для меток «−30%», «Хит». Цвет и прозрачность меняются в панели сверху.`],
    ["Текст",`Инструментом ${K("Текст")} растяните область, впишите преимущество в 3–5 слов. Один шрифт на весь пакет, 2 размера: заголовок и подпись.`],
    ["Экспорт",`Выделите слайд ${K("Рамкой")}, проверьте читаемость при уменьшении и сохраните каждое изображение кнопкой ${K("Сохранить")} в панели сверху.`]]},
  {t:"Логотип и паттерн для кофейни",who:"Новая кофейня «Зерно»",price:"8 000 ₽ за логотип + 3 текстуры",time:"90 минут",
   prompt:"minimalist logo emblem for a coffee shop, single coffee bean forming a stylized leaf, flat vector, two colors deep espresso brown and warm cream, centered on plain background, clean geometric lines",
   neg:"photo, 3D, gradient, text, many colors, complex details",
   set:[["Модели","Stable Diffusion 3.5 + GPT Image"],["Соотношение","1:1"],["Цвета","2, прописаны в промпте"],["Вариантов","12–16 на выбор"]],
   steps:[
    ["Задайте палитру словами",`Выберите 2–3 цвета и пропишите их в каждом промпте одинаково: «deep espresso brown and warm cream». Это главный секрет единого стиля.`],
    ["Сгенерируйте 12+ знаков",`Отметьте в «Опциях» 2–3 модели и запустите генерацию 3–4 раза. Логотип — это выбор из многих вариантов, а не одна удачная попытка.`],
    ["Отбор на доске",`Сложите лучшие 6 знаков на доску, дайте клиенту доступ ${K("Поделиться")} и попросите поставить стикер на 2 любимых.`],
    ["Чистка",`В редакторе уберите артефакты ${K("Ластиком")} и Маской для AI. Для простого знака уберите фон через «Удаление фона» — получите PNG с прозрачностью.`],
    ["Паттерны",`Промпт «seamless pattern of small coffee beans and leaves, flat vector, deep espresso brown on warm cream background» даст фон для упаковки. Сделайте 3 варианта плотности.`],
    ["Мини-брендбук",`На отдельной доске соберите: знак, 2 цвета, 3 паттерна, пример на стакане. Это и есть продукт за 8 000 ₽, а не «картинка с логотипом».`]]},
  {t:"Визуализация интерьера в 3 стилях",who:"Дизайнер интерьеров или агент недвижимости",price:"3 000 ₽ за ракурс",time:"30 минут",
   prompt:"spacious living room, scandinavian interior, light oak floor, white walls, linen sofa in light grey, large window with daylight, indoor plants, wool rug, architectural photography, wide angle, photorealistic, 16:9",
   neg:"distorted furniture, warped walls, people, clutter, low quality",
   set:[["Модели","Flux + Realistic Vision"],["Соотношение","16:9"],["Стили","сканди / лофт / минимализм"],["Расширение","Outpainting для панорамы"]],
   steps:[
    ["Опишите комнату как планировку",`Тип комнаты, пол, стены, окно, 3–4 ключевых предмета мебели. Чем конкретнее, тем меньше «фантазий» нейросети.`],
    ["Три стиля за 3 запуска",`Меняйте только стилевой блок: «scandinavian… light oak» → «industrial loft, exposed brick, black metal» → «minimalism, white, hidden storage». Остальной промпт тот же.`],
    ["Исправьте геометрию",`Кривые линии стен и окон поправьте Маской для AI: закрасьте участок, опишите «straight window frame» и нажмите ${K("Продолжить")}.`],
    ["Свет",`Корректирующий слой ${K("Свет/тени")} — тени +20. Интерьеры продаются светлыми.`],
    ["Презентация",`Положите 3 стиля рядом на доску и подпишите стикерами. Клиент видит выбор — и часто заказывает ещё ракурсы.`]]}
 ]},
 edit:{label:"Редактирование",intro:"Генерация даёт 80% результата. Оставшиеся 20% — редактор, и именно за них клиент платит больше. Все шаги выполняются в режиме редактирования: нажмите на изображение и затем на кнопку редактирования.",items:[
  {t:"Убрать фон и поставить товар в новую сцену",who:"Селлер с фото на телефоне",price:"700 ₽ за фото",time:"10 минут",
   prompt:"empty light oak table near a bright window, soft morning light, blurred cozy kitchen background, commercial photography, 3:4",
   set:[["Исходник","фото клиента («Локальный Файл»)"],["Инструмент","Удаление фона, тип «Объект»"],["Новый фон","генерация + новый слой"]],
   steps:[
    ["Загрузите фото клиента",`Откройте генератор ${K("Изображение")}, вкладка ${K("Локальный Файл")} → ${K("Выберите файл")} → ${K("Загрузить")}. Фото появится на доске.`],
    ["Откройте редактор",`Нажмите на фото, затем на ${K("Редактирование")}. Все инструменты справа, история изменений и масштаб — на верхней панели.`],
    ["Удалите фон",`В панели слоёв нажмите ${K("⋯")} → ${K("Удаление фона")} (для товара — «Удаление Фона Продукта») → ${K("Создать")}. В окне «Configure Удаление Фона Layer» поставьте «Тип источника»: ${K("Объект")} и нажмите ${K("Генерировать")}.${SHOT("rmbg","Окно удаления фона")}`],
    ["Скройте исходник",`У слоя Layer 1 нажмите на «глаз». Останется товар на прозрачном фоне.`],
    ["Подложите новый фон",`Сгенерируйте фон по промпту слева, добавьте его новым слоем и перетащите под слой с товаром. Инструментом ${K("Перемещение")} поставьте товар на стол (точно — полями X и Y).`],
    ["Сохраните",`Нажмите ${K("ПРИМЕНИТЬ")}, чтобы сохранить изменения, и скачайте файл. Сделайте ещё 2 фона — клиент выберет, а вы покажете, что дали больше, чем просили.`]]},
  {t:"Исправить ошибку нейросети Маской для AI",who:"Любой заказ с людьми",price:"входит в заказ, экономит переделку",time:"5 минут",
   prompt:"natural relaxed hand holding a coffee cup, five fingers, realistic skin",
   set:[["Инструмент","Маска для AI"],["Размер кисти","чуть больше дефекта"],["Альтернатива","Удаление переднего плана"]],
   steps:[
    ["Найдите дефект",`Типичные ошибки: шестой палец, лишний предмет, кривая надпись, странный глаз. Увеличьте место инструментом масштаба на верхней панели.`],
    ["Выберите Маску для AI",`В правой панели выберите ${K("Маска для AI")}, режим «In-Paint». В поле «Размер» задайте кисть чуть больше дефекта.${SHOT("inpaint","Режимы Маски для AI")}`],
    ["Закрасьте область",`Проведите кистью только по проблемному месту. Чем точнее маска, тем незаметнее исправление.`],
    ["Опишите, что должно быть",`Коротко опишите правильный результат, как в промпте слева, и нажмите ${K("Продолжить")}. Нейросеть перерисует только закрашенную область.`],
    ["Если нужно просто убрать",`Для лишнего объекта в той же ${K("Маска для AI")} переключите режим на ${K("Удаление переднего плана")}, закрасьте его и нажмите ${K("Продолжить")} — фон дорисуется сам.`]]},
  {t:"Цветокоррекция и увеличение под печать",who:"Тусклое фото или генерация «без жизни»",price:"+300–500 ₽ к заказу",time:"7 минут",
   set:[["Яркость / контраст","+15 / +20"],["Свет / тени","тени +25, свет −10"],["Масштаб","нейросетью, ×2"]],
   steps:[
    ["Яркость и контраст",`В панели слоёв нажмите ${K("Корректирующий слой")}. В поле «Тип корректировки» выберите ${K("Яркость/контраст")} → ${K("Создать")}. Яркость +15%, контраст +20%, галочку «Preserve luminocity» оставьте → ${K("Готово")}.`],
    ["Свет и тени",`Снова ${K("Корректирующий слой")} → ${K("Свет/тени")} → ${K("Создать")}. Тени +25 вытянут детали, свет −10 уберёт пересвет. ${K("Готово")}.`],
    ["Проверьте до/после",`Каждая коррекция — отдельный корректирующий слой. Выключите «глаз» у слоя, чтобы сравнить. Скриншот до/после — готовый пост для блога.`],
    ["Сохраните",`Нажмите ${K("ПРИМЕНИТЬ")}.`],
    ["Увеличьте разрешение",`Инструмент ${K("Масштаб")} → в списке «AI-масштаб» → коэффициент 2 → кнопка «МАСШТАБ». Для баннеров и печати этот шаг обязателен.${SHOT("scaleai","AI-масштаб")}`]]},
  {t:"Наложение текстуры через слои и режимы",who:"Обложки, постеры, винтажный стиль",price:"+500 ₽ к обложке",time:"10 минут",
   prompt:"old paper texture, subtle grain, light beige, scratches and fibers, flat scan, seamless",
   set:[["Слой 1","Портрет / основное фото"],["Слой 2","Текстура бумаги"],["Режим наложения","Перекрытие (Overlay)"],["Непрозрачность","40–60%"]],
   steps:[
    ["Сгенерируйте текстуру",`Промпт слева даст ровный скан бумаги. Квадрат 1:1 подойдёт к любому формату.`],
    ["Поставьте её слоем сверху",`В редакторе добавьте текстуру новым слоем поверх фото. Слои двигаются перетаскиванием в панели слоёв.`],
    ["Режим наложения",`У слоя текстуры выберите режим ${K("Перекрытие")}. Текстура смешается с фото и даст эффект печати. Попробуйте также «Мягкий свет» и «Умножение».`],
    ["Сила эффекта",`Опустите непрозрачность до 40–60%. Если эффект виден с первого взгляда — его слишком много.`],
    ["Без разрушения",`Исходник не тронут: выключите «глаз» у текстуры — вернётся чистое фото. Поэтому клиенту можно отдать обе версии.`]]},
  {t:"Ч/Б и кривые для «дорогого» вида",who:"Портреты, бренды одежды, мероприятия",price:"входит в ретушь",time:"5 минут",
   set:[["Корректирующий слой","Черное и белое"],["Каналы","Красные 40 · Жёлтые 60 · Зелёные 30 · Голубые 80"],["Контраст","Кривые, S-образная"]],
   steps:[
    ["Добавьте слой Ч/Б",`${K("Корректирующий слой")} → «Тип корректировки»: ${K("Черное и белое")} → ${K("Создать")}. Пресет «Нейтральный», затем ползунками Красный/Желтый осветлите кожу, Синим затемните небо → ${K("Готово")}.${SHOT("bw2","Так выглядят настройки Ч/Б")}`],
    ["Настройте каналы",`Ползунки каналов меняют, как цвет становится серым. Красные 40 и жёлтые 60 делают кожу светлой и чистой, голубые 80 затемняют небо.`],
    ["Добавьте контраст",`Новый корректирующий слой ${K("Кривые")}: поднимите светлую часть кривой и опустите тёмную — получится S-образная кривая и «журнальная» глубина.`],
    ["Сохраните",`Нажмите ${K("Готово")}. Корректирующие слои не меняют пиксели: выключите их «глаз», и цвет вернётся.`]]},
  {t:"Ретушь портрета для обложки",who:"Эксперт, блогер, спикер",price:"1 500 ₽ за портрет",time:"20 минут",
   set:[["Детализация лица","глубина 75–80%"],["Сглаживание кожи","умеренное"],["Просветление/затемнение","dodge & burn, 10–15%"],["Улучшение","шумоподавление"]],
   steps:[
    ["Улучшите качество",`Если фото с телефона, начните с инструмента «Улучшение изображения»: шумоподавление и резкость.`],
    ["Детализация лица",`«Детализация лица» с глубиной 75–80% восстановит глаза и черты. Больше 85% даёт «пластиковую» кожу — клиенты это замечают.`],
    ["Объём светом",`Инструмент ${K("Просветление/затемнение")}: режим «Просветлить (Сохранение света)», Значение 10–15% — по скулам и лбу; «Затемнить (Сохранение света)» — по контуру лица. Размер кисти большой, Жесткость 0%.`],
    ["Фон",`Уберите фон и подложите однотонный или размытый. Для обложки оставьте место под заголовок.`],
    ["Цвет",`Финальный корректирующий слой ${K("Яркость/контраст")}: +5…+10. Сравните с исходником — разница должна быть видна, но не кричать.`]]}
 ]},
 video:{label:"Создание видео",intro:"Видео стоит в 3–5 раз дороже картинки, а делается из той же картинки. Правило: сначала идеальный кадр, потом движение.",items:[
  {t:"Оживить карточку товара",who:"Селлер — видеообложка WB",price:"2 500 ₽ за ролик",time:"10 минут",
   prompt:"slow cinematic camera push-in, steam gently rising from the mug, soft light flickering, coffee beans slightly rolling, smooth motion, no camera shake",
   set:[["Тип","Картинка в видео (Image2Video)"],["Модель","Kling 3.0 или Seedance"],["First Frame Image","готовая карточка"],["Длительность","5 сек"]],
   steps:[
    ["Возьмите готовый кадр",`Используйте карточку из примера «Карточка товара» — она уже отретуширована. Хороший исходник — главное условие плавной анимации.`],
    ["Выберите Картинку в видео",`В генераторе в правой ленте выберите способ «Картинка в видео» и модель Kling 3.0 или Seedance. Загрузите кадр в поле First Frame Image.`],
    ["Опишите движение, а не объект",`Промпт для видео описывает, что двигается: пар, свет, камера. Объект нейросеть уже видит на кадре. Скопируйте промпт слева.`],
    ["Сгенерируйте 2 варианта",`Запустите генерацию дважды или двумя моделями. Выберите вариант без дрожания и искажений товара.`],
    ["Сдайте клиенту",`Добавьте ролик на доску клиента. Совет: продавайте пакет «карточка + видеообложка» — чек вырастает в 3 раза.`]]},
  {t:"Reels с нуля по тексту",who:"Кофейня, эксперт, бренд",price:"5 000 ₽ за ролик",time:"30 минут",
   prompt:"cozy morning coffee shop, barista pouring latte art in slow motion, warm golden sunlight through window, steam, shallow depth of field, cinematic, smooth camera movement, vertical 9:16",
   set:[["Тип","Текст в видео (Text2Video)"],["Модель","WAN 2.7 или Kling"],["Соотношение","9:16"],["Шаги инференса","40"],["Длительность","5 сек"]],
   steps:[
    ["Разбейте ролик на сцены",`15-секундный Reels = 3 сцены по 5 секунд: атмосфера → процесс → результат с текстом. Распишите их стикерами на доске клиента.`],
    ["Сгенерируйте сцену 1",`Выберите «Текст в видео», модель WAN 2.7, соотношение 9:16, шаги инференса 40. Чем подробнее промпт, тем лучше — видео-модели любят детали.`],
    ["Сохраните стиль",`Для сцен 2 и 3 копируйте ту же часть про свет и камеру («warm golden sunlight… cinematic»), меняйте только действие. Тогда сцены склеятся без скачков.`],
    ["Проверьте плавность",`Если движение дёргается, поднимите шаги инференса до 50 и перегенерируйте. Для спокойных сцен этого достаточно.`],
    ["Переходите к сборке",`Три готовые сцены собираете в один ролик — это следующий пример.`]]},
  {t:"Склейка ролика и увеличение до FHD",who:"Финал любого видеозаказа",price:"входит в ролик",time:"10 минут",
   set:[["Склейка","Склеить видео"],["Зацикливание","Luma Ray, Loop: Yes"],["Увеличение","FHD 1920×1080, RealESRGAN_x4plus"],["Crop to Fit","Yes"]],
   steps:[
    ["Соберите сцены",`Инструментом «Склеить видео» объедините 3 сцены по порядку и добавьте мягкие переходы.`],
    ["Нужен бесконечный фон?",`Для фона сайта или заставки сгенерируйте ролик в Luma Ray с параметром «Зациклить: Yes» — он повторяется без шва.`],
    ["Увеличьте качество",`Откройте «AI Увеличение видео»: Resolution — FHD (1920×1080), модель — RealESRGAN_x4plus, Crop to Fit — Yes. Ролик из 720p станет чётким для рекламы.`],
    ["Добавьте текст и музыку",`Призыв к действию («Скачай меню», «Запишись») поставьте в последние 3 секунды. Музыку клиент обычно добавляет сам в соцсети.`],
    ["Сдайте и сделайте пост",`Сдайте ролик на доске. С разрешения клиента выложите в свой блог «как я сделала Reels для кофейни за 30 минут» — это ваш следующий лид.`]]},
  {t:"Живое фото эксперта для аватара и Stories",who:"Эксперт после AI-фотосессии",price:"1 500 ₽ за ролик",time:"10 минут",
   prompt:"the woman gently smiles and slightly turns her head toward the camera, hair moves softly in the breeze, subtle natural blinking, static camera, realistic motion",
   set:[["Тип","Картинка в видео"],["Модель","Seedance 2.0 Avatar или Kling 3.0"],["Кадр","портрет из фотосессии"],["Соотношение","9:16"]],
   steps:[
    ["Выберите портрет",`Лучше всего оживают кадры, где лицо смотрит почти в камеру и есть свободное место вокруг головы.`],
    ["Минимум движения",`Для лиц описывайте маленькие движения: улыбка, поворот головы, моргание, волосы. Большие движения ломают черты лица.`],
    ["Камера стоит",`Добавьте «static camera» — иначе модель может «поехать» и лицо исказится.`],
    ["Проверьте лицо",`Посмотрите ролик на паузах: глаза, зубы, пальцы. Если есть искажение — перегенерируйте, меняя только формулировку движения.`],
    ["Продайте апсейлом",`Предлагайте живые фото как допродажу к фотосессии: «3 живых аватара за 3 500 ₽». Это 10 минут работы на каждый.`]]},
  {t:"Плавное slow-motion и звук",who:"Рекламный ролик, спорт, еда",price:"+1 000 ₽ к ролику",time:"15 минут",
   prompt:"a drop of honey slowly falling onto a stack of pancakes, macro, golden backlight, extreme slow motion, smooth motion",
   set:[["Интерполяция","30 → 60 fps, замедление 2×"],["Hunyuan Flow Shift","12 для динамики, 6–8 для спокойных сцен"],["Звук","огибающая: fade in 0.2 с, fade out 0.5 с"]],
   steps:[
    ["Генерация",`Создайте 3–5-секундный ролик по промпту слева. Для динамичных сцен в модели Hunyuan поднимите Flow Shift до 12 и шаги до 50 — движение станет ровнее.`],
    ["Интерполяция кадров",`Через инструмент интерполяции поднимите 30 fps до 60 и включите замедление 2×: 5 секунд превратятся в 10 плавных секунд без рывков.`],
    ["Звуковой акцент",`На момент падения капли поставьте звук «удар» с плавным нарастанием (fade in 0.2 с) и затуханием (0.5 с). Звук в такт делает ролик дороже.`],
    ["Проверка",`Смотрите на телефоне со звуком: так ролик увидит аудитория клиента.`]]}
 ]}
};

const LAB_THEORY = {
 img:`<section class="panel"><span class="tag">Теория за 5 минут</span><h2>Как Boringtask превращает текст в картинку</h2>
  <div class="prose">
   <p>Генератор начинает с шума и шаг за шагом «проявляет» изображение по вашему описанию. Отсюда три правила, которые экономят часы:</p>
   <ul>
    <li><b>Одна задача — несколько моделей.</b> В Boringtask вы отмечаете 2–3 модели в «Опциях» и сразу видите разные трактовки. Подпись под картинкой показывает, какая модель её сделала.</li>
    <li><b>Seed («Начальное значение») — это «номер черновика».</b> Тот же seed и тот же промпт дают похожий результат. Пустое поле — каждый раз новый вариант.</li>
    <li><b>Текст на русском делайте сами.</b> Нейросети ошибаются в кириллице. Генерируйте фон с местом под надпись и добавляйте текст инструментом «Текст».</li>
   </ul></div>
  <div class="tablewrap"><table><thead><tr><th>Параметр в «Опциях»</th><th>Что делает</th><th>Для заказов ставьте</th></tr></thead><tbody>
   <tr><td>Негативный промпт (Общие Настройки)</td><td>Что убрать из картинки</td><td>blurry, watermark, extra fingers, distorted text</td></tr>
   <tr><td>Ширина / Высота (Общие Настройки)</td><td>Размер в пикселях, по умолчанию 1024</td><td>Оставьте 1024, формат задавайте соотношением сторон</td></tr>
   <tr><td>Соотношение сторон / Aspect Ratio</td><td>Формат кадра у конкретной модели</td><td>3:4 карточки, 9:16 Stories, 16:9 обложки, 1:1 посты</td></tr>
   <tr><td>Quality</td><td>Качество (GPT Image 2: 1K…, Seedream 5 Lite: high)</td><td>Черновики — ниже, финал клиенту — максимум</td></tr>
   <tr><td>Улучшение промпта (Flux 1.1 Pro)</td><td>Модель сама дописывает детали</td><td>Yes для идей, No для точного ТЗ</td></tr>
   <tr><td>Начальное значение (seed)</td><td>«Номер черновика»</td><td>Пусто — новый вариант; число — повторить удачный</td></tr>
   <tr><td>Выходные изображения (Stable Diffusion 3.5)</td><td>Сколько вариантов за запуск, 1–4</td><td>4 на поиске идеи, 1 на доработке</td></tr>
   <tr><td>Шаги шумоподавления (SD 3.5, SDXL)</td><td>Сколько раз модель уточняет картинку. По умолчанию 25 у SD 3.5, 75 у SDXL</td><td>Оставьте по умолчанию; меньше — быстрее черновик</td></tr>
   <tr><td>Степень соответствия (по умолчанию 5)</td><td>Насколько строго следовать промпту (CFG)</td><td>6–8 для товаров, 4–5 для арта</td></tr>
   <tr><td>Сэмплер и Планировщик</td><td>Алгоритм «проявки»: euler; sgm_uniform, karras, normal, beta и др.</td><td>Начните с euler + sgm_uniform, для фото попробуйте karras</td></tr>
  </tbody></table></div>
  ${SHOT("sdopts","Настройки Stable Diffusion 3.5 в «Опциях». Ниже в списке есть и Stable Diffusion XL.")}
  <h3 class="ico-h">Реальные генерации в Boringtask</h3>
  <div class="shot-pair">
   ${SHOT("forest","Промпт: «инопланетный лес с грибами, светящиеся растения, туман». Nano Banana 2 Lite, Aspect Ratio 4:3.")}
   ${SHOT("girl","Промпт: «портрет девочки с веснушками, мягкий свет, кинематографичный, 4k». Seedream 5 Lite, 4:3, Quality high.")}
  </div>
  <p class="prose">Обратите внимание: промпты короткие и на русском. Для старта этого хватает — а формулы из модуля «Промпты» дают управляемый результат под ТЗ клиента.</p></section>`,
 edit:`<section class="panel"><span class="tag">Теория за 5 минут</span><h2>Как устроен редактор Boringtask</h2>
  <div class="grid">
   <div class="cell"><span class="k">Вход</span><b>Нажмите на изображение → кнопка редактирования</b><span class="k">Справа — «ПРИМЕНИТЬ»/«ОТМЕНИТЬ», инструменты и слои, сверху — стрелки отмены/повтора и масштаб.</span></div>
   <div class="cell"><span class="k">Слои</span><b>Стопка прозрачных плёнок</b><span class="k">Фон, объект, текстура и коррекции живут отдельно. «Глаз» скрывает слой, перетаскивание меняет порядок.</span></div>
   <div class="cell"><span class="k">Корректирующие слои</span><b>Цвет без порчи исходника</b><span class="k">Яркость/контраст, Свет/тени, Черное и белое, Кривые. Выключили — исходник цел.</span></div>
   <div class="cell"><span class="k">ИИ внутри</span><b>Маска для AI, Удаление фона, Масштаб</b><span class="k">Нейросеть перерисовывает только то, что вы выделили.</span></div>
  </div>
  <div class="tablewrap"><table><thead><tr><th>Инструмент</th><th>Когда нужен на заказе</th></tr></thead><tbody>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-pipette.png" alt=""></span>Выбор цвета (пипетка)</span></td><td>Взять фирменный цвет клиента прямо с его логотипа</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-selection.png" alt=""></span>Выбор (Прямоугольник, Круг, Эллипс, Произвольно)</span></td><td>Ограничить правку участком изображения</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-brush.png" alt=""><img class="btn-ico" src="img/btn-line.png" alt=""><img class="btn-ico" src="img/btn-filling.png" alt=""><img class="btn-ico" src="img/btn-eraser.png" alt=""></span>Кисть, Линия, Заливка, Ластик</span></td><td>Ручные мелкие правки, подложки, дорисовка</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-in-paint.png" alt=""></span>Маска для AI (режимы In-Paint и Удаление переднего плана)</span></td><td>Лишние пальцы, предметы, кривой текст</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-moving.png" alt=""><img class="btn-ico" src="img/btn-rotate.png" alt=""><img class="btn-ico" src="img/btn-scale_img.png" alt=""></span>Перемещение, Вращение, Масштаб</span></td><td>Композиция, выравнивание, увеличение разрешения</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-dodge.png" alt=""><img class="btn-ico" src="img/btn-gaussian.png" alt=""><img class="btn-ico" src="img/btn-foreground.png" alt=""></span>Просветление/затемнение, Размытие, Шум</span></td><td>Объём, глубина резкости, «плёночное» зерно</td></tr>
   <tr><td><span class="btncell multi"><span class="icos"><img class="btn-ico" src="img/btn-copy-layer.png" alt=""></span>Копия слоя</span></td><td>Безопасный эксперимент: правьте копию, оригинал рядом</td></tr>
  </tbody></table></div>
  <h3>Корректирующий слой: как это выглядит</h3>
  <div class="shot-pair">
   ${SHOT("adj1","Кнопка с ползунками в панели слоёв → имя слоя → «Тип корректировки» → «СОЗДАТЬ».")}
   ${SHOT("adj2","Яркость и контраст в процентах. «Preserve luminocity» сохраняет яркость цветов. Затем «ГОТОВО».")}
  </div>
  <div class="shot-pair">
   ${SHOT("bw1","Тип «Черное и Белое» → «СОЗДАТЬ».")}
   ${SHOT("bw2","Пресет «Нейтральный» и шесть ползунков: Красный, Зеленый, Синий, Голубой, Пурпурный, Желтый. Ими управляют тем, насколько светлым станет каждый цвет в Ч/Б.")}
  </div>
  <h3>Настройки инструментов: как это выглядит</h3>
  <div class="shot-pair">
   ${SHOT("selmode","«Выбор»: форма выделения. Потом «ОБРЕЗАТЬ» — кадрировать, «УДАЛИТЬ» — стереть выделенное.")}
   ${SHOT("inpaint","«Маска для AI»: режим In-Paint (перерисовать по промпту) или Удаление Переднего Плана (убрать объект). Размер кисти в px → «ПРОДОЛЖИТЬ».")}
   ${SHOT("brushset","«Кисть»: Размер, Жесткость, Скорость.")}
   ${SHOT("lineset","«Линия»: ширина и тип края. У «Заливки» режим Solid.")}
  </div>
  <div class="shot-sm">${SHOT("colorpick","Клик по чёрному квадрату под инструментами открывает палитру. Фирменный цвет клиента проще взять пипеткой с его логотипа.")}</div>
  <h3>Второй ряд инструментов: что внутри</h3>
  <div class="tablewrap"><table><thead><tr><th>Инструмент</th><th>Настройки</th><th>Кнопка запуска</th></tr></thead><tbody>
   <tr><td>Перемещение</td><td>X и Y в пикселях</td><td>двигаете слой мышью</td></tr>
   <tr><td>Масштаб</td><td>AI-масштаб (коэффициент 2…), Пропорциональный или Свободный (ширина и высота в px)</td><td>«МАСШТАБ»</td></tr>
   <tr><td>Вращение</td><td>Угол в deg, «По часовой» или против</td><td>«ПОВОРОТ»</td></tr>
   <tr><td>Просветление/затемнение</td><td>Затемнить, Просветлить, оба с «Сохранением света»; Размер, Жесткость, Значение</td><td>рисуете кистью</td></tr>
   <tr><td>Шум</td><td>Цвет Переднего Плана или Оттенки Серого; Значение, Непрозрачность</td><td>«ШУМ»</td></tr>
   <tr><td>Размытие</td><td>Гаусс, Значение</td><td>«РАЗМЫТЬ»</td></tr>
   <tr><td>Ластик</td><td>Размер, Жесткость</td><td>рисуете кистью</td></tr>
  </tbody></table></div>
  <div class="shot-pair">
   ${SHOT("scalemenu","«Масштаб»: три способа.")}
   ${SHOT("scaleai","AI-масштаб: выберите коэффициент (2) → «МАСШТАБ». Нейросеть дорисует детали.")}
   ${SHOT("scaleprop","Пропорциональный: задайте ширину — высота подстроится.")}
   ${SHOT("rotate","«Вращение»: угол и направление → «ПОВОРОТ».")}
   ${SHOT("dodgemenu","«Просветление/затемнение»: режимы «Сохранение света» не дают цвету «выгорать».")}
   ${SHOT("dodgeset","Для портрета: Жесткость 0%, Значение 10–15%, кисть крупная.")}
   ${SHOT("noisemenu","«Шум»: цветной (цвет переднего плана) или ч/б.")}
   ${SHOT("blurset","«Размытие»: Гаусс, Значение → «РАЗМЫТЬ». Выделите фон «Выбором» заранее — размоется только он.")}
  </div>
  <h3>AI-функции в меню «⋯» панели слоёв</h3>
  <div class="shot-pair">
   ${SHOT("aimenu","Список прокручивается — внизу есть и другие функции.")}
   ${SHOT("rmbg","Окно «Configure Удаление Фона Layer»: исходный слой, «Тип источника» (Объект) и «Вписать Результат в Канвас». Затем «ГЕНЕРИРОВАТЬ».")}
  </div>
   <div class="tablewrap"><table><thead><tr><th>Функция</th><th>Какую услугу продаёт</th></tr></thead><tbody>
    <tr><td>Удаление Фона Продукта</td><td>Белый фон для карточек Wildberries и Ozon</td></tr>
    <tr><td>Удаление Фона</td><td>Аватарки, коллажи, перенос человека в новую сцену</td></tr>
    <tr><td>Продвинутый In-Paint</td><td>Точечные правки: одежда, предметы, детали</td></tr>
    <tr><td>Удаление Переднего Плана</td><td>Убрать прохожих, провода, лишние предметы</td></tr>
    <tr><td>Повышение Качества / Увеличение Масштаба с AI</td><td>Старые фото, печать, баннеры большого размера</td></tr>
    <tr><td>Замена Освещения</td><td>Одна предметная съёмка — десяток настроений</td></tr>
    <tr><td>Замена Материала</td><td>Мебель и одежда в других тканях и цветах без пересъёмки</td></tr>
    <tr><td>Out-Painting</td><td>Дорисовать края: квадрат → 9:16 для Stories, 16:9 для баннера</td></tr>
    <tr><td>Набросок в Изображение</td><td>Эскиз клиента «от руки» → готовая визуализация</td></tr>
   </tbody></table></div>
  <div class="callout money">Каждая строка таблицы — отдельная услуга с отдельным прайсом. Тяжёлые функции (апскейл, Out-Painting, замена материала) расходуют больше баланса, поэтому закладывайте их стоимость в цену.</div>
  <h3>Кнопки редактора</h3>
  ${iconLegend(["Редактор","Панель над изображением","Панель слоёв"])}
  <div class="callout">Привычка профессионала: перед любой серьёзной правкой нажмите «Копия слоя». Если клиент скажет «верните как было», вы вернёте за секунду.</div></section>`,
 video:`<section class="panel"><span class="tag">Теория за 5 минут</span><h2>Три способа сделать видео в Boringtask</h2>
  ${SHOT("t2v","Категория «Текст в Видео» слева в окне генератора: WAN2.1 Text2Video, Luma Ray Text2Video, Kling 1.6 Text2Video, Hunyuan Video. Полный и актуальный список моделей — во вкладке «Генерировать Видео» → «Опции».")}
  <div class="grid">
   <div class="cell"><span class="k">Текст в видео</span><b>WAN 2.7, Seedance 2, Kling 3, Grok Imagine</b><span class="k">Ролик по описанию. Нужен подробный промпт: сцена, свет, движение камеры.</span></div>
   <div class="cell"><span class="k">Картинка в видео</span><b>Kling 3.0, Seedance 2.5, Wan 2.7 i2v, Veo 3.1</b><span class="k">Оживляет готовый кадр. Самый управляемый способ — начинайте с него.</span></div>
   <div class="cell"><span class="k">Видео в видео</span><b>Pixverse 5 Extend, Topaz, Bria Remove Background v2v</b><span class="k">Продлить ролик, улучшить, убрать фон, примерить одежду.</span></div>
  </div>
  <div class="tablewrap"><table><thead><tr><th>Параметр</th><th>Смысл</th><th>Рекомендация</th></tr></thead><tbody>
   <tr><td>Шаги инференса</td><td>Качество и плавность</td><td>30–50; для сложного движения ближе к 50</td></tr>
   <tr><td>Guidance (CFG)</td><td>Следование промпту</td><td>Kling 0–1 (норма 0.5), Hunyuan 1–10 (норма 6)</td></tr>
   <tr><td>Длительность</td><td>Секунды ролика</td><td>5 сек на сцену; длинный ролик собирайте из сцен</td></tr>
   <tr><td>Зациклить (Luma Ray)</td><td>Бесшовный повтор</td><td>Фоны сайтов, заставки, Stories</td></tr>
   <tr><td>AI Увеличение видео</td><td>Чёткость</td><td>FHD 1920×1080, RealESRGAN_x4plus</td></tr>
  </tbody></table></div>
  <div class="callout w">Промпт для «картинки в видео» описывает движение, а не объект. «Пар поднимается, камера медленно приближается» работает. «Красивая кружка кофе» — нет: кружку модель и так видит.</div></section>`
};
const LAB_HW = {
 img:"Сделайте 3 работы из этого модуля в своей нише: одну карточку или обложку, одну серию из 3 кадров в едином стиле и один вариант с текстом. Сложите их на доску «Портфолио».",
 edit:"Возьмите 3 своих генерации из прошлого модуля и доведите их в редакторе: убранный фон + новая сцена, исправленная Маской деталь, цветокоррекция. Сохраните пары «до / после» — это лучший контент для блога.",
 video:"Оживите 2 лучшие работы из портфолио и соберите один Reels из 3 сцен с увеличением до FHD. Видео в портфолио позволяет поднять цены на 30–50%."
};

// русские версии промптов практикумов: ключ — английский промпт из LAB
const LAB_RU = {
 "handmade ceramic coffee mug, matte sage green glaze, standing on light oak table, steam rising, scattered coffee beans, commercial product photography, soft window light from the left, clean background, highly detailed, sharp focus, vertical composition 3:4":"керамическая кружка ручной работы, матовая глазурь цвета шалфея, стоит на столе из светлого дуба, поднимается пар, рассыпанные кофейные зёрна, коммерческая предметная съёмка, мягкий свет из окна слева, чистый фон, высокая детализация, резкий фокус, вертикальная композиция 3:4",
 "blurry, low quality, text, watermark, distorted handle, extra objects":"размыто, низкое качество, текст, водяной знак, искривлённая ручка, лишние предметы",
 "professional portrait of a confident woman in her 30s, psychologist, warm smile, beige linen blazer, sitting in a cozy bright office with plants, soft natural light, shallow depth of field, 85mm lens, cinematic, 4k, editorial photography":"профессиональный портрет уверенной женщины за 30, психолог, тёплая улыбка, бежевый льняной пиджак, сидит в уютном светлом кабинете с растениями, мягкий естественный свет, малая глубина резкости, объектив 85 мм, кинематографично, 4k, журнальная фотография",
 "plastic skin, extra fingers, deformed face, oversaturated, cartoon":"пластиковая кожа, лишние пальцы, деформированное лицо, перенасыщенные цвета, мультяшность",
 "YouTube thumbnail, surprised young man pointing at a large glowing stack of coins, bold yellow text \"КАК Я СЭКОНОМИЛ 100 000\", dark blue gradient background, high contrast, rim light, sharp, 16:9":"обложка YouTube, удивлённый молодой мужчина указывает на большую светящуюся стопку монет, жирный жёлтый текст \"КАК Я СЭКОНОМИЛ 100 000\", тёмно-синий градиентный фон, высокий контраст, контровой свет, резкость, 16:9",
 "misspelled text, extra letters, blurry face, low contrast":"текст с ошибками, лишние буквы, размытое лицо, низкий контраст",
 "glass serum bottle with golden dropper on a pale pink podium, water droplets, fresh rose petals around, soft studio light, minimalist premium beauty product photography, empty space on the left for text, vertical 3:4":"стеклянный флакон сыворотки с золотой пипеткой на бледно-розовом подиуме, капли воды, свежие лепестки роз вокруг, мягкий студийный свет, минималистичная премиальная съёмка косметики, пустое место слева для текста, вертикально 3:4",
 "text, letters, watermark, clutter, harsh shadows":"текст, буквы, водяной знак, беспорядок, жёсткие тени",
 "minimalist logo emblem for a coffee shop, single coffee bean forming a stylized leaf, flat vector, two colors deep espresso brown and warm cream, centered on plain background, clean geometric lines":"минималистичная эмблема для кофейни, кофейное зерно превращается в стилизованный лист, плоский вектор, два цвета — глубокий коричневый эспрессо и тёплый кремовый, по центру на однотонном фоне, чистые геометрические линии",
 "photo, 3D, gradient, text, many colors, complex details":"фото, 3D, градиент, текст, много цветов, сложные детали",
 "spacious living room, scandinavian interior, light oak floor, white walls, linen sofa in light grey, large window with daylight, indoor plants, wool rug, architectural photography, wide angle, photorealistic, 16:9":"просторная гостиная, скандинавский интерьер, пол из светлого дуба, белые стены, светло-серый льняной диван, большое окно с дневным светом, комнатные растения, шерстяной ковёр, архитектурная фотография, широкий угол, фотореализм, 16:9",
 "distorted furniture, warped walls, people, clutter, low quality":"искажённая мебель, кривые стены, люди, беспорядок, низкое качество",
 "empty light oak table near a bright window, soft morning light, blurred cozy kitchen background, commercial photography, 3:4":"пустой стол из светлого дуба у яркого окна, мягкий утренний свет, размытая уютная кухня на фоне, коммерческая фотография, 3:4",
 "natural relaxed hand holding a coffee cup, five fingers, realistic skin":"естественная расслабленная рука держит чашку кофе, пять пальцев, реалистичная кожа",
 "old paper texture, subtle grain, light beige, scratches and fibers, flat scan, seamless":"текстура старой бумаги, лёгкое зерно, светло-бежевый, царапины и волокна, плоский скан, бесшовно",
 "slow cinematic camera push-in, steam gently rising from the mug, soft light flickering, coffee beans slightly rolling, smooth motion, no camera shake":"медленный кинематографичный наезд камеры, над кружкой мягко поднимается пар, мягко мерцает свет, кофейные зёрна слегка перекатываются, плавное движение, без тряски камеры",
 "cozy morning coffee shop, barista pouring latte art in slow motion, warm golden sunlight through window, steam, shallow depth of field, cinematic, smooth camera movement, vertical 9:16":"уютная утренняя кофейня, бариста в замедленной съёмке наливает латте-арт, тёплый золотой солнечный свет из окна, пар, малая глубина резкости, кинематографично, плавное движение камеры, вертикально 9:16",
 "the woman gently smiles and slightly turns her head toward the camera, hair moves softly in the breeze, subtle natural blinking, static camera, realistic motion":"женщина мягко улыбается и слегка поворачивает голову к камере, волосы мягко колышутся на ветру, лёгкое естественное моргание, неподвижная камера, реалистичное движение",
 "a drop of honey slowly falling onto a stack of pancakes, macro, golden backlight, extreme slow motion, smooth motion":"капля мёда медленно падает на стопку блинчиков, макро, золотой контровой свет, сверхзамедленная съёмка, плавное движение"
};
function mLab(tab){const n=LAB[tab].items.length;return LAB_THEORY[tab]+`
<section class="panel" data-init="lab" data-tab="${tab}">
  <span class="tag m">${n} заказов шаг за шагом</span>
  <h2>${LAB[tab].label}: делаем вместе</h2>
  <p class="prose">${LAB[tab].intro}</p>
  <div class="row"><a class="btn ghost" href="${BT}" target="_blank" rel="noopener">Открыть Boringtask во второй вкладке</a></div>
  <div class="chips" id="labPick"></div>
  <div id="labEx"></div>
</section>
<section class="panel"><span class="tag w">Домашнее задание</span><h2>Закрепите руками</h2><p class="prose">${LAB_HW[tab]}</p></section>`}

function mPrompt(){return `
<section class="panel"><div class="prose">
  <p class="lead">Промпт — это техническое задание для нейросети. Хорошее ТЗ экономит 10 перегенераций, а значит, ваше время и лимиты тарифа.</p>
</div></section>

<section class="panel" data-init="formula"><span class="tag">Формула</span>
  <div class="langhead"><h2>Четыре блока идеального промпта</h2>${LANGSW}</div>
  <div class="fsteps" data-fsteps></div>
  <div class="fbuilt"><span class="eyebrow">Собранный промпт</span><div class="out" data-fout></div>
   <div class="row" style="margin-top:1rem"><button class="btn ghost" data-fcopy>Скопировать</button></div></div>
  <div class="prose"><ul>
   <li>Пишите на английском: большинство моделей обучены на нём и точнее понимают детали. Русский работает, но хуже держит стиль.</li>
   <li>Главное — в начале. Модели сильнее учитывают первые слова.</li>
   <li>Конкретика вместо оценок: не «красивый свет», а «golden hour backlight».</li>
   <li>Для товара называйте материал и цвет: «matte ceramic, sage green», а не «кружка».</li>
  </ul></div></section>

<section class="panel tool" data-init="styles"><span class="tag">Библиотека стилей</span>
  <div class="langhead"><h2>20 готовых ядер стиля — нажмите, чтобы скопировать</h2>${LANGSW}</div>
  <p class="prose">Добавьте ядро после своего сюжета — стиль станет предсказуемым. Сравнивайте его в 2–3 моделях: одни лучше передают фото, другие — живопись.</p>
  <div class="grid" id="stLib"></div></section>

<section class="panel" data-init="tpl"><span class="tag">Ниши</span>
  <div class="langhead"><h2>Шаблоны промптов для 6 популярных заказов</h2>${LANGSW}</div>
  <div class="tablewrap"><table><thead><tr><th>Заказ</th><th>Шаблон (замените слова в скобках)</th><th></th></tr></thead><tbody data-tplbody></tbody></table></div></section>

<section class="panel tool" data-init="doctor"><span class="tag w">Промпт-доктор</span><h2>Что не так с картинкой и как исправить</h2>
  <p class="prose">Выберите симптом — получите причину и готовое исправление для Boringtask.</p>
  <div class="chips" id="docPick"></div>
  <div id="docOut"></div></section>

<section class="panel tool" data-init="prompt">
  <span class="tag">Конструктор промптов</span>
  <div class="langhead"><h2>Соберите промпт по формуле</h2>${LANGSW}</div>
  <div class="form">
    <label class="f">Сюжет<input id="pSub" type="text" value="керамическая кружка кофе на деревянном столе, пар"></label>
    <label class="f">Стиль<select id="pSty">
      <option value="commercial product photography, clean, premium" data-ru="коммерческая предметная съёмка, чисто, премиально">Коммерческое фото товара</option>
      <option value="35mm film photography, Kodak Portra, grainy, nostalgic" data-ru="плёночная фотография 35 мм, Kodak Portra, зерно, ностальгия">Плёнка 90-х</option>
      <option value="isometric 3D render, pastel colors, soft shadows" data-ru="изометрический 3D-рендер, пастельные цвета, мягкие тени">Изометрия 3D</option>
      <option value="cinematic still, anamorphic, dramatic" data-ru="кинокадр, анаморфный объектив, драматично">Кинокадр</option>
      <option value="children's book illustration, watercolor and gouache" data-ru="иллюстрация для детской книги, акварель и гуашь">Детская акварель</option>
      <option value="minimalist flat vector illustration, bold shapes" data-ru="минималистичная плоская векторная иллюстрация, крупные формы">Плоский вектор</option></select></label>
    <label class="f">Свет<select id="pLig">
      <option value="soft morning light from window" data-ru="мягкий утренний свет из окна">Мягкий утренний</option>
      <option value="studio softbox lighting, white background" data-ru="студийный свет софтбокса, белый фон">Студийный, белый фон</option>
      <option value="golden hour warm backlight" data-ru="тёплый контровой свет золотого часа">Золотой час</option>
      <option value="neon rim light, dark background" data-ru="неоновый контурный свет, тёмный фон">Неоновый контур</option></select></label>
    <label class="f">Площадка<select id="pFmt">
      <option value="aspect ratio 3:4, vertical" data-ru="соотношение сторон 3:4, вертикально">Карточка WB/Ozon · 3:4</option>
      <option value="aspect ratio 9:16, vertical" data-ru="соотношение сторон 9:16, вертикально">Reels / Stories · 9:16</option>
      <option value="aspect ratio 16:9, wide" data-ru="соотношение сторон 16:9, горизонтально">Обложка YouTube · 16:9</option>
      <option value="aspect ratio 1:1, square" data-ru="соотношение сторон 1:1, квадрат">Пост · 1:1</option></select></label>
  </div>
  <p class="foot" data-phint style="margin:.2rem 0 .6rem"></p>
  <div class="out" id="pOut"></div>
  <div class="row"><button class="btn" id="pCopy">Копировать промпт</button><a class="btn ghost" href="${BT}" target="_blank" rel="noopener">Вставить в Boringtask</a></div>
</section>`}

function m3(){return `
<section class="panel"><div class="prose">
  <p class="lead">Клиент смотрит портфолио 20 секунд. За это время он должен увидеть свою задачу, уже решённую. Поэтому портфолио собирается под нишу, а не «всё, что я умею».</p>
</div></section>
<section class="panel">
  <span class="tag">План на неделю</span><h2>7 дней — 9 работ</h2>
  <div class="tablewrap"><table>
    <thead><tr><th>День</th><th>Что делаете в Boringtask</th><th>Итог</th></tr></thead>
    <tbody>
      <tr><td class="mono">1</td><td>Выбираете нишу из теста, находите 10 реальных карточек/обложек конкурентов, кладёте скриншоты на доску «Референсы».</td><td>Мудборд</td></tr>
      <tr><td class="mono">2–3</td><td>Делаете 3 работы «до/после»: берёте слабую карточку из открытого доступа и переделываете. Удаление фона, новый фон генерацией, текст.</td><td>3 кейса до/после</td></tr>
      <tr><td class="mono">4</td><td>Серия из 3 работ в едином стиле для вымышленного бренда. Фиксируйте seed и стиль-ядро промпта.</td><td>Серия бренда</td></tr>
      <tr><td class="mono">5</td><td>Оживляете 2 лучшие работы через «Картинка в видео». Видео в портфолио повышает цену.</td><td>2 ролика</td></tr>
      <tr><td class="mono">6</td><td>Собираете всё на одной доске: подписи «задача → решение → срок». Даёте доступ по ссылке.</td><td>Портфолио-доска</td></tr>
      <tr><td class="mono">7</td><td>Выкладываете работы в блог и на биржи, отправляете 10 откликов (модуль 4).</td><td>Первые отклики</td></tr>
    </tbody></table></div>
  <div class="callout w">Не выдавайте учебные работы за реальные заказы. Подписывайте «концепт для бренда X» — это честно и всё равно продаёт.</div>
</section>
<section class="panel tool" data-init="checklist" data-key="pf" data-items="Ниша выбрана и описана одним предложением|Доска с 10 референсами конкурентов|3 кейса до/после|Серия из 3 работ в одном стиле|2 AI-ролика из лучших кадров|Подписи «задача → решение → срок» к каждой работе|Ссылка на доску-портфолио открывается без регистрации|Работы выложены в блог и на 2 площадки">
  <span class="tag m">Чек-лист портфолио</span><h2>Готово ли портфолио к продаже</h2>
  <div class="cl"></div>
</section>`}

function m4(){return `
<section class="panel">
  <span class="tag">Где клиенты</span><h2>6 каналов, с которых приходят первые заказы</h2>
  <div class="grid">
    <div class="cell"><b>Kwork и FL.ru</b><span class="k">Опубликуйте 2–3 «кворка» с фиксированной ценой. Первые 5 заказов — ради отзывов.</span></div>
    <div class="cell"><b>Селлеры WB/Ozon</b><span class="k">Найдите карточки с плохими фото, предложите бесплатно переделать одну. Конверсия в оплату самая высокая.</span></div>
    <div class="cell"><b>Telegram-чаты</b><span class="k">Чаты селлеров, маркетологов, фриланса. Пишите кейс «до/после», а не «ищу работу».</span></div>
    <div class="cell"><b>Авито Услуги</b><span class="k">Раздел «Дизайн». Объявление с 3 работами и ценой «от».</span></div>
    <div class="cell"><b>Знакомые эксперты</b><span class="k">Психологи, тренеры, мастера — им нужна AI-фотосессия и обложки.</span></div>
    <div class="cell"><b>Свой блог</b><span class="k">Медленный старт, но через 2–3 месяца даёт самые тёплые заявки (модуль 5).</span></div>
  </div>
</section>

<section class="panel tool" data-init="pitch">
  <span class="tag">Генератор сообщения</span><h2>Холодное сообщение, на которое отвечают</h2>
  <div class="form">
    <label class="f">Кому пишете<select id="cWho">
      <option value="seller">Селлеру маркетплейса</option><option value="expert">Эксперту / блогеру</option><option value="cafe">Кафе / локальному бизнесу</option><option value="youtube">Автору YouTube-канала</option></select></label>
    <label class="f">Ваше имя<input id="cName" type="text" value="Анна"></label>
    <label class="f">Что заметили у них<input id="cSeen" type="text" value="на главном фото товар теряется на сером фоне"></label>
  </div>
  <div class="out" id="cOut"></div>
  <div class="row"><button class="btn" id="cCopy">Копировать сообщение</button></div>
  <p class="foot">Правило: одно конкретное наблюдение, один бесплатный пример, один простой вопрос. Отправляйте 10 сообщений в день — при 5–10% ответов это 3–5 диалогов в неделю.</p>
</section>

<section class="panel"><span class="tag">Переписка</span><h2>Диалог от «ответили» до «оплатили»: 5 шагов</h2>
  <ol class="steps">
    <li><div><b>Уточните задачу.</b> «Для какой площадки? Сколько штук? К какому сроку?» Три вопроса — и вы уже понимаете цену.</div></li>
    <li><div><b>Отправьте бриф</b> (генератор ниже). Клиент, который заполнил бриф, почти всегда платит: он уже вложил время.</div></li>
    <li><div><b>Покажите 1 пробный вариант</b> на доске Boringtask. Сделать его — 10 минут, а клиент видит не обещание, а результат.</div></li>
    <li><div><b>Назовите цену пакетом:</b> «5 карточек за 6 000 ₽ или 10 за 10 800 ₽». Две цифры вместо одной — клиент выбирает, а не решает «покупать ли».</div></li>
    <li><div><b>Возьмите предоплату</b> и назовите дату сдачи. Без предоплаты не начинайте — это защищает от «пропал после работы».</div></li>
  </ol></section>

<section class="panel tool" data-init="brief"><span class="tag">Генератор брифа</span><h2>Бриф, который клиент заполнит за 3 минуты</h2>
  <div class="form">
    <label class="f">Клиент<input id="bName" type="text" value="Мария, магазин «Глина и Дом»"></label>
    <label class="f">Бизнес / продукт<input id="bBiz" type="text" value="керамическая посуда ручной работы"></label>
    <label class="f">Что сделать<input id="bWhat" type="text" value="10 карточек товара + 2 видеообложки"></label>
    <label class="f">Где разместить<input id="bWhere" type="text" value="Wildberries, Ozon"></label>
    <label class="f">Стиль<input id="bStyle" type="text" value="светлый, натуральный, дерево и лён"></label>
    <label class="f">Срок<input id="bDead" type="text" value="5 рабочих дней"></label>
    <label class="f">Бюджет<input id="bBudget" type="text" value="12 000 ₽"></label>
  </div>
  <div class="out" id="bOut"></div>
  <div class="row"><button class="btn" id="bCopy">Копировать бриф</button></div></section>

<section class="panel"><span class="tag w">Возражения</span><h2>8 частых возражений и что ответить</h2>
  <div style="display:flex;flex-direction:column;gap:.5rem">
  ${[["«Это же нейросеть, я сам сделаю»","«Конечно, можно. Я экономлю вам время на подборе моделей, исправлении рук, текста и фона. Давайте сделаю одну карточку бесплатно — сравните с тем, что получится у вас»."],
     ["«Дорого»","«Понимаю. Можем начать со стартового пакета из 3 штук. Если конверсия карточек вырастет — продолжим». Не снижайте цену без уменьшения объёма."],
     ["«А это законно? Авторские права?»","«Изображения создаются с нуля под ваш товар, я не использую чужие фото. Ваш товар снимаем вы или я с вашего фото». Не обещайте юридических гарантий, которых не можете дать."],
     ["«Нужно подумать»","«Конечно. Что важно для решения: цена, сроки или результат? Могу показать ещё пример в вашем стиле». Возвращайтесь через 2 дня с конкретным вариантом."],
     ["«У меня уже есть дизайнер»","«Отлично. Я могу взять на себя объём: 30 карточек за неделю, а ваш дизайнер сосредоточится на сложных задачах»."],
     ["«Сделайте бесплатно, потом заплачу»","Бесплатно — только 1 пробный вариант, и только на доске по ссылке. Остальное — после предоплаты 50%."],
     ["«Хочу 10 правок»","«В пакет входят 2 круга правок. Каждый следующий — 500 ₽». Правило правок закрепите в брифе заранее."],
     ["«А вдруг не понравится?»","«Поэтому сначала показываю 2–3 направления на доске. Вы выбираете стиль до основной работы»."]]
   .map(o=>`<details class="opt" style="display:block"><summary style="cursor:pointer;font-weight:600">${o[0]}</summary><p style="margin-top:.5rem">${o[1]}</p></details>`).join("")}
  </div></section>

<section class="panel"><span class="tag">Сдача работы</span><h2>Как сдать так, чтобы вернулись</h2>
  <ol class="steps">
    <li><div>Выложите финальные варианты на доску клиента, подпишите каждый: формат, размер, площадка.</div></li>
    <li><div>Отправьте ссылку «Поделиться» и сообщение: что сделано, что входит, как оставить правки стикером.</div></li>
    <li><div>После утверждения и оплаты передайте файлы и бонус: 1 вертикальную версию для Stories.</div></li>
    <li><div>Через 7 дней спросите о результате: выросли ли продажи и клики. Попросите отзыв и разрешение показать кейс.</div></li>
  </ol></section>

<section class="panel tool" data-init="price">
  <span class="tag m">Конструктор прайса</span><h2>Соберите заказ и озвучьте цену уверенно</h2>
  <div class="form">
    <label class="f">Услуга<select id="prS">${SERVICES.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select></label>
    <label class="f">Количество<input id="prQ" type="number" min="1" value="5"></label>
    <label class="f">Ваш уровень<select id="prL"><option value="0.15">Новичок</option><option value="0.45" selected>Есть 5+ отзывов</option><option value="0.8">Опытный</option></select></label>
  </div>
  <div class="chips" id="prX">
    <button class="chip" data-x="0.3" aria-pressed="false">Срочно, 24 ч (+30%)</button>
    <button class="chip" data-x="0.2" aria-pressed="false">Видео-версия (+20%)</button>
    <button class="chip" data-x="0.15" aria-pressed="false">Исходники и слои (+15%)</button>
  </div>
  <div class="grid" id="prOut"></div>
  <div class="out" id="prTxt"></div>
  <div class="row"><button class="btn" id="prCopy">Копировать коммерческое</button></div>
</section>

<section class="panel"><span class="tag w">Деньги и документы</span><h2>Как брать оплату безопасно</h2>
  <ol class="steps">
    <li><div>Оформите самозанятость в приложении «Мой налог»: 4% с физлиц, 6% с компаний и ИП, чек формируется за секунду.</div></li>
    <li><div>Берите предоплату 50% для новых клиентов. Для маленьких заказов до 3 000 ₽ — 100%.</div></li>
    <li><div>Фиксируйте в переписке: что входит, сколько правок (обычно 2), срок и формат сдачи.</div></li>
    <li><div>Показывайте работы на доске Boringtask по ссылке, а финальные файлы в полном разрешении (после AI-масштаба) отправляйте только после оплаты.</div></li>
  </ol>
  <p class="foot">Курс не заменяет консультацию юриста или налогового специалиста; условия налоговых режимов уточняйте на nalog.gov.ru.</p>
</section>`}

function m5(){return `
<section class="panel"><div class="prose">
  <p class="lead">Блог нейродизайнера — это витрина, которая работает, пока вы спите. Главное правило: показывайте процесс и результат для бизнеса, а не «смотрите, что умеет нейросеть».</p>
  <p>Весь контент делается в том же Boringtask: обложки постов, карусели, Reels из ваших работ. Один заказ даёт 3–4 единицы контента.</p>
</div></section>

<section class="panel">
  <span class="tag">Воронка</span><h2>Как блог превращается в заказы</h2>
  <ol class="steps">
    <li><div><b>Охват.</b> Reels «до/после» за 15 секунд: слабая карточка → ваша. Делается через «Картинка в видео».</div></li>
    <li><div><b>Доверие.</b> Разборы: «почему эта обложка не кликается и как я бы её сделала». Карусель 5 слайдов.</div></li>
    <li><div><b>Заявка.</b> Лид-магнит в шапке: «Бесплатно переделаю 1 карточку — напишите ФОТО». Это фильтр горячих клиентов.</div></li>
    <li><div><b>Продажа.</b> Переписка по скрипту из модуля 4, оплата, сдача на доске.</div></li>
    <li><div><b>Повтор.</b> Готовый заказ — новый пост-кейс с согласия клиента. Круг замыкается.</div></li>
  </ol>
</section>

<section class="panel">
  <span class="tag">Рубрики</span><h2>5 рубрик, которых хватит на год</h2>
  <p class="prose">Так распределяется контент блога. Пример: из 20 постов в месяц 8 — «до / после», 4 — разборы и по 3 — промпты и закулисье, 2 — отзывы.</p>
  <div class="rubbar" aria-hidden="true">
    <i style="--w:40;--c:var(--dusk);--t:#fff">40%</i><i style="--w:20;--c:var(--sky);--t:var(--tile-ink)">20%</i><i style="--w:15;--c:var(--hot);--t:#fff">15%</i><i style="--w:15;--c:var(--sun);--t:var(--tile-ink)">15%</i><i style="--w:10;--c:var(--slate);--t:#fff">10%</i>
  </div>
  <div class="rubs">
    <div class="rub" style="--c:var(--dusk)"><div class="rubtop"><b class="rp">40%</b><span class="rn">8 из 20</span></div><b>До / после</b><span>Главный продающий формат: слабая работа → ваша.</span></div>
    <div class="rub" style="--c:var(--sky)"><div class="rubtop"><b class="rp">20%</b><span class="rn">4 из 20</span></div><b>Разбор чужой работы</b><span>Показывает экспертизу без хвастовства.</span></div>
    <div class="rub" style="--c:var(--hot)"><div class="rubtop"><b class="rp">15%</b><span class="rn">3 из 20</span></div><b>Промпт дня</b><span>Сохраняют и пересылают — растёт охват.</span></div>
    <div class="rub" style="--c:var(--sun)"><div class="rubtop"><b class="rp">15%</b><span class="rn">3 из 20</span></div><b>Закулисье и цифры</b><span>«Сколько я заработала за неделю» — доверие.</span></div>
    <div class="rub" style="--c:var(--slate)"><div class="rubtop"><b class="rp">10%</b><span class="rn">2 из 20</span></div><b>Отзыв и кейс клиента</b><span>Социальное доказательство.</span></div>
  </div>
</section>

<section class="panel"><span class="tag">Запуск блога</span><h2>Telegram-канал + клипы за один вечер</h2>
  <ol class="steps">
    <li><div><b>Название и аватар.</b> «Анна | нейродизайн для селлеров». Аватар — ваш портрет из AI-фотосессии (модуль «Изображения»): сразу и пример работы.</div></li>
    <li><div><b>Описание</b> по формуле шапки ниже, со ссылкой на доску-портфолио в Boringtask.</div></li>
    <li><div><b>Закреп.</b> Пост «Кто я, что делаю, сколько стоит, как заказать» + 3 лучшие работы до/после.</div></li>
    <li><div><b>5 стартовых постов</b> до любого продвижения, чтобы новый подписчик сразу видел пользу.</div></li>
    <li><div><b>Дубли в клипы.</b> Каждый Reels публикуйте в VK Клипы, YouTube Shorts и Telegram-канал: одна работа — три площадки.</div></li>
    <li><div><b>Первые подписчики.</b> Чаты своей ниши, взаимные упоминания с коллегами, бесплатные разборы работ в комментариях.</div></li>
  </ol></section>

<section class="panel"><span class="tag">Карусель в Boringtask</span><h2>Разбор на 5 слайдов за 20 минут</h2>
  <ol class="steps">
    <li><div>На доске «Контент» нарисуйте 5 квадратов 1:1 инструментом «Формы» — это слайды.</div></li>
    <li><div>Слайд 1 — обложка: крупный вопрос («Почему эту карточку не покупают?») и картинка. Генерируйте фон с местом под текст.</div></li>
    <li><div>Слайды 2–4 — по одной ошибке на слайд: скриншот, стрелка из «Форм», пояснение «Текстом».</div></li>
    <li><div>Слайд 5 — ваш вариант «после» и призыв: «Пиши ФОТО — переделаю твою».</div></li>
    <li><div>Сохраните каждый слайд и загрузите каруселью. Шрифт и цвета одинаковые на всех слайдах.</div></li>
  </ol></section>

<section class="panel tool" data-init="reels"><span class="tag">Сценарии Reels</span><h2>Готовый 15-секундный сценарий под вашу нишу</h2>
  <div class="form"><label class="f">Ниша<select id="rsN"><option value="seller">Карточки для селлеров</option><option value="expert">Фото для экспертов</option><option value="cafe">Визуал для кафе</option><option value="youtube">Обложки YouTube</option></select></label></div>
  <div class="tablewrap"><table id="rsT"></table></div>
  <div class="row"><button class="btn" id="rsCopy">Копировать сценарий</button></div>
  <div class="out" id="rsRaw" hidden></div>
  <p class="foot">Первые 3 секунды решают всё: начинайте с проблемы или результата, а не с приветствия.</p></section>

<section class="panel tool" data-init="plan">
  <span class="tag">Генератор контент-плана</span><h2>План на 14 дней под вашу нишу</h2>
  <div class="form">
    <label class="f">Ниша<select id="cpN">
      <option value="карточки товаров для маркетплейсов">Карточки для маркетплейсов</option>
      <option value="обложки и превью для YouTube">Обложки YouTube</option>
      <option value="AI-фотосессии для экспертов">AI-фотосессии экспертов</option>
      <option value="рекламные креативы и Reels">Креативы и Reels</option>
      <option value="визуализация интерьеров">Интерьеры</option></select></label>
    <label class="f">Площадка<select id="cpP"><option>Telegram + VK Клипы</option><option>VK + Telegram</option><option>YouTube Shorts</option><option>Дзен + Telegram</option></select></label>
  </div>
  <div class="tablewrap"><table id="cpT"></table></div>
  <div class="row"><button class="btn" id="cpCopy">Копировать план</button></div>
  <div class="out" id="cpRaw" hidden></div>
</section>

<section class="panel">
  <span class="tag m">Шапка профиля</span><h2>Формула описания, которое продаёт</h2>
  <div class="out">Имя · нейродизайнер для [кого]
Делаю [результат] за [срок] — [цифра-доказательство]
👇 Бесплатно переделаю 1 [карточку/обложку] — пишите «ФОТО»</div>
  <p class="foot">Пример: «Анна · нейродизайнер для селлеров WB. Карточки, которые покупают, за 24 часа — 40+ сделанных карточек. Бесплатно переделаю 1 карточку — пишите ФОТО».</p>
</section>`}

function m6(){return `
<section class="panel"><div class="prose">
  <p class="lead">Почасовая работа упирается в потолок. Чтобы доход рос без новых часов, нужны три рычага: пакеты вместо разовых заказов, ежемесячные клиенты и автоматизация в Boringtask.</p>
</div></section>
<section class="panel">
  <span class="tag">Три рычага</span><h2>Как поднять доход, не работая больше</h2>
  <div class="levers">
    <div class="lever" style="--c:var(--sky)">
      <div class="lv-head"><span class="lv-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/></svg></span><span class="eyebrow">Рычаг 1</span></div>
      <b>Пакеты</b>
      <span class="lv-res">Чек растёт в 2–3 раза</span>
      <ul><li>«Старт» — 5 карточек</li><li>«Магазин» — 20 карточек</li><li>«Бренд» — 20 + видео + инфографика</li></ul>
      <span class="lv-note">Чаще всего выбирают средний пакет.</span>
    </div>
    <div class="lever" style="--c:var(--sun)">
      <div class="lv-head"><span class="lv-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15.5l2 2 4-4"/></svg></span><span class="eyebrow">Рычаг 2</span></div>
      <b>Абонемент</b>
      <span class="lv-res">Предсказуемая база дохода</span>
      <ul><li>«Визуал на месяц»</li><li>12 постов, 4 Reels, 10 карточек</li><li>фиксированная сумма каждый месяц</li></ul>
      <span class="lv-note">3–4 таких клиента — основа дохода.</span>
    </div>
    <div class="lever" style="--c:var(--hot)">
      <div class="lv-head"><span class="lv-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h11M4 12h16M4 17h11"/><path d="M15 4l3 3-3 3M17 14l3 3-3 3"/></svg></span><span class="eyebrow">Рычаг 3</span></div>
      <b>Конвейер</b>
      <span class="lv-res">Заказ на 50 фото — за вечер</span>
      <ul><li>пакетная генерация в Boringtask</li><li>сценарий: фото товаров → улучшение → удаление фона</li><li>одинаковые настройки на всю серию</li></ul>
      <span class="lv-note">Больше заказов за то же время.</span>
    </div>
  </div>
  <div class="lv-sum"><b>Вместе</b> пакеты поднимают чек, абонемент делает доход предсказуемым, а конвейер освобождает время.</div>
</section>

<section class="panel tool" data-init="retainer">
  <span class="tag m">Калькулятор абонементов</span><h2>Сколько ежемесячных клиентов нужно</h2>
  <div class="form">
    <label class="f">Цена абонемента, ₽/мес<input id="rP" type="number" step="1000" value="25000"></label>
    <label class="f">Клиентов на абонементе<input id="rN" type="number" min="0" value="3"></label>
    <label class="f">Разовые заказы в месяц, ₽<input id="rO" type="number" step="1000" value="20000"></label>
    <label class="f">Часов на одного абонента в месяц<input id="rH" type="number" step="1" value="12"></label>
  </div>
  <div class="grid" id="rOut"></div>
</section>

<section class="panel tool" data-init="checklist" data-key="exit" data-items="Доход от нейродизайна 3 месяца подряд не ниже зарплаты|Подушка безопасности на 3–6 месяцев расходов|Минимум 2 клиента на абонементе|Блог приносит не меньше 4 заявок в месяц|Самозанятость оформлена, доход прозрачен|Обсуждён с работодателем возможный переход на частичную занятость|Заполнен календарь заказов на месяц вперёд">
  <span class="tag w">Правило выхода</span><h2>Увольняйтесь, когда отмечены все пункты</h2>
  <div class="cl"></div>
  <p class="foot">Безопасный промежуточный шаг — сократить ставку на основной работе до 0,5 и освободить время, сохранив стабильный доход.</p>
</section>

<section class="panel">
  <span class="tag">Почему тариф окупается</span><h2>Boringtask — это ваши средства производства</h2>
  <div class="prose">
    <p>Вместо подписок на генератор картинок, генератор видео, фоторедактор и онлайн-доску у вас одно окно. Один средний заказ обычно покрывает месяц тарифа — остальное идёт в доход.</p>
    <p>Чем больше клиентов, тем важнее старший тариф: больше генераций, видео-модели и пакетная обработка экономят часы, а часы — это ваши деньги.</p>
  </div>
  <div class="row"><a class="btn money" href="${BT}" target="_blank" rel="noopener">Выбрать тариф на boringtask.ru</a></div>
</section>`}

function m7(){return `
<section class="panel tool" data-init="exam">
  <span class="tag">Экзамен · 10 вопросов</span><h2>Проверьте, готовы ли вы брать заказы</h2>
  <div id="exQ" style="display:flex;flex-direction:column;gap:1.2rem"></div>
  <button class="btn" id="exBtn" style="align-self:flex-start">Проверить ответы</button>
  <div id="exOut"></div>
</section>

<section class="panel tool" data-init="checklist" data-key="d90" data-items="Неделя 1: регистрация в Boringtask, выбор ниши, доска референсов|Неделя 2: портфолио из 9 работ на доске|Неделя 3: 2 кворка, объявление на Авито, шапка блога|Неделя 3–4: 10 холодных сообщений каждый день|Неделя 4: первые 3 оплаченных заказа и 3 отзыва|Месяц 2: 3 поста и 2 Reels в неделю по контент-плану|Месяц 2: пакеты «Старт / Магазин / Бренд» в прайсе|Месяц 3: первый клиент на абонементе|Месяц 3: доход ≥ 30 000 ₽, решение о следующей ступени">
  <span class="tag m">План на 90 дней</span><h2>Ваш личный трекер</h2>
  <div class="cl"></div>
  <p class="foot">Отметки сохраняются в этом браузере.</p>
</section>

<section class="panel" style="background:var(--ink);color:var(--bg);border-color:var(--ink)">
  <span class="eyebrow" style="color:inherit;opacity:.7">Следующий шаг</span>
  <h2>Откройте Boringtask и сделайте первую работу сегодня</h2>
  <p style="max-width:60ch;opacity:.85">Возьмите промпт из модуля «Промпты», сгенерируйте карточку в 2–3 моделях и доведите лучшую в редакторе. Это ваша первая работа в портфолио.</p>
  <div class="row"><a class="btn money" href="${BT}" target="_blank" rel="noopener">Перейти на boringtask.ru</a><button class="btn ghost" style="color:var(--bg)" data-go="li">Открыть практикум</button></div>
</section>`}

/* ---------- дополнительные разделы модулей ---------- */
const flip = (items) => `<div class="flips">${items.map(([f,b],i)=>`<button class="flip" data-init="flip" aria-pressed="false"><span class="ff"><span class="eyebrow">Миф ${i+1}</span><b>${f}</b><span class="hint">Нажмите, чтобы узнать правду</span></span><span class="fb"><span class="eyebrow">Как на самом деле</span>${b}</span></button>`).join("")}</div>`;
const dd = (bad,good) => `<div class="dd"><div class="dd-bad"><span class="eyebrow">Так не надо</span><ul>${bad.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="dd-good"><span class="eyebrow">Так продаёт</span><ul>${good.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`;
const tl = (rows) => `<ol class="tline">${rows.map(([t,h,d])=>`<li><span class="tt mono">${t}</span><div><b>${h}</b><p>${d}</p></div></li>`).join("")}</ol>`;

const EXTRA = {
m0: `
<section class="panel">
  <span class="tag">Мифы и правда</span>
  <h2>5 мифов, из-за которых новички бросают через неделю</h2>
  <p class="prose">Эти убеждения звучат разумно, но мешают начать зарабатывать. Переверните каждую карточку.</p>
  ${flip([
   ["Нейросеть всё сделает сама — дизайнер не нужен","Нейросеть делает черновик. Заказчик платит за попадание в задачу: формат площадки, фирменные цвета, текст без ошибок, правки. Это и есть ваша работа."],
   ["Нужно уметь рисовать","В курсе вы не рисуете ни одной линии руками. Нужны вкус и насмотренность — их тренируют модули «Промпты» и «Портфолио»."],
   ["Рынок уже занят","Селлеров, экспертов и малого бизнеса, которым нужен визуал, гораздо больше, чем людей, умеющих сдать его в срок и без переделок. Конкурируют качеством и скоростью, а не фактом владения нейросетью."],
   ["Нужен дорогой компьютер","Генерация идёт на серверах Boringtask. Хватит ноутбука с браузером и стабильного интернета."],
   ["Сначала пройду всё, потом начну искать заказы","Первые отклики — уже на третьей неделе. Портфолио и клиенты растут параллельно с обучением, иначе мотивация закончится раньше курса."]
  ])}
</section>

<section class="panel">
  <span class="tag">Режим обучения</span>
  <h2>Неделя нейродизайнера, который пока работает в офисе</h2>
  <p class="prose">Так учатся выпускники зарубежных программ по фрилансу: короткие ежедневные подходы и один длинный блок на выходных. Подстройте под себя, но сохраните ритм.</p>
  <div class="week">
    <div><b>Пн</b><span>40 мин</span><p>Один урок курса + повторить в Boringtask</p></div>
    <div><b>Вт</b><span>40 мин</span><p>3 генерации в своей нише, лучшую — на доску</p></div>
    <div><b>Ср</b><span>40 мин</span><p>Пост или Reels в блог по контент-плану</p></div>
    <div><b>Чт</b><span>40 мин</span><p>10 откликов или холодных сообщений</p></div>
    <div><b>Пт</b><span>отдых</span><p>Вдохновение: 20 минут в Pinterest и Behance</p></div>
    <div class="wk"><b>Сб</b><span>3 часа</span><p>Заказы или работа в портфолио</p></div>
    <div class="wk"><b>Вс</b><span>30 мин</span><p>Итоги недели: деньги, заявки, что улучшить</p></div>
  </div>
  <div class="callout money">Итого около 6 часов в неделю. Этого достаточно, чтобы к концу второго месяца выйти на первые 30 000 ₽ — при условии, что пункт «отклики» вы не пропускаете.</div>
</section>

<section class="panel tool" data-init="checklist" data-key="kit" data-items="Зарегистрировался в Boringtask и сменил временный пароль|Создал пространство «Портфолио» в Boringtask|Завёл папку «Нейродизайн» на компьютере: референсы, заказы, документы|Выбрал 2 ниши-кандидата (подскажет тест в модуле «Профессия»)|Создал Telegram-канал или страницу ВКонтакте под блог|Поставил в календарь 4 слота по 40 минут на эту неделю">
  <span class="tag m">Чек-лист</span>
  <h2>Стартовый набор за 15 минут</h2>
  <p class="prose">Сделайте это сегодня, пока есть энтузиазм. Отметки сохранятся в браузере.</p>
  <div class="cl"></div>
</section>`,

m1: `
<section class="panel">
  <span class="tag">Реальность профессии</span>
  <h2>Один рабочий день нейродизайнера</h2>
  <p class="prose">Обычный вторник фрилансера с тремя постоянными клиентами. Обратите внимание: генерация занимает меньше трети времени.</p>
  ${tl([
   ["09:30","Сообщения и правки","Селлер просит поменять цвет кнопки на карточке. 5 минут в редакторе, отправка по ссылке «ПОДЕЛИТЬСЯ»."],
   ["10:00","Генерация серии","8 карточек для нового товара: 3 модели в «Опциях», отбор лучших, удаление фона продукта."],
   ["12:00","Доводка","Текст на карточки, цветокоррекция, AI-масштаб для зума на маркетплейсе."],
   ["14:00","Блог","Пост «было → стало» по утреннему заказу и короткий Reels из той же работы."],
   ["15:00","Продажи","Ответ на 2 заявки из блога, бриф, предоплата 50%."],
   ["16:00","Сдача","Финальные файлы клиенту, просьба об отзыве и получение оплаты."]
  ])}
</section>

<section class="panel">
  <span class="tag">Кто платит</span>
  <h2>6 типов клиентов и что им на самом деле нужно</h2>
  <div class="grid">
    <div class="cell"><span class="k">Селлер WB/Ozon</span><b>Больше кликов по карточке</b><span class="k">Говорите о CTR и продажах, а не о «красоте».</span></div>
    <div class="cell"><span class="k">Эксперт, коуч, психолог</span><b>Выглядеть дороже конкурентов</b><span class="k">AI-фотосессия, обложки, единый стиль соцсетей.</span></div>
    <div class="cell"><span class="k">Кафе, салон, магазин</span><b>Постоянный поток контента</b><span class="k">Лучший кандидат на абонемент.</span></div>
    <div class="cell"><span class="k">Блогер</span><b>Обложки и превью быстро</b><span class="k">Ценит скорость: сдача за 24 часа.</span></div>
    <div class="cell"><span class="k">Агентство</span><b>Руки на подхвате</b><span class="k">Стабильный объём, но строгие сроки и бриф.</span></div>
    <div class="cell"><span class="k">Застройщик, дизайнер интерьера</span><b>Визуализация «как будет»</b><span class="k">Высокий чек за ракурс.</span></div>
  </div>
</section>

<section class="panel">
  <span class="tag w">Право и этика</span>
  <h2>Что можно продавать, а что опасно</h2>
  <p class="prose">Клиенты всё чаще спрашивают о правах. Это не юридическая консультация, а базовые правила безопасности.</p>
  ${dd([
   "Генерировать узнаваемых знаменитостей и реальных людей без их согласия",
   "Использовать чужие логотипы, бренды и персонажей",
   "Рисовать товар «лучше, чем он есть» — маркетплейсы наказывают за несоответствие",
   "Обещать клиенту «эксклюзивные авторские права» на сгенерированное"
  ],[
   "Фото клиента — только с его письменного согласия на обработку",
   "Свой стиль и свои персонажи вместо чужих",
   "Реальный товар на новом фоне: вы меняете сцену, а не сам продукт",
   "В договоре: «исполнитель передаёт права в том объёме, в котором ими обладает», и ссылка на условия использования Boringtask"
  ])}
  <div class="callout w">Перед первым коммерческим заказом прочитайте пользовательское соглашение Boringtask в разделе о коммерческом использовании генераций. Если клиент — крупная компания, предложите ему согласовать формулировку о правах со своим юристом.</div>
</section>

<section class="panel">
  <span class="tag">Навыки</span>
  <h2>За что платят больше, чем за генерацию</h2>
  <p class="prose">Зарубежные школы называют это «AI art direction»: нейросеть заменила руки, но не голову. Вот пять навыков, которые отличают дизайнера за 500 ₽ от дизайнера за 5 000 ₽.</p>
  <ol class="steps">
    <li><div><b>Бриф.</b> Задать клиенту правильные вопросы до начала работы. Готовая форма — в модуле «Клиенты».</div></li>
    <li><div><b>Отбор.</b> Из 40 вариантов показать 3 лучших и объяснить, почему они.</div></li>
    <li><div><b>Серийность.</b> Сделать 10 картинок в одном стиле, а не 10 разных.</div></li>
    <li><div><b>Доводка.</b> Руки, текст, артефакты, цвет — то, что выдаёт «нейросеть».</div></li>
    <li><div><b>Упаковка.</b> Сдать в нужных форматах и размерах под площадку.</div></li>
  </ol>
</section>`,

li: `
<section class="panel">
  <span class="tag">Приём профессионалов</span>
  <h2>Серия в одном стиле: главный навык для клиента</h2>
  <p class="prose">Курсы по бренд-дизайну с AI начинают именно с этого: клиенту нужна не одна красивая картинка, а лента, карточки или обложки, которые выглядят как одна семья.</p>
  <div class="series">
    <figure><img src="${pic("catA")}" alt="Рыжий кот в снегу" loading="lazy"><figcaption>Кадр 1</figcaption></figure>
    <figure><img src="${pic("catB")}" alt="Полосатый кот бежит по снегу" loading="lazy"><figcaption>Кадр 2</figcaption></figure>
    <figure><img src="${pic("spacecat")}" alt="Кот в скафандре" loading="lazy"><figcaption>Кадр 3 — уже другая серия</figcaption></figure>
  </div>
  <p class="prose">Первые два кадра — одна серия: тот же снег, тот же свет, та же оптика. Третий выпадает: меняется всё. Чтобы серия держалась:</p>
  <ol class="steps">
    <li><div><b>Зафиксируйте «ядро стиля».</b> Одна строка про свет, оптику и палитру, которую вы копируете в каждый промпт без изменений. Готовые ядра — в модуле «Промпты».</div></li>
    <li><div><b>Одна модель на серию.</b> Сравнивайте модели на первом кадре, дальше работайте в победившей.</div></li>
    <li><div><b>Одинаковое соотношение сторон и качество</b> во всех кадрах.</div></li>
    <li><div><b>Удачный кадр — в «Картинку в Картинку».</b> Категория слева в окне генератора: берёт ваш кадр за основу и сохраняет стиль.</div></li>
    <li><div><b>Финальная цветокоррекция одним слоем.</b> Одинаковые настройки «Яркость/Контраст» на всех кадрах выравнивают серию.</div></li>
  </ol>
</section>

<section class="panel">
  <span class="tag w">Насмотренность</span>
  <h2>7 признаков, по которым видно «сделано нейросетью»</h2>
  <p class="prose">Клиент может не знать слова «артефакт», но почувствует фальшь. Проверьте каждую работу перед сдачей.</p>
  <div class="tablewrap"><table><thead><tr><th>Признак</th><th>Где смотреть</th><th>Чем исправить в Boringtask</th></tr></thead><tbody>
   <tr><td>Лишние или слипшиеся пальцы</td><td>Руки, особенно с предметами</td><td>Маска для AI, режим In-Paint</td></tr>
   <tr><td>«Каша» вместо букв</td><td>Вывески, этикетки, упаковка</td><td>Удаление Переднего Плана + свой текст инструментом «Текст»</td></tr>
   <tr><td>Пластиковая кожа</td><td>Портреты</td><td>Шум «Оттенки Серого», значение 3–5</td></tr>
   <tr><td>Несогласованные тени</td><td>Предмет на новом фоне</td><td>Замена Освещения в меню «⋯»</td></tr>
   <tr><td>Перегруженный фон</td><td>Карточки товаров</td><td>Размытие «Гаусс» по выделенному фону</td></tr>
   <tr><td>Кислотная насыщенность</td><td>Вся картинка</td><td>Корректирующий слой «Яркость/Контраст»</td></tr>
   <tr><td>Мягкая, «мыльная» детализация</td><td>При увеличении</td><td>AI-масштаб ×2 или Повышение Качества</td></tr>
  </tbody></table></div>
</section>`,

le: `
<section class="panel tool" data-init="checklist" data-key="qc" data-items="Руки и пальцы в порядке|Текст читается и без ошибок|Нет артефактов по краям объекта после удаления фона|Тени совпадают с источником света|Цвета совпадают с брендбуком или фото товара|Размер под площадку: WB 900×1200, Ozon 1200×1600, YouTube 1280×720|Файл назван по-человечески: клиент_товар_01.jpg|Исходник с слоями сохранён в пространстве клиента">
  <span class="tag m">Контроль качества</span>
  <h2>Чек-лист перед сдачей клиенту</h2>
  <p class="prose">Агентства проверяют каждую работу по такому списку. Две минуты проверки экономят час на правках и сохраняют отзыв.</p>
  <div class="cl"></div>
</section>

<section class="panel">
  <span class="tag">До и после</span>
  <h2>Как показать правку, чтобы клиент сказал «вау»</h2>
  <p class="prose">Сама по себе хорошая картинка продаёт хуже, чем пара «было → стало». Этот приём одинаково работает в портфолио, в блоге и в отчёте клиенту.</p>
  <div class="series two">
    <figure><img src="${pic("car")}" alt="Исходник: неоновый спорткар" loading="lazy"><figcaption>Было: генерация</figcaption></figure>
    <figure><img src="${pic("bwcar")}" alt="После: черно-белая версия с корректирующим слоем" loading="lazy"><figcaption>Стало: корректирующий слой «Черное и Белое»</figcaption></figure>
  </div>
  <ol class="steps">
    <li><div>Перед правкой нажмите «Копия слоя» — оригинал останется для сравнения.</div></li>
    <li><div>Скачайте оба варианта одного размера.</div></li>
    <li><div>На доске поставьте их рядом и подпишите стикерами «Было» и «Стало».</div></li>
    <li><div>Отправьте клиенту ссылку «ПОДЕЛИТЬСЯ», а не два файла в мессенджер.</div></li>
  </ol>
</section>`,

lv: `
<section class="panel">
  <span class="tag">Раскадровка</span>
  <h2>Ролик из трёх сцен: схема, которую используют моушн-дизайнеры</h2>
  <p class="prose">Короткие ролики на 10–15 секунд строят по одной схеме. Её используют и в рекламе, и в Reels.</p>
  ${tl([
   ["0–3 с","Крючок","Самый эффектный кадр с движением камеры. Зритель решает, смотреть ли дальше."],
   ["3–9 с","Суть","Товар или результат крупно: вращение, деталь, «было → стало»."],
   ["9–15 с","Призыв","Финальный кадр со свободным местом под текст: цена, ссылка, «пишите в директ»."]
  ])}
  <div class="callout">Делайте каждую сцену отдельной генерацией по 5 секунд, а потом соберите их в категории «Склеить Видео». Так проще переделать одну сцену, не трогая остальные.</div>
</section>

<section class="panel">
  <span class="tag">Монтаж</span>
  <h2>Звук, текст и обложка: последние 10 % работы</h2>
  <div class="grid">
    <div class="cell"><span class="k">Звук</span><b>Трендовый трек</b><span class="k">Добавляйте музыку уже в приложении соцсети: так Reels получает больше показов.</span></div>
    <div class="cell"><span class="k">Текст</span><b>3–5 слов на экран</b><span class="k">Крупно, в верхней трети кадра: снизу его закроет интерфейс.</span></div>
    <div class="cell"><span class="k">Обложка</span><b>Отдельная картинка</b><span class="k">Сгенерируйте её в той же серии, что и видео. Лента выглядит цельно.</span></div>
    <div class="cell"><span class="k">Формат</span><b>9:16, до 15 секунд</b><span class="k">Для карточки маркетплейса — 3:4 и без звука.</span></div>
  </div>
</section>`,

m3: `
<section class="panel">
  <span class="tag">Структура кейса</span>
  <h2>Шаблон кейса: задача → решение → результат</h2>
  <p class="prose">На Behance и Dribbble сильные дизайнеры оформляют каждую работу как историю. Скопируйте шаблон и заполните для каждой работы.</p>
  <div class="out" id="caseTpl">Задача: [кто клиент] хотел [что], потому что [проблема].
Решение: сделал [что] в Boringtask — [модели, инструменты]. Ключевой приём: [одна фраза].
Результат: [цифра: CTR, просмотры, сроки] или [отзыв клиента одной фразой].
Срок: [N] часов. Стоимость: от [N] ₽.</div>
  <div class="row"><button class="btn ghost" data-copy="caseTpl">Скопировать шаблон</button></div>
</section>

<section class="panel">
  <span class="tag">Площадки</span>
  <h2>Где разместить портфолио и что там работает</h2>
  <div class="tablewrap"><table><thead><tr><th>Площадка</th><th>Кому показывать</th><th>Совет</th></tr></thead><tbody>
   <tr><td>Доска Boringtask по ссылке</td><td>Любому клиенту в личных сообщениях</td><td>Сгруппируйте работы по нишам, добавьте стикеры с ценами</td></tr>
   <tr><td>Telegram-канал</td><td>Экспертам и малому бизнесу</td><td>Закреплённый пост: 9 лучших работ альбомом + прайс</td></tr>
   <tr><td>ВКонтакте</td><td>Локальному бизнесу</td><td>Раздел «Товары» как витрина услуг с ценами</td></tr>
   <tr><td>Kwork, Профи.ру, Авито</td><td>Тем, кто ищет исполнителя прямо сейчас</td><td>3–5 работ строго под услугу в объявлении</td></tr>
   <tr><td>Behance</td><td>Агентствам и зарубежным клиентам</td><td>Полный кейс с процессом и описанием на английском</td></tr>
  </tbody></table></div>
</section>

<section class="panel">
  <span class="tag w">Разбор ошибок</span>
  <h2>Портфолио, которое не продаёт: 6 ошибок</h2>
  ${dd([
   "30 работ в 10 разных стилях",
   "Только «искусство»: драконы и космос",
   "Без подписей: непонятно, что за задача",
   "Работы для «воображаемых» клиентов, оформленные как реальные",
   "Ссылка открывается только после регистрации",
   "Нет цены и способа связаться"
  ],[
   "9 работ в 1–2 нишах",
   "Работы, которые решают задачи бизнеса: карточки, обложки, креативы",
   "Подпись «задача → решение → срок» под каждой",
   "Учебные работы честно помечены «концепт»",
   "Ссылка «ПОДЕЛИТЬСЯ» открывается в один клик",
   "Прайс «от» и контакт на первом экране"
  ])}
</section>`,

m6: `
<section class="panel">
  <span class="tag m">Продуктизация</span>
  <h2>Три пакета вместо почасовой оплаты</h2>
  <p class="prose">Главный совет зарубежных курсов по фрилансу: продавайте не часы, а понятные пакеты с фиксированной ценой. Клиенту проще выбрать, а средний чек растёт, потому что большинство выбирает средний вариант.</p>
  <div class="tiers">
    <div><span class="eyebrow">Старт</span><b class="mono">от 5 000 ₽</b><p>5 карточек товара, 1 раунд правок, сдача за 3 дня</p></div>
    <div class="best"><span class="eyebrow">Магазин · выбирают чаще</span><b class="mono">от 12 000 ₽</b><p>12 карточек, инфографика, 2 раунда правок, видео-обложка</p></div>
    <div><span class="eyebrow">Бренд</span><b class="mono">от 25 000 ₽</b><p>Карточки для всей линейки, стиль, 5 Reels, приоритетные сроки</p></div>
  </div>
  <p class="foot">Цены — пример. Посчитайте свои в тренажёре прайса в модуле «Клиенты».</p>
</section>`,

m7: `
<section class="panel">
  <span class="tag">Финальный проект</span>
  <h2>Дипломный кейс: визуальный набор для реального бизнеса</h2>
  <p class="prose">Так заканчиваются лучшие программы: не тестом, а проектом для живого заказчика. Найдите знакомый бизнес (кафе, мастер, магазин) и сделайте для него бесплатно или за символическую цену:</p>
  <div class="dipl">
    <div class="dp"><div class="dpv posts" aria-hidden="true"><i></i><i></i><i></i></div><b><span class="bkn">1</span>3 карточки или поста</b><span>в одном стиле</span></div>
    <div class="dp"><div class="dpv reel" aria-hidden="true"><i><svg viewBox="0 0 24 24"><path d="M9 7l8 5-8 5z"/></svg></i><span>0–15 с</span></div><b><span class="bkn">2</span>1 Reels на 15 секунд</b><span>из трёх сцен</span></div>
    <div class="dp"><div class="dpv cover" aria-hidden="true"><i></i><em></em></div><b><span class="bkn">3</span>Обложка для соцсетей</b><span>под размеры площадки</span></div>
    <div class="dp"><div class="dpv ba" aria-hidden="true"><i>было</i><i>стало</i></div><b><span class="bkn">4</span>Кейс «было → стало»</b><span>и отзыв владельца</span></div>
  </div>
  <div class="dipl-res">
    <span class="dr-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg></span>
    <div><b>Что вы получите</b><span>Первый кейс в портфолио с реальным отзывом. А владелец бизнеса — ваш первый кандидат на абонемент.</span></div>
  </div>
</section>

<section class="panel">
  <span class="tag">Что дальше</span>
  <h2>5 направлений роста после курса</h2>
  <p class="prose">Выберите одно направление на ближайшие 3 месяца и доведите его до первых заказов — так рост быстрее, чем по чуть-чуть во всём.</p>
  <div class="grow">
    <div class="gw" style="--c:var(--dusk)"><span class="gw-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg></span><b>Моушн и видеореклама</b><span>Самый быстрорастущий запрос: чек ролика выше чека картинки.</span><button class="gw-go" data-go="lv">Повторить: модуль 08 →</button></div>
    <div class="gw" style="--c:var(--sky)"><span class="gw-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h8M8 16h5"/></svg></span><b>Прототипы сайтов</b><span>UI-элементы и «Генерировать UI» в Boringtask.</span><button class="gw-go" data-go="ui">Повторить: модуль 10 →</button></div>
    <div class="gw" style="--c:var(--hot)"><span class="gw-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="12" cy="15" r="4"/></svg></span><b>Брендинг</b><span>Логотип, палитра и стиль — самый дорогой пакет.</span><button class="gw-go" data-go="bk">Повторить: модуль 09 →</button></div>
    <div class="gw" style="--c:var(--slate)"><span class="gw-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg></span><b>Интерьеры и недвижимость</b><span>Out-Painting и Замена Материала дают «вау» для застройщиков.</span><button class="gw-go" data-go="le">Повторить: модуль 07 →</button></div>
    <div class="gw" style="--c:var(--sun)"><span class="gw-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg></span><b>Обучение</b><span>Свои мастер-классы и консультации для новичков.</span><span class="gw-tag">через год практики</span></div>
  </div>
</section>`
};
const EXTRA_BEFORE_LAST = {m6:1, m7:1, li:1, le:1, lv:1};
function withExtra(id, html){
  const x=EXTRA[id]; if(!x) return html;
  if(EXTRA_BEFORE_LAST[id]){const k=html.lastIndexOf("<section"); if(k>0) return html.slice(0,k)+x+html.slice(k)}
  return html+x;
}

/* ---------- интерактив ---------- */
const INIT = {
 flip(el){el.onclick=()=>el.setAttribute("aria-pressed",el.getAttribute("aria-pressed")==="true"?"false":"true")},
 lab(el){
  const tab=el.dataset.tab;let idx=0,lang=store.get("lablang","ru");
  const pick=el.querySelector("#labPick"),box=el.querySelector("#labEx");
  const tr=s=>s&&lang==="ru"&&LAB_RU[s]||s;
  const drawTabs=()=>{
   pick.innerHTML=LAB[tab].items.map((x,i)=>`<button class="chip" data-i="${i}" aria-pressed="${i===idx}">${i+1}. ${x.t}</button>`).join("");
   pick.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{idx=+c.dataset.i;drawTabs()});
   drawEx()};
  const drawEx=()=>{const x=LAB[tab].items[idx];
   box.innerHTML=`<div class="ex">
    <div class="ex-meta">
     <h2>${x.t}</h2>
     <div class="row"><span class="tag">${x.who}</span><span class="tag m">${x.price}</span><span class="tag w">≈ ${x.time}</span></div>
     <div class="win"><div class="win-bar"><i></i><i></i><i></i>&nbsp;Boringtask · настройки</div><div class="win-body">${x.set.map(r=>`<div class="ui-r"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}</div></div>
     ${x.prompt?`<div class="panel" style="padding:1rem;gap:.6rem"><div class="langhead"><span class="eyebrow">${tab==="video"?"Промпт движения":tab==="edit"?"Промпт для этого шага":"Промпт"}</span>${LANGSW}</div><div class="out">${esc(tr(x.prompt))}</div>
       ${x.neg?`<span class="eyebrow">Негативный промпт</span><div class="out">${esc(tr(x.neg))}</div>`:""}
       <div class="row"><button class="btn" data-copy="p">Копировать промпт</button>${x.neg?`<button class="btn ghost" data-copy="n">Копировать негативный</button>`:""}</div></div>`:""}
    </div>
    <div class="stepper">
     <span class="eyebrow">Все шаги · ${x.steps.length}</span>
     <ol class="steps" style="margin-top:.6rem">${x.steps.map(t=>`<li><div><b>${t[0]}.</b> ${t[1]}</div></li>`).join("")}</ol>
     <span class="tag m" style="align-self:flex-start">✓ Готово — сохраните результат в портфолио</span>
    </div></div>`;
   const sw=box.querySelector(".langsw");
   if(sw) langSwitch(sw.parentElement,"lablang",l=>{lang=l;drawEx()});
   box.querySelectorAll("[data-copy]").forEach(b=>b.onclick=e=>copyText(tr(b.dataset.copy==="p"?x.prompt:x.neg),e.currentTarget));
  };
  drawTabs();
 },
 coretpl(el){
  const T={en:"[SUBJECT], soft dusk light, lavender and sky blue palette, deep navy shadows, 50mm, calm editorial mood, matte texture",
   ru:"[СЮЖЕТ], мягкий сумеречный свет, лавандовая и небесно-голубая палитра, глубокие тёмно-синие тени, 50 мм, спокойное журнальное настроение, матовая фактура"};
  const out=el.querySelector("#coreTpl");
  const lang=langSwitch(el.querySelector(".langhead"),"corelang",l=>out.textContent=T[l]);
  out.textContent=T[lang()];
 },
 formula(el){
  const F=[["Сюжет","Кто, что, где","a detective in a trench coat under a streetlamp","детектив в плаще под уличным фонарём"],
   ["Ядро стиля","Жанр, эпоха, техника","film noir, 1940s, black and white","фильм-нуар, 1940-е, чёрно-белое"],
   ["Атмосфера","Свет, цвет, эмоция","dramatic chiaroscuro, rain-slicked, mysterious","драматичная светотень, мокрый от дождя асфальт, загадочность"],
   ["Техника","Формат и качество","3:4, highly detailed, sharp focus","3:4, высокая детализация, резкий фокус"]];
  const steps=el.querySelector("[data-fsteps]"), out=el.querySelector("[data-fout]");
  const ex=f=>lang()==="en"?f[2]:f[3];
  const draw=()=>{steps.innerHTML=F.map((f,i)=>`<div class="fstep" style="--fc:var(--f${i+1})"><span class="fnum">${i+1}</span><b>${f[0]}</b><span class="fwhat">${f[1]}</span><span class="fex">${ex(f)}</span></div>`).join("");
   out.innerHTML=F.map((f,i)=>`<span class="fpart" style="--fc:var(--f${i+1})">${ex(f)}</span>`).join(", ")};
  const lang=langSwitch(el.querySelector(".langhead"),"fmlang",draw); draw();
  el.querySelector("[data-fcopy]").onclick=e=>copyText(F.map(ex).join(", "),e.target);
 },
 styles(el){
  const S=[["Нуарный детектив","film noir, 1940s, black and white, high contrast, dramatic chiaroscuro lighting, rain-slicked streets","фильм-нуар, 1940-е, чёрно-белое, высокий контраст, драматичная светотень, мокрые от дождя улицы"],
   ["Неоновый киберпанк","cyberpunk, neon-noir, cinematic, rainy night, futuristic megacity, holographic ads","киберпанк, неонуар, кинематографично, дождливая ночь, футуристический мегаполис, голографическая реклама"],
   ["Импрессионизм","impressionism, oil painting, loose visible brushstrokes, play of light, vibrant color","импрессионизм, масляная живопись, свободные видимые мазки, игра света, яркий цвет"],
   ["Детская акварель","children's book illustration, watercolor and gouache, soft textures, whimsical, gentle lighting","иллюстрация для детской книги, акварель и гуашь, мягкие текстуры, сказочность, нежный свет"],
   ["Изометрия Low-Poly","isometric view, low-poly style, pastel colors, soft shadows, diorama, cozy","изометрия, стиль low-poly, пастельные цвета, мягкие тени, диорама, уют"],
   ["Ретрофутуризм 50-х","retrofuturism 1950s, atompunk, optimistic future, streamlined shapes, chrome details, vintage poster","ретрофутуризм 1950-х, атомпанк, оптимистичное будущее, обтекаемые формы, хромированные детали, винтажный постер"],
   ["Синтвейв","synthwave, outrun, vibrant pink and cyan neon grid, digital sunset, retro 80s","синтвейв, аутран, яркая розово-бирюзовая неоновая сетка, цифровой закат, ретро 80-х"],
   ["Плёночная ностальгия","35mm film photography, Kodak Portra, grainy, soft colors, nostalgic 90s summer, natural light","плёночная фотография 35 мм, Kodak Portra, зерно, мягкие цвета, ностальгическое лето 90-х, естественный свет"],
   ["Заброшенное место","abandoned place photography, decay and nature reclaiming, beams of light, atmospheric dust","фотография заброшенного места, разрушение и природа, забирающая своё, лучи света, пыль в воздухе"],
   ["Двойная экспозиция","double exposure photography, silhouette blending with landscape, poetic, dreamlike","фотография с двойной экспозицией, силуэт сливается с пейзажем, поэтично, как во сне"],
   ["Японская гравюра","ukiyo-e, Japanese woodblock print, flat colors, bold outlines, traditional patterns","укиё-э, японская гравюра на дереве, плоские цвета, жирные контуры, традиционные узоры"],
   ["Амигуруми","amigurumi, crocheted plush toy, soft yarn texture, cute, handmade, button eyes","амигуруми, вязаная плюшевая игрушка, мягкая текстура пряжи, мило, ручная работа, глаза-пуговки"],
   ["Lofi-обложка","lofi album cover, cozy room with rainy window, warm glow, nostalgic, anime style","обложка lofi-альбома, уютная комната с дождливым окном, тёплое свечение, ностальгия, аниме-стиль"],
   ["Соло-путешествие","tranquil solitude, vast empty landscape, one small figure, soft mist, cool blues, contemplative","спокойное уединение, огромный пустой пейзаж, одна маленькая фигура, лёгкая дымка, холодные синие тона, созерцательность"],
   ["Тёмная академия","dark academia, moody scholarly, old libraries, tweed, candlelight, classical busts, autumn","тёмная академия, мрачная учёная атмосфера, старые библиотеки, твид, свечи, классические бюсты, осень"],
   ["VHS-эффект","VHS tape, tracking errors, rolling static, distorted colors, analog decay","VHS-кассета, сбои трекинга, бегущие помехи, искажённые цвета, аналоговый износ"],
   ["Советский мультфильм","Soviet cartoon style, painterly backgrounds, expressive large eyes, watercolor textures","стиль советского мультфильма, живописные фоны, выразительные большие глаза, акварельные текстуры"],
   ["Пиксель-арт 90-х","pixel art, 256-color palette, point-and-click adventure game, simple UI","пиксель-арт, палитра на 256 цветов, point-and-click квест, простой интерфейс"],
   ["Премиум-товар","luxury product photography, dark marble surface, dramatic rim light, reflections, minimal","предметная съёмка премиум-товара, тёмная мраморная поверхность, драматичный контровой свет, отражения, минимализм"],
   ["Минимализм бренда","minimalist brand photography, monochrome pastel background, soft shadows, lots of negative space","минималистичная бренд-фотография, однотонный пастельный фон, мягкие тени, много пустого пространства"]];
  const box=el.querySelector("#stLib");
  const txt=s=>lang()==="en"?s[1]:s[2];
  box.innerHTML=S.map((s,i)=>`<button class="cell" data-i="${i}" style="all:unset;cursor:pointer;background:var(--sunk);border-radius:10px;padding:1rem;display:flex;flex-direction:column;gap:.4rem;min-width:0"><b>${s[0]}</b><span class="mono" data-st style="font-size:.8rem;color:var(--muted)"></span><span class="k" style="font-size:.78rem;color:var(--accent)">Скопировать</span></button>`).join("");
  const draw=()=>box.querySelectorAll("button").forEach(b=>b.querySelector("[data-st]").textContent=txt(S[+b.dataset.i]));
  const lang=langSwitch(el.querySelector(".langhead"),"stlang",draw); draw();
  box.querySelectorAll("button").forEach(b=>b.onclick=()=>{const s=txt(S[+b.dataset.i]);const lab=b.querySelector("span:last-child");
   const ok=()=>{lab.textContent="Скопировано";setTimeout(()=>lab.textContent="Скопировать",1300)};
   try{navigator.clipboard.writeText(s).then(ok,()=>{lab.textContent="Выделите текст выше вручную"})}catch(e){lab.textContent="Выделите текст выше вручную"}});
 },
 tpl(el){
  const T=[["Карточка товара","[product, material, color] on [surface], [props], commercial product photography, soft window light, clean background, 3:4","[товар, материал, цвет] на [поверхность], [реквизит], коммерческая предметная съёмка, мягкий свет из окна, чистый фон, 3:4"],
   ["Фото эксперта","professional portrait of [who, age], [profession], [clothes], in [place], soft natural light, 85mm, shallow depth of field","профессиональный портрет: [кто, возраст], [профессия], [одежда], в [место], мягкий естественный свет, 85 мм, малая глубина резкости"],
   ["Обложка YouTube","YouTube thumbnail, [emotion] person [action], [key object], high contrast, rim light, bold background [color], 16:9","обложка YouTube, [эмоция] человек [действие], [ключевой объект], высокий контраст, контровой свет, яркий фон [цвет], 16:9"],
   ["Еда для кафе","[dish] on [plate], top view, [garnish], natural daylight, food styling, appetizing, editorial food photography","[блюдо] на [тарелка], вид сверху, [украшение], естественный дневной свет, фуд-стайлинг, аппетитно, журнальная фуд-фотография"],
   ["Интерьер","[room], [style] interior, [floor], [walls], [3 furniture items], daylight, architectural photography, wide angle","[комната], интерьер в стиле [стиль], [пол], [стены], [3 предмета мебели], дневной свет, архитектурная фотография, широкий угол"],
   ["Фон для рекламы","abstract [color] background, [shapes], soft gradient light, empty space for text on the [side], minimal, 16:9","абстрактный [цвет] фон, [формы], мягкий градиентный свет, пустое место для текста [сторона], минимализм, 16:9"]];
  const body=el.querySelector("[data-tplbody]");
  const txt=t=>lang()==="en"?t[1]:t[2];
  const draw=()=>{body.innerHTML=T.map((t,i)=>`<tr><td>${t[0]}</td><td class="mono" style="color:var(--ink);font-weight:400;white-space:normal">${txt(t)}</td><td><button class="linkbtn" data-ti="${i}">Скопировать</button></td></tr>`).join("");
   body.querySelectorAll("[data-ti]").forEach(b=>b.onclick=()=>{const ok=()=>{b.textContent="Скопировано";setTimeout(()=>b.textContent="Скопировать",1300)};
    try{navigator.clipboard.writeText(txt(T[+b.dataset.ti])).then(ok,()=>toast("Выделите шаблон вручную"))}catch(e){toast("Выделите шаблон вручную")}})};
  const lang=langSwitch(el.querySelector(".langhead"),"tpllang",draw); draw();
 },
 doctor(el){
  const D=[
   ["Картинка размытая, «мыльная»","Мало шагов или нет указаний качества.","Добавьте «highly detailed, sharp focus», поднимите шаги шумоподавления до 30–35, в негативный промпт — «blurry, low quality». Потом инструмент «Масштаб» → нейросетью ×2."],
   ["Модель игнорирует часть промпта","Слишком длинный промпт или низкая степень соответствия (CFG).","Перенесите главное в начало, уберите второстепенное. Поднимите CFG до 7–9. У моделей с CFG 1 по умолчанию (New Reality, DreamShaper Enhanced) поднимите до 5–7."],
   ["Лишние пальцы, кривые руки","Классическая слабость диффузионных моделей.","Не перегенерируйте всю картинку: в редакторе выберите «Маску для AI», закрасьте руку, опишите «natural hand, five fingers» и нажмите «Продолжить»."],
   ["Текст с ошибками","Нейросети плохо пишут, особенно кириллицей.","Генерируйте без текста («no text» в негативном промпте) и добавьте надпись инструментом «Текст». Для коротких английских слов попробуйте GPT Image или Nano Banana."],
   ["Серия выглядит разной","Меняется модель, ядро стиля или seed.","Зафиксируйте модель и ядро стиля, задайте одинаковый seed. Меняйте только действие и ракурс."],
   ["Слишком «нейросетевой» пластиковый вид","Перегруженные эпитеты, высокий CFG, «идеальность».","Добавьте «35mm film, natural skin texture, subtle grain», снизьте CFG до 6. После генерации — инструмент «Шум», 3–5%."],
   ["Товар не похож на реальный","Нейросеть дорисовывает свою версию.","Не генерируйте сам товар: сфотографируйте его, загрузите через «Локальный Файл», удалите фон и генерируйте только сцену вокруг."],
   ["Видео дёргается или лицо «плывёт»","Слишком большое движение или мало шагов.","Описывайте маленькие движения, добавьте «static camera, smooth motion», поднимите шаги инференса до 50. В Hunyuan — Flow Shift 12."]];
  const pick=el.querySelector("#docPick"),out=el.querySelector("#docOut");
  pick.innerHTML=D.map((d,i)=>`<button class="chip" data-i="${i}" aria-pressed="false">${d[0]}</button>`).join("");
  pick.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{pick.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===c));const d=D[+c.dataset.i];
   out.innerHTML=`<div class="grid"><div class="cell"><span class="k">Причина</span><span>${d[1]}</span></div><div class="cell" style="background:var(--money-soft)"><span class="k">Что сделать в Boringtask</span><span>${d[2]}</span></div></div>`});
  pick.querySelector(".chip").click();
 },
 brief(el){
  const ids=["bName","bBiz","bWhat","bWhere","bStyle","bDead","bBudget"];
  const make=()=>{const v=ids.map(i=>el.querySelector("#"+i).value.trim()||"—");
   el.querySelector("#bOut").textContent=`БРИФ НА ВИЗУАЛ\n\nКлиент: ${v[0]}\nБизнес / продукт: ${v[1]}\nЧто нужно сделать: ${v[2]}\nГде будет размещено: ${v[3]}\nСтиль и референсы: ${v[4]}\nСрок: ${v[5]}\nБюджет: ${v[6]}\n\nВключено: 2 круга правок, показ вариантов на онлайн-доске.\nНе включено: съёмка, тексты для карточек, правки после утверждения.\nОплата: 50% предоплата, 50% после утверждения.\n\nПожалуйста, приложите: логотип, фирменные цвета, 3–5 примеров, которые нравятся, и 1–2, которые не нравятся.`};
  ids.forEach(i=>el.querySelector("#"+i).oninput=make);make();el.querySelector("#bCopy").onclick=e=>copyText(el.querySelector("#bOut").textContent,e.currentTarget);
 },
 reels(el){
  const R={
   seller:{t:"Карточка WB: было / стало",s:[["0–3 с","Хук: слабая карточка клиента на весь экран, текст «Почему это не покупают?»","Скриншот исходника, без генерации"],["3–8 с","Процесс: быстрые кадры редактора Boringtask — удаление фона, новая сцена","Запись экрана, ускорение ×4"],["8–13 с","Результат: новая карточка оживает","Картинка в видео: «slow camera push-in, soft light flicker, static product»"],["13–15 с","Призыв: «Переделаю 1 карточку бесплатно — пиши ФОТО»","Текст поверх последнего кадра"]]},
   expert:{t:"Фото эксперта без фотографа",s:[["0–3 с","Хук: обычное селфи, текст «Это селфи за 2 минуты стало фотосессией»","Исходное фото клиента"],["3–9 с","Слайд-шоу 4 образов из AI-фотосессии","Seedream 5 Lite, серия в одном стиле"],["9–13 с","Лучший портрет оживает: улыбка, поворот головы","Картинка в видео: «gentle smile, slight head turn, static camera»"],["13–15 с","Призыв: «Хочешь так же — пиши ОБРАЗ»","Текст поверх кадра"]]},
   cafe:{t:"Меню, которое хочется съесть",s:[["0–3 с","Хук: «Мы сделали рекламу кофейни без съёмки»","Текст на атмосферном кадре кафе"],["3–8 с","Бариста рисует латте-арт","Текст в видео, WAN 2.7: «barista pouring latte art, slow motion, warm sunlight, 9:16»"],["8–13 с","Капля мёда на панкейки в slow-motion","Текст в видео + интерполяция 60 fps"],["13–15 с","Логотип кофейни и адрес","Анимация логотипа: картинка в видео"]]},
   youtube:{t:"Обложка, которая кликается",s:[["0–3 с","Хук: две обложки рядом, «Какая наберёт больше?»","Старая и новая обложка, сравнение"],["3–9 с","Разбор: 3 причины, почему новая лучше (лицо, контраст, 3 слова)","Стрелки и стикеры на доске Boringtask"],["9–13 с","Процесс генерации в 2 моделях","Запись экрана, ускорение"],["13–15 с","Призыв: «Разберу твою обложку — кидай в комменты»","Текст поверх кадра"]]}};
  const sel=el.querySelector("#rsN");
  const make=()=>{const r=R[sel.value];
   el.querySelector("#rsT").innerHTML=`<thead><tr><th>Время</th><th>Что на экране</th><th>Как сделать в Boringtask</th></tr></thead><tbody>${r.s.map(x=>`<tr><td class="mono">${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody>`;
   el.querySelector("#rsRaw").textContent=`Reels: ${r.t}\n`+r.s.map(x=>`${x[0]} — ${x[1]} (${x[2]})`).join("\n")};
  sel.oninput=make;make();
  el.querySelector("#rsCopy").onclick=e=>{const raw=el.querySelector("#rsRaw");raw.hidden=false;copyText(raw.textContent,e.currentTarget)};
 },
 freedom(el){
  const ids=["fz","fc","fh","ft"],v=()=>ids.map(i=>+el.querySelector("#"+i).value||0);
  const calc=()=>{const [z,c,h,t]=v();const net=c*0.94;const need=Math.ceil((z+t)/Math.max(net,1));
    const hours=need*h;const rate=net/Math.max(h,.5);const pay=t>0?(t/Math.max(net,1)):0;
    el.querySelector("#fout").innerHTML=
     `<div class="cell"><span class="k">Заказов в месяц, чтобы заменить зарплату</span><span class="v money mono">${need}</span><span class="k">≈ ${Math.ceil(need/4.3)} в неделю</span></div>
      <div class="cell"><span class="k">Часов работы в месяц</span><span class="v mono">${Math.round(hours)}</span><span class="k">≈ ${Math.round(hours/4.3)} ч в неделю против ~40 на работе</span></div>
      <div class="cell"><span class="k">Ваша ставка за час</span><span class="v money mono">${fmt(rate)}</span><span class="k">после налога 6%</span></div>
      <div class="cell"><span class="k">Тариф окупается за</span><span class="v mono">${pay<=1?"1 заказ":pay.toFixed(1)+" заказа"}</span><span class="k">дальше — ваш доход</span></div>`};
  ids.forEach(i=>el.querySelector("#"+i).oninput=calc);calc();
 },
 niche(el){
  const Q=[
   {q:"Что вам ближе?",o:[["Продажи и цифры","wb"],["Люди и лица","photo"],["Видео и движение","video"],["Пространство и уют","interior"]]},
   {q:"Сколько часов в неделю есть сейчас?",o:[["5–7 часов","wb"],["8–12 часов","photo"],["12+ часов","video"],["Нерегулярно","interior"]]},
   {q:"Кто вокруг вас?",o:[["Знакомые с магазинами","wb"],["Эксперты и блогеры","photo"],["Креаторы и SMM","video"],["Ремонт, недвижимость","interior"]]},
   {q:"Что хочется сделать первым?",o:[["Карточку товара","wb"],["Портрет в новом образе","photo"],["Ожившую картинку","video"],["Комнату мечты","interior"]]}];
  const R={wb:["Карточки и инфографика для маркетплейсов","Самый быстрый спрос: селлеров тысячи, задачи повторяются. Стартовый оффер: «5 карточек за 48 часов».","Карточки товаров для WB/Ozon"],
   photo:["AI-фотосессии и визуал экспертов","Высокий чек и сарафан: один довольный эксперт приводит коллег. Оффер: «20 фото в 3 образах за 3 дня».","AI-фотосессия для эксперта (20 фото)"],
   video:["Reels, AI-ролики и креативы","Видео дороже картинок и в дефиците. Оффер: «3 Reels для вашего продукта за неделю».","AI-ролик / Reels 10–15 сек"],
   interior:["Визуализация интерьеров","Дизайнеры и агентства недвижимости платят за скорость. Оффер: «3 стиля одной комнаты за сутки».","Визуализация интерьера"]};
  el.querySelector("#nicheQ").innerHTML=Q.map((x,i)=>`<fieldset class="q" style="border:0;padding:0;margin:0"><legend><b>${i+1}. ${x.q}</b></legend>${x.o.map((o,j)=>`<label class="opt"><input type="radio" name="nq${i}" id="nq${i}_${j}" value="${o[1]}"><span>${o[0]}</span></label>`).join("")}</fieldset>`).join("");
  el.querySelector("#nicheBtn").onclick=()=>{const c={};let n=0;Q.forEach((_,i)=>{const s=el.querySelector(`input[name=nq${i}]:checked`);if(s){c[s.value]=(c[s.value]||0)+1;n++}});
   const out=el.querySelector("#nicheOut");if(n<Q.length){out.innerHTML=`<div class="callout w">Ответьте на все ${Q.length} вопроса — осталось ${Q.length-n}.</div>`;return}
   const k=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];const r=R[k];const s=SERVICES.find(x=>x.name===r[2]);store.set("niche",k);
   out.innerHTML=`<div class="callout"><b style="font-size:1.1rem">${r[0]}</b><br>${r[1]}<br><span class="mono">Цена старта: ${s.min.toLocaleString("ru-RU")}–${Math.round((s.min+s.max)/2).toLocaleString("ru-RU")} ₽ ${s.unit}</span></div>`};
 },
 prompt(el){
  const f=["pSub","pSty","pLig","pFmt"].map(i=>el.querySelector("#"+i));
  const SUB={ru:"керамическая кружка кофе на деревянном столе, пар",en:"ceramic coffee mug on a wooden table, steam"};
  const HINT={ru:"Промпт на русском. Для более точного результата переключитесь на английский.",en:"Сюжет вставляется как вы его написали — для английского промпта напишите сюжет по-английски."};
  const val=s=>lang()==="en"?s.value:s.selectedOptions[0].dataset.ru;
  const make=()=>{const q=lang()==="en"?"highly detailed, sharp focus":"высокая детализация, резкий фокус";
   el.querySelector("#pOut").textContent=`${f[0].value.trim()}, ${val(f[1])}, ${val(f[2])}, ${q}, ${val(f[3])}`;
   el.querySelector("[data-phint]").textContent=HINT[lang()]};
  const lang=langSwitch(el.querySelector(".langhead"),"pblang",l=>{const other=l==="en"?"ru":"en";if(f[0].value.trim()===SUB[other])f[0].value=SUB[l];make()});
  if(f[0].value.trim()===SUB.ru&&lang()==="en")f[0].value=SUB.en;
  f.forEach(x=>x.oninput=make);make();el.querySelector("#pCopy").onclick=e=>copyText(el.querySelector("#pOut").textContent,e.currentTarget);
 },
 pitch(el){
  const T={seller:["Здравствуйте! Смотрела ваш товар на маркетплейсе —","Я нейродизайнер, делаю карточки, которые выделяются в выдаче. Сделала бесплатный вариант главного фото — прикрепляю.","Если нравится, могу так же оформить остальные карточки. Показать, сколько это стоит?"],
   expert:["Здравствуйте! Читаю ваш блог и заметила, что","Я нейродизайнер: делаю AI-фотосессии и обложки для экспертов без студии и фотографа. Сделала пример обложки в вашем стиле — прикрепляю.","Хотите такую же серию фото в 3 образах?"],
   cafe:["Здравствуйте! Была у вас в профиле и заметила, что","Я делаю визуал для кафе с помощью нейросетей: фото блюд, афиши, Reels. Набросала пример поста для вашего меню — прикрепляю.","Интересно сделать так весь месяц?"],
   youtube:["Здравствуйте! Смотрю ваш канал и обратила внимание, что","Я делаю обложки, на которые чаще кликают. Переделала превью вашего последнего видео — прикрепляю для сравнения.","Хотите протестировать на следующих трёх роликах?"]};
  const ids=["cWho","cName","cSeen"].map(i=>el.querySelector("#"+i));
  const make=()=>{const t=T[ids[0].value];el.querySelector("#cOut").textContent=`${t[0]} ${ids[2].value.trim()}.\n\n${t[1]}\n\n${t[2]}\n\n${ids[1].value.trim()}, нейродизайнер`};
  ids.forEach(x=>x.oninput=make);make();el.querySelector("#cCopy").onclick=e=>copyText(el.querySelector("#cOut").textContent,e.currentTarget);
 },
 price(el){
  const S=el.querySelector("#prS"),Q=el.querySelector("#prQ"),L=el.querySelector("#prL");
  el.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{c.setAttribute("aria-pressed",c.getAttribute("aria-pressed")==="true"?"false":"true");calc()});
  const calc=()=>{const s=SERVICES.find(x=>x.id===S.value);const q=Math.max(1,+Q.value||1);
   const base=s.min+(s.max-s.min)*(+L.value);let mult=1;const extras=[];
   el.querySelectorAll('.chip[aria-pressed="true"]').forEach(c=>{mult+=+c.dataset.x;extras.push(c.textContent.replace(/ \(.+\)/,""))});
   const disc=q>=10?0.85:q>=5?0.9:1;const unit=Math.round(base*mult/50)*50;const total=Math.round(unit*q*disc/100)*100;
   el.querySelector("#prOut").innerHTML=`<div class="cell"><span class="k">Цена ${s.unit}</span><span class="v mono">${fmt(unit)}</span></div>
     <div class="cell"><span class="k">Скидка за объём</span><span class="v mono">${disc<1?Math.round((1-disc)*100)+"%":"нет"}</span></div>
     <div class="cell"><span class="k">Итого по заказу</span><span class="v money mono">${fmt(total)}</span><span class="k">предоплата 50%: ${fmt(total/2)}</span></div>`;
   el.querySelector("#prTxt").textContent=`${s.name} — ${q} шт.\nСрок: ${extras.includes("Срочно, 24 ч")?"24 часа":"3–5 рабочих дней"}\nВходит: ${["2 круга правок","сдача на онлайн-доске",...extras.filter(x=>x!=="Срочно, 24 ч")].join(", ")}\nСтоимость: ${fmt(total)}${disc<1?" (с учётом скидки за объём)":""}\nОплата: 50% предоплата, 50% после утверждения. Чек самозанятого.`};
  [S,Q,L].forEach(x=>x.oninput=calc);calc();el.querySelector("#prCopy").onclick=e=>copyText(el.querySelector("#prTxt").textContent,e.currentTarget);
 },
 plan(el){
  const N=el.querySelector("#cpN"),P=el.querySelector("#cpP");
  const rub=["До / после","Промпт дня","Разбор чужой работы","До / после (Reels)","Закулисье и цифры","До / после","Отзыв / кейс"];
  const idea={"До / после":n=>`Было → стало: ${n}, 2 слайда + подпись «что изменили»`,"Промпт дня":n=>`Промпт из Boringtask для темы «${n}» + результат 2 моделей`,"Разбор чужой работы":n=>`3 ошибки в популярной работе (${n}) и как исправить`,"До / после (Reels)":n=>`15-сек Reels: картинка в видео, ${n}`,"Закулисье и цифры":()=>"Сколько заказов и денег за неделю, сколько часов ушло","Отзыв / кейс":()=>"Скрин отзыва + задача → решение → результат"};
  const make=()=>{const n=N.value;const rows=[];for(let d=1;d<=14;d++){const r=rub[(d-1)%7];rows.push([d,r,idea[r](n),d%7===0?"Призыв: «Напишите ФОТО — переделаю бесплатно»":"Мягкий призыв в конце"])}
   el.querySelector("#cpT").innerHTML=`<thead><tr><th>День</th><th>Рубрика</th><th>Идея для ${esc(P.value)}</th><th>Призыв</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${esc(r[2])}</td><td>${r[3]}</td></tr>`).join("")}</tbody>`;
   el.querySelector("#cpRaw").textContent=rows.map(r=>`День ${r[0]} · ${r[1]}: ${r[2]} — ${r[3]}`).join("\n")};
  [N,P].forEach(x=>x.oninput=make);make();
  el.querySelector("#cpCopy").onclick=e=>{const raw=el.querySelector("#cpRaw");raw.hidden=false;copyText(raw.textContent,e.currentTarget)};
 },
 retainer(el){
  const ids=["rP","rN","rO","rH"];const calc=()=>{const [p,n,o,h]=ids.map(i=>+el.querySelector("#"+i).value||0);
   const inc=p*n+o;const hrs=n*h;el.querySelector("#rOut").innerHTML=
    `<div class="cell"><span class="k">Доход в месяц</span><span class="v money mono">${fmt(inc)}</span><span class="k">после налога 6%: ${fmt(inc*0.94)}</span></div>
     <div class="cell"><span class="k">Гарантированная база</span><span class="v mono">${fmt(p*n)}</span><span class="k">${inc?Math.round(p*n/inc*100):0}% дохода предсказуемы</span></div>
     <div class="cell"><span class="k">Часов на абонентов</span><span class="v mono">${hrs}</span><span class="k">ставка ${fmt(h?p/h:0)} в час</span></div>`};
  ids.forEach(i=>el.querySelector("#"+i).oninput=calc);calc();
 },
 checklist(el){
  const key=el.dataset.key,items=el.dataset.items.split("|");let st=store.get("cl_"+key,{});
  const box=el.querySelector(".cl");
  const draw=()=>{const n=items.filter((_,i)=>st[i]).length;
   box.innerHTML=`<div class="prog" style="margin-bottom:.4rem"><span class="mono">${n}/${items.length}</span><div class="bar"><b style="width:${n/items.length*100}%"></b></div></div>`+
    items.map((t,i)=>`<label class="opt"><input type="checkbox" id="cl_${key}_${i}" ${st[i]?"checked":""} data-i="${i}"><span>${t}</span></label>`).join("");
   box.querySelectorAll("input").forEach(c=>c.onchange=()=>{st[c.dataset.i]=c.checked;store.set("cl_"+key,st);draw()})};
  box.style.cssText="display:flex;flex-direction:column;gap:.5rem";draw();
 },
 exam(el){
  const Q=[
   {q:"Клиент просит 10 карточек. Какой первый шаг в Boringtask даст лучший результат?",o:["Сгенерировать одной моделью и сразу отправить","Отметить 2–3 модели в «Опциях» и сравнить варианты","Скачать чужие карточки и перекрасить"],a:1},
   {q:"Как убрать фон у товара?",o:["Ластиком вручную","«Три точки» над слоем → «Удаление фона» → тип «Объект»","Заливкой белым"],a:1},
   {q:"Что пишем в холодном сообщении первым?",o:["Конкретное наблюдение о бизнесе клиента","Прайс-лист","Историю о себе"],a:0},
   {q:"Какой формат даёт 40% контента блога?",o:["Мемы","До / после","Новости нейросетей"],a:1},
   {q:"Когда безопасно уходить с работы?",o:["После первого заказа","Когда доход 3 месяца подряд ≥ зарплаты и есть подушка","Когда надоест"],a:1},
   {q:"Какой рычаг делает доход предсказуемым?",o:["Скидки всем","Ежемесячные абонементы","Работа по ночам"],a:1},
   {q:"Нейросеть нарисовала лишний палец. Что быстрее всего?",o:["Перегенерировать всю картинку","Маска для AI на руку → описать → «Продолжить»","Отдать клиенту как есть"],a:1},
   {q:"Что писать в промпте для «Картинки в видео»?",o:["Подробное описание объекта","Движение: что двигается и как ведёт себя камера","Только название модели"],a:1},
   {q:"Как сделать серию из 10 картинок в одном стиле?",o:["Каждый раз новая модель","Одна модель, одно ядро стиля, одинаковый seed","Разные цвета в каждом промпте"],a:1},
   {q:"Как добавить русский текст на карточку без ошибок?",o:["Написать его в промпте","Сгенерировать фон с местом и добавить надпись инструментом «Текст»","Попросить клиента"],a:1}];
  el.querySelector("#exQ").innerHTML=Q.map((x,i)=>`<fieldset class="q" style="border:0;padding:0;margin:0"><legend><b>${i+1}. ${x.q}</b></legend>${x.o.map((o,j)=>`<label class="opt"><input type="radio" name="ex${i}" id="ex${i}_${j}" value="${j}"><span>${o}</span></label>`).join("")}</fieldset>`).join("");
  el.querySelector("#exBtn").onclick=()=>{let ok=0,miss=[];Q.forEach((x,i)=>{const s=el.querySelector(`input[name=ex${i}]:checked`);if(s&&+s.value===x.a)ok++;else miss.push(i+1)});
   store.set("examScore",ok);
   el.querySelector("#exOut").innerHTML=ok===Q.length?`<div class="callout"><b>${ok} из ${Q.length}. Вы готовы брать заказы.</b> Отметьте модуль пройденным и откройте Boringtask.</div>`:`<div class="callout w"><b>${ok} из ${Q.length}.</b> Пересмотрите вопросы: ${miss.join(", ")}.</div>`};
 }
};

/* ================= сквозной проект, видео, лента, сертификат ================= */
const PROJ = () => store.get("project",{biz:"",niche:"",client:""});
const PST = () => store.get("psteps",{});
const bizName = () => esc(PROJ().biz || "ваш проект");

const PSTEPS = {
 m0:{t:"Выберите проект",task:"Выберите реальный бизнес или свою нишу. Весь курс вы будете делать визуал именно для него, и в конце у вас будет один цельный кейс."},
 m1:{t:"Портрет клиента",task:"Опишите, кто покупает у «{biz}», какие 3 визуальные задачи у него болят и сколько он готов платить. 5–7 строк в заметке или стикером на доске."},
 m2:{t:"Пространство проекта",task:"Создайте в Boringtask дизайнерское пространство «Проект: {biz}». Добавьте стикеры-колонки: «Референсы», «Черновики», «Готово»."},
 ad:{t:"Мудборд и 3 направления",task:"Соберите на доске проекта 12 референсов и разложите их на 3 стилевых направления A / B / C. Подпишите каждое двумя словами."},
 pr:{t:"Ядро стиля",task:"Выберите одно направление и запишите для «{biz}» ядро стиля: свет, оптика, палитра, настроение. Проверьте его на 3 разных сюжетах."},
 li:{t:"3 ключевых изображения",task:"Сгенерируйте 3 главные картинки для «{biz}» в одном стиле: товар или услуга, атмосфера, человек. Лучшие — в колонку «Готово»."},
 le:{t:"Доводка и «было → стало»",task:"Доведите 3 картинки в редакторе по чек-листу качества и сделайте одну пару «было → стало»."},
 lv:{t:"Ролик на 15 секунд",task:"Соберите для «{biz}» Reels из трёх сцен: крючок, суть, призыв."},
 bk:{t:"Бренд-кит",task:"Соберите для «{biz}» палитру из 5 цветов, ядро стиля и 3 шаблона постов на одной доске."},
 ui:{t:"Прототип главного экрана",task:"Соберите главный экран сайта или приложения для «{biz}» из UI-элементов: шапка, первый экран, 3 карточки, кнопка."},
 m3:{t:"Кейс в портфолио",task:"Оформите проект «{biz}» как кейс по шаблону «задача → решение → результат» и поставьте его первым в портфолио."},
 m4:{t:"Предложение владельцу",task:"Напишите владельцу «{biz}» (или похожего бизнеса) сообщение с вашим кейсом и ценой. Отправьте его по-настоящему."},
 m5:{t:"3 поста о проекте",task:"Опубликуйте в блоге 3 поста о работе над «{biz}»: процесс, «было → стало», результат."},
 au:{t:"Конвейер на 20 единиц",task:"Сделайте для «{biz}» серию из 20 карточек или постов за один вечер по конвейеру из модуля. Засеките время."},
 m6:{t:"Абонемент",task:"Составьте для «{biz}» три пакета на месяц: Старт, Оптимальный, Максимум — с ценами и объёмом."},
 m7:{t:"Финальная сборка",task:"Соберите все шаги в один кейс, пройдите экзамен и отправьте финальный проект на сертификацию."}
};

const VIDEOS = {
 m0:["Кто я и почему этот курс","Как устроены 16 модулей и сквозной проект","Лестница дохода на примере","Калькулятор свободы: считаем вместе"],
 m1:["Что покупают у нейродизайнера","Разбор 10 услуг и цен","Один день из жизни","Что можно продавать, а что опасно"],
 m2:["Регистрация и первое пространство","Окно «Создать Медиа Контент»","Сравнение моделей в один клик","Иконки и панели: быстрый тур"],
 ad:["Как тренировать насмотренность за 15 минут в день","Мудборд на доске Boringtask","Разбор референса по 6 осям","Три направления для клиента"],
 pr:["Формула промпта","Ядра стиля","Шаблоны для 6 заказов","Что не так с картинкой"],
 li:["Настройки «Опций»","Карточка для Wildberries с нуля","Серия в одном стиле","7 признаков «нейросетевой» картинки"],
 le:["Слои и корректирующие слои","Маска для AI","Удаление фона и новая сцена","Контроль качества перед сдачей"],
 lv:["Текст в видео и картинка в видео","Промпт движения","Раскадровка из трёх сцен","Склейка и обложка"],
 bk:["Что входит в бренд-кит","Палитра пипеткой","Ядро стиля на 5 кадрах","Шаблоны постов на доске"],
 ui:["Дизайнерское пространство","Вкладка «Генерировать UI»","Экран из UI-элементов","Наведение, фокус, действие"],
 m3:["7 дней — 9 работ","Шаблон кейса","Где разместить портфолио","Разбор чужих портфолио"],
 m4:["Где искать первых клиентов","Холодное сообщение","Возражения и цена","Сдача работы и отзыв"],
 m5:["Как блог превращается в заказы","Рубрики на год","Reels за вечер","Контент-план на 14 дней"],
 au:["Клонирование пространств","Конвейер на 50 карточек","Библиотека промптов","Считаем ставку за вечер"],
 m6:["Абонементы","Пакеты вместо часов","Международный рынок","Когда увольняться"],
 m7:["Экзамен","Сборка финального кейса","Сертификат и что с ним делать","Ваш план на 90 дней"]
};

function videoBlock(m){
  const ch=VIDEOS[m.id]||[];
  return `<section class="panel vid" data-init="video" data-mod="${m.id}">
   <span class="tag">Видео · ${ch.length} части</span><h2>Видео к модулю</h2>
   <div class="vwrap">
     <div class="vposter"><img src="${pic(m.img)}" alt="" loading="lazy"><span class="vplay" aria-hidden="true"></span><span class="vstate" data-vstate>Видео готовится к записи</span></div>
     <div class="vside"><span class="eyebrow">В видео</span><ol class="vch">${ch.map(c=>`<li>${c}</li>`).join("")}</ol>
       <div data-vlink></div><div data-vadmin></div></div>
   </div></section>`;
}

function projectBlock(m){
  const s=PSTEPS[m.id]; if(!s) return "";
  const i=Object.keys(PSTEPS).indexOf(m.id);
  if(m.id==="m0") return `<section class="panel tool proj" data-init="project">
   <span class="tag m">Сквозной проект · шаг 1 из ${Object.keys(PSTEPS).length}</span><h2>Ваш проект на весь курс</h2>
   <p class="prose">${s.task} Выбирайте то, что вам интересно и что можно показать заказчикам: кофейню у дома, магазин подруги, свой будущий бренд.</p>
   <div class="form">
     <label class="f">Название бизнеса или проекта<input id="pjBiz" type="text" placeholder="Например: кофейня «Лаванда»"></label>
     <label class="f">Ниша<select id="pjNiche"><option value="">Выберите</option><option>Кофейня, ресторан</option><option>Магазин на Wildberries / Ozon</option><option>Салон красоты, мастер</option><option>Эксперт, коуч, психолог</option><option>Интерьер, недвижимость</option><option>Одежда, мерч</option><option>Своя ниша</option></select></label>
     <label class="f">Кто покупатель<input id="pjClient" type="text" placeholder="Например: студенты и фрилансеры рядом с вузом"></label>
   </div>
   <div class="row"><button class="btn" id="pjSave">Сохранить проект</button><span class="foot" id="pjOut"></span></div>
  </section>`;
  const st=PST()[m.id]||{};
  return `<section class="panel tool proj" data-init="pstep" data-mod="${m.id}">
   <span class="tag m">Сквозной проект · шаг ${i+1} из ${Object.keys(PSTEPS).length}</span><h2>Шаг проекта: ${s.t}</h2>
   <p class="prose">${s.task.replace(/\{biz\}/g,bizName())}</p>
   ${PROJ().biz?"":`<div class="callout w">Проект ещё не выбран. <button class="linkbtn" data-go="m0">Выберите его в модуле «Старт»</button> — займёт минуту.</div>`}
   <div class="form">
     <label class="f">Ссылка на доску Boringtask (кнопка «ПОДЕЛИТЬСЯ»)<input type="url" data-f="link" value="${esc(st.link||"")}" placeholder="https://boringtask.ru/…"></label>
     <label class="f">Что сделали — одной-двумя фразами<input type="text" data-f="note" value="${esc(st.note||"")}" placeholder="Например: 3 карточки в стиле «утренний свет»"></label>
   </div>
   <div class="row"><button class="btn ${st.done?"money":""}" data-pdone>${st.done?"✓ Шаг выполнен":"Отметить шаг выполненным"}</button>
    <button class="btn ghost" data-psend>Отправить в ленту курса</button></div>
   <div data-pout></div>
  </section>`;
}

function feedBlock(m){
  return `<section class="panel feed" data-init="feed" data-mod="${m.id}">
   <span class="tag">Лента учеников</span><h2>Проекты других учеников</h2>
   <p class="prose">Работы по этому модулю, которые ученики отправили в ленту. Смотрите, как одну задачу решают для разных бизнесов, и сравнивайте со своей.</p>
   <div class="fgrid" data-fgrid><div class="fempty"><b>Загружаем ленту…</b></div></div>
   <div data-fadmin></div>
  </section>`;
}

function finalBlock(){
  const P=PROJ(), S=PST();
  const keys=Object.keys(PSTEPS).filter(k=>k!=="m7"), doneN=keys.filter(k=>k==="m0"?!!P.biz:(S[k]||{}).done).length;
  const lines=keys.filter(k=>k!=="m0").map(k=>{const s=S[k]||{};return `${s.done?"✓":"·"} ${PSTEPS[k].t}${s.note?": "+s.note:""}${s.link?" — "+s.link:""}`}).join("\n");
  const exam=store.get("examScore",null);
  return `<section class="panel tool proj" data-init="final">
   <span class="tag m">Финальный проект</span><h2>Сборка кейса и заявка на сертификат</h2>
   <p class="prose">Здесь собраны все шаги вашего проекта. Когда выполнены все шаги и сдан экзамен, отправьте заявку автору курса. После проверки вы получите сертификат «Сертифицированный нейродизайнер Boringtask» со ссылкой, по которой его может проверить любой заказчик.</p>
   <div class="grid">
     <div class="cell"><span class="k">Проект</span><span class="v">${bizName()}</span><span class="k">${esc(P.niche||"ниша не выбрана")}</span></div>
     <div class="cell"><span class="k">Шаги проекта</span><span class="v">${doneN} из ${keys.length}</span><span class="k">${doneN===keys.length?"всё готово":"отметьте шаги в модулях"}</span></div>
     <div class="cell"><span class="k">Экзамен</span><span class="v">${exam==null?"не сдан":exam+" из 10"}</span><span class="k">нужно 8 и больше</span></div>
   </div>
   <label class="f">Ваше имя для сертификата<input id="certName" type="text" value="${esc(store.get("certName",""))}" placeholder="Имя и фамилия"></label>
   <div class="out" id="caseOut">Финальный проект: ${PROJ().biz||"—"} (${P.niche||"—"})
Покупатель: ${P.client||"—"}
${lines}</div>
   <div class="row"><button class="btn" id="certReq" ${doneN===keys.length&&exam>=8?"":"disabled"}>Скопировать заявку на сертификат</button><span class="foot" id="certHint">${doneN===keys.length&&exam>=8?"Отправьте скопированный текст автору курса.":"Кнопка станет активной, когда выполнены все шаги и экзамен сдан на 8+."}</span></div>
   <div data-contact></div>
   <div data-certadmin></div>
  </section>`;
}

const stepDone=(k,P,S)=>k==="m0"?!!P.biz:k==="m7"?store.get("examScore",0)>=8:!!(S[k]||{}).done;
function stepsDoneCount(){const P=PROJ(),S=PST();return Object.keys(PSTEPS).filter(k=>stepDone(k,P,S)).length}

/* ---------- db / user ---------- */
let DB=null, USER=null, CAN_ADMIN=false;
const ready = (async()=>{
  try{ if(window.claude&&window.claude.use){
    const [d,u]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    DB=d; USER=u; CAN_ADMIN = u ? !!(await u.canEdit()) : false;
  }}catch(e){}
  return DB;
})();
const slug = s => (String(s).toLowerCase().replace(/[^a-z0-9а-яё]+/gi,"-").replace(/^-|-$/g,"").slice(0,30)||"st")+"-"+Math.random().toString(36).slice(2,7);
const certCode = () => "BT-"+Math.random().toString(36).slice(2,6).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
const fmtDate = t => new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});

/* ---------- страница сертификата ---------- */
function certPage(code){
  return `<div class="view"><section class="certwrap">
    <div class="cert" id="certCard"><div class="cert-in"><span class="eyebrow">Проверка сертификата</span><b class="ctitle">Ищем сертификат ${esc(code)}…</b></div></div>
  </section></div>`;
}
async function fillCert(code){
  const card=document.getElementById("certCard"); if(!card) return;
  const db=await ready;
  const shell=(inner)=>`<div class="cert-in">${inner}</div>`;
  if(!db){card.innerHTML=shell(`<span class="eyebrow">Проверка сертификата</span><b class="ctitle">Войдите в claude.ai, чтобы проверить сертификат</b><p>Реестр сертификатов доступен вошедшим пользователям. Код: <span class="mono">${esc(code)}</span></p>`);return}
  try{
    const snap=await db.doc("certs/"+code).get();
    if(!snap.exists){card.innerHTML=shell(`<span class="eyebrow">Проверка сертификата</span><b class="ctitle">Сертификат ${esc(code)} не найден</b><p>Проверьте код. Если вам прислали эту ссылку как подтверждение квалификации, она недействительна.</p>`);return}
    const c=snap.data();
    card.classList.add("ok");
    card.innerHTML=`<div class="cert-in">
      <div class="cert-top"><span class="brandline"><span class="mark"></span>Boringtask · Нейродизайнер</span><span class="seal">✓ Подлинный</span></div>
      <span class="eyebrow">Сертификат</span>
      <b class="ctitle">Сертифицированный нейродизайнер Boringtask</b>
      <span class="cname">${esc(c.name||"")}</span>
      <p>Прошёл(а) курс «Нейродизайнер. Как заработать деньги» из 16 модулей и защитил(а) финальный проект${c.project?` «${esc(c.project)}»`:""}.</p>
      <div class="cert-meta"><span>Выдан: <b>${c.at?fmtDate(c.at):"—"}</b></span><span>Код: <b class="mono">${esc(code)}</b></span></div>
      ${c.link?`<a class="btn sun" href="${esc(c.link)}" target="_blank" rel="noopener">Посмотреть финальный проект ↗</a>`:""}
    </div>`;
  }catch(e){card.innerHTML=shell(`<b class="ctitle">Не удалось проверить сертификат</b><p>Обновите страницу через минуту.</p>`)}
}

/* ---------- новые модули ---------- */
const REFX = {
 lake:{t:"Озеро на закате",ax:[["Свет","Закат, контровой тёплый свет, мягкие тени"],["Оптика","Широкий угол, горизонт по центру, симметрия"],["Композиция","Отражение делит кадр пополам, деревья — рамка"],["Палитра","Терракота, розовый, холодный голубой"],["Фактура","Гладкая вода против колючих сосен"],["Настроение","Тишина, ностальгия, «открытка»"]],p:"golden hour backlight, wide angle, symmetrical reflection, framed by pine trees, terracotta and dusty pink palette, calm nostalgic mood",ru:"контровой свет золотого часа, широкий угол, симметричное отражение, кадр в рамке из сосен, палитра терракоты и пыльно-розового, спокойное ностальгическое настроение"},
 car:{t:"Неоновый спорткар",ax:[["Свет","Ночь, неон, цветные блики на мокром асфальте"],["Оптика","Низкий ракурс, 35 мм, лёгкая перспектива"],["Композиция","Машина в нижней трети, вывески создают глубину"],["Палитра","Бирюза + пурпур, комплементарная пара"],["Фактура","Глянец кузова, мокрая дорога"],["Настроение","Скорость, киберпанк, реклама"]],p:"night city, neon reflections on wet asphalt, low angle 35mm, teal and magenta complementary palette, glossy surfaces, cyberpunk commercial mood",ru:"ночной город, неоновые отражения на мокром асфальте, низкий ракурс, 35 мм, комплементарная палитра бирюзы и пурпура, глянцевые поверхности, рекламное настроение в стиле киберпанк"},
 girl:{t:"Портрет с веснушками",ax:[["Свет","Мягкий контровой, тёплый, ореол в волосах"],["Оптика","85 мм, малая глубина резкости, боке"],["Композиция","Лицо по центру, глаза на верхней трети"],["Палитра","Персик, медь, кремовый"],["Фактура","Естественная кожа, отдельные волоски"],["Настроение","Тепло, доверие, естественность"]],p:"soft warm backlight, rim light in hair, 85mm portrait, shallow depth of field, peach and copper palette, natural skin texture, warm trustworthy mood",ru:"мягкий тёплый контровой свет, ореол в волосах, портрет на 85 мм, малая глубина резкости, персиковая и медная палитра, естественная текстура кожи, тёплое доверительное настроение"},
 forest:{t:"Светящийся лес",ax:[["Свет","Биолюминесценция, туман рассеивает свет"],["Оптика","Средний план, глубина через слои тумана"],["Композиция","Тропинка ведёт взгляд вглубь кадра"],["Палитра","Холодный бирюзовый + фиолетовый, тёплые акценты"],["Фактура","Мох, влажные шляпки грибов"],["Настроение","Сказка, тайна, фэнтези"]],p:"bioluminescent mushrooms, volumetric fog, leading path into depth, cyan and violet palette with warm accents, moss textures, mysterious fairytale mood",ru:"светящиеся грибы, объёмный туман, тропинка уводит взгляд вглубь, бирюзово-фиолетовая палитра с тёплыми акцентами, фактура мха, загадочное сказочное настроение"}
};
const VOCAB = {
 "Свет":[["golden hour","золотой час"],["soft window light","мягкий свет из окна"],["rim light","контурный свет"],["backlight","контровой свет"],["studio softbox","студийный софтбокс"],["neon glow","неоновое свечение"],["overcast diffused","рассеянный свет пасмурного дня"],["volumetric light","объёмный свет"]],
 "Оптика":[["85mm portrait","портрет на 85 мм"],["35mm street","уличная съёмка на 35 мм"],["macro","макро"],["wide angle","широкий угол"],["top-down flat lay","раскладка сверху"],["low angle","низкий ракурс"],["shallow depth of field","малая глубина резкости"],["tilt-shift","тилт-шифт"]],
 "Композиция":[["centered","по центру"],["rule of thirds","правило третей"],["negative space on the left","пустое место слева"],["symmetrical","симметрия"],["leading lines","ведущие линии"],["close-up","крупный план"],["full body","в полный рост"],["framed by","в рамке из"]],
 "Палитра":[["pastel","пастель"],["monochrome","монохром"],["complementary teal and orange","комплементарные бирюзовый и оранжевый"],["earthy tones","землистые тона"],["muted lavender","приглушённая лаванда"],["high contrast","высокий контраст"],["warm beige","тёплый бежевый"],["black and white","чёрно-белое"]],
 "Материал":[["matte","матовый"],["glossy","глянцевый"],["linen texture","текстура льна"],["brushed metal","шлифованный металл"],["ceramic","керамика"],["velvet","бархат"],["paper cut","вырезка из бумаги"],["wet surface","мокрая поверхность"]],
 "Жанр и эпоха":[["editorial fashion","журнальная мода"],["product commercial","рекламная предметная съёмка"],["cinematic still","кинокадр"],["90s film photo","плёночное фото 90-х"],["scandinavian minimalism","скандинавский минимализм"],["vintage poster","винтажный постер"],["3D render","3D-рендер"],["watercolor illustration","акварельная иллюстрация"]]
};
const LANGSW = `<div class="langsw" role="group" aria-label="Язык"><button type="button" data-lang="ru" aria-pressed="true">Русский</button><button type="button" data-lang="en" aria-pressed="false">Английский</button></div>`;
const langSwitch = (box, key, onChange) => {
  let lang = store.get(key, "ru");
  const sync = () => box.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  box.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set(key, lang); sync(); onChange(lang); });
  sync(); return () => lang;
};

function mArt(){return `
<section class="panel"><span class="tag">Зачем это нужно</span>
  <h2>Насмотренность — навык, который тренируется</h2>
  <div class="prose"><p>Нейросеть одинаково доступна всем. Разница между картинкой за 300 ₽ и за 3 000 ₽ — в том, кто ставит задачу. Арт-директор видит, <b>почему</b> кадр работает, и умеет повторить это словами. Этот навык тренируется так же, как мышцы.</p></div>
  <div class="week week4">
    <div><b>5 мин</b><span>Pinterest</span><p>Сохраните 5 картинок из своей ниши в отдельную доску</p></div>
    <div><b>5 мин</b><span>Behance</span><p>Откройте один свежий кейс и найдите в нём 3 приёма</p></div>
    <div><b>5 мин</b><span>Кино</span><p>Один кадр из фильма: опишите свет и цвет тремя словами</p></div>
    <div class="wk"><b>3 вопроса</b><span>к каждой картинке</span><p>Откуда свет? Куда смотрит глаз? Какие 3 цвета главные?</p></div>
  </div>
</section>

<section class="panel"><span class="tag">Практика в Boringtask</span>
  <h2>Мудборд на доске за 20 минут</h2>
  <ol class="steps">
    <li><div>Создайте пространство «Мудборд: клиент» или используйте пространство проекта.</div></li>
    <li><div>Загрузите 12–20 референсов через ${K("Изображение")} → «Локальный Файл». Можно скриншоты Pinterest и сайтов конкурентов.</div></li>
    <li><div>Разложите картинки на 3 группы: свет, цвет, композиция. ${K("Стикеры")} над каждой группой — подпись в двух словах.</div></li>
    <li><div>Отметьте ${K("Формы")} → кругом 3 лучших референса. Это то, что вы покажете клиенту первым.</div></li>
    <li><div>Отправьте клиенту ссылку ${K("Поделиться")} и попросите отметить, что нравится. Так вы получите согласование до начала генерации.</div></li>
  </ol>
  ${SHOT("templates","Шаблоны досок — удобная основа для мудборда: колонки уже размечены")}
</section>

<section class="panel tool" data-init="refx"><span class="tag m">Тренажёр</span>
  <h2>Разбор референса по 6 осям</h2>
  <p class="prose">Выберите картинку — увидите, как арт-директор раскладывает её на части и превращает в промпт.</p>
  <div class="refpick" data-refpick></div>
  <div data-refout></div>
</section>

<section class="panel" data-init="vocab"><span class="tag">Словарь</span>
  <h2>Словарь стиля: 48 слов, которые понимает нейросеть</h2>
  <p class="prose">Нажмите на слово — оно скопируется. Собирайте из них ядро стиля: по одному-два слова из каждой группы.</p>
  <div data-vocablang>${LANGSW}</div>
  <div class="vocab">${Object.entries(VOCAB).map(([g,ws])=>`<div><span class="eyebrow">${g}</span><div class="chips">${ws.map(([en,ru],i)=>`<button class="chip" data-word="${g}|${i}" data-en="${en}" data-ru="${ru}">${ru}</button>`).join("")}</div></div>`).join("")}</div>
  <div class="out" data-vocabout>Нажимайте слова — здесь соберётся ваш набор.</div>
  <div class="row" style="margin-top:1rem"><button class="btn ghost" data-vocabcopy>Скопировать</button></div>
</section>

<section class="panel"><span class="tag">Работа с клиентом</span>
  <h2>Арт-дирекшн: три направления вместо одного варианта</h2>
  <p class="prose">Профессионалы не показывают клиенту одну картинку. Они показывают три направления — и клиент выбирает, а не критикует.</p>
  <div class="grid">
    <div class="cell"><span class="k">Направление A</span><b>Безопасное</b><span class="k">Близко к тому, что клиент уже видел у конкурентов.</span></div>
    <div class="cell"><span class="k">Направление B</span><b>Рекомендуемое</b><span class="k">Ваш вариант: свежо, но в рамках брифа.</span></div>
    <div class="cell"><span class="k">Направление C</span><b>Смелое</b><span class="k">Неожиданный ход. Часто клиент берёт из него одну деталь.</span></div>
  </div>
  ${dd(["Показать 20 вариантов «на выбор»","Спросить «ну как вам?»","Начинать генерацию без согласованного стиля"],["3 направления по 2 кадра на доске","Спросить «какое ближе к задаче и почему?»","Зафиксировать выбор и ядро стиля в стикере"])}
</section>`}

const PALETTE=[["Небо","#85ADDB"],["Сумерки","#456168"],["Сирень","#BA9EC9"],["Лаванда","#8B6BBA"],["Ночь","#262855"]];
function mBrand(){return `
<section class="panel"><span class="tag">Услуга</span>
  <h2>Что такое бренд-кит и почему он стоит дороже картинок</h2>
  <p class="prose">Бренд-кит — набор правил и заготовок, по которым весь визуал клиента выглядит как одна семья. Это одна из самых дорогих услуг нейродизайнера: клиент платит не за картинку, а за систему.</p>
  <div class="bkgrid">
    <div class="bkc"><div class="bkv pal" aria-hidden="true"><i style="--c:#85ADDB"></i><i style="--c:#456168"></i><i style="--c:#BA9EC9"></i><i style="--c:#8B6BBA"></i><i style="--c:#262855"></i></div><b><span class="bkn">1</span>Палитра</b><span>5 цветов с HEX-кодами</span></div>
    <div class="bkc"><div class="bkv core" aria-hidden="true"><code><em>[сюжет]</em>, soft dusk light, lavender palette, 50mm…</code></div><b><span class="bkn">2</span>Ядро стиля</b><span>одна строка промпта для всех генераций</span></div>
    <div class="bkc"><div class="bkv type" aria-hidden="true"><span class="t1">Aa</span><span class="t2">Aa</span></div><b><span class="bkn">3</span>Шрифтовая пара</b><span>заголовки и текст</span></div>
    <div class="bkc"><div class="bkv tpl" aria-hidden="true"><i class="sq"></i><i class="vt"></i><i class="wd"></i></div><b><span class="bkn">4</span>6 шаблонов</b><span>посты, сторис, обложки</span></div>
    <div class="bkc"><div class="bkv ava" aria-hidden="true"><i class="cv"></i><i class="ci"></i></div><b><span class="bkn">5</span>Аватар и обложки</b><span>для соцсетей</span></div>
    <div class="bkc price"><span class="eyebrow">Цена пакета</span><b>15 000–40 000 ₽</b><span>ориентир за полный бренд-кит</span></div>
  </div>
</section>

<section class="panel tool" data-init="palette"><span class="tag m">Практика</span>
  <h2>Палитра из референса за 5 минут</h2>
  <p class="prose">Пример: палитра этого курса взята с фотографии лавандового поля на закате. Нажмите на цвет, чтобы скопировать HEX.</p>
  <div class="swatches" data-sw></div>
  <ol class="steps">
    <li><div>Загрузите референс клиента или его лучшее фото в редактор.</div></li>
    <li><div>Инструмент ${K("Выбор цвета")}: кликайте по главным зонам — небо, тень, акцент. Значение видно в поле RGB.</div></li>
    <li><div>Возьмите 5 цветов: 2 светлых фона, 1 средний, 1 акцент, 1 тёмный для текста.</div></li>
    <li><div>Выложите их на доску квадратами ${K("Формы")} и подпишите кодами. Это первая страница бренд-кита.</div></li>
  </ol>
</section>

<section class="panel" data-init="coretpl"><span class="tag">Ядро стиля</span>
  <div class="langhead"><h2>Ядро стиля: одна строка на все генерации</h2>${LANGSW}</div>
  <p class="prose">Ядро — это часть промпта, которая не меняется. Меняется только сюжет. Так 50 картинок выглядят как работа одного фотографа.</p>
  <div class="out" id="coreTpl">[СЮЖЕТ], soft dusk light, lavender and sky blue palette, deep navy shadows, 50mm, calm editorial mood, matte texture</div>
  <div class="row"><button class="btn ghost" data-copy="coreTpl">Скопировать ядро</button></div>
  <ol class="steps">
    <li><div>Проверьте ядро на 5 разных сюжетах: товар, человек, интерьер, деталь, пейзаж.</div></li>
    <li><div>Если один кадр выпадает — меняйте ядро, а не сюжет.</div></li>
    <li><div>Удачный кадр отправьте в «Картинку в Картинку», чтобы следующие держали стиль.</div></li>
  </ol>
</section>

<section class="panel"><span class="tag">Шаблоны</span>
  <h2>Шаблоны постов на доске Boringtask</h2>
  <div class="tablewrap"><table><thead><tr><th>Шаблон</th><th>Размер</th><th>Из чего собрать</th></tr></thead><tbody>
   <tr><td>Пост ВКонтакте / Telegram</td><td class="mono">1080×1080</td><td>Фон-генерация + ${K("Текст")} + UI-элемент «Бадж»</td></tr>
   <tr><td>Сторис / Reels-обложка</td><td class="mono">1080×1920</td><td>Вертикальная генерация 9:16, текст в верхней трети</td></tr>
   <tr><td>Обложка YouTube</td><td class="mono">1280×720</td><td>16:9, лицо + 3–4 слова крупно</td></tr>
   <tr><td>Карточка товара</td><td class="mono">900×1200</td><td>Удаление Фона Продукта + фон из палитры</td></tr>
   <tr><td>Цитата / совет</td><td class="mono">1080×1350</td><td>Сплошной цвет палитры + ${K("Текст")}</td></tr>
   <tr><td>Анонс / акция</td><td class="mono">1080×1080</td><td>Панель + Кнопка из UI-элементов</td></tr>
  </tbody></table></div>
  <div class="callout">Соберите все шаблоны в одном пространстве и для каждого нового поста нажимайте «КЛОНИРОВАТЬ» в настройках пространства. Подробнее — в модуле «Автоматизация».</div>
</section>

<section class="panel tool" data-init="checklist" data-key="bk" data-items="Палитра из 5 цветов с HEX|Ядро стиля проверено на 5 сюжетах|Шрифтовая пара выбрана|6 шаблонов на доске|Аватар и обложки соцсетей|Доска бренд-кита открывается по ссылке «ПОДЕЛИТЬСЯ»|Короткая инструкция для клиента: как пользоваться шаблонами">
  <span class="tag m">Сдача</span><h2>Чек-лист: бренд-кит готов к сдаче</h2><div class="cl"></div>
</section>`}

function mUI(){return `
<section class="panel"><span class="tag">Услуга</span>
  <h2>Прототип за день: что продавать</h2>
  <p class="prose">Малому бизнесу и экспертам часто нужен не готовый сайт, а картинка «как он будет выглядеть» — чтобы показать партнёру, разработчику или инвестору. Это быстрая и хорошо оплачиваемая услуга.</p>
  <div class="grid">
    <div class="cell"><b>Главный экран лендинга</b><span class="k">5 000–15 000 ₽</span></div>
    <div class="cell"><b>Лендинг из 5 блоков</b><span class="k">10 000–35 000 ₽</span></div>
    <div class="cell"><b>3 экрана приложения</b><span class="k">12 000–30 000 ₽</span></div>
  </div>
  <p class="foot">Цены — ориентир по фриланс-площадкам. Уточните в своей нише.</p>
</section>

<section class="panel"><span class="tag">Настройка</span>
  <h2>Дизайнерское пространство и «Генерировать UI»</h2>
  <ol class="steps">
    <li><div>Нажмите карандаш рядом с названием пространства и выберите <b>«Дизайнерское пространство»</b>. В пространстве для совместной работы UI-функции недоступны.</div></li>
    <li><div>Откройте генератор ${K("Изображение")} → вкладка <b>«Генерировать UI»</b>.</div></li>
    <li><div>Опишите экран: «главная страница кофейни, шапка с меню, крупное фото, 3 карточки напитков, кнопка "Заказать"».</div></li>
    <li><div>Лучший вариант используйте как основу и доберите детали UI-элементами.</div></li>
  </ol>
  <div class="shot-pair">${SHOT("space","Тип пространства меняется в настройках")}${SHOT("gen","Вкладка «Генерировать UI» в окне генератора")}</div>
</section>

<section class="panel"><span class="tag">Практика</span>
  <h2>Собираем экран из UI-элементов</h2>
  <ol class="steps">
    <li><div>${K("UI-элементы")} на левой панели (волшебная палочка) → ${K("Панель")}: фон шапки и карточек.</div></li>
    <li><div>«Изображение»: место под фото в каждой карточке. Сами фото — из генератора.</div></li>
    <li><div>${K("Текст")}: заголовок первого экрана и подписи. Не больше 2 шрифтов.</div></li>
    <li><div>${K("Кнопка")} и ${K("Поле ввода")}: форма заявки. ${K("Бадж")}: «Хит», «Новинка».</div></li>
    <li><div>${K("Меню")} для мобильной версии и ${K("Ссылка")} для пунктов навигации.</div></li>
  </ol>
  <div class="shot-sm">${SHOT("uipanel","Палитра UI-элементов")}</div>
</section>

<section class="panel"><span class="tag">Интерактив</span>
  <h2>Наведение, фокус и действие: кликабельный прототип</h2>
  <p class="prose">Над выбранным элементом открывается панель со вкладками. Через них прототип оживает: кнопка меняет цвет при наведении, клик ведёт на другой экран. Поведение каждой вкладки проверьте на своей доске.</p>
  <div class="tablewrap"><table><thead><tr><th>Вкладка</th><th>Для чего</th></tr></thead><tbody>
   <tr><td>Основное</td><td>Положение, размер, цвет, рамка, скругление</td></tr>
   <tr><td>Наведение</td><td>Как элемент выглядит под курсором</td></tr>
   <tr><td>Фокус / Вне Фокуса</td><td>Состояния полей ввода и кнопок при выборе</td></tr>
   <tr><td>Действие</td><td>Что происходит по клику</td></tr>
   <tr><td>Переменные, Процесс</td><td>Данные и сценарии для сложных прототипов</td></tr>
  </tbody></table></div>
  ${SHOT("toolbar","Панель над выбранным элементом со вкладками")}
</section>

<section class="panel"><span class="tag">Пример</span>
  <h2>Разбор: главная страница турагентства</h2>
  ${SHOT("uilanding","Прототип, собранный на доске Boringtask")}
  <ol class="steps">
    <li><div><b>Шапка:</b> логотип слева, меню из 5 пунктов в скруглённой панели.</div></li>
    <li><div><b>Первый экран:</b> фото на всю ширину и одно действие — поле поиска.</div></li>
    <li><div><b>Карточки направлений:</b> одинаковые по размеру, фото в одной цветовой гамме.</div></li>
  </ol>
  <div class="callout money">Сдавайте прототип ссылкой «ПОДЕЛИТЬСЯ» и предлагайте следующим шагом дизайн остальных экранов — так один заказ превращается в три.</div>
</section>`}

function mAuto(){return `
<section class="panel"><span class="tag">Экономика</span>
  <h2>Скорость = деньги: почему нужен конвейер</h2>
  <p class="prose">Цена за карточку на рынке почти не растёт, а ваша скорость — растёт. Конвейер превращает 3 часа на 5 карточек в 3 часа на 30.</p>
  <div class="grid">
    <div class="cell"><span class="k">Без конвейера</span><span class="v">5 карточек</span><span class="k">за вечер</span></div>
    <div class="cell"><span class="k">С шаблонами</span><span class="v">15 карточек</span><span class="k">за вечер</span></div>
    <div class="cell"><span class="k">Полный конвейер</span><span class="v">30–50</span><span class="k">за вечер, при отработанном ядре стиля</span></div>
  </div>
</section>

<section class="panel"><span class="tag">Шаблоны</span>
  <h2>Шаблон пространства + «КЛОНИРОВАТЬ»</h2>
  <ol class="steps">
    <li><div>Соберите эталонное пространство: колонки-стикеры «ТЗ → Референсы → Черновики → Правки → Готово», шаблоны карточек, ядро стиля в стикере.</div></li>
    <li><div>Для нового клиента откройте настройки пространства (карандаш у названия) и нажмите <b>«КЛОНИРОВАТЬ»</b>.</div></li>
    <li><div>Переименуйте копию: «Клиент — проект — месяц». Отправьте клиенту ссылку ${K("Поделиться")}.</div></li>
  </ol>
  ${SHOT("space","«КЛОНИРОВАТЬ» в настройках пространства")}
</section>

<section class="panel"><span class="tag">Конвейер</span>
  <h2>50 карточек за вечер: пошаговый конвейер</h2>
  ${tl([
   ["18:00","Бриф и ядро","Проверяете бриф, вставляете ядро стиля клиента. 10 минут."],
   ["18:10","Пакетная генерация","В «Опциях» одна модель, «Выходные изображения» — 4. Меняете только сюжет в начале промпта."],
   ["19:10","Отбор","Лучшие варианты — на доску в колонку «Черновики». Остальное — в «Историю запросов»."],
   ["19:40","Доводка серией","Удаление Фона Продукта и один корректирующий слой с одинаковыми настройками на все карточки."],
   ["20:40","Текст и шаблон","Кладёте карточки в клонированный шаблон, меняете только текст."],
   ["21:00","Сдача","Ссылка «ПОДЕЛИТЬСЯ» и счёт."]
  ])}
</section>

<section class="panel"><span class="tag">Библиотека</span>
  <h2>Библиотека промптов: не пишите дважды</h2>
  <ul class="prose">
    <li><b>«История запросов»</b> в генераторе хранит все промпты — удачные копируйте в библиотеку.</li>
    <li><b>Доска «Промпты»:</b> по стикеру на каждый удачный промпт, сгруппированы по нишам. Рядом — пример результата.</li>
    <li><b>«Галерея» с «Фильтрами»</b> помогает найти старую генерацию, когда клиент просит «как в прошлый раз».</li>
    <li><b>Ядра стиля клиентов</b> — отдельный стикер в пространстве каждого клиента.</li>
  </ul>
</section>

<section class="panel tool" data-init="batch"><span class="tag m">Калькулятор</span>
  <h2>Сколько вы зарабатываете за вечер</h2>
  <div class="form">
    <label class="f">Карточек за вечер<input id="bN" type="number" min="1" value="30"></label>
    <label class="f">Цена за карточку, ₽<input id="bP" type="number" min="0" step="100" value="700"></label>
    <label class="f">Длина вечера, часов<input id="bH" type="number" min="0.5" step="0.5" value="3"></label>
  </div>
  <div class="grid" data-bout></div>
  <p class="foot">Значения по умолчанию — пример. Налог самозанятого 6% учтён.</p>
</section>`}

const EN_SECTION = `
<section class="panel"><span class="tag">Международный рынок</span>
  <h2>Зарубежные клиенты: что реально в 2026 году</h2>
  <p class="prose">Зарубежные курсы по фрилансу почти всегда ведут на Upwork и Fiverr. Для тех, кто живёт в России, этот путь сейчас закрыт или рискован — важно знать это заранее.</p>
  <div class="tablewrap"><table><thead><tr><th>Путь</th><th>Кому подходит</th><th>Что учесть</th></tr></thead><tbody>
   <tr><td>Upwork, Fiverr, Contra</td><td>Тем, кто живёт и имеет банковский счёт за пределами России</td><td>Upwork с 2022 года не принимает новых пользователей из России, выплаты на российские карты недоступны. Обходные схемы нарушают правила площадок и грозят блокировкой вместе с деньгами.</td></tr>
   <tr><td>Behance и Dribbble</td><td>Всем</td><td>Портфолио на английском: кейсы с процессом. Работает как витрина и приводит прямые запросы.</td></tr>
   <tr><td>Русскоязычный бизнес за рубежом</td><td>Всем</td><td>Кафе, салоны и эксперты в Казахстане, Армении, Грузии, Сербии, ОАЭ ищут исполнителей в Telegram-чатах своих городов.</td></tr>
   <tr><td>Агентства-посредники</td><td>Тем, кто готов работать на объём</td><td>Агентство берёт зарубежного клиента, вы делаете часть работы за рубли.</td></tr>
  </tbody></table></div>
  <div class="callout w">Перед работой с иностранными клиентами уточните в своём банке и налоговой, как законно получать оплату из-за рубежа в вашем статусе. Это не юридическая консультация.</div>
</section>`;

/* ---------- новые инициализаторы ---------- */
Object.assign(INIT, {
 project(el){
  const P=PROJ(); el.querySelector("#pjBiz").value=P.biz||""; el.querySelector("#pjNiche").value=P.niche||""; el.querySelector("#pjClient").value=P.client||"";
  el.querySelector("#pjSave").onclick=()=>{const v={biz:el.querySelector("#pjBiz").value.trim(),niche:el.querySelector("#pjNiche").value,client:el.querySelector("#pjClient").value.trim()};
    if(!v.biz){el.querySelector("#pjOut").textContent="Введите название проекта.";return}
    store.set("project",v); el.querySelector("#pjOut").textContent="Сохранено. В каждом модуле вас ждёт следующий шаг проекта «"+v.biz+"»."; toast("Проект «"+v.biz+"» сохранён")};
 },
 pstep(el){
  const id=el.dataset.mod, out=el.querySelector("[data-pout]");
  const save=(patch)=>{const S=PST();S[id]=Object.assign({},S[id]||{},patch);store.set("psteps",S);return S[id]};
  el.querySelectorAll("[data-f]").forEach(i=>i.onchange=()=>save({[i.dataset.f]:i.value.trim()}));
  el.querySelector("[data-pdone]").onclick=(e)=>{const st=save({done:!(PST()[id]||{}).done});e.target.className="btn "+(st.done?"money":"");e.target.textContent=st.done?"✓ Шаг выполнен":"Отметить шаг выполненным";if(st.done)toast("Шаг проекта выполнен")};
  el.querySelector("[data-psend]").onclick=()=>{
    const st=PST()[id]||{}, P=PROJ();
    const txt=`Работа в ленту курса «Нейродизайнер»
Модуль: ${MODULES.find(m=>m.id===id).short}
Проект: ${P.biz||"—"} (${P.niche||"—"})
Что сделано: ${st.note||"—"}
Ссылка: ${st.link||"—"}`;
    out.innerHTML=`<div class="out" id="send_${id}">${esc(txt)}</div><p class="foot">Отправьте этот текст автору курса${CONTACT?": "+esc(CONTACT):""}. После проверки работа появится в ленте ниже.</p>`;
    const b=document.createElement("button");b.className="btn ghost";b.textContent="Скопировать";b.onclick=()=>copyText(txt,b);out.appendChild(b);
  };
 },
 video(el){
  const id=el.dataset.mod;
  ready.then(async db=>{
    if(!db) return;
    let url="",dur="";
    try{const s=await db.doc("videos/"+id).get(); if(s.exists){const d=s.data();url=d.url||"";dur=d.dur||""}}catch(e){}
    const st=el.querySelector("[data-vstate]"), ln=el.querySelector("[data-vlink]");
    if(url){st.textContent=dur?("Видео · "+dur):"Видео готово";el.classList.add("has");ln.innerHTML=`<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">▶ Смотреть видео${dur?" · "+esc(dur):""}</a>`;
      el.querySelector(".vposter").onclick=()=>ln.querySelector("a").click()}
    if(CAN_ADMIN){
      el.querySelector("[data-vadmin]").innerHTML=`<details class="adm"><summary>Для автора: ссылка на видео</summary><div class="form"><label class="f">Ссылка (VK Видео, YouTube, Rutube, Kinescope)<input type="url" data-vu value="${esc(url)}"></label><label class="f">Длительность<input type="text" data-vd value="${esc(dur)}" placeholder="12 мин"></label></div><button class="btn ghost" data-vs>Сохранить</button></details>`;
      el.querySelector("[data-vs]").onclick=async()=>{try{await db.doc("videos/"+id).set({url:el.querySelector("[data-vu]").value.trim(),dur:el.querySelector("[data-vd]").value.trim(),at:Date.now()});toast("Видео сохранено");INIT.video(el)}catch(e){toast("Не удалось сохранить: "+e.code)}};
    }
  });
 },
 feed(el){
  const id=el.dataset.mod, grid=el.querySelector("[data-fgrid]");
  const empty=(t,s)=>`<div class="fempty"><b>${t}</b><span>${s}</span></div>`;
  ready.then(async db=>{
    if(!db){grid.innerHTML=empty("Здесь пока пусто","Работы учеников появятся в этой ленте.");return}
    try{
      const snap=await db.collection("feed").where("mod","==",id).limit(60).get();
      const items=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.at||0)-(a.at||0));
      grid.innerHTML=items.length?items.map((x,i)=>`<article class="fcard" style="--fc:${["var(--sky)","var(--sun)","var(--hot)","var(--slate)"][i%4]}">
        <div class="fhead"><span class="fava">${esc((x.name||"?").trim().charAt(0).toUpperCase())}</span><div><b>${esc(x.name||"Ученик")}</b><span>${esc(x.niche||"")}</span></div></div>
        <b class="ft">${esc(x.title||"")}</b><p>${esc(x.text||"")}</p>
        ${x.link?`<a href="${esc(x.link)}" target="_blank" rel="noopener">Открыть работу ↗</a>`:""}
        ${CAN_ADMIN?`<button class="linkbtn" data-del="${x.id}">Убрать из ленты</button>`:""}</article>`).join("")
        :empty("Здесь пока пусто","Станьте первым: выполните шаг проекта выше и отправьте работу в ленту.");
      grid.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{try{await db.doc("feed/"+b.dataset.del).delete();INIT.feed(el)}catch(e){toast("Не удалось удалить")}});
    }catch(e){grid.innerHTML=empty("Не удалось загрузить ленту","Обновите страницу через минуту.")}
    if(CAN_ADMIN&&!el.querySelector(".adm")){
      el.querySelector("[data-fadmin]").innerHTML=`<details class="adm"><summary>Для автора: добавить работу ученика</summary><div class="form">
        <label class="f">Имя ученика<input type="text" data-a="name"></label><label class="f">Ниша / проект<input type="text" data-a="niche"></label>
        <label class="f">Название работы<input type="text" data-a="title"></label><label class="f">Ссылка на доску<input type="url" data-a="link"></label>
        <label class="f">Комментарий<input type="text" data-a="text"></label></div><button class="btn ghost" data-asave>Добавить в ленту</button></details>`;
      el.querySelector("[data-asave]").onclick=async()=>{const v={};el.querySelectorAll("[data-a]").forEach(i=>v[i.dataset.a]=i.value.trim());
        if(!v.name||!v.title){toast("Заполните имя и название");return}
        try{await db.doc("feed/"+slug(v.name)).set({...v,mod:id,at:Date.now()});el.querySelectorAll("[data-a]").forEach(i=>i.value="");toast("Работа добавлена в ленту");INIT.feed(el)}catch(e){toast("Не удалось сохранить: "+e.code)}};
    }
  });
 },
 final(el){
  const nm=el.querySelector("#certName"); nm.onchange=()=>store.set("certName",nm.value.trim());
  el.querySelector("#certReq").onclick=(e)=>{const t=`Заявка на сертификат «Сертифицированный нейродизайнер Boringtask»
Имя: ${nm.value.trim()||"—"}
${el.querySelector("#caseOut").textContent}
Экзамен: ${store.get("examScore","—")} из 10`;copyText(t,e.target)};
  ready.then(async db=>{
    if(db){try{const s=await db.doc("cfg/main").get();if(s.exists&&s.data().contact){CONTACT=s.data().contact}}catch(e){}}
    el.querySelector("[data-contact]").innerHTML=CONTACT?`<div class="callout">Куда отправить заявку: <b>${esc(CONTACT)}</b></div>`:"";
    if(!db||!CAN_ADMIN) return;
    const box=el.querySelector("[data-certadmin]");
    box.innerHTML=`<details class="adm" open><summary>Для автора: выдать сертификат</summary>
      <div class="form"><label class="f">Имя ученика<input type="text" data-c="name"></label><label class="f">Название проекта<input type="text" data-c="project"></label><label class="f">Ссылка на финальный проект<input type="url" data-c="link"></label></div>
      <div class="row"><button class="btn" data-cissue>Выдать сертификат</button></div><div data-cout></div>
      <div class="form" style="margin-top:1rem"><label class="f">Ваш контакт для заявок (Telegram, почта)<input type="text" data-contactin value="${esc(CONTACT)}"></label></div><button class="btn ghost" data-csave>Сохранить контакт</button>
      <div data-clist></div></details>`;
    const list=async()=>{try{const s=await db.collection("certs").limit(200).get();const it=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.at||0)-(a.at||0));
      box.querySelector("[data-clist]").innerHTML=it.length?`<div class="tablewrap" style="margin-top:1rem"><table><thead><tr><th>Код</th><th>Имя</th><th>Проект</th><th>Ссылка для проверки</th></tr></thead><tbody>${it.map(c=>`<tr><td class="mono">${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.project||"")}</td><td><button class="linkbtn" data-open="${esc(c.id)}">Открыть</button></td></tr>`).join("")}</tbody></table></div>`:"";
      box.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>go("cert-"+b.dataset.open))}catch(e){}};
    list();
    box.querySelector("[data-cissue]").onclick=async()=>{const v={};box.querySelectorAll("[data-c]").forEach(i=>v[i.dataset.c]=i.value.trim());
      if(!v.name){toast("Введите имя ученика");return}
      const code=certCode();
      try{await db.doc("certs/"+code).set({...v,at:Date.now()});
        box.querySelector("[data-cout]").innerHTML=`<div class="callout money">Сертификат <b class="mono">${code}</b> выдан. Отправьте ученику ссылку на этот курс с окончанием <b class="mono">#cert-${code}</b> — по ней сертификат проверит кто угодно, кто открыл курс.</div>`;
        box.querySelectorAll("[data-c]").forEach(i=>i.value="");list()}catch(e){toast("Не удалось выдать: "+e.code)}};
    box.querySelector("[data-csave]").onclick=async()=>{const c=box.querySelector("[data-contactin]").value.trim();try{await db.doc("cfg/main").set({contact:c});CONTACT=c;toast("Контакт сохранён")}catch(e){toast("Не удалось сохранить")}};
  });
 },
 refx(el){
  const pick=el.querySelector("[data-refpick]"), out=el.querySelector("[data-refout]");
  pick.innerHTML=Object.entries(REFX).map(([k,v],i)=>`<button class="refbtn" data-k="${k}" aria-pressed="${i===0}"><img src="${pic(k)}" alt=""><span>${v.t}</span></button>`).join("");
  let cur="lake", lang=()=>"ru";
  const text=r=>lang()==="en"?r.p:r.ru;
  const show=k=>{cur=k;const r=REFX[k];pick.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    out.innerHTML=`<div class="refgrid">${r.ax.map(([a,b],i)=>`<div class="refax" style="--rc:${["var(--sky)","var(--sun)","var(--hot)","var(--slate)","var(--sky)","var(--sun)"][i]}"><span class="eyebrow">${a}</span><p>${b}</p></div>`).join("")}</div>
     <div class="langhead"><span class="eyebrow">Промпт-описание стиля</span>${LANGSW}</div><div class="out" id="refP">${text(r)}</div><div class="row" style="margin-top:1rem"><button class="btn ghost" data-copy2>Скопировать</button></div>`;
    lang=langSwitch(out.querySelector(".langsw").parentElement,"reflang",()=>{out.querySelector("#refP").textContent=text(REFX[cur])});
    out.querySelector("#refP").textContent=text(r);
    out.querySelector("[data-copy2]").onclick=e=>copyText(text(REFX[cur]),e.target)};
  pick.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.k)); show("lake");
 },
 vocab(el){
  const out=el.querySelector("[data-vocabout]"), chips=[...el.querySelectorAll("[data-word]")]; let set=[];
  const label=b=>b.dataset[lang()];
  const render=()=>{const ws=set.map(id=>label(chips.find(c=>c.dataset.word===id)));out.textContent=ws.length?ws.join(", "):"Нажимайте слова — здесь соберётся ваш набор.";return ws.join(", ")};
  const lang=langSwitch(el.querySelector("[data-vocablang]"),"vocablang",()=>{chips.forEach(b=>b.textContent=label(b));render()});
  chips.forEach(b=>{b.textContent=label(b);b.onclick=()=>{const w=b.dataset.word;const on=b.getAttribute("aria-pressed")==="true";b.setAttribute("aria-pressed",!on);
    set=on?set.filter(x=>x!==w):[...set,w]; const txt=render();
    if(!on){try{navigator.clipboard.writeText(txt).catch(()=>{})}catch(e){}}}});
  el.querySelector("[data-vocabcopy]").onclick=e=>{const txt=render(); if(txt) copyText(txt,e.target); else toast("Сначала выберите слова")};
 },
 palette(el){
  const sw=el.querySelector("[data-sw]");
  sw.innerHTML=PALETTE.map(([n,h])=>`<button class="sw" style="--c:${h}"><span></span><b>${n}</b><span class="mono">${h}</span></button>`).join("");
  sw.querySelectorAll(".sw").forEach((b,i)=>b.onclick=()=>{copyText(PALETTE[i][1],b.querySelector("b"))});
 },
 batch(el){
  const o=el.querySelector("[data-bout]");
  const f=()=>{const n=+el.querySelector("#bN").value||0,p=+el.querySelector("#bP").value||0,h=+el.querySelector("#bH").value||1;const g=n*p*0.94;
    o.innerHTML=`<div class="cell"><span class="k">За вечер после налога</span><span class="v money">${fmt(g)}</span></div><div class="cell"><span class="k">Ставка в час</span><span class="v">${fmt(g/h)}</span></div><div class="cell"><span class="k">20 таких вечеров в месяц</span><span class="v money">${fmt(g*20)}</span></div>`};
  el.querySelectorAll("input").forEach(i=>i.oninput=f);f();
 }
});
let CONTACT="";
ready.then(async db=>{if(db){try{const s=await db.doc("cfg/main").get();if(s.exists)CONTACT=s.data().contact||""}catch(e){}}});


EXTRA.m6 = (EXTRA.m6||"") + EN_SECTION;
function projHome(){
  const P=PROJ(), S=PST(), keys=Object.keys(PSTEPS), n=stepsDoneCount();
  if(!P.biz) return `<section class="hproj rv"><div><span class="eyebrow">Сквозной проект</span><h2>Весь курс — один реальный кейс</h2><p>Выберите бизнес или нишу, и в каждом модуле вы сделаете для него следующую часть: стиль, картинки, видео, бренд-кит, прототип, блог. В конце — готовый кейс для портфолио и сертификат.</p></div></section>`;
  const next=keys.find(k=>!stepDone(k,P,S))||"m7";
  const nm=MODULES.find(x=>x.id===next);
  return `<section class="hproj rv"><div><span class="eyebrow">Ваш проект</span><h2>${esc(P.biz)}</h2><p>${esc(P.niche||"")}${P.client?" · "+esc(P.client):""}</p>
   <div class="pdots">${keys.map(k=>{const d=stepDone(k,P,S);return `<span class="${d?"on":""}" title="${PSTEPS[k].t}"></span>`}).join("")}</div>
   <span class="foot">${n} из ${keys.length} шагов проекта</span></div>
   <button class="btn sun" data-go="${next}">Следующий шаг: ${PSTEPS[next].t} →</button></section>`;
}
const start=(location.hash||"").slice(1)||store.get("last","home");
go(start==="home"||start.startsWith("cert-")||MODULES.some(m=>m.id===start)?start:"home");
})();
