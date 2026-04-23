/**
 * Cookie Consent Component
 * Componente per la gestione del consenso cookie e privacy policy.
 *
 * Utilizzo: includere questo file prima della chiusura del tag </body>
 * <script src="cookie-consent.js"></script>
 */

(function () {

  /* =========================================================
   * CONFIGURAZIONE — modifica solo questa sezione
   * ========================================================= */
  const CONFIG = {

    // Abilita o disabilita l'intero componente
    enabled: true,

    // Mostra un'icona in basso a destra per riaprire il banner dopo l'accettazione.
    // Se false, il banner scompare definitivamente dopo l'accettazione.
    allowReopen: true,

    // Nome del cookie che memorizza il consenso
    cookieName: 'cookie_consent',

    // Durata del cookie di consenso in giorni
    cookieDurationDays: 365,

    // URL delle pagine legali (sostituisci con i tuoi URL reali)
    privacyPolicyUrl: '/privacy-policy',
    cookiePolicyUrl:  '/cookie-policy',

    // Nome del sito o dell'azienda mostrato nel banner
    companyName: 'Il Nostro Sito',

    // Posizione del banner: 'bottom-right' | 'bottom-left' | 'bottom-center'
    position: 'bottom-right',

    // ---- Testi del banner ----
    texts: {
      title:        'Informativa su Cookie e Privacy',
      body:         'Questo sito utilizza esclusivamente cookie tecnici, necessari al corretto funzionamento delle pagine. ' +
                    'Non vengono utilizzati cookie di profilazione o di tracciamento. ' +
                    'Continuando la navigazione accetti l\'utilizzo di questi cookie.',
      acceptBtn:    'Accetta e chiudi',
      reopenTitle:  'Gestione Cookie',   // tooltip dell'icona di riapertura
      privacyLink:  'Privacy Policy',
      cookieLink:   'Cookie Policy',
    },

    // ---- Stile ----
    style: {
      // Colore di sfondo del banner
      bannerBg:       '#1a1a2e',
      // Colore del testo principale
      textColor:      '#e0e0e0',
      // Colore del testo secondario (link, titolo)
      accentColor:    '#7eb8f7',
      // Colore del pulsante Accetta
      btnBg:          '#7eb8f7',
      btnText:        '#1a1a2e',
      btnHoverBg:     '#a8d0ff',
      // Colore dell'icona di riapertura
      iconBg:         '#1a1a2e',
      iconColor:      '#7eb8f7',
      iconHoverBg:    '#2a2a4e',
      // Bordo e ombra
      borderColor:    'rgba(126,184,247,0.25)',
      shadow:         '0 8px 32px rgba(0,0,0,0.45)',
      // Border radius
      bannerRadius:   '12px',
      btnRadius:      '8px',
      iconRadius:     '50%',
      // Font
      fontFamily:     '"Segoe UI", system-ui, -apple-system, sans-serif',
      fontSize:       '13.5px',
      // z-index
      zIndex:         '99999',
    },

  };
  /* =========================================================
   * FINE CONFIGURAZIONE
   * ========================================================= */


  // --- Utilità cookie ---

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce(function (acc, part) {
      const [k, v] = part.split('=');
      return k === name ? decodeURIComponent(v) : acc;
    }, null);
  }


  // --- Calcolo posizione ---

  function getPositionStyles(position) {
    const base = 'position:fixed; bottom:24px;';
    if (position === 'bottom-left')   return base + ' left:24px;';
    if (position === 'bottom-center') return base + ' left:50%; transform:translateX(-50%);';
    return base + ' right:24px;'; // default: bottom-right
  }

  function getIconPositionStyles(position) {
    const base = 'position:fixed; bottom:24px;';
    if (position === 'bottom-left')   return base + ' left:24px;';
    if (position === 'bottom-center') return base + ' left:50%; transform:translateX(-50%);';
    return base + ' right:24px;';
  }


  // --- Iniezione CSS ---

  function injectStyles() {
    const s = CONFIG.style;
    const css = `
      #cc-banner *,
      #cc-banner *::before,
      #cc-banner *::after { box-sizing: border-box; margin: 0; padding: 0; }

      #cc-banner {
        ${getPositionStyles(CONFIG.position)}
        width: 340px;
        max-width: calc(100vw - 32px);
        background: ${s.bannerBg};
        color: ${s.textColor};
        font-family: ${s.fontFamily};
        font-size: ${s.fontSize};
        line-height: 1.55;
        border-radius: ${s.bannerRadius};
        border: 1px solid ${s.borderColor};
        box-shadow: ${s.shadow};
        z-index: ${s.zIndex};
        overflow: hidden;
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        pointer-events: none;
      }

      #cc-banner.cc-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      #cc-banner-inner {
        padding: 20px 20px 16px;
      }

      #cc-title {
        font-size: 14px;
        font-weight: 700;
        color: ${s.accentColor};
        margin-bottom: 10px;
        letter-spacing: 0.01em;
      }

      #cc-body {
        margin-bottom: 14px;
        color: ${s.textColor};
        opacity: 0.88;
      }

      #cc-links {
        margin-bottom: 16px;
        font-size: 12px;
        display: flex;
        gap: 14px;
      }

      #cc-links a {
        color: ${s.accentColor};
        text-decoration: none;
        opacity: 0.9;
        transition: opacity 0.2s;
      }

      #cc-links a:hover { opacity: 1; text-decoration: underline; }

      #cc-accept-btn {
        display: block;
        width: 100%;
        padding: 10px 16px;
        background: ${s.btnBg};
        color: ${s.btnText};
        font-family: ${s.fontFamily};
        font-size: 13px;
        font-weight: 700;
        border: none;
        border-radius: ${s.btnRadius};
        cursor: pointer;
        letter-spacing: 0.02em;
        transition: background 0.2s, transform 0.1s;
      }

      #cc-accept-btn:hover  { background: ${s.btnHoverBg}; }
      #cc-accept-btn:active { transform: scale(0.98); }

      /* Icona di riapertura */
      #cc-reopen-icon {
        ${getIconPositionStyles(CONFIG.position)}
        width: 44px;
        height: 44px;
        background: ${s.iconBg};
        border: 1px solid ${s.borderColor};
        border-radius: ${s.iconRadius};
        box-shadow: ${s.shadow};
        z-index: ${s.zIndex};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, transform 0.2s;
        opacity: 0;
        transform: scale(0.7);
        pointer-events: none;
      }

      #cc-reopen-icon.cc-visible {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }

      #cc-reopen-icon:hover { background: ${s.iconHoverBg}; transform: scale(1.08); }

      #cc-reopen-icon svg { display: block; }

      /* Responsive */
      @media (max-width: 400px) {
        #cc-banner { width: calc(100vw - 32px); bottom: 16px; right: 16px; left: 16px; }
        #cc-reopen-icon { bottom: 16px; right: 16px; }
      }
    `;
    const styleEl = document.createElement('style');
    styleEl.id = 'cc-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }


  // --- Costruzione HTML ---

  function buildBanner() {
    const t = CONFIG.texts;

    const banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', t.title);

    banner.innerHTML =
      '<div id="cc-banner-inner">' +
        '<div id="cc-title">' + escHtml(t.title) + '</div>' +
        '<div id="cc-body">' + escHtml(t.body) + '</div>' +
        '<div id="cc-links">' +
          '<a href="' + escHtml(CONFIG.privacyPolicyUrl) + '" target="_blank" rel="noopener">' + escHtml(t.privacyLink) + '</a>' +
          '<a href="' + escHtml(CONFIG.cookiePolicyUrl)  + '" target="_blank" rel="noopener">' + escHtml(t.cookieLink)  + '</a>' +
        '</div>' +
        '<button id="cc-accept-btn" type="button">' + escHtml(t.acceptBtn) + '</button>' +
      '</div>';

    return banner;
  }

  function buildReopenIcon() {
    const icon = document.createElement('div');
    icon.id = 'cc-reopen-icon';
    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', CONFIG.texts.reopenTitle);
    icon.setAttribute('title', CONFIG.texts.reopenTitle);

    // Icona SVG cookie
    icon.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
        'stroke="' + CONFIG.style.iconColor + '" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<circle cx="8.5" cy="8.5" r="1.2" fill="' + CONFIG.style.iconColor + '" stroke="none"/>' +
        '<circle cx="14" cy="15" r="1.2" fill="' + CONFIG.style.iconColor + '" stroke="none"/>' +
        '<circle cx="9"  cy="14" r="0.8" fill="' + CONFIG.style.iconColor + '" stroke="none"/>' +
        '<circle cx="15" cy="9.5" r="0.8" fill="' + CONFIG.style.iconColor + '" stroke="none"/>' +
        '<path d="M15.5 6.5 Q17 8 15.5 9.5"/>' +
        '<path d="M6.5 15.5 Q8 17 9.5 15.5"/>' +
      '</svg>';

    return icon;
  }


  // --- Logica principale ---

  function showBanner(banner) {
    requestAnimationFrame(function () {
      banner.classList.add('cc-visible');
      banner.querySelector('#cc-accept-btn').focus();
    });
  }

  function hideBanner(banner) {
    banner.classList.remove('cc-visible');
  }

  function showIcon(icon) {
    requestAnimationFrame(function () {
      icon.classList.add('cc-visible');
    });
  }

  function hideIcon(icon) {
    icon.classList.remove('cc-visible');
  }

  function onAccept(banner, icon) {
    setCookie(CONFIG.cookieName, 'accepted', CONFIG.cookieDurationDays);
    hideBanner(banner);
    if (CONFIG.allowReopen && icon) {
      // Breve ritardo per non sovrapporre le animazioni
      setTimeout(function () { showIcon(icon); }, 400);
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


  // --- Init ---

  function init() {
    if (!CONFIG.enabled) return;

    injectStyles();

    const banner = buildBanner();
    document.body.appendChild(banner);

    var icon = null;
    if (CONFIG.allowReopen) {
      icon = buildReopenIcon();
      document.body.appendChild(icon);
    }

    const alreadyAccepted = getCookie(CONFIG.cookieName) === 'accepted';

    if (alreadyAccepted) {
      // Consenso già dato in precedenza
      if (CONFIG.allowReopen && icon) {
        showIcon(icon);
      }
    } else {
      // Prima visita: mostra il banner con un piccolo ritardo
      setTimeout(function () { showBanner(banner); }, 300);
    }

    // Evento: pulsante Accetta
    banner.querySelector('#cc-accept-btn').addEventListener('click', function () {
      onAccept(banner, icon);
    });

    // Evento: icona di riapertura (click e tastiera)
    if (icon) {
      function reopenHandler() {
        hideIcon(icon);
        setTimeout(function () { showBanner(banner); }, 200);
      }
      icon.addEventListener('click', reopenHandler);
      icon.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reopenHandler();
        }
      });
    }
  }

  // Avvia il componente dopo il caricamento del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();