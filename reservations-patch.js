(function(){
'use strict';
var frame=document.getElementById('site');
if(!frame)return;
var NARITA_FOLDER='https://drive.google.com/drive/folders/1OpsMnJ0hkVuz3wIvxpR0n-J-FMXg4CJd';
var TYPES={
 'Vuelos':{icon:'✈️',label:'Vuelos',short:'Vuelos'},
 'Alojamiento':{icon:'🛏️',label:'Alojamientos',short:'Alojamiento'},
 'Tours y excursiones':{icon:'🧭',label:'Tours',short:'Tour / excursión'},
 'Restaurantes':{icon:'🍜',label:'Restaurantes',short:'Restaurante'},
 'Otros':{icon:'🎟️',label:'Otros',short:'Otro'}
};
var TYPE_ORDER=['Vuelos','Alojamiento','Tours y excursiones','Restaurantes','Otros'];
function style(doc){
 if(doc.getElementById('reservation-timeline-style'))return;
 var s=doc.createElement('style');s.id='reservation-timeline-style';
 s.textContent='\n'+
 '.res-timeline-intro{margin:0 0 12px}.res-timeline-intro h2{font:600 24px Fraunces,serif;margin:0 0 4px}.res-timeline-intro p{font-size:12px;color:var(--text-muted);margin:0;line-height:1.45}\n'+
 '.res-filter-row{display:flex;gap:7px;overflow-x:auto;padding:2px 0 12px;scrollbar-width:none}.res-filter-row::-webkit-scrollbar{display:none}.res-filter-btn{flex:none;border:1px solid var(--paper-line);background:#fff;color:var(--text-muted);border-radius:22px;padding:8px 11px;font:600 11.5px Inter,sans-serif;cursor:pointer}.res-filter-btn.active{background:var(--ink);border-color:var(--ink);color:var(--on-ink)}\n'+
 '.res-date-group{margin:0 0 17px}.res-date-head{display:flex;align-items:center;gap:10px;margin:17px 0 8px}.res-date-head__badge{width:48px;height:48px;border-radius:13px;background:var(--ink);color:var(--on-ink);display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none;box-shadow:var(--shadow-card)}.res-date-head__badge strong{font:600 19px Fraunces,serif;line-height:1}.res-date-head__badge span{font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-fill);margin-top:2px}.res-date-head__text{min-width:0}.res-date-head__text strong{font-size:13.5px}.res-date-head__text small{display:block;font-size:10.5px;color:var(--text-muted);margin-top:1px}\n'+
 '.res-timeline .res-card{margin:0 0 9px;position:relative}.res-card__timeline-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 8px}.res-date-chip,.res-type-chip{display:inline-flex;align-items:center;gap:4px;border-radius:20px;padding:4px 8px;font:700 10.5px Inter,sans-serif}.res-date-chip{background:var(--ink);color:var(--on-ink)}.res-type-chip{background:var(--paper-2);color:var(--text-muted)}\n'+
 '.res-card--narita{background:#fff;border:1px solid var(--paper-line);border-left:4px solid var(--gold-fill);border-radius:var(--radius-lg);padding:14px 14px 13px;box-shadow:var(--shadow-card)}.res-card--narita .res-card__title{font-size:14px;font-weight:700;line-height:1.35}.res-card--narita .res-card__sub{font-size:12px;color:var(--text-muted);margin:4px 0 8px}.res-narita-note{font-size:11.5px;line-height:1.48;color:var(--text-muted);margin:0 0 10px}.res-narita-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none;background:var(--gold-soft);color:var(--gold);border-radius:20px;padding:7px 10px;font-size:11.5px;font-weight:700}\n'+
 '.prep-old__alert.is-resolved{border-left-color:var(--jade)}.prep-old__alert.is-resolved .prep-old__label{color:var(--jade-ink)}\n'+
 '@media(max-width:360px){.res-date-head__badge{width:44px;height:44px}.res-filter-btn{padding:7px 9px}}';
 doc.head.appendChild(s);
}
function normalizeType(name){
 name=(name||'').trim();
 if(name==='Alojamientos')return 'Alojamiento';
 if(TYPES[name])return name;
 if(/vuelo/i.test(name))return 'Vuelos';
 if(/aloj/i.test(name))return 'Alojamiento';
 if(/tour|excurs/i.test(name))return 'Tours y excursiones';
 if(/restaur/i.test(name))return 'Restaurantes';
 return 'Otros';
}
function dateInfo(text){
 text=(text||'').replace(/\s+/g,' ');
 var months={nov:10,dic:11},best=null;
 var range=/\b(\d{1,2})\s*(?:a|al|hasta|–|—|-)\s*(\d{1,2})\s*(Nov|Dic)\b/ig,m;
 while((m=range.exec(text))){var d=+m[1],mon=months[m[3].toLowerCase()],key=new Date(2026,mon,d).getTime();if(!best||key<best.key)best={key:key,date:new Date(2026,mon,d),label:d+'–'+(+m[2])+' '+m[3]};}
 var single=/\b(\d{1,2})\s*(Nov|Dic)\b/ig;
 while((m=single.exec(text))){var d2=+m[1],mon2=months[m[2].toLowerCase()],key2=new Date(2026,mon2,d2).getTime();if(!best||key2<best.key)best={key:key2,date:new Date(2026,mon2,d2),label:d2+' '+m[2]};}
 return best||{key:new Date(2026,11,31).getTime(),date:new Date(2026,11,31),label:'Sin fecha'};
}
function dateHeader(doc,date,count){
 var days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],months=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
 var h=doc.createElement('div');h.className='res-date-head';
 h.innerHTML='<div class="res-date-head__badge"><strong>'+date.getDate()+'</strong><span>'+months[date.getMonth()]+'</span></div><div class="res-date-head__text"><strong>'+days[date.getDay()]+' '+date.getDate()+' de '+(date.getMonth()===10?'noviembre':'diciembre')+'</strong><small>'+count+' reserva'+(count===1?'':'s')+' con inicio este día</small></div>';
 return h;
}
function collect(panel){
 var records=[];
 var accordions=[].slice.call(panel.querySelectorAll('.res-accordion-group'));
 if(accordions.length){
   accordions.forEach(function(group){var type=normalizeType(group.dataset.group);group.querySelectorAll('.res-card').forEach(function(card){records.push({card:card,type:type});});});
   return records;
 }
 var type='Otros';
 [].slice.call(panel.children).forEach(function(el){
   if(el.classList&&el.classList.contains('cat-title'))type=normalizeType(el.textContent);
   else if(el.classList&&el.classList.contains('res-card'))records.push({card:el,type:type});
 });
 return records;
}
function makeNarita(doc){
 var card=doc.createElement('article');card.className='res-card res-card--narita';
 card.innerHTML='<div class="res-card__title">Alojamiento en Narita · mamá, papá y Renzo</div><div class="res-card__sub">9 Nov → 10 Nov · 1 noche · conexión en NRT</div><p class="res-narita-note">Llegada a Narita el 9 Nov a las 16:30. VJ933 sale de NRT a Hanoi el 10 Nov a las 09:30. La reserva está guardada en la carpeta Narita del Drive.</p><a class="res-narita-link" href="'+NARITA_FOLDER+'" target="_blank" rel="noopener noreferrer">📁 Abrir carpeta Narita</a>';
 return {card:card,type:'Alojamiento',manual:true};
}
function addMeta(doc,rec,info){
 var card=rec.card;
 var old=card.querySelector('.res-card__timeline-meta');if(old)old.remove();
 var meta=doc.createElement('div');meta.className='res-card__timeline-meta';
 var t=TYPES[rec.type]||TYPES.Otros;
 meta.innerHTML='<span class="res-date-chip">'+info.label+'</span><span class="res-type-chip">'+t.icon+' '+t.short+'</span>';
 card.insertBefore(meta,card.firstChild);
 card.dataset.resType=rec.type;
}
function updatePrepare(doc){
 doc.querySelectorAll('.prep-old__alert').forEach(function(a){
   if((a.textContent||'').indexOf('Tokyo 9–10 Nov')<0)return;
   a.classList.add('is-resolved');
   var label=a.querySelector('.prep-old__label');if(label)label.textContent='Resuelto';
   var strong=a.querySelector('strong');if(strong)strong.textContent='Narita 9–10 Nov, tres viajeros';
   var p=a.querySelector('p');if(p)p.innerHTML='Mamá, papá y Renzo ya tienen alojamiento para la noche de tránsito. Llegan a NRT el 9 Nov a las 16:30 y VJ933 sale el 10 Nov a las 09:30. <a href="'+NARITA_FOLDER+'" target="_blank" rel="noopener">Abrir carpeta Narita</a>.';
 });
}
function build(doc){
 var panel=doc.getElementById('panel-reservas');if(!panel)return;
 if(panel.dataset.timelineBuilt==='1')return;
 var records=collect(panel);
 if(!records.length)return;
 var hasNarita=records.some(function(r){var txt=(r.card.textContent||'').toLowerCase();return r.type==='Alojamiento'&&txt.indexOf('narita')>=0&&/9\s*nov/i.test(txt);});
 if(!hasNarita)records.push(makeNarita(doc));
 records.forEach(function(r){var info=r.manual?{key:new Date(2026,10,9).getTime(),date:new Date(2026,10,9),label:'9–10 Nov'}:dateInfo(r.card.textContent||'');r.info=info;addMeta(doc,r,info);});
 records.sort(function(a,b){if(a.info.key!==b.info.key)return a.info.key-b.info.key;return TYPE_ORDER.indexOf(a.type)-TYPE_ORDER.indexOf(b.type);});
 panel.innerHTML='';panel.dataset.timelineBuilt='1';panel.classList.add('res-timeline');
 var intro=doc.createElement('div');intro.className='res-timeline-intro';intro.innerHTML='<h2>Reservas por fecha</h2><p>Ordenadas como sucede el viaje. Usá los filtros para ver solo vuelos, alojamientos, tours o restaurantes.</p>';panel.appendChild(intro);
 var filters=doc.createElement('div');filters.className='res-filter-row';
 var defs=[['ALL','Todos']].concat(TYPE_ORDER.map(function(k){return[k,(TYPES[k].icon+' '+TYPES[k].label)];}));
 defs.forEach(function(def){var b=doc.createElement('button');b.type='button';b.className='res-filter-btn'+(def[0]==='ALL'?' active':'');b.dataset.filter=def[0];b.textContent=def[1];filters.appendChild(b);});panel.appendChild(filters);
 var by={};records.forEach(function(r){var k=String(r.info.key);if(!by[k])by[k]=[];by[k].push(r);});
 Object.keys(by).sort(function(a,b){return +a-+b;}).forEach(function(k){var rs=by[k],g=doc.createElement('section');g.className='res-date-group';g.dataset.dateKey=k;g.appendChild(dateHeader(doc,rs[0].info.date,rs.length));rs.forEach(function(r){g.appendChild(r.card);});panel.appendChild(g);});
 filters.addEventListener('click',function(e){var b=e.target.closest('.res-filter-btn');if(!b)return;var f=b.dataset.filter;filters.querySelectorAll('.res-filter-btn').forEach(function(x){x.classList.toggle('active',x===b);});panel.querySelectorAll('.res-date-group').forEach(function(g){var visible=0;g.querySelectorAll('.res-card').forEach(function(c){var on=f==='ALL'||c.dataset.resType===f;c.style.display=on?'':'none';if(on)visible++;});g.style.display=visible?'':'none';});});
 updatePrepare(doc);
}
function run(){try{var doc=frame.contentDocument;if(!doc)return;style(doc);frame.contentWindow.setTimeout(function(){build(doc);updatePrepare(doc);},30);}catch(e){console.error('Reservation timeline patch failed',e);}}
frame.addEventListener('load',run);
if(frame.contentDocument&&frame.contentDocument.readyState==='complete')run();
})();