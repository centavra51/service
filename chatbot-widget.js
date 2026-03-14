(function () {
    /* CONFIGURATION: Edit these values to customize your chatbot */
    const CONFIG = {
        webhookUrl: 'https://auto.amz-creator.com/webhook/5689895f-e066-45d2-a2fb-b05db721546a',
        primaryColor: '#2d2d2d',
        secondaryColor: '#3a3a3a',
        textColor: '#ffffff',
        // Translations for the widget UI
        translations: {
            en: {
                botName: 'AI Consultant',
                welcomeMessage: 'Hello! I am your personal AI assistant. How can I help you today?',
                placeholder: 'Type a message...',
                inviteText: '👋 Hi! Ask me anything!',
            },
            ru: {
                botName: 'ИИ Консультант',
                welcomeMessage: 'Здравствуйте! Я ваш персональный ИИ-ассистент. Чем я могу вам помочь?',
                placeholder: 'Введите сообщение...',
                inviteText: '👋 Привет! Задайте мне вопрос!',
            },
            ro: {
                botName: 'Consultant AI',
                welcomeMessage: 'Salut! Sunt asistentul tău personal AI. Cu ce te pot ajuta astăzi?',
                placeholder: 'Scrie un mesaj...',
                inviteText: '👋 Salut! Pune-mi o întrebare!',
            }
        }
    };

    /* Language Detection */
    const getLang = () => {
        const stored = localStorage.getItem('site-lang');
        if (stored && CONFIG.translations[stored]) return stored;
        const htmlLang = document.documentElement.lang?.split('-')[0]?.toLowerCase();
        if (htmlLang && CONFIG.translations[htmlLang]) return htmlLang;
        const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
        if (browserLang && CONFIG.translations[browserLang]) return browserLang;
        return 'en';
    };

    let LANG = getLang();
    let TEXT = CONFIG.translations[LANG];

    /* Main Widget Logic */
    const d = document, c = d.createElement('div');
    c.id = 'ai-chatbot-widget-container';
    d.body.appendChild(c);
    const s = c.attachShadow({ mode: 'open' });
    const st = d.createElement('style');

    st.textContent = `
:host {
    --pg: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.secondaryColor});
    --bc: #fff;
    --tc: #1f2937;
    --umb: ${CONFIG.primaryColor};
    --umt: #fff;
    --bmb: #f3f4f6;
    --bmt: #1f2937;
    font-family: 'Inter', sans-serif;
}

/* ===== TRIGGER AREA (icon + bubble) ===== */
.chat-trigger-area {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    cursor: pointer;
}

/* ===== ICON CONTAINER ===== */
.robot-container {
    width: 62px;
    height: 62px;
    position: relative;
    filter: drop-shadow(0 4px 14px rgba(0,0,0,0.25));
    transition: transform 0.3s ease;
}
.robot-container:hover {
    transform: scale(1.1);
}

/* ===== SVG AI ICON ===== */
.robot-svg {
    width: 100%;
    height: 100%;
}

/* Gentle float */
.robot-container {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
.robot-container:hover {
    animation: none;
    transform: scale(1.08);
}

/* ===== INVITE BUBBLE ===== */
.invite-bubble {
    background: #fff;
    color: #1f2937;
    padding: 10px 16px;
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.4;
    max-width: 200px;
    position: relative;
    opacity: 0;
    transform: translateX(-12px) scale(0.9);
    animation: bubbleIn 0.5s ease-out 2s forwards, bubblePulse 4s ease-in-out 3s infinite;
    pointer-events: none;
}

.invite-bubble::before {
    content: '';
    position: absolute;
    bottom: 10px;
    left: -7px;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 3px;
    transform: rotate(45deg);
    box-shadow: -2px 2px 4px rgba(0,0,0,0.06);
}

@keyframes bubbleIn {
    0% { opacity: 0; transform: translateX(-12px) scale(0.9); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes bubblePulse {
    0%, 100% { transform: translateX(0) scale(1); }
    50% { transform: translateX(0) scale(1.03); }
}

/* Hide bubble when chat is open */
.chat-trigger-area.open .invite-bubble {
    opacity: 0 !important;
    transform: translateX(-12px) scale(0.8) !important;
    transition: all 0.3s ease;
}

/* ===== CLOSE ICON OVERLAY ===== */
.close-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${CONFIG.primaryColor};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.5) rotate(-90deg);
    transition: all 0.35s ease;
    pointer-events: none;
}
.chat-trigger-area.open .close-overlay {
    opacity: 1;
    transform: scale(1) rotate(0deg);
}
.chat-trigger-area.open .robot-svg {
    opacity: 0;
    transition: opacity 0.25s ease;
}
.chat-trigger-area:not(.open) .robot-svg {
    opacity: 1;
    transition: opacity 0.25s ease;
}
.close-overlay svg {
    width: 28px;
    height: 28px;
    fill: #fff;
}

/* ===== CHAT WINDOW ===== */
.chat-window {
    position: fixed;
    bottom: 6rem;
    left: 2rem;
    width: 380px;
    height: 600px;
    max-height: 80vh;
    background: var(--bc);
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    pointer-events: none;
    transition: all 0.3s ease;
    font-size: 16px;
}
.chat-window.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
}

.chat-header {
    background: ${CONFIG.primaryColor};
    padding: 1.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 1rem;
}
.avatar {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}
.avatar svg {
    width: 24px;
    height: 24px;
    fill: #e0e0e0;
}
.hi h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.hi span { font-size: .85rem; opacity: .9; }

.chat-msgs {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scroll-behavior: smooth;
}
.msg {
    max-width: 80%;
    padding: .8rem 1rem;
    border-radius: 12px;
    line-height: 1.5;
    font-size: .95rem;
    word-wrap: break-word;
}
.msg.bot {
    align-self: flex-start;
    background: var(--bmb);
    color: var(--bmt);
    border-bottom-left-radius: 4px;
}
.msg.user {
    align-self: flex-end;
    background: var(--umb);
    color: var(--umt);
    border-bottom-right-radius: 4px;
}

.typing {
    display: flex;
    gap: 4px;
    padding: .5rem 1rem;
    background: var(--bmb);
    border-radius: 12px;
    width: fit-content;
    margin-bottom: 1rem;
    border-bottom-left-radius: 4px;
}
.td {
    width: 8px;
    height: 8px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bnc 1.4s infinite ease-in-out both;
}
.td:nth-child(1) { animation-delay: -.32s; }
.td:nth-child(2) { animation-delay: -.16s; }
@keyframes bnc {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

.chat-input-area {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background: #fff;
    display: flex;
    gap: .5rem;
}
.ci {
    flex: 1;
    padding: .8rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    outline: none;
    font-size: .95rem;
    transition: border-color .2s;
}
.ci:focus { border-color: ${CONFIG.primaryColor}; }
.sb {
    background: ${CONFIG.primaryColor};
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform .2s, opacity .2s;
}
.sb:hover { transform: scale(1.05); opacity: 0.9; }
.sb svg { width: 20px; height: 20px; fill: #fff; margin-left: 2px; }

/* ===== MOBILE ===== */
@media (max-width: 480px) {
    .chat-window {
        width: 100%;
        height: 100%;
        bottom: 0;
        left: 0;
        border-radius: 0;
        max-height: none;
    }
    .chat-trigger-area {
        bottom: 1rem;
        left: 1rem;
    }
}
`;
    s.appendChild(st);

    // Build the HTML — AI brain / sparkle icon instead of robot
    s.innerHTML += `
<!-- Trigger Area: AI Icon + Bubble -->
<div class="chat-trigger-area" id="ct">
    <div class="robot-container">
        <svg class="robot-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Circle background -->
            <circle cx="32" cy="32" r="30" fill="#2d2d2d"/>
            <circle cx="32" cy="32" r="30" stroke="#444" stroke-width="0.8"/>

            <!-- AI Brain circuit icon -->
            <!-- Main brain shape -->
            <path d="M32 14c-6 0-11 3-13 7.5C17 22 15.5 24 15.5 27c0 2 .8 3.8 2 5.2-.3 1.2-.5 2.5-.5 3.8 0 5 3 9 7 10.5 1 2.5 3.5 4.5 8 4.5s7-2 8-4.5c4-1.5 7-5.5 7-10.5 0-1.3-.2-2.6-.5-3.8 1.2-1.4 2-3.2 2-5.2 0-3-1.5-5-3.5-5.5C43 17 38 14 32 14z" fill="#e8e8e8" opacity="0.15"/>
            
            <!-- Simplified circuit brain lines -->
            <circle cx="32" cy="28" r="3" fill="none" stroke="#e0e0e0" stroke-width="1.8"/>
            <circle cx="32" cy="28" r="1.2" fill="#e0e0e0"/>
            
            <!-- Circuit nodes -->
            <circle cx="24" cy="32" r="2" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
            <circle cx="24" cy="32" r="0.8" fill="#e0e0e0"/>
            
            <circle cx="40" cy="32" r="2" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
            <circle cx="40" cy="32" r="0.8" fill="#e0e0e0"/>
            
            <circle cx="28" cy="40" r="2" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
            <circle cx="28" cy="40" r="0.8" fill="#e0e0e0"/>
            
            <circle cx="36" cy="40" r="2" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
            <circle cx="36" cy="40" r="0.8" fill="#e0e0e0"/>
            
            <!-- Connecting lines -->
            <line x1="32" y1="31" x2="32" y2="25" stroke="#e0e0e0" stroke-width="1.2"/>
            <line x1="29.5" y1="29.5" x2="26" y2="32" stroke="#e0e0e0" stroke-width="1.2"/>
            <line x1="34.5" y1="29.5" x2="38" y2="32" stroke="#e0e0e0" stroke-width="1.2"/>
            <line x1="25" y1="34" x2="27" y2="38" stroke="#e0e0e0" stroke-width="1.2"/>
            <line x1="39" y1="34" x2="37" y2="38" stroke="#e0e0e0" stroke-width="1.2"/>
            <line x1="30" y1="40" x2="34" y2="40" stroke="#e0e0e0" stroke-width="1.2"/>
            
            <!-- Small sparkle accents -->
            <g opacity="0.7">
                <line x1="18" y1="18" x2="18" y2="22" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
                <line x1="16" y1="20" x2="20" y2="20" stroke="#ccc" stroke-width="1" stroke-linecap="round"/>
            </g>
            <g opacity="0.5">
                <line x1="46" y1="16" x2="46" y2="19" stroke="#ccc" stroke-width="0.8" stroke-linecap="round"/>
                <line x1="44.5" y1="17.5" x2="47.5" y2="17.5" stroke="#ccc" stroke-width="0.8" stroke-linecap="round"/>
            </g>
            <g opacity="0.4">
                <line x1="44" y1="44" x2="44" y2="47" stroke="#ccc" stroke-width="0.8" stroke-linecap="round"/>
                <line x1="42.5" y1="45.5" x2="45.5" y2="45.5" stroke="#ccc" stroke-width="0.8" stroke-linecap="round"/>
            </g>
        </svg>
        <!-- Close icon overlay -->
        <div class="close-overlay">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>
    </div>
    <div class="invite-bubble" id="invite">${TEXT.inviteText}</div>
</div>

<!-- Chat Window -->
<div class="chat-window" id="cw">
    <div class="chat-header">
        <div class="avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#e0e0e0" opacity="0.3"/>
                <circle cx="12" cy="10" r="2" fill="#e0e0e0"/>
                <circle cx="8" cy="14" r="1.5" fill="#e0e0e0"/>
                <circle cx="16" cy="14" r="1.5" fill="#e0e0e0"/>
                <line x1="12" y1="12" x2="8" y2="14" stroke="#e0e0e0" stroke-width="1"/>
                <line x1="12" y1="12" x2="16" y2="14" stroke="#e0e0e0" stroke-width="1"/>
                <line x1="12" y1="8" x2="12" y2="5" stroke="#e0e0e0" stroke-width="1"/>
                <line x1="11" y1="5" x2="13" y2="5" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="hi">
            <h3>${TEXT.botName}</h3>
            <span>Online</span>
        </div>
    </div>
    <div class="chat-msgs" id="cm">
        <div class="msg bot">${TEXT.welcomeMessage}</div>
    </div>
    <div class="chat-input-area">
        <input type="text" class="ci" placeholder="${TEXT.placeholder}" id="ci">
        <button class="sb" id="sb">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
    </div>
</div>`;

    const t = s.getElementById('ct'),
          cw = s.getElementById('cw'),
          ci = s.getElementById('ci'),
          sb = s.getElementById('sb'),
          cm = s.getElementById('cm');

    let io = false,
        sid = localStorage.getItem('cwsid') || 's-' + Date.now();
    localStorage.setItem('cwsid', sid);

    t.onclick = () => {
        io = !io;
        cw.classList.toggle('open', io);
        t.classList.toggle('open', io);
        if (io) ci.focus();
    };

    const sm = async () => {
        const tx = ci.value.trim();
        if (!tx) return;
        ci.value = '';
        am(tx, 'user');
        const tid = styp();
        try {
            const r = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: tx, sessionId: sid, lang: LANG })
            });
            const d = await r.json();
            rt(tid);
            am(d.response?.text || d.response || "No response.", 'bot');
        } catch (e) {
            rt(tid);
            am("Error, try again.", 'bot');
        }
    };

    const am = (tx, sn) => {
        const d = document.createElement('div');
        d.className = `msg ${sn}`;
        d.innerHTML = tx.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:inherit;text-decoration:underline;">$1</a>');
        cm.appendChild(d);
        cm.scrollTop = cm.scrollHeight;
    };

    const styp = () => {
        const i = 't-' + Date.now(),
              d = document.createElement('div');
        d.className = 'typing';
        d.id = i;
        d.innerHTML = '<div class="td"></div><div class="td"></div><div class="td"></div>';
        cm.appendChild(d);
        cm.scrollTop = cm.scrollHeight;
        return i;
    };

    const rt = (i) => {
        const e = s.getElementById(i);
        if (e) e.remove();
    };

    sb.onclick = sm;
    ci.onkeypress = (e) => { if (e.key === 'Enter') sm(); };

    /* ===== Dynamic language sync ===== */
    const updateWidgetLanguage = () => {
        const newLang = getLang();
        if (newLang === LANG) return;
        LANG = newLang;
        TEXT = CONFIG.translations[LANG];

        // Update invite bubble
        const invite = s.getElementById('invite');
        if (invite) invite.textContent = TEXT.inviteText;

        // Update header bot name
        const headerName = s.querySelector('.hi h3');
        if (headerName) headerName.textContent = TEXT.botName;

        // Update input placeholder
        if (ci) ci.placeholder = TEXT.placeholder;

        // Update the first (welcome) bot message
        const firstBotMsg = s.querySelector('.msg.bot');
        if (firstBotMsg) firstBotMsg.textContent = TEXT.welcomeMessage;
    };

    // Watch for lang attribute changes on <html> (set by the site's language switcher)
    const langObserver = new MutationObserver(() => updateWidgetLanguage());
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
