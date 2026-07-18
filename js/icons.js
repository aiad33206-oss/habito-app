/* ==========================================================================
   ICONS — minimal hand-drawn SVG set (24x24 viewBox, stroke-based)
   Usage: ICONS.home(), ICONS.chart(), etc. return an <svg> string.
   ========================================================================== */
var ICONS = (function(){
  function svg(inner, cls){
    return '<svg class="icon '+(cls||'')+'" viewBox="0 0 24 24">'+inner+'</svg>';
  }
  return {
    home: function(c){ return svg('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>', c); },
    chart: function(c){ return svg('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>', c); },
    check: function(c){ return svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/>', c); },
    gear: function(c){ return svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>', c); },
    flame: function(c){ return svg('<path d="M12 21c4 0 6.5-2.6 6.5-6 0-2.7-1.6-4-2.6-5.7-.5.9-1.2 1.6-2 1.6.4-2.4-.6-4.9-2.9-6.4.4 2-.2 3.6-1.7 5.1C7.6 11.2 6 12.8 6 15c0 3.4 2 6 6 6Z"/>', c); },
    target: function(c){ return svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>', c); },
    heart: function(c){ return svg('<path d="M12 20.5s-7.5-4.6-9.8-9.3C.7 7.9 2.4 4.7 5.6 4.1c2-.4 3.8.5 4.9 2.1C11.6 4.6 13.4 3.7 15.4 4.1c3.2.6 4.9 3.8 3.4 7.1C16.5 15.9 12 20.5 12 20.5Z"/>', c); },
    plus: function(c){ return svg('<path d="M12 5v14M5 12h14"/>', c); },
    close: function(c){ return svg('<path d="M6 6l12 12M18 6L6 18"/>', c); },
    pencil: function(c){ return svg('<path d="M4 20l.9-4L16 4.9a2 2 0 0 1 2.8 0l.3.3a2 2 0 0 1 0 2.8L8 19l-4 1Z"/><path d="M14 6.5 17.5 10"/>', c); },
    trash: function(c){ return svg('<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-.7 12.1a1 1 0 0 1-1 .9H8.7a1 1 0 0 1-1-.9L7 7"/><path d="M10 11v6M14 11v6"/>', c); },
    chevronRight: function(c){ return svg('<path d="M9 5l7 7-7 7"/>', c); },
    back: function(c){ return svg('<path d="M15 5l-7 7 7 7"/>', c); },
    camera: function(c){ return svg('<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.4"/>', c); },
    download: function(c){ return svg('<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/>', c); },
    upload: function(c){ return svg('<path d="M12 20V9M8 13l4-4 4 4"/><path d="M5 19h14"/>', c); },
    shield: function(c){ return svg('<path d="M12 3.5 19 6.5v5.2c0 4.6-3 7.7-7 8.8-4-1.1-7-4.2-7-8.8V6.5Z"/><path d="M9 12l2 2 4-4.2"/>', c); },
    mail: function(c){ return svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 6.5l8 6.5 8-6.5"/>', c); },
    user: function(c){ return svg('<circle cx="12" cy="8.3" r="3.3"/><path d="M5 20c1-3.5 4-5.3 7-5.3s6 1.8 7 5.3"/>', c); },
    logout: function(c){ return svg('<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>', c); },
    globe: function(c){ return svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.2 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.2-3.4-8.5s1.2-6.2 3.4-8.5Z"/>', c); },
    palette: function(c){ return svg('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a4 4 0 0 0 4-4c0-4.3-3.6-7.2-8-7.2Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="9.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>', c); },
    bell: function(c){ return svg('<path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"/><path d="M10 19a2 2 0 0 0 4 0"/>', c); },
    google: function(){ return '<svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.3 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"/><path fill="#4CAF50" d="M24 43.5c5.3 0 9.9-1.7 13.5-4.7l-6.2-5.3C29.4 35.3 26.9 36 24 36c-5.3 0-9.8-3.6-11.4-8.5l-6.5 5C9.8 39 16.4 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.3-5.5 6.9l6.2 5.3C39.6 37.4 43.5 31.4 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>'; }
  };
})();
