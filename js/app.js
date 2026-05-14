// ── API helpers ──────────────────────────────────────────────────────
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function getApiCandidates(){
  const cfg=window.PVQ_CONFIG||{};const out=[],seen={};
  function add(u){u=String(u||'').trim();if(!u||seen[u])return;seen[u]=true;out.push(u);}
  add(cfg.API_URL);(cfg.API_URL_FALLBACKS||[]).forEach(add);return out;
}
async function requestJson(url,init){
  const res=await fetch(url,init);const txt=await res.text();
  try{return JSON.parse(txt);}catch{throw new Error('Сервер вернул не JSON');}
}
function makeGetUrl(apiUrl,action,body){
  const u=new URL(apiUrl);u.searchParams.set('action',action);
  Object.entries(body||{}).forEach(([k,v])=>{if(Array.isArray(v))u.searchParams.set(k,JSON.stringify(v));else if(v!=null)u.searchParams.set(k,String(v));});
  return u.toString();
}
async function api(action,body){
  let lastErr=null;
  for(const apiUrl of getApiCandidates()){
    try{return await requestJson(apiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action},body||{}))});}
    catch(e){lastErr=e;try{return await requestJson(makeGetUrl(apiUrl,action,body),{method:'GET'});}catch(e2){lastErr=e2;}}
  }
  throw(lastErr||new Error('Сервер недоступен'));
}

// ── State ────────────────────────────────────────────────────────────
let answers={},TOKEN='',META=null,QUESTIONS=[];

function answeredCount(){return Object.keys(answers).length;}
function setPage(html){document.getElementById('pvq-form-pg').innerHTML=html;}

function renderErr(msg){
  setPage(`<div class="pvq-pg-msg pvq-pg-msg--err"><div class="pvq-pg-ico">⚠️</div><h2>Ссылка недоступна</h2><p>${esc(msg||'Не удалось открыть опрос')}</p></div>`);
}
function renderThanks(){
  setPage(`<div class="pvq-pg-msg pvq-pg-msg--ok"><div class="pvq-pg-ico">✅</div><h2>Спасибо! Ответы отправлены</h2><p>Мы свяжемся с вами после обработки результатов.<br>Можете закрыть эту страницу.</p></div>`);
}

function updateProgress(){
  const total=QUESTIONS.length,done=answeredCount();
  const pct=total>0?Math.round(done/total*100):0;
  const fill=document.getElementById('pvq-progress-fill');
  const cnt=document.getElementById('pvq-progress-cnt');
  const subWrap=document.getElementById('pvq-submit-wrap');
  if(fill)fill.style.width=pct+'%';
  if(cnt)cnt.textContent=done+' / '+total;
  if(subWrap)subWrap.style.display=done===total?'block':'none';
}

async function submitSurvey(){
  const total=QUESTIONS.length;
  if(answeredCount()<total){alert('Нужно ответить на все '+total+' утверждений');return;}
  const btn=document.getElementById('pvq-submit-btn');
  if(btn){btn.disabled=true;btn.textContent='Отправка…';}
  try{
    const res=await api('submitValueSurvey',{token:TOKEN,answers});
    if(!res?.ok){renderErr(res?.error||'Не удалось отправить ответы');return;}
    renderThanks();
  }catch(err){renderErr(err?.message||'Сетевая ошибка при отправке');}
}

function renderForm(){
  setPage(`
    <div class="pvq-form-wrap">
      <div class="pvq-form-hdr">
        <div class="pvq-form-logo-ico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
        </div>
        <div>
          <div class="pvq-form-title">Оценка ценностей</div>
          <div class="pvq-form-sub">${esc(META?.candidate_name||'')}${META?.vacancy_name?' · '+esc(META.vacancy_name):''}</div>
        </div>
      </div>
      <div class="pvq-form-progress">
        <div class="pvq-progress-bar"><div class="pvq-progress-fill" id="pvq-progress-fill" style="width:0%"></div></div>
        <div class="pvq-progress-cnt" id="pvq-progress-cnt">0 / ${QUESTIONS.length}</div>
      </div>
      <div class="pvq-scale-legend">
        Оцените, насколько каждое описание похоже на вас: от <strong>1</strong> (совсем не похож) до <strong>6</strong> (очень похож)
      </div>
      ${QUESTIONS.map((q,i)=>`
      <div class="pvq-qcard" id="pvq-q-${esc(q.key)}">
        <div class="pvq-qnum">${i+1}</div>
        <div class="pvq-qbody">
          <div class="pvq-qtext">${esc(q.text)}</div>
          <div class="pvq-opts">
            ${[1,2,3,4,5,6].map((v,i)=>{
              const lbl=['Совсем не похож на меня','Не похож на меня','Немного похож на меня','В некоторой степени похож на меня','Похож на меня','Очень похож на меня'][i];
              return`<label class="pvq-opt">
              <input type="radio" name="pvq-${esc(q.key)}" value="${v}">
              <span class="pvq-opt-num">${v}</span>
              <span class="pvq-opt-lbl">${lbl}</span>
            </label>`;}).join('')}
          </div>
        </div>
      </div>`).join('')}
      <div class="pvq-form-footer">
        <div id="pvq-submit-wrap" style="display:none">
          <button type="button" class="pvq-submit-btn" id="pvq-submit-btn">Отправить ответы</button>
        </div>
        <p style="margin-top:12px;font-size:12px;color:#9ca3af">Ответьте на все <strong>${QUESTIONS.length}</strong> утверждений чтобы отправить опрос</p>
      </div>
    </div>`);

  document.querySelectorAll('[name^="pvq-"]').forEach(input=>{
    input.addEventListener('change',e=>{
      const key=e.target.name.replace('pvq-','');
      answers[key]=parseInt(e.target.value);
      const card=document.getElementById('pvq-q-'+key);
      if(card){
        card.classList.add('pvq-qcard--done');
        card.querySelectorAll('.pvq-opt').forEach(opt=>opt.classList.remove('pvq-opt--sel'));
        e.target.closest('.pvq-opt')?.classList.add('pvq-opt--sel');
      }
      updateProgress();
    });
  });
  document.getElementById('pvq-submit-btn').onclick=submitSurvey;
  updateProgress();
}

async function boot(){
  try{
    const u=new URL(location.href);
    TOKEN=u.searchParams.get('token')||'';
    if(!TOKEN){renderErr('Не найден token в ссылке');return;}
    const res=await api('startValueSurvey',{token:TOKEN});
    if(!res?.ok){renderErr(res?.error||'Ссылка недействительна');return;}
    META=res.invite||{};
    QUESTIONS=(res.questions||[]).map((q,i)=>Object.assign({key:q.key||('q'+(i+1))},q));
    if(!QUESTIONS.length){renderErr('Список вопросов пуст');return;}
    renderForm();
  }catch(err){renderErr(err?.message||'Сетевая ошибка при открытии опроса');}
}
boot();
