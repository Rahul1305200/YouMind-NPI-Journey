/* YouMind × NPI · where a sign-up came from.
 *
 * Every QR code and link carries its own tag:
 *   npi.html?src=npi&from=flyer   (or card, guide)
 * Rule:
 *   - The first source wins. It is kept for 90 days and never overwritten by a later visit.
 *   - Typing the code NPI also counts as NPI (from = "code") when no link was saved first.
 *   - Anything else is "direct".
 * Prototype: kept in this browser only. The real build saves the same fields with the sign-up
 * (source, from, first seen) and sends them to the CRM as lead source NPI.
 */
(function () {
  var KEY = 'ym_npi_source';
  var KEEP_MS = 90 * 24 * 60 * 60 * 1000;
  var FROM = ['flyer', 'card', 'guide', 'link'];

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && v.source && Date.now() - Number(v.at || 0) < KEEP_MS) return v;
    } catch (e) { /* storage blocked: nothing saved */ }
    return null;
  }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  var params = new URLSearchParams(location.search);
  if (!read() && String(params.get('src') || '').toLowerCase() === 'npi') {
    var from = String(params.get('from') || '').toLowerCase();
    write({ source: 'npi', from: FROM.indexOf(from) >= 0 ? from : 'link', at: Date.now() });
  }

  window.ymNpiSource = {
    get: read,
    /* A typed code counts only when no link source was saved first. */
    fromCode: function (code) {
      if (!read() && String(code || '').trim().toUpperCase() === 'NPI') write({ source: 'npi', from: 'code', at: Date.now() });
      return read();
    },
    /* The tag to carry on to the next page. */
    query: function () {
      var v = read();
      return '?src=npi&from=' + encodeURIComponent(v ? v.from : 'link');
    },
    label: function () {
      var v = read();
      if (!v) return 'Direct';
      return { flyer: 'NPI flyer', card: 'NPI athlete card', guide: 'NPI parent guide', link: 'NPI link', code: 'Code NPI' }[v.from] || 'NPI';
    }
  };
})();
