(function(){
  'use strict';
  var frame=window.__tripFrame||document.getElementById('site');
  if(!frame)return;
  // Never embed passport scans, passport numbers, or boarding-pass barcodes in the public app.
  var DOCUMENTS_FOLDER='https://drive.google.com/drive/folders/1YE6vU0Y-_U_xV2fYOksnhsWofM2p462_';
  function styles(doc){
    if(doc.getElementById('trip-document-style'))return;
    var s=doc.createElement('style');s.id='trip-document-style';
    s.textContent=
      '.trip-doc-summary{margin:10px 0 0;border-top:1px solid var(--paper-line);padding-top:10px;font-size:11.5px;line-height:1.5;color:var(--text-muted)}'+
      '.trip-doc-summary strong{color:var(--text)}.trip-doc-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}'+
      '.trip-doc-link{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--paper-line);background:var(--jade-soft);color:var(--jade-ink);text-decoration:none;font:700 11.5px Inter,sans-serif;border-radius:20px;padding:9px 11px}'+
      '.trip-doc-section{margin:20px 0 22px}.trip-doc-section h3{font:600 25px Fraunces,serif;margin:0 0 10px}'+
      '.trip-doc-card{background:#fff;border:1px solid var(--paper-line);border-radius:14px;padding:13px 14px;margin:0 0 10px;box-shadow:var(--shadow-card)}'+
      '.trip-doc-card--review{border-left:4px solid var(--gold-fill)}'+
      '.trip-doc-card strong{display:block;font-size:13px;margin-bottom:5px}.trip-doc-card p{font-size:11.5px;line-height:1.5;color:var(--text-muted);margin:0}';
    doc.head.appendChild(s);
  }
  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
  }
  function taiwanArrival(doc){
    var node=doc.getElementById('trip-data'),data;
    try{data=JSON.parse(node?node.textContent:'{}');}catch(e){return '';}
    var twac=data.documentacion&&data.documentacion.twacTaiwan;
    if(!twac||!Array.isArray(twac.viajeros)||!twac.viajeros.length)return '';
    var cards=twac.viajeros.map(function(v){
      var url=typeof v.pdf==='string'&&/^https:\/\/drive\.google\.com\//.test(v.pdf)?v.pdf:'';
      var link=url?'<div class="trip-doc-links"><a class="trip-doc-link" href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">Ver TWAC de '+escapeHtml(v.nombre)+'</a></div>':'';
      return '<div class="trip-doc-card trip-doc-card--review"><strong>Taiwán · TWAC de '+escapeHtml(v.nombre)+' recibido</strong>'+
        '<p>Entrada '+escapeHtml(v.entradaFecha)+' en '+escapeHtml(v.entradaVuelo)+'. Salida declarada '+escapeHtml(v.salidaFecha)+' en '+escapeHtml(v.salidaVueloDeclarado)+', mientras la tarjeta de embarque indica '+escapeHtml(v.salidaVueloTarjeta)+'. Revisar y corregir el vuelo en el trámite oficial. El PDF guardado conserva la declaración recibida.</p>'+
        '<p style="margin-top:8px">Es una tarjeta de llegada, no una aprobación de visa. Solo se recibió el comprobante de Renzo.</p>'+link+'</div>';
    }).join('');
    return '<div id="twac-taiwan-documents">'+cards+'</div>';
  }
  function inPrepare(doc){
    var p=doc.querySelector('#panel-preparar .prep-old');
    if(!p||doc.getElementById('trip-document-section'))return;
    var section=doc.createElement('section');section.id='trip-document-section';section.className='trip-doc-section';
    section.innerHTML='<h3>Documentos del viaje</h3>'+
      '<div class="trip-doc-card"><strong>🛂 Pasaportes y documentos de identidad</strong>'+
      '<p>Las copias originales ya están guardadas en Drive. Se conservan allí, con acceso restringido; no se cargan fotos ni números de pasaporte en la app.</p>'+
      '<div class="trip-doc-links"><a class="trip-doc-link" href="'+DOCUMENTS_FOLDER+'" target="_blank" rel="noopener noreferrer">🔒 Abrir carpeta privada de pasaportes</a></div></div>'+taiwanArrival(doc);
    var heading=[].slice.call(p.querySelectorAll('h3')).find(function(h){return /Antes de salir/i.test(h.textContent||'');});
    if(heading)p.insertBefore(section,heading);else p.appendChild(section);
  }
  function run(){
    try{var doc=frame.contentDocument;if(!doc)return;styles(doc);inPrepare(doc);}catch(e){console.error('Trip documents:',e);}
  }
  frame.addEventListener('load',function(){(frame.contentWindow||window).setTimeout(run,100);});
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')run();
})();