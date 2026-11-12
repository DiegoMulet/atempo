/* ATEMPO — ilustrações vetoriais */
window.ART = {
  hero: function () {
    return '' +
'<svg class="hero-svg" viewBox="0 0 640 470" role="img" aria-label="Estudante estudando com notebook e caderno">' +
'<defs>' +
'<linearGradient id="gHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3622"/><stop offset="1" stop-color="#2f1b10"/></linearGradient>' +
'<linearGradient id="gSweat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2f36"/><stop offset="1" stop-color="#17191d"/></linearGradient>' +
'<linearGradient id="gLap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef1f4"/><stop offset=".55" stop-color="#c3c9d0"/><stop offset="1" stop-color="#9aa3ad"/></linearGradient>' +
'<linearGradient id="gTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1fa79f"/><stop offset="1" stop-color="#11807b"/></linearGradient>' +
'<linearGradient id="gSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c9a8"/><stop offset="1" stop-color="#e6ad8a"/></linearGradient>' +
'</defs>' +
/* formas de fundo */
'<path d="M300 34C420 -6 600 10 700 70V470H330C262 410 214 330 222 240 230 150 236 62 300 34Z" fill="url(#gTeal)"/>' +
'<path d="M640 60C560 40 470 70 430 130 400 176 430 230 500 240 560 248 620 220 640 200Z" fill="#0f6f6b" opacity=".35"/>' +
'<path d="M148 300C120 214 170 132 262 128 334 125 344 222 306 296 266 372 170 380 148 300Z" fill="#f6dfa4" opacity=".7"/>' +
'<path d="M40 440C110 270 290 130 520 52" stroke="#f2c15e" stroke-width="3" fill="none" opacity=".9"/>' +
'<path d="M90 470C170 330 330 200 600 150" stroke="#f2c15e" stroke-width="2" fill="none" opacity=".45"/>' +
/* caneca */
'<rect x="132" y="350" width="40" height="46" rx="6" fill="#ffffff"/><path d="M172 362h8a9 9 0 0 1 0 18h-8" stroke="#ffffff" stroke-width="5" fill="none"/><rect x="132" y="350" width="40" height="8" rx="3" fill="#e9e1d2"/>' +
/* cabelo de trás */
'<path d="M302 76C246 76 222 124 228 180 232 230 214 272 236 304H374C388 264 366 228 370 180 376 120 354 76 302 76Z" fill="url(#gHair)"/>' +
/* pescoço */
'<path d="M286 200h32v44h-32z" fill="#dda07f"/>' +
/* corpo */
'<path d="M226 266C238 238 270 230 302 232 336 230 366 238 380 266L400 402H208Z" fill="url(#gSweat)"/>' +
'<path d="M282 234q20 15 40 0" stroke="#3b3f47" stroke-width="5" fill="none" stroke-linecap="round"/>' +
/* rosto */
'<ellipse cx="301" cy="160" rx="40" ry="49" fill="url(#gSkin)"/>' +
'<ellipse cx="279" cy="183" rx="8" ry="4.5" fill="#e98f7a" opacity=".35"/><ellipse cx="325" cy="183" rx="8" ry="4.5" fill="#e98f7a" opacity=".35"/>' +
'<path d="M281 166q8 5 16 0M307 166q8 5 16 0" stroke="#3a2418" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
'<path d="M280 153q9-5 17-1M307 152q9-4 17 1" stroke="#4a2c1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
'<path d="M303 170q-4 10 3 12" stroke="#c98d70" stroke-width="2" fill="none" stroke-linecap="round"/>' +
'<path d="M293 192q9 5 17 0" stroke="#b5604f" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
/* franja */
'<path d="M257 168C249 112 290 90 323 98 352 106 354 150 345 180 341 150 328 128 304 124 284 121 266 138 257 168Z" fill="url(#gHair)"/>' +
'<path d="M262 120C252 150 250 190 244 222 238 250 240 280 250 300L232 300C222 262 234 220 240 180 244 150 248 130 262 120Z" fill="#3a2215"/>' +
/* braço apoiado no rosto */
'<path d="M214 376C212 322 228 252 248 212L274 222C262 262 254 322 252 378Z" fill="url(#gSweat)"/>' +
'<path d="M250 216C245 198 254 176 267 177 279 178 282 200 276 218Z" fill="url(#gSkin)"/>' +
'<path d="M262 186q6-2 10 2M260 196q6-2 11 2" stroke="#d99a7a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
/* mesa */
'<path d="M90 398H640V470H90Z" fill="#f4ede2"/><path d="M90 398H640" stroke="#e6dac6" stroke-width="3"/>' +
/* livros */
'<rect x="180" y="420" width="236" height="13" rx="3" fill="#2f6f8f"/><rect x="190" y="433" width="222" height="13" rx="3" fill="#c9a56a"/><rect x="176" y="446" width="244" height="14" rx="3" fill="#13385a"/>' +
'<path d="M196 426h200M204 439h190M192 453h214" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>' +
/* caderno aberto */
'<path d="M196 398L302 386 408 398 400 422 302 414 204 422Z" fill="#ffffff" stroke="#e1d9cb" stroke-width="1.5"/>' +
'<path d="M302 386V414" stroke="#d9d0c0" stroke-width="1.5"/>' +
'<path d="M216 402l70-6M218 409l68-6M318 396l70 6M318 403l66 6" stroke="#c6d3dd" stroke-width="1.4" stroke-linecap="round"/>' +
/* braço que escreve */
'<path d="M358 258C394 290 396 352 364 386L332 374C352 346 354 310 340 284Z" fill="url(#gSweat)"/>' +
'<ellipse cx="330" cy="386" rx="15" ry="10" fill="url(#gSkin)"/>' +
'<path d="M322 392 302 406" stroke="#13385a" stroke-width="3.2" stroke-linecap="round"/>' +
/* notebook */
'<path d="M404 226 566 206 578 372 416 384Z" fill="url(#gLap)"/>' +
'<path d="M404 226 566 206" stroke="#ffffff" stroke-width="2" opacity=".8"/>' +
'<circle cx="492" cy="294" r="9" fill="#ffffff" opacity=".65"/>' +
'<path d="M410 384 580 372 606 398H392Z" fill="#b5bcc4"/><path d="M392 398H606" stroke="#8e97a1" stroke-width="2"/>' +
'</svg>';
  },

  building: function () {
    var cols = '';
    for (var i = 0; i < 8; i++) {
      var x = 30 + i * 14.3;
      cols += '<rect x="' + x + '" y="46" width="7" height="38" fill="#f3efe7"/><rect x="' + (x + 4.6) + '" y="46" width="2.4" height="38" fill="#d8d0c1"/>';
    }
    return '' +
'<svg viewBox="0 0 160 104" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Fachada de tribunal">' +
'<defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cfdd"/><stop offset="1" stop-color="#eaf1f5"/></linearGradient></defs>' +
'<rect width="160" height="104" fill="url(#gSky)"/>' +
'<circle cx="8" cy="78" r="16" fill="#7f9a6d"/><circle cx="154" cy="80" r="15" fill="#7f9a6d"/>' +
'<path d="M20 36 80 12 140 36Z" fill="#ece6db" stroke="#c9c0b0" stroke-width="1"/>' +
'<path d="M44 33 80 19 116 33Z" fill="#ddd5c6"/>' +
'<rect x="22" y="36" width="116" height="10" fill="#e6dfd2"/><rect x="22" y="44" width="116" height="2" fill="#cfc6b6"/>' +
cols +
'<rect x="16" y="84" width="128" height="5" fill="#e3dccf"/><rect x="11" y="89" width="138" height="5" fill="#d6cebf"/><rect x="6" y="94" width="148" height="10" fill="#c9c0b0"/>' +
'</svg>';
  }
};
