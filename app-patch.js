(function(){
'use strict';
var frame=document.getElementById('site'),boot=document.getElementById('boot');
var FLIGHT_PDF='https://drive.google.com/file/d/1CxbJIkYF9iUSpdSvRF-lIib_DkuDsZX5/view?usp=drivesdk';
var PDF_LINKS=[
 {match:'Perth → Hanoi',url:'https://drive.google.com/file/d/1NKUVLbh5ionuN_2KO-xt08KpgIQ22xRJ/view?usp=sharing'},
 {match:'Tokyo → Hanoi',url:'https://drive.google.com/file/d/1epa4TfSMFw4SnvViT5SvbL_CLl4Vz0HR/view?usp=sharing'},
 {match:'Hanoi → Da Nang',url:'https://drive.google.com/file/d/1VoaAjVU37ww15meZJN384EL8VbDfBGLw/view?usp=sharing'},
 {match:'Da Nang → Taipei → Osaka',url:'https://drive.google.com/file/d/1kC8V2_taDyDbymZs7UgcHstWifJdIfkH/view?usp=sharing'},
 {match:'Narita → Christchurch',url:'https://drive.google.com/file/d/114hX3KXnVZ3X6RVZ-6EtL1lZiOT0lHlh/view?usp=sharing'},
 {match:'Buenos Aires ⇄ Tokyo',url:FLIGHT_PDF},
 {match:'Tầm Vị',url:'https://drive.google.com/file/d/16oDmT-qAbgConRoP885jK4hGsZ0VHr-R/view?usp=sharing'}
];
var GROUP_META={
 'Vuelos':{icon:'✈️',hint:'Pasajes, conexiones y comprobantes'},
 'Alojamiento':{icon:'🛏️',hint:'Hoteles y departamentos'},
 'Tours y excursiones':{icon:'🧭',hint:'Actividades y experiencias reservadas'},
 'Restaurantes':{icon:'🍜',hint:'Mesas y experiencias gastronómicas'},
 'Otros':{icon:'🎟️',hint:'Otras reservas del viaje'}
};
var GROUP_ORDER=['Vuelos','Alojamiento','Tours y excursiones','Restaurantes','Otros'];
var MONEY_RE=/(?:\bAUD\b|\bUSD\b|\bARS\b|\bTWD\b|\bJPY\b|[€¥$]|\bmonto\b|\bpagad\w*\b|\bpago\b|\bprepaga\w*\b|\bsaldo\b|\befectivo\b|\bpropina\b|\bcosto\b|\bprecio\b|\breembols\w*\b|\bcobrad\w*\b|\bdepósito\b|\btarjeta de crédito\b|\bgasto\b|\bdinero\b)/i;

function cleanMoneyText(text){
 if(typeof text!=='string')return text;
 var parts=text.split(/(?<=[.!?])\s+|\s+(?:·|\||—)\s+/),keep=[];
 parts.forEach(function(part){
   var c=part.replace(/\s*\((?:~?\s*)?(?:AUD|USD|ARS|TWD|JPY|[€¥$])[^)]*\)/gi,'').replace(/\s{2,}/g,' ').trim();
   if(c&&!MONEY_RE.test(c))keep.push(c);
 });
 return keep.join(' · ').trim();
}
function safeScrub(root){
 if(!root)return;
 var doc=root.ownerDocument,NF=doc.defaultView.NodeFilter,w=doc.createTreeWalker(root,NF.SHOW_TEXT),nodes=[];
 while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(function(n){if(n.nodeValue&&MONEY_RE.test(n.nodeValue))n.nodeValue=cleanMoneyText(n.nodeValue)||'';});
}
function sanitizeData(doc){
 var n=doc.getElementById('trip-data'),data;
 if(!n)return null;
 try{data=JSON.parse(n.textContent);}catch(e){return null;}
 delete data.reservasTotales;delete data.efectivo;delete data.dailyBudget;delete data.atm;
 (data.reservas||[]).forEach(function(r){
   delete r.montoTotal;delete r.pagado;delete r.saldoPendiente;delete r.moneda;delete r.local;delete r.aud;
   if(r.notas)r.notas=cleanMoneyText(r.notas);
   if(r.num===24||r.pdf==='ba_tokyo'){
     r.fechas='Ida: sáb 7 Nov → llegada a Tokyo lun 9 Nov · Vuelta: mar 8 Dic → llegada a Buenos Aires mié 9 Dic';
     r.referencia='Airline reference: A9A9AF · AC9845 + AC97 + AC5 / AC6 + AC96 + AC90';
     r.notas='Ida: 7 Nov · AEP 13:35 → GRU 16:20 (AC9845, GOL) · GRU 21:45 → YUL 06:10 del 8 Nov (AC97) · YUL 12:40 → NRT 16:30 del 9 Nov (AC5). Vuelta: 8 Dic · NRT 18:45 → YUL 17:00 (AC6) · YUL 20:55 → GRU 09:00 del 9 Dic (AC96) · GRU 12:15 → EZE 15:05 del 9 Dic (AC90).';
   }
 });
 (data.days||[]).forEach(function(d){
   if(d.num===30)d.activity='Papá, mamá y Renzo salen de Narita a las 18:45 en AC6 hacia Montreal (llegada 17:00). Conexión AC96: Montreal 20:55 → São Paulo 09:00 del 9 Dic. Último tramo AC90: São Paulo 12:15 → Buenos Aires Ezeiza 15:05 del 9 Dic. Álvaro + Mili continúan su viaje hacia Nueva Zelanda el 9 Dic desde Narita.';
 });
 n.textContent=JSON.stringify(data);
 try{doc.defaultView.DATA=data;}catch(e){}
 var pdfNode=doc.getElementById('trip-pdfs');if(pdfNode)pdfNode.remove();
 try{doc.defaultView.PDF_B64={};}catch(e){}
 return data;
}
function injectStyles(doc){
 if(doc.getElementById('github-live-patch-v3'))return;
 var s=doc.createElement('style');s.id='github-live-patch-v3';
 s.textContent='\n'+
 '.cover{height:clamp(122px,24vw,168px)!important;aspect-ratio:auto!important;max-height:none!important}.cover img{object-position:center 38%!important}\n'+
 '.res-sort-note{font-size:12px;color:var(--text-muted);margin:-8px 2px 12px}.res-accordion-group{background:#fff;border:1px solid var(--paper-line);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);margin:0 0 10px;overflow:hidden}.res-accordion-summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:13px 14px}.res-accordion-summary::-webkit-details-marker{display:none}.res-accordion-icon{width:34px;height:34px;border-radius:10px;background:var(--paper-2);display:flex;align-items:center;justify-content:center;font-size:17px;flex:none}.res-accordion-text{min-width:0;flex:1;display:flex;flex-direction:column}.res-accordion-text strong{font-size:14px}.res-accordion-text small{font-size:11.5px;color:var(--text-muted)}.res-accordion-count{min-width:25px;height:25px;padding:0 7px;border-radius:20px;background:var(--paper-2);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700}.res-accordion-chev{transition:transform .2s}.res-accordion-group[open] .res-accordion-chev{transform:rotate(90deg)}.res-accordion-body{padding:2px 10px 10px;border-top:1px solid var(--paper-line)}.res-accordion-body .res-card{margin-top:10px;margin-bottom:0}.res-card__date-emphasis{font-weight:600}\n'+
 '.prep-old{padding:0 0 8px}.prep-old__hero{background:linear-gradient(150deg,var(--ink),#1b2937);color:var(--on-ink);border-radius:18px;padding:18px 17px 19px;margin:1px 0 15px;overflow:hidden}.prep-old__kicker{font:700 11px Inter,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--gold-fill)}.prep-old__hero h2{font-size:28px;line-height:1.02;margin:5px 0 7px}.prep-old__hero p{font-size:13px;line-height:1.45;color:var(--on-ink-muted);margin:0;max-width:94%}\n'+
 '.prep-old__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:0 0 20px}.prep-old__stat{background:#fff;border:1px solid var(--paper-line);border-radius:14px;padding:13px 8px;text-align:center;box-shadow:var(--shadow-card)}.prep-old__stat strong{display:block;font:600 25px Fraunces,serif;line-height:1;color:var(--text)}.prep-old__stat span{display:block;font-size:10.5px;color:var(--text-muted);margin-top:5px}\n'+
 '.prep-old h3{font:600 25px Fraunces,serif;margin:21px 0 11px;line-height:1.1}.prep-old__alerts{display:grid;gap:10px}.prep-old__alert{background:#fff;border:1px solid var(--paper-line);border-left:4px solid var(--vermilion);border-radius:14px;padding:13px 14px 13px 15px;box-shadow:var(--shadow-card)}.prep-old__alert.amber{border-left-color:var(--gold-fill)}.prep-old__label{display:inline-block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:var(--vermilion-ink);margin-right:6px}.prep-old__alert.amber .prep-old__label{color:var(--gold)}.prep-old__alert strong{font-size:13.5px}.prep-old__alert p{font-size:12.5px;color:var(--text-muted);line-height:1.52;margin:7px 0 0}.prep-old__alert a{color:var(--text);font-weight:700;text-underline-offset:2px}\n'+
 '.prep-old__quick{display:grid;grid-template-columns:1fr 1fr;gap:9px}.prep-old__quick-card{background:#fff;border:1px solid var(--paper-line);border-radius:14px;padding:12px 12px;box-shadow:var(--shadow-card)}.prep-old__quick-card span{font-size:20px}.prep-old__quick-card strong{display:block;font-size:12.5px;margin:5px 0 3px}.prep-old__quick-card p{font-size:11px;line-height:1.45;color:var(--text-muted);margin:0}\n'+
 '.climate-card{background:#fff;border:1px solid var(--paper-line);border-radius:16px;padding:10px 13px 9px;box-shadow:var(--shadow-card)}.climate-row{display:grid;grid-template-columns:86px 1fr 52px;gap:9px;align-items:center;padding:8px 0;border-top:1px dashed var(--paper-line)}.climate-row:first-child{border-top:0}.climate-name{font-size:12px;font-weight:700}.climate-track{height:8px;border-radius:8px;background:var(--paper-2);position:relative;overflow:hidden}.climate-range{position:absolute;top:0;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--jade),var(--gold-fill),var(--vermilion))}.climate-temp{font-size:11px;color:var(--text-muted);text-align:right}.climate-note{font-size:11.5px;color:var(--text-muted);line-height:1.45;margin:9px 2px 0;font-style:italic}\n'+
 '.layer-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.layer-card{background:#fff;border:1px solid var(--paper-line);border-radius:15px;padding:13px 13px 14px;box-shadow:var(--shadow-card);min-height:143px}.layer-card__icon{font-size:20px}.layer-card strong{display:block;font-size:13px;margin:7px 0 4px}.layer-card p{font-size:11.5px;color:var(--text-muted);line-height:1.52;margin:0}\n'+
 '.prep-old__guide{background:var(--paper-2);border:1px solid var(--paper-line);border-radius:14px;padding:13px 14px;margin:16px 0 0;font-size:11.5px;color:var(--text-muted);line-height:1.5}.prep-old__guide strong{color:var(--text)}\n'+
 '.prep-old__flight{background:#fff;border:1px solid var(--paper-line);border-radius:14px;padding:13px 14px;box-shadow:var(--shadow-card)}.prep-old__flight b{font-size:12.5px}.prep-old__flight p{font-size:11.5px;color:var(--text-muted);line-height:1.5;margin:4px 0 9px}.prep-old__flight a{display:inline-flex;align-items:center;gap:6px;background:var(--jade-soft);color:var(--jade-ink);text-decoration:none;border-radius:20px;padding:7px 10px;font-size:11.5px;font-weight:700}\n'+
 '@media(max-width:360px){.climate-row{grid-template-columns:72px 1fr 46px}.layer-grid{grid-template-columns:1fr}.prep-old__quick{grid-template-columns:1fr}}';
 doc.head.appendChild(s);
}
function removeMoneyUi(doc){
 var tab=doc.getElementById('tab-efectivo')||doc.querySelector('[data-tab="efectivo"]');if(tab)tab.remove();
 var panel=doc.getElementById('panel-efectivo');if(panel)panel.remove();
 doc.querySelectorAll('.res-card__amounts,.ticket,[class*="cash-"],[class*="money-"]').forEach(function(el){el.remove();});
 safeScrub(doc.getElementById('panel-itinerario'));
 safeScrub(doc.getElementById('panel-reservas'));
}
function climateRow(name,min,max){
 var left=Math.max(0,Math.min(100,min/30*100)),width=Math.max(6,Math.min(100-left,(max-min)/30*100));
 return '<div class="climate-row"><div class="climate-name">'+name+'</div><div class="climate-track"><span class="climate-range" style="left:'+left.toFixed(1)+'%;width:'+width.toFixed(1)+'%"></span></div><div class="climate-temp">'+min+'–'+max+'°</div></div>';
}
function rebuildPrepare(doc){
 var p=doc.getElementById('panel-preparar');if(!p)return;
 p.innerHTML='<div class="prep-old">'+
 '<div class="prep-old__hero"><div class="prep-old__kicker">Resumen para salir tranquilos</div><h2>33 días, 3 países,<br>4 climas</h2><p>Una vista práctica de lo que todavía puede trabar el viaje, qué llevar y qué conviene resolver primero.</p></div>'+
 '<div class="prep-old__stats"><div class="prep-old__stat"><strong>33</strong><span>días totales</span></div><div class="prep-old__stat"><strong>3</strong><span>países</span></div><div class="prep-old__stat"><strong>5</strong><span>viajeros</span></div></div>'+
 '<h3>Primero, resolver esto</h3><div class="prep-old__alerts">'+
 '<div class="prep-old__alert"><span class="prep-old__label">Crítico</span><strong>Visas de Vietnam y Taiwán</strong><p>Con pasaporte argentino, Vietnam admite solicitud de e‑Visa y Argentina no figura en la lista de exención de visa de Taiwán. Revisar requisitos vigentes y tramitar con anticipación en los sitios oficiales. <a href="https://evisa.gov.vn/" target="_blank" rel="noopener">Vietnam</a> · <a href="https://www.boca.gov.tw/fp-158-250-a5a40-2.html" target="_blank" rel="noopener">Taiwán</a></p></div>'+
 '<div class="prep-old__alert"><span class="prep-old__label">Crítico</span><strong>El equipaje tiene un tramo muy restrictivo</strong><p>CI790 permite 7 kg y D7378 solo 5 kg de cabina. Para una ruta que va de clima tropical a montaña y fin de otoño japonés, conviene definir desde ahora cómo repartir el equipaje entre los cinco.</p></div>'+
 '<div class="prep-old__alert amber"><span class="prep-old__label">Hueco real</span><strong>Tokyo 9–10 Nov, tres viajeros</strong><p>Air Canada llega a Narita el 9 Nov a las 16:30 y VJ933 sale a Hanoi el 10 Nov a las 09:30 para papá, mamá y Renzo. Hace falta una noche de tránsito con acceso simple a Narita y margen cómodo para volver al aeropuerto.</p></div>'+
 '</div>'+
 '<h3>Antes de salir</h3><div class="prep-old__quick">'+
 '<div class="prep-old__quick-card"><span>🛂</span><strong>Documentos offline</strong><p>Pasaportes, visas, vuelos, reservas y direcciones clave descargadas en los teléfonos.</p></div>'+
 '<div class="prep-old__quick-card"><span>📶</span><strong>Conectividad lista</strong><p>eSIM/SIM, roaming de respaldo y mapas offline para los días de llegada.</p></div>'+
 '<div class="prep-old__quick-card"><span>🩹</span><strong>Kit chico de salud</strong><p>Medicación personal, analgésico, rehidratación y curitas para ampollas.</p></div>'+
 '<div class="prep-old__quick-card"><span>🔌</span><strong>Carga y energía</strong><p>Adaptador universal, cargador múltiple, cables cortos y batería externa en cabina.</p></div>'+
 '</div>'+
 '<h3>Arco de clima</h3><div class="climate-card">'+
 climateRow('Hanoi',21,27)+climateRow('Ha Giang',11,20)+climateRow('Hoi An',22,27)+climateRow('Taipei',19,25)+climateRow('Kansai',7,17)+climateRow('Alpes',0,10)+climateRow('Tokyo',4,13)+
 '</div><p class="climate-note">Rangos orientativos basados en climatología histórica. No son un pronóstico para 2026; revisar el tiempo real 7–10 días antes.</p>'+
 '<h3>Valija por capas</h3><div class="layer-grid">'+
 '<div class="layer-card"><div class="layer-card__icon">🌧️</div><strong>Lluvia tropical</strong><p>Piloto respirable, paraguas compacto, funda de mochila y una muda seca para Hoi An/Hue.</p></div>'+
 '<div class="layer-card"><div class="layer-card__icon">🧥</div><strong>Abrigo comprimible</strong><p>Plumón liviano o campera térmica + polar fino para Ha Giang, Takayama y noches de Japón.</p></div>'+
 '<div class="layer-card"><div class="layer-card__icon">👟</div><strong>Un buen calzado</strong><p>Zapatilla cómoda, resistente a lluvia y con agarre. Sumar medias técnicas; evitar un segundo par pesado.</p></div>'+
 '<div class="layer-card"><div class="layer-card__icon">🧤</div><strong>Pequeños que rinden</strong><p>Cuello, guantes finos y primera piel ocupan poco y resuelven moto, montaña y esperas al aire libre.</p></div>'+
 '<div class="layer-card"><div class="layer-card__icon">🧺</div><strong>Lavado planificado</strong><p>Llevar 5–6 mudas rápidas y lavar en Kyoto/Tokyo. La casa de Kyoto ya tiene lavarropas y secadora.</p></div>'+
 '<div class="layer-card"><div class="layer-card__icon">🔋</div><strong>Tecnología mínima</strong><p>Adaptador universal, cargador múltiple, batería externa en cabina y copia offline de todo.</p></div>'+
 '</div>'+
 '<div class="prep-old__guide"><strong>Cómo leer esta guía.</strong> El clima día por día es una expectativa razonable, no un pronóstico. Las recomendaciones están pensadas para evitar sobrecargar la valija y para resolver primero los puntos que pueden bloquear el viaje.</div>'+
 '<h3>Vuelo principal actualizado</h3><div class="prep-old__flight"><b>Ida · 7–9 Nov</b><p>AEP 13:35 → GRU 16:20 · GRU 21:45 → YUL 06:10 (8 Nov) · YUL 12:40 → NRT 16:30 (9 Nov).</p><b>Vuelta · 8–9 Dic</b><p>NRT 18:45 → YUL 17:00 · YUL 20:55 → GRU 09:00 (9 Dic) · GRU 12:15 → EZE 15:05.</p><a href="'+FLIGHT_PDF+'" target="_blank" rel="noopener noreferrer">📄 Ver itinerario actualizado</a></div>'+
 '</div>';
}
function patchPdfLinks(doc){
 doc.querySelectorAll('a.pdf-chip').forEach(function(a){var text=(a.textContent||'').replace(/\s+/g,' ').trim();PDF_LINKS.some(function(item){if(text.indexOf(item.match)>=0){a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('download');return true;}return false;});});
}
function groupReservations(doc){
 var panel=doc.getElementById('panel-reservas');if(!panel||panel.querySelector('.res-accordion-group'))return;
 var children=[].slice.call(panel.children),body=null,groups=[];
 children.forEach(function(el){
   if(el.classList&&el.classList.contains('cat-title')){
     var name=(el.textContent||'').trim(),meta=GROUP_META[name]||GROUP_META.Otros,count=0,c=el.nextElementSibling;
     while(c&&!(c.classList&&c.classList.contains('cat-title'))){if(c.classList&&c.classList.contains('res-card'))count++;c=c.nextElementSibling;}
     var d=doc.createElement('details');d.className='res-accordion-group';d.dataset.group=name;
     var sm=doc.createElement('summary');sm.className='res-accordion-summary';sm.innerHTML='<span class="res-accordion-icon">'+meta.icon+'</span><span class="res-accordion-text"><strong>'+name+'</strong><small>'+meta.hint+'</small></span><span class="res-accordion-count">'+count+'</span><span class="res-accordion-chev">›</span>';
     body=doc.createElement('div');body.className='res-accordion-body';d.appendChild(sm);d.appendChild(body);panel.insertBefore(d,el);el.remove();groups.push(d);
   }else if(body&&el.classList&&el.classList.contains('res-card'))body.appendChild(el);
 });
 groups.sort(function(a,b){return GROUP_ORDER.indexOf(a.dataset.group)-GROUP_ORDER.indexOf(b.dataset.group);});groups.forEach(function(g){panel.appendChild(g);});if(groups[0])groups[0].open=true;
 if(groups.length){var note=doc.createElement('p');note.className='res-sort-note';note.textContent='Agrupadas por tipo y ordenadas cronológicamente dentro de cada sección.';panel.insertBefore(note,groups[0]);}
}
function patchFlightCard(doc){
 doc.querySelectorAll('.res-card').forEach(function(card){var title=card.querySelector('.res-card__title');if(!title||(title.textContent||'').indexOf('Vuelo Buenos Aires ⇄ Tokyo')<0)return;var sub=card.querySelector('.res-card__sub');if(sub)sub.innerHTML='Air Canada (vía Gotogate)<br><span class="res-card__date-emphasis">Ida: 7 Nov → NRT 9 Nov 16:30 · Vuelta: NRT 8 Dic 18:45 → EZE 9 Dic 15:05</span>';var det=card.querySelector('details.notes p');if(det)det.textContent='Ida: AEP 13:35 → GRU 16:20 (AC9845) · GRU 21:45 → YUL 06:10 del 8 Nov (AC97) · YUL 12:40 → NRT 16:30 del 9 Nov (AC5). Vuelta: NRT 18:45 → YUL 17:00 (AC6) · YUL 20:55 → GRU 09:00 del 9 Dic (AC96) · GRU 12:15 → EZE 15:05 del 9 Dic (AC90).';});
}
function patchDates(doc,data){
 var r=doc.getElementById('date-range');if(r)r.textContent='7 Nov – 9 Dic';
 var status=doc.getElementById('trip-status'),bar=doc.getElementById('progress-bar');if(!status||!bar)return;
 var n=new Date(),today=new Date(n.getFullYear(),n.getMonth(),n.getDate()),first=new Date(2026,10,7),last=new Date(2026,11,9),end=new Date(2026,11,10),old=bar.querySelector('.progress__marker');if(old)old.remove();
 if(today<first){var d=Math.ceil((first-today)/86400000);status.innerHTML='<strong>Faltan '+d+' día'+(d===1?'':'s')+'</strong> para el despegue';return;}
 if(today>=end){status.textContent='✈️ Viaje completado — esperamos que haya sido increíble';return;}
 var pct=Math.max(0,Math.min(100,((today-first)/(last-first))*100)),m=doc.createElement('div');m.className='progress__marker';m.style.left=pct+'%';bar.appendChild(m);
 var current=null;(data&&data.days||[]).some(function(day){var z=String(day.date||'').match(/(\d{1,2})\s+(Nov|Dic)/);if(!z)return false;var dt=new Date(2026,z[2]==='Nov'?10:11,+z[1]);if(dt.getTime()===today.getTime()){current=day;return true;}return false;});
 if(current)status.innerHTML='<strong>Día '+current.num+' de '+data.days.length+'</strong> · '+current.place;else if(today<new Date(2026,10,9))status.innerHTML='<strong>En viaje</strong> · rumbo a Japón';else status.innerHTML='<strong>Último tramo del viaje</strong> · regreso / conexiones';
}
function patchMapsLang(doc){doc.querySelectorAll('a[href*="google.com/maps"]').forEach(function(a){try{var u=new URL(a.href);u.searchParams.set('hl','es');u.searchParams.set('gl','es');a.href=u.toString();}catch(e){}});}
function repairTabs(doc){
 var buttons=[].slice.call(doc.querySelectorAll('.tab-btn'));
 buttons.forEach(function(btn){if(btn.dataset.repairWired)return;btn.dataset.repairWired='1';btn.addEventListener('click',function(){var tab=btn.getAttribute('data-tab');if(!tab)return;buttons.forEach(function(b){var on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');});doc.querySelectorAll('main .panel').forEach(function(panel){var on=panel.id==='panel-'+tab;panel.classList.toggle('active',on);panel.hidden=!on;});});});
}
function patch(){
 try{
   var doc=frame.contentDocument;if(!doc)return;
   var data=sanitizeData(doc);
   injectStyles(doc);
   removeMoneyUi(doc);
   rebuildPrepare(doc);
   patchPdfLinks(doc);
   groupReservations(doc);
   patchFlightCard(doc);
   patchDates(doc,data);
   patchMapsLang(doc);
   repairTabs(doc);
   frame.classList.add('ready');if(boot)boot.remove();
 }catch(e){frame.classList.add('ready');if(boot)boot.textContent='No se pudo cargar la bitácora.';console.error(e);}
}
frame.addEventListener('load',patch);
if(frame.contentDocument&&frame.contentDocument.readyState==='complete')patch();
})();