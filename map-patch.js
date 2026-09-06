(function(){
  'use strict';

  var frame = document.getElementById('site');
  if(!frame) return;

  var PLACES = {
    'Hanoi':          {lat:21.0278,lng:105.8342,country:'VN',countryName:'Vietnam'},
    'Ha Long Bay':    {lat:20.9101,lng:107.1839,country:'VN',countryName:'Vietnam'},
    'Ha Giang':       {lat:22.8026,lng:104.9784,country:'VN',countryName:'Vietnam'},
    'Hoi An':         {lat:15.8801,lng:108.3380,country:'VN',countryName:'Vietnam'},
    'Hue':            {lat:16.4637,lng:107.5909,country:'VN',countryName:'Vietnam'},
    'Da Nang':        {lat:16.0544,lng:108.2022,country:'VN',countryName:'Vietnam'},
    'Taipei':         {lat:25.0330,lng:121.5654,country:'TW',countryName:'Taiwán'},
    'Osaka':          {lat:34.6937,lng:135.5023,country:'JP',countryName:'Japón'},
    'Kyoto':          {lat:35.0116,lng:135.7681,country:'JP',countryName:'Japón'},
    'Nara':           {lat:34.6851,lng:135.8048,country:'JP',countryName:'Japón'},
    'Himeji':         {lat:34.8151,lng:134.6853,country:'JP',countryName:'Japón'},
    'Hiroshima':      {lat:34.3853,lng:132.4553,country:'JP',countryName:'Japón'},
    'Miyajima':       {lat:34.2959,lng:132.3199,country:'JP',countryName:'Japón'},
    'Nagoya':         {lat:35.1815,lng:136.9066,country:'JP',countryName:'Japón'},
    'Takayama':       {lat:36.1461,lng:137.2522,country:'JP',countryName:'Japón'},
    'Shirakawa-go':   {lat:36.2570,lng:136.9060,country:'JP',countryName:'Japón'},
    'Hakone':         {lat:35.2324,lng:139.1069,country:'JP',countryName:'Japón'},
    'Tokyo':          {lat:35.6762,lng:139.6503,country:'JP',countryName:'Japón'},
    'Enoshima':       {lat:35.2990,lng:139.4800,country:'JP',countryName:'Japón'}
  };

  var COUNTRY_META = {
    VN:{label:'Vietnam',flag:'🇻🇳',color:'#356b52'},
    TW:{label:'Taiwán',flag:'🇹🇼',color:'#d9a53c'},
    JP:{label:'Japón',flag:'🇯🇵',color:'#a83a2c'}
  };

  var monthMap = {Ene:0,Feb:1,Mar:2,Abr:3,May:4,Jun:5,Jul:6,Ago:7,Sep:8,Oct:9,Nov:10,Dic:11};
  var mapInstance = null;
  var allMarkers = [];
  var routeLayer = null;
  var activeFilter = 'ALL';
  var refreshTimer = null;

  function localDateOnly(){
    var d=new Date();
    return new Date(d.getFullYear(),d.getMonth(),d.getDate());
  }

  function parseTripDate(label){
    var parts=(label||'').trim().split(/\s+/);
    var day=parseInt(parts[1],10);
    var month=monthMap[parts[2]];
    if(!isFinite(day) || month===undefined) return null;
    return new Date(2026,month,day);
  }

  function sameDay(a,b){
    return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  function mapsUrl(name){
    var p=PLACES[name];
    var q=name + (p ? ', '+p.countryName : '');
    return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
  }

  function extractPlaces(placeText){
    var keys=Object.keys(PLACES).sort(function(a,b){return b.length-a.length;});
    var found=[];
    keys.forEach(function(name){
      if((placeText||'').indexOf(name)!==-1 && found.indexOf(name)===-1) found.push(name);
    });
    return found;
  }

  function readTripData(doc){
    var node=doc.getElementById('trip-data');
    if(!node) return null;
    try{return JSON.parse(node.textContent);}catch(e){return null;}
  }

  function buildStops(doc){
    var data=readTripData(doc);
    if(!data || !Array.isArray(data.days)) return {stops:[],route:[],days:[]};

    var byName={};
    var route=[];
    data.days.forEach(function(day){
      var date=parseTripDate(day.date);
      var names=extractPlaces(day.place);
      names.forEach(function(name){
        var p=PLACES[name];
        if(!byName[name]) byName[name]={name:name,lat:p.lat,lng:p.lng,country:p.country,countryName:p.countryName,days:[]};
        byName[name].days.push({num:day.num,dateLabel:day.date,date:date,place:day.place,activity:day.activity||''});
        if(!route.length || route[route.length-1]!==name) route.push(name);
      });
    });

    var stops=Object.keys(byName).map(function(name){
      var stop=byName[name];
      stop.days.sort(function(a,b){return a.num-b.num;});
      return stop;
    }).sort(function(a,b){return a.days[0].num-b.days[0].num;});

    return {stops:stops,route:route,days:data.days};
  }

  function stopStatus(stop,today){
    var hasToday=false,hasFuture=false,hasPast=false;
    stop.days.forEach(function(d){
      if(!d.date) return;
      if(sameDay(d.date,today)) hasToday=true;
      else if(d.date>today) hasFuture=true;
      else hasPast=true;
    });
    if(hasToday) return 'today';
    if(hasFuture) return 'upcoming';
    if(hasPast) return 'visited';
    return 'upcoming';
  }

  function statusLabel(status){
    return status==='today' ? 'Están acá hoy' : status==='visited' ? 'Visitado' : 'Próximo';
  }

  function firstFutureStop(stops,today){
    var candidate=null;
    stops.forEach(function(stop){
      stop.days.forEach(function(d){
        if(d.date && d.date>=today && (!candidate || d.date<candidate.date)) candidate={stop:stop,date:d.date,dateLabel:d.dateLabel};
      });
    });
    return candidate;
  }

  function injectStyles(doc){
    if(doc.getElementById('trip-map-style')) return;
    var style=doc.createElement('style');
    style.id='trip-map-style';
    style.textContent='\n'+
      '.trip-map-cta{display:flex;align-items:center;gap:12px;width:100%;margin:2px 0 16px;padding:13px 14px;border:0;border-radius:14px;background:linear-gradient(135deg,#d9a53c,#bd8522);color:#101820;font:700 13px Inter,system-ui,sans-serif;box-shadow:0 5px 16px -8px rgba(162,114,31,.65);cursor:pointer;text-align:left}\n'+
      '.trip-map-cta__icon{width:36px;height:36px;border-radius:11px;background:rgba(255,255,255,.42);display:flex;align-items:center;justify-content:center;flex:none;font-size:19px}\n'+
      '.trip-map-cta__text{min-width:0;flex:1}.trip-map-cta__text strong{display:block;font-size:14px}.trip-map-cta__text small{display:block;font-weight:500;opacity:.72;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n'+
      '.trip-map-cta__chev{font-size:20px;line-height:1;opacity:.7}\n'+
      '.trip-map-modal{position:fixed;inset:0;z-index:999;background:var(--paper);display:none;flex-direction:column;color:var(--text);overflow:hidden}\n'+
      '.trip-map-modal.open{display:flex}\n'+
      '.trip-map-top{background:var(--ink);color:var(--on-ink);padding:calc(12px + env(safe-area-inset-top)) 14px 12px;display:flex;align-items:center;gap:10px;flex:none}\n'+
      '.trip-map-close{width:42px;height:42px;border:1px solid var(--ink-line);border-radius:12px;background:rgba(255,255,255,.06);color:var(--on-ink);font-size:24px;line-height:1;cursor:pointer;flex:none}\n'+
      '.trip-map-heading{min-width:0;flex:1}.trip-map-heading strong{font-family:Fraunces,serif;font-size:19px;font-weight:600;display:block}.trip-map-heading small{font-size:11.5px;color:var(--on-ink-muted);display:block;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n'+
      '.trip-map-progress{background:var(--paper);padding:10px 12px 8px;border-bottom:1px solid var(--paper-line);flex:none}\n'+
      '.trip-map-progress__row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;margin-bottom:8px}.trip-map-progress__row strong{font-size:12.5px}.trip-map-progress__row span{color:var(--text-muted);text-align:right}\n'+
      '.trip-map-bar{height:7px;border-radius:10px;background:var(--paper-2);overflow:hidden}.trip-map-bar span{display:block;height:100%;background:var(--gold-fill);border-radius:10px;transition:width .25s ease}\n'+
      '.trip-map-filters{display:flex;gap:7px;padding:9px 12px;background:#fff;border-bottom:1px solid var(--paper-line);overflow-x:auto;flex:none;-webkit-overflow-scrolling:touch}\n'+
      '.trip-map-filter{border:1px solid var(--paper-line);background:var(--paper);color:var(--text-muted);border-radius:20px;padding:7px 11px;font:600 11.5px Inter,system-ui,sans-serif;white-space:nowrap;cursor:pointer}\n'+
      '.trip-map-filter.active{background:var(--ink);color:var(--on-ink);border-color:var(--ink)}\n'+
      '.trip-map-canvas{position:relative;flex:1;min-height:320px;background:#e8e4da}\n'+
      '#trip-map-leaflet{position:absolute;inset:0}\n'+
      '.trip-map-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:var(--text-muted);font-size:13px;background:var(--paper-2);z-index:2}\n'+
      '.trip-map-legend{position:absolute;left:10px;bottom:10px;z-index:500;background:rgba(255,255,255,.94);border:1px solid var(--paper-line);border-radius:10px;padding:7px 9px;font-size:10.5px;box-shadow:var(--shadow-card);display:flex;gap:9px;flex-wrap:wrap;max-width:calc(100% - 20px)}\n'+
      '.trip-map-legend span{display:inline-flex;align-items:center;gap:4px}.trip-map-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.trip-map-dot.today{background:#d9a53c;box-shadow:0 0 0 2px rgba(217,165,60,.22)}.trip-map-dot.upcoming{background:#356b52}.trip-map-dot.visited{background:#9ca69d}\n'+
      '.trip-map-fallback{display:none;position:absolute;inset:0;overflow:auto;padding:12px;background:var(--paper)}\n'+
      '.trip-map-fallback.show{display:block}.trip-map-fallback a{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--text);text-decoration:none;background:#fff;border:1px solid var(--paper-line);border-radius:11px;padding:10px 12px;margin-bottom:7px;font-size:12px}.trip-map-fallback small{color:var(--text-muted)}\n'+
      '.trip-pin{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:700 10px Inter,system-ui,sans-serif;border:2px solid #fff;box-shadow:0 2px 8px rgba(16,24,32,.28)}\n'+
      '.trip-pin.today{background:#d9a53c;width:31px;height:31px;font-size:11px;box-shadow:0 0 0 5px rgba(217,165,60,.22),0 3px 10px rgba(16,24,32,.3)}.trip-pin.visited{background:#8f9a91;opacity:.82}.trip-pin.VN.upcoming{background:#356b52}.trip-pin.TW.upcoming{background:#a2721f}.trip-pin.JP.upcoming{background:#a83a2c}\n'+
      '.trip-map-popup{font-family:Inter,system-ui,sans-serif;min-width:180px}.trip-map-popup strong{font-size:14px}.trip-map-popup__meta{font-size:11px;color:#616f5f;margin:3px 0 7px}.trip-map-popup__status{display:inline-block;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:20px;background:#EFE7D4;color:#20281f;margin-bottom:7px}.trip-map-popup a{display:inline-flex;align-items:center;gap:4px;color:#254a3a;font-size:11.5px;font-weight:700;text-decoration:none}\n'+
      '.leaflet-control-attribution{font-size:9px!important}\n'+
      '@media (min-width:641px){.trip-map-modal{left:50%;right:auto;width:640px;transform:translateX(-50%);box-shadow:0 0 50px rgba(0,0,0,.18)}}\n'+
      '@media (prefers-reduced-motion:reduce){.trip-map-bar span{transition:none}}';
    doc.head.appendChild(style);
  }

  function addButton(doc, stops){
    var panel=doc.getElementById('panel-itinerario');
    if(!panel || doc.getElementById('trip-map-open')) return;
    var button=doc.createElement('button');
    button.type='button';
    button.id='trip-map-open';
    button.className='trip-map-cta';
    button.innerHTML='<span class="trip-map-cta__icon" aria-hidden="true">🗺️</span><span class="trip-map-cta__text"><strong>Ver mapa del viaje</strong><small>'+stops.length+' destinos · recorrido completo y links a Maps</small></span><span class="trip-map-cta__chev" aria-hidden="true">›</span>';
    panel.insertBefore(button,panel.firstChild);
  }

  function addModal(doc){
    if(doc.getElementById('trip-map-modal')) return;
    var modal=doc.createElement('section');
    modal.id='trip-map-modal';
    modal.className='trip-map-modal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=''+
      '<div class="trip-map-top">'+
        '<button class="trip-map-close" id="trip-map-close" type="button" aria-label="Cerrar mapa">‹</button>'+
        '<div class="trip-map-heading"><strong>Mapa del viaje</strong><small id="trip-map-subtitle">Vietnam · Taiwán · Japón 2026</small></div>'+
      '</div>'+
      '<div class="trip-map-progress">'+
        '<div class="trip-map-progress__row"><strong id="trip-map-progress-label">Recorrido</strong><span id="trip-map-next">Próximo destino</span></div>'+
        '<div class="trip-map-bar"><span id="trip-map-progress-fill" style="width:0%"></span></div>'+
      '</div>'+
      '<div class="trip-map-filters" role="group" aria-label="Filtrar mapa">'+
        '<button type="button" class="trip-map-filter active" data-country="ALL">Todos</button>'+
        '<button type="button" class="trip-map-filter" data-country="VN">🇻🇳 Vietnam</button>'+
        '<button type="button" class="trip-map-filter" data-country="TW">🇹🇼 Taiwán</button>'+
        '<button type="button" class="trip-map-filter" data-country="JP">🇯🇵 Japón</button>'+
      '</div>'+
      '<div class="trip-map-canvas">'+
        '<div id="trip-map-leaflet" aria-label="Mapa interactivo de destinos"></div>'+
        '<div class="trip-map-loading" id="trip-map-loading">Cargando mapa interactivo…</div>'+
        '<div class="trip-map-fallback" id="trip-map-fallback"></div>'+
        '<div class="trip-map-legend"><span><i class="trip-map-dot visited"></i>Visitado</span><span><i class="trip-map-dot today"></i>Hoy</span><span><i class="trip-map-dot upcoming"></i>Próximo</span></div>'+
      '</div>';
    doc.body.appendChild(modal);
  }

  function ensureLeaflet(doc,done){
    var win=doc.defaultView;
    if(win.L){done(true);return;}

    if(!doc.getElementById('leaflet-css')){
      var link=doc.createElement('link');
      link.id='leaflet-css';
      link.rel='stylesheet';
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin='';
      doc.head.appendChild(link);
    }

    var existing=doc.getElementById('leaflet-js');
    if(existing){
      var tries=0;
      var timer=win.setInterval(function(){
        tries++;
        if(win.L){win.clearInterval(timer);done(true);}
        else if(tries>50){win.clearInterval(timer);done(false);}
      },100);
      return;
    }

    var script=doc.createElement('script');
    script.id='leaflet-js';
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin='';
    script.onload=function(){done(!!win.L);};
    script.onerror=function(){done(false);};
    doc.head.appendChild(script);
  }

  function fillFallback(doc,stops){
    var box=doc.getElementById('trip-map-fallback');
    if(!box) return;
    box.innerHTML=stops.map(function(stop){
      var meta=COUNTRY_META[stop.country];
      var dates=stop.days.map(function(d){return d.dateLabel.replace(/^\S+\s+/,'');}).join(' · ');
      return '<a href="'+mapsUrl(stop.name)+'" target="_blank" rel="noopener"><span>'+meta.flag+' <strong>'+stop.name+'</strong><br><small>'+dates+'</small></span><span>Maps ↗</span></a>';
    }).join('');
  }

  function markerHtml(stop,status){
    var n=stop.days[0].num;
    return '<div class="trip-pin '+stop.country+' '+status+'">'+(status==='visited'?'✓':n)+'</div>';
  }

  function popupHtml(stop,status){
    var meta=COUNTRY_META[stop.country];
    var dates=stop.days.map(function(d){return d.dateLabel;}).join(' · ');
    return '<div class="trip-map-popup"><strong>'+meta.flag+' '+stop.name+'</strong><div class="trip-map-popup__meta">'+dates+'</div><span class="trip-map-popup__status">'+statusLabel(status)+'</span><br><a href="'+mapsUrl(stop.name)+'" target="_blank" rel="noopener">📍 Abrir en Google Maps ↗</a></div>';
  }

  function visibleStops(stops){
    return activeFilter==='ALL' ? stops : stops.filter(function(s){return s.country===activeFilter;});
  }

  function renderMap(doc,model){
    var win=doc.defaultView;
    var L=win.L;
    var today=localDateOnly();
    var mapEl=doc.getElementById('trip-map-leaflet');
    if(!mapEl || !L) return;

    if(mapInstance){
      try{mapInstance.remove();}catch(e){}
      mapInstance=null;
    }
    allMarkers=[];

    mapInstance=L.map(mapEl,{zoomControl:true,attributionControl:true,worldCopyJump:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      attribution:'© OpenStreetMap'
    }).addTo(mapInstance);

    var shown=visibleStops(model.stops);
    shown.forEach(function(stop){
      var status=stopStatus(stop,today);
      var icon=L.divIcon({className:'',html:markerHtml(stop,status),iconSize:[status==='today'?31:26,status==='today'?31:26],iconAnchor:[13,13]});
      var marker=L.marker([stop.lat,stop.lng],{icon:icon,title:stop.name}).addTo(mapInstance);
      marker.bindPopup(popupHtml(stop,status),{maxWidth:260});
      marker.__country=stop.country;
      marker.__stop=stop;
      allMarkers.push(marker);
    });

    var routeNames=model.route.filter(function(name){
      return activeFilter==='ALL' || PLACES[name].country===activeFilter;
    });
    var coords=routeNames.map(function(name){return [PLACES[name].lat,PLACES[name].lng];});
    if(coords.length>1){
      routeLayer=L.polyline(coords,{color:'#536058',weight:2,opacity:.5,dashArray:'5 7'}).addTo(mapInstance);
    }

    if(shown.length){
      var bounds=L.latLngBounds(shown.map(function(s){return [s.lat,s.lng];}));
      mapInstance.fitBounds(bounds,{padding:[28,28],maxZoom:8});
    }else{
      mapInstance.setView([27,120],4);
    }

    var next=firstFutureStop(shown,today);
    if(activeFilter==='ALL' && next && next.stop && today>=parseTripDate(model.days[0].date)){
      var todays=shown.filter(function(s){return stopStatus(s,today)==='today';});
      if(todays.length){
        mapInstance.setView([todays[0].lat,todays[0].lng],7);
      }
    }

    win.setTimeout(function(){if(mapInstance) mapInstance.invalidateSize();},80);
  }

  function updateProgress(doc,model){
    var today=localDateOnly();
    var statuses=model.stops.map(function(s){return stopStatus(s,today);});
    var visited=statuses.filter(function(s){return s==='visited';}).length;
    var current=statuses.filter(function(s){return s==='today';}).length;
    var done=Math.min(model.stops.length,visited+current);
    var pct=model.stops.length ? Math.round(done/model.stops.length*100) : 0;
    var label=doc.getElementById('trip-map-progress-label');
    var nextEl=doc.getElementById('trip-map-next');
    var fill=doc.getElementById('trip-map-progress-fill');
    if(label) label.textContent=done+' de '+model.stops.length+' destinos recorridos';
    if(fill) fill.style.width=pct+'%';
    var next=firstFutureStop(model.stops,today);
    if(nextEl){
      if(current){
        var here=model.stops.filter(function(s){return stopStatus(s,today)==='today';}).map(function(s){return s.name;}).join(' · ');
        nextEl.textContent='Hoy: '+here;
      }else if(next){
        nextEl.textContent='Próximo: '+next.stop.name+' · '+next.dateLabel.replace(/^\S+\s+/,'');
      }else{
        nextEl.textContent='Viaje completado';
      }
    }
  }

  function openMap(doc,model){
    var modal=doc.getElementById('trip-map-modal');
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    doc.body.style.overflow='hidden';
    updateProgress(doc,model);
    fillFallback(doc,model.stops);

    ensureLeaflet(doc,function(ok){
      var loading=doc.getElementById('trip-map-loading');
      var fallback=doc.getElementById('trip-map-fallback');
      if(loading) loading.style.display='none';
      if(ok){
        if(fallback) fallback.classList.remove('show');
        renderMap(doc,model);
      }else if(fallback){
        fallback.classList.add('show');
      }
    });
  }

  function closeMap(doc){
    var modal=doc.getElementById('trip-map-modal');
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    doc.body.style.overflow='';
  }

  function wire(doc,model){
    var open=doc.getElementById('trip-map-open');
    var close=doc.getElementById('trip-map-close');
    if(open && !open.dataset.wired){
      open.dataset.wired='1';
      open.addEventListener('click',function(){openMap(doc,model);});
    }
    if(close && !close.dataset.wired){
      close.dataset.wired='1';
      close.addEventListener('click',function(){closeMap(doc);});
    }

    doc.querySelectorAll('.trip-map-filter').forEach(function(btn){
      if(btn.dataset.wired) return;
      btn.dataset.wired='1';
      btn.addEventListener('click',function(){
        activeFilter=btn.getAttribute('data-country')||'ALL';
        doc.querySelectorAll('.trip-map-filter').forEach(function(b){b.classList.toggle('active',b===btn);});
        if(doc.getElementById('trip-map-modal').classList.contains('open')) renderMap(doc,model);
      });
    });

    doc.addEventListener('keydown',function(e){
      if(e.key==='Escape') closeMap(doc);
    });

    if(refreshTimer) frame.contentWindow.clearInterval(refreshTimer);
    refreshTimer=frame.contentWindow.setInterval(function(){
      updateProgress(doc,model);
      if(doc.getElementById('trip-map-modal') && doc.getElementById('trip-map-modal').classList.contains('open') && doc.defaultView.L){
        renderMap(doc,model);
      }
    },60000);
  }

  function setup(){
    try{
      var doc=frame.contentDocument;
      if(!doc) return;
      var model=buildStops(doc);
      if(!model.stops.length) return;
      injectStyles(doc);
      addButton(doc,model.stops);
      addModal(doc);
      updateProgress(doc,model);
      wire(doc,model);
    }catch(err){
      console.error('Trip map setup failed',err);
    }
  }

  frame.addEventListener('load',function(){
    setup();
    frame.contentWindow.setTimeout(setup,200);
  });

  if(frame.contentDocument && frame.contentDocument.readyState==='complete') setup();
})();
