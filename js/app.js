const $app = document.getElementById('app');
const SCALE = [
  '1 — Совсем не похож на меня',
  '2 — Не похож на меня',
  '3 — Немного похож на меня',
  '4 — В некоторой степени похож на меня',
  '5 — Похож на меня',
  '6 — Очень похож на меня',
];

let TOKEN = '';
let META = null;
let QUESTIONS = [];
let idx = 0;
let answers = Array(57).fill(null);

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}
async function requestJson(url, init){
  const res = await fetch(url, init);
  const txt = await res.text();
  try{
    return JSON.parse(txt);
  }catch{
    throw new Error('Сервер вернул не JSON');
  }
}

function makeGetUrl(action, body){
  const u = new URL(window.PVQ_CONFIG.API_URL);
  u.searchParams.set('action', action);
  Object.entries(body || {}).forEach(([k,v])=>{
    if(Array.isArray(v)){
      u.searchParams.set(k, JSON.stringify(v));
    }else if(v != null){
      u.searchParams.set(k, String(v));
    }
  });
  return u.toString();
}

async function api(action, body){
  try{
    return await requestJson(window.PVQ_CONFIG.API_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(Object.assign({action},body||{})),
    });
  }catch{
    // Fallback: некоторые прокси/браузеры режут POST к Apps Script.
    return requestJson(makeGetUrl(action, body), { method:'GET' });
  }
}
function progressPct(){ return Math.round(((idx+1)/QUESTIONS.length)*100); }
function answeredCount(){ return answers.filter(v=>v!=null).length; }

function renderErr(msg){
  $app.innerHTML = `<div class="ttl">Ссылка недоступна</div><div class="sub">${esc(msg||'Не удалось открыть опрос')}</div>`;
}

function renderQuestion(){
  const q = QUESTIONS[idx];
  if(!q){ renderErr('Вопросы не загружены'); return; }
  const chosen = answers[idx];
  $app.innerHTML = `
    <div class="ttl">Оценка ценностей (PVQ-RR)</div>
    <div class="sub">${esc(META?.candidate_name||'Кандидат')} · ${esc(META?.vacancy_name||'')}</div>
    <div class="prog"><div style="width:${progressPct()}%"></div></div>
    <div class="q">Вопрос ${idx+1} из ${QUESTIONS.length}</div>
    <div class="qtxt">${esc(q.text)}</div>
    ${SCALE.map((txt,i)=>`
      <label class="opt">
        <input type="radio" name="ans" value="${i+1}" ${chosen===i+1?'checked':''}>
        <span>${esc(txt)}</span>
      </label>
    `).join('')}
    <div class="row">
      <span class="note">Заполнено: ${answeredCount()} / ${QUESTIONS.length}</span>
      <div style="display:flex;gap:8px">
        <button class="btn" id="prev" ${idx===0?'disabled':''}>Назад</button>
        ${idx<QUESTIONS.length-1
          ? '<button class="btn primary" id="next">Далее</button>'
          : '<button class="btn primary" id="submit">Отправить тест</button>'}
      </div>
    </div>`;
  document.querySelectorAll('input[name="ans"]').forEach(el=>{
    el.addEventListener('change',e=>{ answers[idx]=Number(e.target.value); });
  });
  const prev=document.getElementById('prev');
  if(prev)prev.onclick=()=>{idx=Math.max(0,idx-1);renderQuestion();};
  const next=document.getElementById('next');
  if(next)next.onclick=()=>{
    if(answers[idx]==null){alert('Выберите вариант ответа');return;}
    idx=Math.min(QUESTIONS.length-1,idx+1);
    renderQuestion();
  };
  const sub=document.getElementById('submit');
  if(sub)sub.onclick=submitSurvey;
}

async function submitSurvey(){
  try{
    if(answers.some(v=>v==null)){alert('Нужно ответить на все 57 вопросов');return;}
    if(!confirm('После отправки ответы нельзя изменить. Отправить?'))return;
    $app.innerHTML='<div class="loading">Отправка результатов...</div>';
    const res=await api('submitValueSurvey',{token:TOKEN,answers});
    if(!res?.ok){ renderErr(res?.error||'Не удалось отправить ответы'); return; }
    renderResult(res.result||{});
  }catch(err){
    renderErr(err?.message || 'Сетевая ошибка при отправке');
  }
}

function renderResult(result){
  const top = result.top_values||[];
  $app.innerHTML = `
    <div class="ttl">Спасибо! Опрос отправлен</div>
    <div class="sub">Ответы сохранены и недоступны для редактирования.</div>
    <div class="grid">
      <div class="panel">
        <h3>Ключевая интерпретация</h3>
        <div class="note" style="font-size:13px;line-height:1.7">${esc(result.interpretation||'')}</div>
      </div>
      <div class="panel">
        <h3>Топ ценностей</h3>
        <div class="note" style="font-size:13px">${top.map(t=>`${esc(t.label)} (${Number(t.score).toFixed(2)})`).join(' · ')||'—'}</div>
      </div>
      <div class="panel">
        <h3>Столбчатая диаграмма</h3>
        <canvas id="bar" height="180"></canvas>
      </div>
      <div class="panel">
        <h3>Круг ценностей</h3>
        <canvas id="circle" height="220"></canvas>
      </div>
    </div>`;
  const bar=result.bar_chart||{};
  const circle=result.circle_chart||{};
  new Chart(document.getElementById('bar').getContext('2d'),{
    type:'bar',
    data:{labels:bar.labels||[],datasets:[{data:bar.data||[],backgroundColor:'#7b5ea7'}]},
    options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}
  });
  new Chart(document.getElementById('circle').getContext('2d'),{
    type:'radar',
    data:{labels:circle.labels||[],datasets:[{data:circle.data||[],borderColor:'#7b5ea7',backgroundColor:'rgba(123,94,167,.15)',pointBackgroundColor:'#7b5ea7'}]},
    options:{plugins:{legend:{display:false}}}
  });
}

async function boot(){
  try{
    const u = new URL(location.href);
    TOKEN = u.searchParams.get('token') || '';
    if(!TOKEN){ renderErr('Не найден token в ссылке'); return; }
    const res = await api('startValueSurvey',{token:TOKEN});
    if(!res?.ok){ renderErr(res?.error||'Ссылка недействительна'); return; }
    META = res.invite||{};
    QUESTIONS = res.questions||[];
    if(!QUESTIONS.length){ renderErr('Список вопросов пуст'); return; }
    renderQuestion();
  }catch(err){
    renderErr(err?.message || 'Сетевая ошибка при открытии опроса');
  }
}
boot();
