(() => {
  const dict = {
    ru: { hero: 'Мы — ваша команда ремонта в Кишинёве: услуги 24/7', sub: 'Сантехника, электрика, плитка, покраска, полы. Быстрый выезд и честная смета.', cta: 'Оставить заявку', quiz: 'Калькулятор стоимости', service: 'Тип услуги', amount: 'Площадь/точки/метры', calc: 'Рассчитать', contact: 'Форма заявки', send: 'Отправить', sent: 'Заявка отправлена.', fail: 'Ошибка отправки.' },
    ro: { hero: 'Suntem echipa ta de reparații din Chișinău: servicii 24/7', sub: 'Instalator, electrician, faianțar, vopsire, pardoseli. Deplasare rapidă și deviz clar.', cta: 'Trimite cerere', quiz: 'Calculator cost', service: 'Tip serviciu', amount: 'Suprafață/puncte/metri', calc: 'Calculează', contact: 'Formular cerere', send: 'Trimite', sent: 'Cererea a fost trimisă.', fail: 'Eroare la trimitere.' }
  };
  let lang = 'ru';
  const applyI18n = () => document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (dict[lang][k]) el.textContent = dict[lang][k]; });
  document.getElementById('langToggle').addEventListener('click', (e) => { lang = lang === 'ru' ? 'ro' : 'ru'; e.target.textContent = lang === 'ru' ? 'RO' : 'RU'; document.documentElement.lang = lang; applyI18n(); });
  applyI18n();

  const base = { plumbing: 220, electrical: 200, tiling: 260 };
  document.getElementById('calcBtn').onclick = () => {
    const service = document.getElementById('qService').value;
    const amount = Math.max(1, Number(document.getElementById('qAmount').value || 1));
    const total = Math.round(base[service] * amount);
    document.getElementById('calcResult').textContent = `${lang === 'ru' ? 'Оценка' : 'Estimare'}: ${total} MDL`;
    document.getElementById('serviceField').value = `${service} / ${amount}`;
  };

  document.getElementById('leadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const status = document.getElementById('formStatus');
    status.textContent = '...';
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('bad status');
      status.textContent = dict[lang].sent;
      form.reset();
    } catch {
      status.textContent = dict[lang].fail;
    }
  });
})();
