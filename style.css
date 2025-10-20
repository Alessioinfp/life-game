:root{
  --bg:#e9eef3;
  --card:#f7fafc;
  --muted:#98a3ad;
  --accent:#5b9bd5;
  --glass: rgba(255,255,255,0.7);
  font-family: "Helvetica Neue", Arial, sans-serif;
}
body{
  margin:0;
  background: linear-gradient(180deg,#e9eef3,#d7e0e8);
  color:#233240;
  -webkit-font-smoothing:antialiased;
}
.app{
  max-width:420px;
  margin:24px auto;
  padding:18px;
  border-radius:20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.45));
  box-shadow: 0 8px 28px rgba(13,30,45,0.10), inset 0 1px 0 rgba(255,255,255,0.6);
  min-height:88vh;
  position:relative;
}
/* iOS 风格玻璃态增强 */
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))){
  .app{ -webkit-backdrop-filter: blur(22px) saturate(160%); backdrop-filter: blur(22px) saturate(160%); border: 1px solid rgba(255,255,255,0.38); }
  .habit-panel{ -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.38); box-shadow: 0 6px 20px rgba(20,50,80,0.10), inset 0 1px 0 rgba(255,255,255,0.65); }
  .attr{ background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.38); box-shadow: 0 4px 14px rgba(20,50,80,0.08), inset 0 1px 0 rgba(255,255,255,0.65); }
}
header{
  display:flex;
  justify-content:center;
  align-items:center;
  margin-bottom:14px;
  position:relative;
}
h1{font-size:20px;margin:0}
.settings{position:absolute;right:0;top:0;width:36px;height:36px;border-radius:8px;background:var(--card);display:flex;align-items:center;justify-content:center;cursor:pointer}
.grid{
  display:flex;
  gap:10px;
  margin-bottom:16px;
  overflow-x:auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-bottom:6px;
}
.attr{
  background:var(--card);
  border-radius:12px;
  padding:10px;
  text-align:center;
  box-shadow: inset 0 -6px 12px rgba(0,0,0,0.02);
  min-width:120px;
  scroll-snap-align: start;
}
.attr h3{margin:0;font-size:14px}
.lvl{font-size:18px;margin-top:6px}
.bar{
  height:8px;
  background:rgba(0,0,0,0.06);
  border-radius:8px;
  margin-top:8px;
  overflow:hidden;
}
.bar > i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#7ab6f0);width:0%;}
.habit-panel{
  margin-top:8px;
  background:rgba(255,255,255,0.85);
  border-radius:12px;
  padding:12px;
}
/* 移除标签栏样式（已取消） */
.habit-list{
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:8px;
}
.habit{
  background:var(--card);
  padding:10px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  cursor:grab;
  border:2px solid transparent;
  transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
  position:relative;
  overflow:hidden;
}
.habit .swipe-actions{ position:absolute; right:0; top:0; bottom:0; width:90px; display:flex; align-items:center; justify-content:center; background:transparent; color:#ff6b6b; font-size:12px; }
.habit .content{ position:relative; z-index:1; width:100%; display:flex; align-items:center; justify-content:space-between; }
.controls{display:flex;gap:8px;min-width:90px;justify-content:flex-end}
.habit.dragging{opacity:0.92;border:2px dashed #b6cfe8; box-shadow: 0 10px 24px rgba(20,50,80,0.18); transform: scale(1.02); cursor:grabbing}
.drag-ghost{position:fixed; left:0; top:0; pointer-events:none; z-index:1000; transform: translate(-9999px,-9999px) scale(1); opacity:0.95; box-shadow: 0 14px 36px rgba(20,50,80,0.28);}
.drag-ghost .habit{margin:0}
.habit .left{display:flex;gap:8px;align-items:center}
.habit-title{font-size:14px}
.habit-reward{font-size:12px;color:var(--muted)}
button{background:var(--accent);border:none;color:white;padding:8px 12px;border-radius:8px;cursor:pointer}
.ghost{opacity:0.5}
.add-btn{background:transparent;color:var(--accent);border:2px dashed rgba(91,155,213,0.4);padding:10px;border-radius:10px;cursor:pointer}
.add-cta{ display:flex; justify-content:center; margin:24px 0 10vh; }
.add-btn.large{ padding:12px 20px; border-radius:14px; font-weight:600; }
.modal{
  position:fixed;left:0;right:0;top:0;bottom:0;
  display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);
}
.modal .card{
  background:white;padding:16px;border-radius:12px;min-width:320px;box-shadow:0 6px 20px rgba(0,0,0,0.15);
}
label{display:block;font-size:12px;color:var(--muted);margin-top:8px}
input[type="text"], input[type="number"], select{
  width:100%;padding:8px;border-radius:8px;border:1px solid #e6eef6;margin-top:6px;
}
.small{font-size:12px;color:var(--muted)}
.checkbox-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.chip{background:#f0f6fb;padding:6px 8px;border-radius:8px;border:1px solid rgba(91,155,213,0.08)}
.topline{display:flex;align-items:center;gap:10px}
.expinfo{font-size:12px;color:var(--muted);margin-top:6px}
.footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.mini{padding:6px 8px;font-size:13px;border-radius:8px;background:#fff;color:var(--accent);border:1px solid rgba(91,155,213,0.12)}
.edit-btn{background:#fff;color:var(--accent);border:1px solid rgba(91,155,213,0.12)}
.delete-btn{background:#ff6b6b}
.level-up-toast{
  position:fixed;right:20px;bottom:20px;background:linear-gradient(90deg,#6fb1ff,#4e8fe4);color:white;padding:10px 14px;border-radius:12px;box-shadow:0 6px 18px rgba(45,90,140,0.2)
}
@media (max-width:420px){
  .app{margin:12px}
}
