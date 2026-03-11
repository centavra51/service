(() => {
  const dict = {
    ru: {
      pageTitle: 'Ремонт в Кишиневе 24/7 | Сантехник, электрик, плиточник',
      pageDescription:
        'Ремонт в Кишиневе 24/7: сантехник, электрик, плиточник и другие работы. Быстрый выезд и честная смета.',
      eyebrow: 'Кишинев и пригород',
      hero: 'Мы ваша команда ремонта в Кишиневе: услуги 24/7',
      sub: 'Сантехника, электрика, плитка, покраска, полы. Быстрый выезд и честная смета.',
      cta: 'Оставить заявку',
      quiz: 'Калькулятор стоимости',
      service: 'Тип услуги',
      amount: 'Площадь / точки / метры',
      calc: 'Рассчитать',
      contact: 'Форма заявки',
      send: 'Отправить',
      sending: 'Отправка...',
      sent: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      fail: 'Не удалось отправить заявку. Попробуйте еще раз.',
      estimate: 'Оценка',
      plumbing: 'Сантехника',
      electrical: 'Электрика',
      tiling: 'Плитка',
      namePlaceholder: 'Имя / Nume',
      phonePlaceholder: 'Телефон / Telefon',
      addressPlaceholder: 'Адрес / Adresa',
      servicePlaceholder: 'Услуга',
      descriptionPlaceholder: 'Описание',
      fieldTemplate: '{service} / {amount}'
    },
    ro: {
      pageTitle: 'Reparatii in Chisinau 24/7 | Instalator, electrician, faiantar',
      pageDescription:
        'Reparatii in Chisinau 24/7: instalator, electrician, faiantar si alte lucrari. Deplasare rapida si deviz clar.',
      eyebrow: 'Chisinau si suburbii',
      hero: 'Suntem echipa ta de reparatii din Chisinau: servicii 24/7',
      sub: 'Instalator, electrician, faiantar, vopsire, pardoseli. Deplasare rapida si deviz clar.',
      cta: 'Trimite cerere',
      quiz: 'Calculator cost',
      service: 'Tip serviciu',
      amount: 'Suprafata / puncte / metri',
      calc: 'Calculeaza',
      contact: 'Formular cerere',
      send: 'Trimite',
      sending: 'Se trimite...',
      sent: 'Cererea a fost trimisa. Revenim cat mai curand.',
      fail: 'Cererea nu a putut fi trimisa. Incearca din nou.',
      estimate: 'Estimare',
      plumbing: 'Instalatii sanitare',
      electrical: 'Electricitate',
      tiling: 'Placare',
      namePlaceholder: 'Nume / Имя',
      phonePlaceholder: 'Telefon / Телефон',
      addressPlaceholder: 'Adresa / Адрес',
      servicePlaceholder: 'Serviciu',
      descriptionPlaceholder: 'Descriere',
      fieldTemplate: '{service} / {amount}'
    }
  };

  const basePrices = { plumbing: 220, electrical: 200, tiling: 260 };
  let lang = document.documentElement.lang === 'ro' ? 'ro' : 'ru';

  const titleEl = document.querySelector('title');
  const descriptionEl = document.querySelector('meta[name="description"]');
  const langToggle = document.getElementById('langToggle');
  const serviceSelect = document.getElementById('qService');
  const amountInput = document.getElementById('qAmount');
  const calcResult = document.getElementById('calcResult');
  const calcBtn = document.getElementById('calcBtn');
  const leadForm = document.getElementById('leadForm');
  const serviceField = document.getElementById('serviceField');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  function t(key) {
    return dict[lang][key] || '';
  }

  function updateStaticText() {
    document.documentElement.lang = lang;
    titleEl.textContent = t('pageTitle');
    descriptionEl.setAttribute('content', t('pageDescription'));
    langToggle.textContent = lang === 'ru' ? 'RO' : 'RU';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[lang][key]) {
        el.textContent = dict[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[lang][key]) {
        el.setAttribute('placeholder', dict[lang][key]);
      }
    });

    document.querySelectorAll('[data-i18n-option]').forEach((el) => {
      const key = el.dataset.i18nOption;
      if (dict[lang][key]) {
        el.textContent = dict[lang][key];
      }
    });
  }

  function buildServiceField(serviceKey, amount) {
    return t('fieldTemplate')
      .replace('{service}', t(serviceKey))
      .replace('{amount}', amount);
  }

  function calculate() {
    const serviceKey = serviceSelect.value;
    const amount = Math.max(1, Number(amountInput.value || 1));
    amountInput.value = String(amount);

    const total = Math.round(basePrices[serviceKey] * amount);
    calcResult.textContent = `${t('estimate')}: ${total} MDL`;
    serviceField.value = buildServiceField(serviceKey, amount);
  }

  langToggle.addEventListener('click', () => {
    lang = lang === 'ru' ? 'ro' : 'ru';
    updateStaticText();

    if (calcResult.textContent) {
      calculate();
    }
  });

  calcBtn.addEventListener('click', calculate);

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(leadForm).entries());
    submitBtn.disabled = true;
    formStatus.textContent = t('sending');
    formStatus.className = 'status';

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      formStatus.textContent = t('sent');
      formStatus.className = 'status success';
      leadForm.reset();
      calcResult.textContent = '';
    } catch (error) {
      console.error(error);
      formStatus.textContent = t('fail');
      formStatus.className = 'status error';
    } finally {
      submitBtn.disabled = false;
    }
  });

  updateStaticText();
  calculate();
})();
