/*
  简要说明：
  - attributes: 五项属性，使用缓增长公式 exp_req = 20 * level^1.5
  - habits: 数组，支持多属性奖励(rewards: [{attribute, value}])
  - drag & drop: HTML5 drag events + touch long-press
  - persistence: localStorage
*/

// -------- Data model and utilities --------
const ATTRIBUTES = ['体力','智力','自律','创造力','幸福感'];
const STORAGE_KEY = 'game_life_v1_data_v1';

let state = loadState();

function defaultState(){
  // initialize attributes at level 1, 0 exp
  const attrs = {};
  ATTRIBUTES.forEach(a => {
    attrs[a] = { name: a, level: 1, exp: 0, exp_required: calcExpRequired(1) };
  });
  return {
    attributes: attrs,
    habits: [
      { id: genId(), title:'跑步 30 分钟', rewards:[{attribute:'体力',value:3}], priority:1, status:'pending', repeat:'daily' },
      { id: genId(), title:'阅读 20 页', rewards:[{attribute:'智力',value:2},{attribute:'自律',value:1}], priority:2, status:'pending', repeat:'daily' },
      { id: genId(), title:'小提琴练习', rewards:[{attribute:'创造力',value:2}], priority:3, status:'pending', repeat:'daily' },
    ]
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // ensure attributes have exp_required
    ATTRIBUTES.forEach(a=>{
      if(parsed.attributes && parsed.attributes[a]){
        parsed.attributes[a].exp_required = calcExpRequired(parsed.attributes[a].level);
      }
    });
    return parsed;
  }catch(e){
    console.warn('load error',e);
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// leveling formula (更轻松反馈)
function calcExpRequired(level){
  // 降低升级所需：基础 20，指数 1.5
  return Math.round(20 * Math.pow(level, 1.5));
}

function genId(){ return 'id_' + Math.random().toString(36).slice(2,9); }

// -------- UI render --------
const attrGrid = document.getElementById('attrGrid');
const habitList = document.getElementById('habitList');
const modalRoot = document.getElementById('modalRoot');
const toastRoot = document.getElementById('toastRoot');

function render(){
  // attributes
  attrGrid.innerHTML = '';
  ATTRIBUTES.forEach(a=>{
    const data = state.attributes[a];
    const percent = Math.min(100, Math.round((data.exp / data.exp_required) * 100));
    const card = document.createElement('div');
    card.className = 'attr';
    card.innerHTML = `<h3>${a}</h3>
      <div class="lvl">Lv${data.level}</div>
      <div class="bar" title="${data.exp} / ${data.exp_required}"><i style="width:${percent}%"></i></div>
      <div class="expinfo">${data.exp} / ${data.exp_required} (${percent}%)</div>`;
    attrGrid.appendChild(card);
  });

  // habits (sorted by priority asc)
  habitList.innerHTML = '';
  const sorted = [...state.habits].sort((x,y)=> (x.priority||0)-(y.priority||0));
  sorted.forEach(h => {
    const el = document.createElement('div');
    el.className = 'habit';
    el.setAttribute('draggable','true');
    el.dataset.id = h.id;
    el.innerHTML = `<div class="content">
        <div class="left">
          <div style="display:flex;flex-direction:column">
            <div class="habit-title">${h.title}</div>
            <div class="habit-reward">${h.rewards.map(r=>`${r.value >= 0 ? '+' : ''}${r.value}${r.attribute}`).join('  ')}</div>
          </div>
        </div>
        <div class="controls">
          <button class="mini" data-action="toggle">${h.status==='done'?'已完成':'完成'}</button>
          <button class="edit-btn" data-action="edit">编辑</button>
        </div>
      </div>
      <div class="swipe-actions" data-action="delete">删除</div>`;
    // events
    el.addEventListener('click', (ev)=>{
      const action = ev.target.dataset.action;
      if(action==='toggle'){ toggleComplete(h.id); ev.stopPropagation(); }
      if(action==='delete'){ deleteHabit(h.id); ev.stopPropagation(); }
      if(action==='edit'){ openEditModal(h); ev.stopPropagation(); }
    });
    // drag handlers
    el.addEventListener('dragstart', dragStart);
    el.addEventListener('dragend', dragEnd);
    el.addEventListener('dragover', dragOver);
    el.addEventListener('drop', dropAt);
    // touch long-press drag (enhanced feel)
    el.addEventListener('touchstart', touchStart, {passive:true});
    el.addEventListener('touchmove', (ev)=> touchMove(ev, el), {passive:false});
    el.addEventListener('touchend', (ev)=> touchEnd(ev, el));
    habitList.appendChild(el);
  });
}

render();

// -------- drag & drop logic --------
let dragId = null;
function dragStart(e){
  this.classList.add('dragging');
  dragId = this.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
}
function dragEnd(e){
  this.classList.remove('dragging');
  dragId = null;
}
function dragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  // visually show insertion
  const draggingEl = habitList.querySelector('.dragging');
  const target = e.currentTarget;
  if(target === draggingEl) return;
  const rect = target.getBoundingClientRect();
  const offset = e.clientY - rect.top;
  if(offset > rect.height/2){
    target.style['border-bottom'] = '2px dashed rgba(0,0,0,0.08)';
    target.style['border-top'] = '';
  }else{
    target.style['border-top'] = '2px dashed rgba(0,0,0,0.08)';
    target.style['border-bottom'] = '';
  }
}
function dropAt(e){
  e.preventDefault();
  const target = e.currentTarget;
  // clear styles
  [...habitList.querySelectorAll('.habit')].forEach(x=>{ x.style['border-top']=''; x.style['border-bottom']=''; });
  const fromId = dragId;
  const toId = target.dataset.id;
  if(!fromId || fromId===toId) return;
  // reorder in state.habits by priorities: rebuild array in displayed order, then update priorities
  const sorted = [...state.habits].sort((x,y)=> (x.priority||0)-(y.priority||0));
  // find indices
  const fromIdx = sorted.findIndex(x=>x.id===fromId);
  const toIdx = sorted.findIndex(x=>x.id===toId);
  // compute insertion position based on mouse
  const rect = target.getBoundingClientRect();
  const offset = e.clientY - rect.top;
  let insertAt = toIdx + (offset > rect.height/2 ? 1 : 0);
  // remove fromIdx and insert
  const [item] = sorted.splice(fromIdx,1);
  sorted.splice(insertAt,0,item);
  // reassign priority as index+1
  sorted.forEach((h,i)=> h.priority = i+1);
  state.habits = sorted;
  saveState();
  render();
  showTempMsg('已更新任务优先级');
}

// -------- touch long-press DnD --------
let touchDragId = null;
let longPressTimer = null;
let lastTouchPoint = {x:0,y:0};
let dragGhost = null;
let swipeStartX = 0; let isSwiping = false; let openedSwipeId = null;

function touchStart(e){
  const el = this;
  lastTouchPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  swipeStartX = lastTouchPoint.x; isSwiping = false;
  longPressTimer = setTimeout(()=>{
    touchDragId = el.dataset.id;
    el.classList.add('dragging');
    if(navigator.vibrate){ try{ navigator.vibrate(10); }catch(_){} }
    // create floating ghost for better feel
    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';
    const clone = el.cloneNode(true);
    clone.style.width = el.getBoundingClientRect().width + 'px';
    clone.classList.remove('dragging');
    clone.style.transform = 'scale(1.02)';
    dragGhost.appendChild(clone);
    document.body.appendChild(dragGhost);
    positionGhost(lastTouchPoint.x, lastTouchPoint.y);
  }, 180);
}

function touchMove(e, el){
  lastTouchPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  const dx = lastTouchPoint.x - swipeStartX;
  // swipe detection (only if drag not active)
  if(!touchDragId){
    if(Math.abs(dx) > 8){ isSwiping = true; }
    if(isSwiping){
      e.preventDefault();
      const content = el.querySelector('.content');
      const limit = -90; // reveal width
      const nextX = Math.max(limit, Math.min(0, dx));
      content.style.transform = `translateX(${nextX}px)`;
      if(nextX === limit){ openedSwipeId = el.dataset.id; }
      return;
    }
    return;
  }
  // drag moving
  e.preventDefault();
  positionGhost(lastTouchPoint.x, lastTouchPoint.y);
  const elUnder = document.elementFromPoint(lastTouchPoint.x, lastTouchPoint.y);
  const target = elUnder && elUnder.closest ? elUnder.closest('.habit') : null;
  [...habitList.querySelectorAll('.habit')].forEach(x=>{ x.style['border-top']=''; x.style['border-bottom']=''; });
  if(!target || target.dataset.id===touchDragId) return;
  const rect = target.getBoundingClientRect();
  const offset = lastTouchPoint.y - rect.top;
  if(offset > rect.height/2){ target.style['border-bottom'] = '2px dashed rgba(0,0,0,0.08)'; }
  else{ target.style['border-top'] = '2px dashed rgba(0,0,0,0.08)'; }
}

function touchEnd(e, el){
  clearTimeout(longPressTimer);
  // finalize swipe
  if(!touchDragId){
    if(isSwiping && el){
      const content = el.querySelector('.content');
      const currentX = parseFloat((content.style.transform || '').replace(/translateX\(([-0-9.]+)px\)/,'$1')) || 0;
      if(currentX <= -80){ // consider fully opened
        content.style.transform = 'translateX(-90px)';
      }else{
        content.style.transform = '';
      }
    }
    if(dragGhost){ dragGhost.remove(); dragGhost=null; }
    isSwiping = false;
    return;
  }
  const elUnder = document.elementFromPoint(lastTouchPoint.x, lastTouchPoint.y);
  const target = elUnder && elUnder.closest ? elUnder.closest('.habit') : null;
  [...habitList.querySelectorAll('.habit')].forEach(x=>{ x.style['border-top']=''; x.style['border-bottom']=''; x.classList.remove('dragging'); });
  if(dragGhost){ dragGhost.remove(); dragGhost=null; }
  const fromId = touchDragId; touchDragId = null;
  if(!target){ return; }
  const toId = target.dataset.id; if(!fromId || fromId===toId) return;
  const sorted = [...state.habits].sort((x,y)=> (x.priority||0)-(y.priority||0));
  const fromIdx = sorted.findIndex(x=>x.id===fromId);
  const toIdx = sorted.findIndex(x=>x.id===toId);
  const rect = target.getBoundingClientRect();
  const offset = lastTouchPoint.y - rect.top;
  let insertAt = toIdx + (offset > rect.height/2 ? 1 : 0);
  const [item] = sorted.splice(fromIdx,1);
  sorted.splice(insertAt,0,item);
  sorted.forEach((h,i)=> h.priority = i+1);
  state.habits = sorted; saveState(); render(); showTempMsg('已更新任务优先级');
}

function positionGhost(x, y){
  if(!dragGhost) return;
  const offsetX = 10; const offsetY = 10;
  dragGhost.style.transform = `translate(${x+offsetX}px, ${y+offsetY}px) scale(1.02)`;
}

// -------- habit operations --------
function openAddModal(){
  openModal({mode:'add'});
}

function openEditModal(habit){
  openModal({mode:'edit',habit});
}

function addHabit(h){
  // set priority to end
  h.id = genId();
  h.priority = (state.habits.length? Math.max(...state.habits.map(x=>x.priority||0))+1 : 1);
  state.habits.push(h);
  saveState();
  render();
}

function updateHabit(id, patch){
  const idx = state.habits.findIndex(x=>x.id===id);
  if(idx>=0){
    state.habits[idx] = {...state.habits[idx], ...patch};
    saveState();
    render();
  }
}

function deleteHabit(id){
  if(!confirm('确认删除该习惯？')) return;
  state.habits = state.habits.filter(x=>x.id!==id);
  saveState();
  render();
}

function toggleComplete(id){
  const h = state.habits.find(x=>x.id===id);
  if(!h) return;
  if(h.status === 'done'){
    h.status = 'pending';
    // do not remove rewards (only awarding on completion)
    saveState();
    render();
    return;
  }
  // award rewards
  awardRewards(h.rewards);
  h.status = 'done';
  saveState();
  render();
  showTempMsg(`完成：${h.title}`);
  // in demo, do not reset status to pending automatically; user can keep it done until next reset
}

function awardRewards(rewards){
  // rewards = [{attribute, value}, ...] - 支持负数减少经验
  const levelUps = [];
  const levelDowns = [];
  rewards.forEach(r=>{
    const attr = state.attributes[r.attribute];
    if(!attr) return;
    const change = Math.round((r.value || 0) * 1.2);
    attr.exp += change;
    
    // 处理升级
    while(attr.exp >= attr.exp_required){
      attr.exp -= attr.exp_required;
      attr.level += 1;
      attr.exp_required = calcExpRequired(attr.level);
      levelUps.push({attribute: attr.name, level: attr.level});
    }
    
    // 处理降级（经验为负时）
    while(attr.exp < 0 && attr.level > 1){
      attr.level -= 1;
      attr.exp_required = calcExpRequired(attr.level);
      attr.exp += attr.exp_required;
      levelDowns.push({attribute: attr.name, level: attr.level});
    }
    
    // 确保经验不为负
    if(attr.exp < 0) attr.exp = 0;
  });
  saveState();
  if(levelUps.length){
    levelUps.forEach(l => showLevelUpToast(`${l.attribute} 提升至 Lv${l.level}`));
  }
  if(levelDowns.length){
    levelDowns.forEach(l => showTempMsg(`${l.attribute} 降至 Lv${l.level}`, 2000));
  }
}

// -------- modal UI --------
document.getElementById('openAdd').addEventListener('click', openAddModal);

function openModal({mode='add', habit=null}){
  modalRoot.style.display = 'block';
  modalRoot.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'modal';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:700">${mode==='add'?'添加新习惯':'编辑习惯'}</div>
      <div style="font-size:12px;color:var(--muted);cursor:pointer" id="closeModal">✕</div>
    </div>
    <label>任务名称</label>
    <input id="mTitle" type="text" placeholder="例如：跑步 30 分钟" />
    <label>奖励（可多选）</label>
    <div class="checkbox-row" id="rewardRow"></div>
    <label>重复</label>
    <select id="mRepeat"><option value="daily">每日</option><option value="weekly">每周</option></select>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
      <button id="saveBtn">保存</button>
      <button id="cancelBtn" class="mini">取消</button>
    </div>
    `;
  wrapper.appendChild(card);
  modalRoot.appendChild(wrapper);

  // build rewardRow: stepper chips -5..5
  const rewardRow = card.querySelector('#rewardRow');
  rewardRow.style.display = 'grid';
  rewardRow.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
  rewardRow.style.gap = '8px';
  ATTRIBUTES.forEach(attr=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.display = 'flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'space-between';
    chip.innerHTML = `<div style="font-size:12px">${attr}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="mini" data-step="-1" data-attr="${attr}">－</button>
        <div data-val="${attr}" style="min-width:20px;text-align:center">0</div>
        <button class="mini" data-step="1" data-attr="${attr}">＋</button>
      </div>`;
    rewardRow.appendChild(chip);
  });
  rewardRow.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('button[data-step]');
    if(!btn) return;
    const attr = btn.dataset.attr;
    const delta = parseInt(btn.dataset.step);
    const valEl = card.querySelector(`div[data-val="${attr}"]`);
    let v = parseInt(valEl.textContent) || 0;
    v = Math.max(-5, Math.min(5, v + delta));
    valEl.textContent = String(v);
    valEl.style.color = v < 0 ? '#ff6b6b' : v > 0 ? '#5b9bd5' : '#98a3ad';
  });

  // fill fields if edit
  if(mode==='edit' && habit){
    card.querySelector('#mTitle').value = habit.title;
    card.querySelector('#mRepeat').value = habit.repeat || 'daily';
    // populate rewards
    habit.rewards.forEach(r=>{
      const valEl = card.querySelector(`div[data-val="${r.attribute}"]`);
      if(valEl) {
        valEl.textContent = String(r.value);
        valEl.style.color = r.value < 0 ? '#ff6b6b' : r.value > 0 ? '#5b9bd5' : '#98a3ad';
      }
    });
  }

  function close(){
    modalRoot.style.display = 'none';
    modalRoot.innerHTML = '';
  }
  card.querySelector('#closeModal').addEventListener('click', close);
  card.querySelector('#cancelBtn').addEventListener('click', close);
  card.querySelector('#saveBtn').addEventListener('click', ()=>{
    const title = card.querySelector('#mTitle').value.trim();
    if(!title){ alert('请输入任务名称'); return; }
    const repeat = card.querySelector('#mRepeat').value;
    const rewards = [];
    ATTRIBUTES.forEach(a=>{
      const valEl = card.querySelector(`div[data-val="${a}"]`);
      const v = parseInt(valEl && valEl.textContent || '0') || 0;
      if(v !== 0) rewards.push({ attribute: a, value: v });
    });
    if(rewards.length===0){ if(!confirm('未设置任何奖励，是否保存？')) return; }
    if(mode==='add'){
      addHabit({ title, rewards, priority: (state.habits.length? Math.max(...state.habits.map(x=>x.priority||0))+1 : 1), status:'pending', repeat });
    }else if(mode==='edit' && habit){
      updateHabit(habit.id, { title, rewards, repeat });
    }
    close();
  });
}

// -------- toast & level up UI --------
function showTempMsg(msg, timeout=1500){
  const el = document.createElement('div');
  el.className = 'level-up-toast';
  el.style.background = 'rgba(0,0,0,0.75)';
  el.style.color = 'white';
  el.innerText = msg;
  toastRoot.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity 240ms'; el.style.opacity=0; setTimeout(()=>el.remove(),260); }, timeout);
}

function showLevelUpToast(msg){
  const el = document.createElement('div');
  el.className = 'level-up-toast';
  el.innerText = msg;
  toastRoot.appendChild(el);
  setTimeout(()=>{ el.style.transition='transform 300ms, opacity 300ms'; el.style.transform='translateY(-10px)'; el.style.opacity=0; setTimeout(()=>el.remove(),700); }, 2000);
}

// autosave on page hide
window.addEventListener('beforeunload', () => { saveState(); });

// also expose some debug in console
window.__gameLifeState = state;

// Register Service Worker for PWA
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
