(function(){
'use strict';
var frame=document.getElementById('site');
if(!frame)return;
var PDF='https://drive.google.com/file/d/19nD15tCCOzjwo2Op9Lm3LfLla_rqadjY/view?usp=drivesdk';
var MAPS='https://www.google.com/maps/search/?api=1&query=Richmond%20Hotel%20Narita%2C%20Hanasaki-cho%20970%2C%20Narita%2C%20Chiba%2C%20Japan&hl=es&gl=es';
var FOLDER='https://drive.google.com/drive/folders/1OpsMnJ0hkVuz3wIvxpR0n-J-FMXg4CJd';
function patch(doc){
  var style=doc.getElementById('narita-reservation-style');
  if(!style){
    style=doc.createElement('style');style.id='narita-reservation-style';
    style.textContent='.res-narita-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.res-narita-actions a{display:inline-flex;align-items:center;gap:6px;text-decoration:none;border-radius:20px;padding:7px 10px;font-size:11.5px;font-weight:700}.res-narita-actions .pdf{background:var(--jade-soft);color:var(--jade-ink)}.res-narita-actions .maps{background:var(--gold-soft);color:var(--gold)}.res-narita-actions .folder{background:var(--paper-2);color:var(--text-muted)}.res-narita-facts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0 0}.res-narita-fact{background:var(--paper-2);border-radius:10px;padding:8px 9px}.res-narita-fact b{display:block;font-size:10.5px}.res-narita-fact span{display:block;font-size:10.5px;color:var(--text-muted);margin-top:1px}@media(max-width:360px){.res-narita-facts{grid-template-columns:1fr}}';
    doc.head.appendChild(style);
  }
  var card=null;
  doc.querySelectorAll('.res-card').forEach(function(c){var t=(c.textContent||'').toLowerCase();if(!card&&t.indexOf('narita')>=0&&t.indexOf('9')>=0&&t.indexOf('10')>=0&&(/alojamiento|richmond/.test(t)))card=c;});
  if(card){
    card.classList.add('res-card--narita');
    var meta=card.querySelector('.res-card__timeline-meta');
    card.innerHTML='';
    if(meta)card.appendChild(meta);
    var body=doc.createElement('div');
    body.innerHTML='<div class="res-card__title">Richmond Hotel Narita · mamá, papá y Renzo</div><div class="res-card__sub">9 Nov → 10 Nov · 1 noche · conexión en Narita</div><div class="res-narita-facts"><div class="res-narita-fact"><b>Check-in</b><span>9 Nov · desde 14:00</span></div><div class="res-narita-fact"><b>Check-out</b><span>10 Nov · hasta 11:00</span></div><div class="res-narita-fact"><b>Dirección</b><span>Hanasaki-cho 970, Narita, Chiba</span></div><div class="res-narita-fact"><b>Teléfono</b><span>+81 476-24-6660</span></div></div><p class="res-narita-note">Llegada a NRT el 9 Nov a las 16:30. El vuelo VJ933 a Hanoi sale el 10 Nov a las 09:30.</p><div class="res-narita-actions"><a class="pdf" href="'+PDF+'" target="_blank" rel="noopener noreferrer">📄 Ver reserva</a><a class="maps" href="'+MAPS+'" target="_blank" rel="noopener noreferrer">📍 Google Maps</a><a class="folder" href="'+FOLDER+'" target="_blank" rel="noopener noreferrer">📁 Carpeta Narita</a></div>';
    while(body.firstChild)card.appendChild(body.firstChild);
  }
  doc.querySelectorAll('.prep-old__alert').forEach(function(a){var tx=(a.textContent||'');if(tx.indexOf('Narita 9–10 Nov')<0&&tx.indexOf('Tokyo 9–10 Nov')<0)return;a.classList.add('is-resolved');var label=a.querySelector('.prep-old__label');if(label)label.textContent='Resuelto';var strong=a.querySelector('strong');if(strong)strong.textContent='Richmond Hotel Narita · 9–10 Nov';var p=a.querySelector('p');if(p)p.innerHTML='Mamá, papá y Renzo tienen confirmada la noche de tránsito en Richmond Hotel Narita. Check-in desde las 14:00 del 9 Nov; VJ933 sale de NRT el 10 Nov a las 09:30. <a href="'+PDF+'" target="_blank" rel="noopener">Ver reserva</a> · <a href="'+MAPS+'" target="_blank" rel="noopener">Mapa</a>.';});
}
function run(){try{var doc=frame.contentDocument;if(!doc)return;frame.contentWindow.setTimeout(function(){patch(doc);},90);}catch(e){console.error('Narita patch failed',e);}}
frame.addEventListener('load',run);
if(frame.contentDocument&&frame.contentDocument.readyState==='complete')run();
})();