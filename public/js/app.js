/* ── Clock ── */
function pad(n){ return n<10?'0'+n:String(n); }
function updateClock(){
  var d=new Date();
  var s=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  var el=document.getElementById('clock');
  var fc=document.getElementById('footer-clock');
  if(el) el.textContent=s;
  if(fc) fc.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}
setInterval(updateClock,1000); updateClock();

/* ── Toast ── */
function showToast(msg, isErr){
  var t=document.getElementById('toast');
  if(!t) return;
  document.getElementById('toast-msg').textContent=msg;
  t.style.background=isErr?'#b91c1c':'#0d0d0d';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(function(){ t.classList.remove('show'); },2800);
}
/* ── Clock ── */
function pad(n){ return n<10?'0'+n:String(n); }
function updateClock(){
  var d=new Date();
  var s=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  var el=document.getElementById('clock');
  var fc=document.getElementById('footer-clock');
  if(el) el.textContent=s;
  if(fc) fc.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}
setInterval(updateClock,1000); updateClock();

/* ── Toast ── */
function showToast(msg, isErr){
  var t=document.getElementById('toast');
  if(!t) return;
  document.getElementById('toast-msg').textContent=msg;
  t.style.background=isErr?'#b91c1c':'#0d0d0d';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(function(){ t.classList.remove('show'); },2800);
}
