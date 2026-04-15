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
// debug-marker: 2026-04-15 repo-check

function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}
function getApiCandidates(){
  const cfg = window.PVQ_CONFIG || {};
  const out = [];
  const seen = {};
  function add(url){
    const u = String(url || '').trim();
    if(!u || seen[u]) return;
    seen[u] = true;
    out.push(u);
  }
  add(cfg.API_URL);
  (cfg.API_URL_FALLBACKS || []).forEach(add);
  return out;
}
async function requestJson(url, init){
  const res = await fetch(url, init);
  const txt = await res.text();
  try{
    return JSON.parse(txt);
  }catch{
    throw new Error('Сервер вернул не JSON');
  }
}

function makeGetUrl(apiUrl, action, body){
  const u = new URL(apiUrl);
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
  let lastErr = null;
  for(const apiUrl of getApiCandidates()){
    try{
      return await requestJson(apiUrl,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(Object.assign({action},body||{})),
      });
    }catch(e){
      lastErr = e;
      try{
        // Fallback: некоторые прокси/браузеры режут POST к Apps Script.
        return await requestJson(makeGetUrl(apiUrl, action, body), { method:'GET' });
      }catch(e2){
        lastErr = e2;
      }
    }
  }
  throw (lastErr || new Error('Сервер недоступен'));
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
    renderThanks();
  }catch(err){
    renderErr(err?.message || 'Сетевая ошибка при отправке');
  }
}

function renderThanks(){
  $app.innerHTML = `
    <div class="ttl">Спасибо! Опрос отправлен</div>
    <div class="sub">Ответы сохранены и недоступны для редактирования.</div>`;
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
