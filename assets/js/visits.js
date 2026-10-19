/* Visit beacon for this site's own statistics (see the privacy note in the footer).
   No cookies, no fingerprinting, nothing shared with third parties. Sends one small
   record per page load to the endpoint in data-endpoint; does nothing if it is empty.
   Visit the site once with ?notrack=1 to stop counting your own browser (?notrack=0 undoes it). */
(function () {
  'use strict';
  var script = document.currentScript;
  var endpoint = script && script.getAttribute('data-endpoint');
  if (!endpoint) return;

  var search = location.search;
  try {
    if (/[?&]notrack=1(&|$)/.test(search)) localStorage.setItem('notrack', '1');
    else if (/[?&]notrack=0(&|$)/.test(search)) localStorage.removeItem('notrack');
    if (localStorage.getItem('notrack') === '1') return;
  } catch (e) { /* storage unavailable: count the visit anyway */ }
  if (navigator.webdriver) return;

  var zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* ignore */ }
  var body = JSON.stringify({
    p: location.pathname,
    q: search.replace(/([?&])notrack=[01](&|$)/, '$1').replace(/[?&]$/, ''),
    r: document.referrer || '',
    s: screen.width + 'x' + screen.height,
    l: navigator.language || '',
    z: zone
  });

  var send = function () {
    try { if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return; } catch (e) { /* fall through */ }
    try { fetch(endpoint, { method: 'POST', body: body, mode: 'no-cors', keepalive: true, credentials: 'omit' }); } catch (e) { /* ignore */ }
  };
  if (document.visibilityState === 'prerender') {
    document.addEventListener('visibilitychange', function once() {
      document.removeEventListener('visibilitychange', once);
      send();
    });
  } else {
    send();
  }
})();
