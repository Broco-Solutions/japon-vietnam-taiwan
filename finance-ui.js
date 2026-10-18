(function(){
'use strict';
var frame=document.getElementById('site');if(!frame)return;
function esc(x){return String(x===null||x===undefined?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmt(n,unit){return (unit||'AUD')+' '+Math.round(Number(n)||0).toLocaleString('es-AR');}
function styles(doc){
 if(doc.getElementById('finance-private-style'))return;
 var s=doc.createElement('style');s.id='finance-private-style';
 s.textContent=[
  '#panel-dinero{padding-bottom:16px}',
  '.money-lock{margin:4px 0;background:#fff;border:1px solid var(--paper-line);border-radius:18px;padding:23px 20px;box-shadow:var(--shadow-card);text-align:center}',
  '.money-lock__icon{width:58px;height:58px;border-radius:18px;margin:0 auto 12px;display:grid;place-items:center;font-size:28px;background:var(--ink);color:var(--gold-fill)}',
  '.money-lock h2{font:600 27px Fraunces,serif;margin:0 0 7px;color:var(--text)}',
  '.money-lock p{font-size:12.5px;line-height:1.55;color:var(--text-muted);margin:0 auto 18px;max-width:330px}',
  '.money-lock form{display:grid;gap:11px;max-width:240px;margin:0 auto}',
  '.money-pin{height:54px;text-align:center;font:700 24px Inter,sans-serif;letter-spacing:11px;padding:0 3px 0 14px;border:1.5px solid var(--paper-line);border-radius:12px;color:var(--ink);background:var(--paper);width:100%}',
  '.money-pin:focus{outline:2px solid var(--gold-fill);outline-offset:2px}',
  '.money-unlock{height:46px;border:0;border-radius:11px;background:var(--gold-fill);color:var(--ink);font:700 13px Inter,sans-serif;cursor:pointer}',
  '.money-error{font-size:12px;color:var(--vermilion-ink);min-height:18px;margin-top:9px}',
  '.money-hero{border-radius:18px;padding:18px;background:linear-gradient(140deg,var(--ink),#1d2d38);color:var(--on-ink);margin-bottom:12px}',
  '.money-eyebrow{text-transform:uppercase;letter-spacing:.11em;font:700 10px Inter,sans-serif;color:var(--gold-fill)}',
  '.money-hero h2{font:600 27px Fraunces,serif;margin:4px 0 7px;color:var(--on-ink)}',
  '.money-hero p{font-size:11.5px;color:var(--on-ink-muted);line-height:1.55;margin:0}',
  '.money-figures{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}',
  '.money-figure{border:1px solid var(--paper-line);background:#fff;border-radius:14px;padding:13px 12px;box-shadow:var(--shadow-card)}',
  '.money-figure:first-child{grid-column:span 2;background:var(--paper-2)}',
  '.money-figure__label{display:block;font-size:11px;color:var(--text-muted);margin-bottom:4px}',
  '.money-figure__num{display:block;font:600 25px Fraunces,serif;color:var(--text);line-height:1.15;white-space:nowrap}',
  '.money-figure__num.small{font-size:20px}',
  '.money-figure__note{display:block;font-size:10px;color:var(--text-muted);margin-top:5px}',
  '.money-bar{height:9px;background:var(--paper-2);border-radius:12px;overflow:hidden;margin:9px 0 16px}',
  '.money-bar span{display:block;height:100%;background:var(--jade);border-radius:12px}',
  '.money-title{font:600 23px Fraunces,serif;margin:23px 1px 10px}',
  '.money-list{background:#fff;border:1px solid var(--paper-line);border-radius:15px;box-shadow:var(--shadow-card);overflow:hidden}',
  '.money-line{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:12px 13px;border-top:1px solid var(--paper-line)}',
  '.money-line:first-child{border-top:0}',
  '.money-line__copy{min-width:0;flex:1}',
  '.money-line strong{font-size:12.5px;display:block;line-height:1.4}',
  '.money-line small{font-size:11px;display:block;color:var(--text-muted);line-height:1.45;margin-top:3px}',
  '.money-line__amount{flex:none;white-space:nowrap;font:700 12px Inter,sans-serif;color:var(--ink);text-align:right}',
  '.money-flag{margin-right:5px}',
  '.money-notice{border-left:4px solid var(--gold-fill);border-radius:12px;background:var(--gold-soft);padding:12px 13px;color:var(--text);font-size:11.5px;line-height:1.55;margin:13px 0}',
  '.money-notice strong{display:block;font-size:12.5px;margin-bottom:3px}',
  '.money-foot{font-size:11px;color:var(--text-muted);line-height:1.5;margin-top:15px}',
  '.money-hide{display:block;margin:18px auto 4px;background:transparent;color:var(--text-muted);border:1px solid var(--paper-line);border-radius:12px;padding:9px 14px;font:600 12px Inter,sans-serif;cursor:pointer}',
  '@media(max-width:355px){.money-figure__num.small{font-size:17px}.money-line{flex-direction:column}.money-line__amount{text-align:left}}'
 ].join('\n');
 doc.head.appendChild(s);
}
function locked(doc){
 var p=doc.getElementById('panel-dinero');if(!p)return;
 p.innerHTML='<div class="money-lock"><div class="money-lock__icon" aria-hidden="true">🔒</div><h2>Resumen financiero</h2><p>Los importes y la planificación de efectivo están en esta sección privada del viaje.</p><form id="money-login"><label for="money-pin" style="font-size:12px;font-weight:700">Código de acceso</label><input class="money-pin" type="password" id="money-pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="••••" aria-label="PIN de cuatro dígitos" required><button class="money-unlock" type="submit">Ver finanzas →</button></form><div id="money-error" class="money-error" role="status" aria-live="polite"></div></div>';
 var form=p.querySelector('#money-login');
 form.addEventListener('submit',function(e){
  e.preventDefault();var input=p.querySelector('#money-pin'),code=input.value;
  var error=p.querySelector('#money-error'),button=p.querySelector('.money-unlock');
  if(!/^\d{4}$/.test(code)){error.textContent='Ingresá cuatro dígitos.';return;}
  button.disabled=true;button.textContent='Verificando…';error.textContent='';
  doc.defaultView.fetch('/api/finance',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',credentials:'same-origin',body:JSON.stringify({pin:code})})
   .then(function(resp){return resp.json().then(function(body){if(!resp.ok)throw new Error(body.error||'No se pudo verificar');return body;});})
   .then(function(body){input.value='';unlocked(doc,body.data);})
   .catch(function(err){input.value='';error.textContent=err.message||'No se pudo consultar.';input.focus();})
   .finally(function(){if(button.isConnected){button.disabled=false;button.textContent='Ver finanzas →';}});
 });
}
function line(label,note,amount,flag){
 return '<div class="money-line"><div class="money-line__copy"><strong>'+(flag?'<span class="money-flag">'+esc(flag)+'</span>':'')+esc(label)+'</strong>'+(note?'<small>'+esc(note)+'</small>':'')+'</div><span class="money-line__amount">'+esc(amount)+'</span></div>';
}
function unlocked(doc,d){
 var p=doc.getElementById('panel-dinero');if(!p)return;
 var total=Number(d.summary.total)||0,paid=Number(d.summary.paid)||0,due=Number(d.summary.pending)||0,pct=total?Math.min(100,Math.max(0,paid/total*100)):0;
 var html='<div class="money-hero"><span class="money-eyebrow">Planificación del viaje · AUD</span><h2>El dinero, claro.</h2><p>Montos orientativos del Excel, con lo abonado, lo pendiente y qué efectivo conviene preparar.</p></div>';
 html+='<div class="money-figures"><div class="money-figure"><span class="money-figure__label">Total de reservas registradas · aprox.</span><strong class="money-figure__num">'+esc(fmt(total))+'</strong><span class="money-figure__note">No es el total definitivo del viaje</span></div>';
 html+='<div class="money-figure"><span class="money-figure__label">✓ Ya abonado</span><strong class="money-figure__num small">'+esc(fmt(paid))+'</strong></div>';
 html+='<div class="money-figure"><span class="money-figure__label">⏳ Pendiente estimado</span><strong class="money-figure__num small">'+esc(fmt(due))+'</strong></div></div>';
 html+='<div class="money-bar" role="img" aria-label="'+Math.round(pct)+' por ciento abonado"><span style="width:'+pct.toFixed(1)+'%"></span></div>';
 html+='<div class="money-notice"><strong>Alcance de este total</strong>'+esc(d.scope)+'</div>';
 html+='<h3 class="money-title">Pendientes por aclarar</h3><div class="money-list">'+(d.pending||[]).map(function(x){return line(x.label,x.note,fmt(x.aud));}).join('')+'</div>';
 html+='<h3 class="money-title">Efectivo que hay que prever</h3><div class="money-list">'+(d.cashMust||[]).map(function(x){return line(x.kind,x.note,x.amount);}).join('')+'</div>';
 html+='<h3 class="money-title">Plan de efectivo por país</h3><div class="money-list">'+(d.cashPlan||[]).map(function(x){return line(x.country,x.note,x.currency+' '+Math.round(x.total).toLocaleString('es-AR'),x.flag);}).join('')+'</div>';
 html+='<div class="money-notice"><strong>No duplicar importes</strong>El plan de efectivo incluye gastos cotidianos y algunas reservas ya contabilizadas. No se suma al total general.</div>';
 html+='<div class="money-foot">'+esc(d.source)+'<br>Los importes reales pueden cambiar. Revisar reservas y condiciones antes de sacar efectivo.</div><button class="money-hide" type="button" id="money-relock">🔒 Ocultar importes</button>';
 p.innerHTML=html;
 p.querySelector('#money-relock').addEventListener('click',function(){locked(doc);});
}
function init(){
 var doc=frame.contentDocument;if(!doc||!doc.querySelector('nav.tabs .row'))return;
 styles(doc);
 var nav=doc.querySelector('nav.tabs .row'),main=doc.querySelector('main');
 if(doc.getElementById('tab-dinero'))return;
 var b=doc.createElement('button');
 b.id='tab-dinero';b.className='tab-btn';b.type='button';b.setAttribute('data-tab','dinero');
 b.setAttribute('role','tab');b.setAttribute('aria-controls','panel-dinero');b.setAttribute('aria-selected','false');b.setAttribute('tabindex','-1');
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg><span>Dinero</span>';
 nav.appendChild(b);
 var panel=doc.createElement('section');panel.id='panel-dinero';panel.className='panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-dinero');panel.hidden=true;main.appendChild(panel);
 locked(doc);
 b.addEventListener('click',function(){
  doc.querySelectorAll('nav.tabs .tab-btn').forEach(function(button){var active=button===b;button.classList.toggle('active',active);button.setAttribute('aria-selected',active?'true':'false');button.setAttribute('tabindex',active?'0':'-1');});
  doc.querySelectorAll('main .panel').forEach(function(item){var active=item===panel;item.classList.toggle('active',active);item.hidden=!active;});
  var cover=doc.querySelector('.cover');doc.defaultView.scrollTo({top:cover?cover.offsetHeight:0,behavior:'auto'});
  if(panel.querySelector('.money-pin'))panel.querySelector('.money-pin').focus({preventScroll:true});
 });
 doc.querySelectorAll('nav.tabs .tab-btn:not(#tab-dinero)').forEach(function(btn){
   btn.addEventListener('click',function(){panel.classList.remove('active');panel.hidden=true;b.classList.remove('active');b.setAttribute('aria-selected','false');b.setAttribute('tabindex','-1');});
 });
}
frame.addEventListener('load',function(){frame.contentWindow.setTimeout(init,100);});
if(frame.contentDocument&&frame.contentDocument.readyState==='complete')init();
})();
