'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const key = 'coffee12-demo-visits-v1';
const historyKey = 'coffee12-demo-history-v2';
let history = [];
try { const parsed = JSON.parse(localStorage.getItem(historyKey) || '[]'); if(Array.isArray(parsed)) history = parsed.filter(x=>typeof x==='number' && Number.isFinite(x) && !Number.isNaN(new Date(x).getTime())).slice(0,12); } catch (_) {}
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2400);}
function updateHistory(){const el=$('#visit-history');el.replaceChildren();if(!history.length){const p=document.createElement('p');p.className='small-note';p.textContent='Здесь появятся новые тестовые посещения.';el.append(p);return;}for(const stamp of history){const row=document.createElement('div');row.className='history-row';const time=document.createElement('time');time.dateTime=new Date(stamp).toISOString();time.textContent=new Intl.DateTimeFormat('ru-RU',{dateStyle:'medium',timeStyle:'short'}).format(stamp);const plus=document.createElement('strong');plus.textContent='+1';row.append(time,plus);el.append(row);}}
let visits = 1;
try { const saved = localStorage.getItem(key); if (saved !== null) visits = Math.max(0, Math.min(12, Number.parseInt(saved, 10) || 0)); } catch (_) {}
const svgNS = 'http://www.w3.org/2000/svg';
for (let i = 0; i < 12; i++) {
  const line = document.createElementNS(svgNS, 'line');
  for (const [name, value] of Object.entries({x1:95,y1:12,x2:95,y2:24,stroke:'currentColor','stroke-width':1.4,transform:`rotate(${i*30} 95 95)`})) line.setAttribute(name,value);
  $('#ticks').append(line);
}
function updateVisits() {
  // The mockup starts with one highlighted sector and the hand at twelve.
  const circumference = 2 * Math.PI * 94;
  $('#arc').setAttribute('stroke-dasharray', `${circumference*visits/12} ${circumference}`);
  $('#hand').setAttribute('transform', `rotate(${Math.max(0,visits-1)*30} 95 95)`);
  $('#clock').setAttribute('aria-label', `Карта лояльности: ${visits} из 12 посещений`);
  $('#visit-count').textContent = `${visits} / 12`;
  $('#visit-dots').replaceChildren(...Array.from({length:12},(_,i)=>{const dot=document.createElement('span');if(i<visits)dot.className='filled';return dot;}));
  $('#reward-text').textContent = visits===12?'Все 12 посещений собраны!':`До подарка — ${12-visits} ${12-visits===1?'посещение':(12-visits>=2&&12-visits<=4?'посещения':'посещений')}`;
  $('#add-visit').disabled=visits===12;
  $('#add-visit').textContent=visits===12?'Циферблат заполнен':'Добавить тестовое посещение';
  updateHistory();
}
function storeVisits(){try{localStorage.setItem(key,String(visits));localStorage.setItem(historyKey,JSON.stringify(history));}catch(_){}updateVisits();}
$('#add-visit').addEventListener('click',()=>{if(visits<12){visits++;history.unshift(Date.now());storeVisits();toast(visits===12?'Все 12 шагов собраны!':'Посещение добавлено');}});
$('#reset-visits').addEventListener('click',()=>{openSheet('Сбросить прогресс?','<p>Тестовые посещения и история будут удалены. Циферблат вернётся к состоянию 1 из 12.</p><button class="primary" id="confirm-reset" type="button">Сбросить</button><button class="secondary" id="cancel-reset" type="button">Отмена</button>');$('#confirm-reset').onclick=()=>{visits=1;history=[];storeVisits();sheet.close();toast('Прогресс сброшен');};$('#cancel-reset').onclick=()=>sheet.close();});
updateVisits();
const pages = ['home','menu','events','profile'];
function showPage(){const wanted=location.hash.slice(1);const page=pages.includes(wanted)?wanted:'home';$$('[data-page]').forEach(el=>el.hidden=el.dataset.page!==page);$$('[data-tab]').forEach(el=>{const active=el.dataset.tab===page;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});document.querySelector('[data-page="'+page+'"]').scrollTop=0;document.title=({home:'12 — Кофейня',menu:'Меню — 12',events:'События — 12',profile:'Профиль — 12'})[page];}
function go(page){if(location.hash===`#${page}`)showPage();else location.hash=page;}
window.addEventListener('hashchange',showPage);showPage();
$$('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
$('#clock').addEventListener('click',()=>go('profile'));
const sheet=$('#sheet');
function openSheet(title,html){$('#sheet-title').textContent=title;$('#sheet-body').innerHTML=html;if(!sheet.open)sheet.showModal();}
$('#close-sheet').addEventListener('click',()=>sheet.close());
sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();const link=e.target.closest('[data-sheet-go]');if(link){sheet.close();go(link.dataset.sheetGo);}});
sheet.addEventListener('close',()=>$('#burger').setAttribute('aria-expanded','false'));
$('#burger').addEventListener('click',()=>{$('#burger').setAttribute('aria-expanded','true');openSheet('Кофейня 12', [['home','Главная'],['menu','Меню'],['events','События'],['profile','Моя карта']].map(([id,name])=>`<button class="sheet-link" data-sheet-go="${id}">${name}</button>`).join(''));});
$('#location').addEventListener('click',()=>openSheet('Как нас найти','<p>Барнаул, площадь Октября.<br>Подземный переход.</p><a href="https://yandex.ru/maps/?text='+encodeURIComponent('Барнаул площадь Октября подземный переход')+'" target="_blank" rel="noopener noreferrer">Открыть поиск на карте ↗</a><p class="sheet-meta">Точная точка входа и график работы уточняются.</p>'));
// Example items: replace with the approved menu before publishing.
const drinks=[['Эспрессо','Насыщенный и короткий'],['Американо','Классический чёрный кофе'],['Капучино','Эспрессо и молочная пена'],['Латте','Мягкий молочный кофе'],['Флэт уайт','Двойной эспрессо и молоко'],['Раф','Сливочный кофе']];
for(const [index,[name,desc]] of drinks.entries()){const btn=document.createElement('button');btn.className='drink';btn.type='button';btn.dataset.category=index<2?'black':'milk';btn.dataset.search=(name+' '+desc).toLocaleLowerCase('ru');btn.innerHTML=`<svg aria-hidden="true"><use href="#i-coffee"/></svg><span><strong>${name}</strong><small>${desc}</small></span><svg class="right" aria-hidden="true"><use href="#i-arrow"/></svg>`;btn.addEventListener('click',()=>openSheet(name,`<p>${desc}.</p><p>Закажите напиток у бариста. Стоимость и наличие уточняйте в кофейне.</p><p class="sheet-meta">Это демонстрационная версия меню.</p>`));$('#drinks').append(btn);}

let filter='all';
function filterDrinks(){const q=$('#drink-search').value.trim().toLocaleLowerCase('ru');let found=0;$$('.drink').forEach(el=>{el.hidden=!(el.dataset.search.includes(q)&&(filter==='all'||el.dataset.category===filter));if(!el.hidden)found++;});$('#empty-drinks').hidden=found!==0;}
$('#drink-search').addEventListener('input',filterDrinks);$$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));filterDrinks();}));
