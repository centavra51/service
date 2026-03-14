(() => {
  const prices = {
    plumbing: 220,
    electrical: 210,
    tiling: 260,
    finishing: 180,
    handyman: 140,
    complex: 320
  };

  const labels = {
    ru: {
      plumbing: 'Сантехника',
      electrical: 'Электрика',
      tiling: 'Плитка',
      finishing: 'Отделка',
      handyman: 'Мелкий бытовой сервис',
      complex: 'Комплексный ремонт',
      calc: (total) => `Предварительная стоимость: от ${total} MDL`,
      desc: (service, amount, urgent) => `Интересует услуга "${service}", ориентировочный объём: ${amount}, срочность: ${urgent ? 'срочно' : 'стандартно'}.`,
      sending: 'Отправляем заявку...',
      sent: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
      fail: 'Не удалось отправить заявку. Попробуйте ещё раз.'
    },
    ro: {
      plumbing: 'Instalatii sanitare',
      electrical: 'Electricitate',
      tiling: 'Faianta',
      finishing: 'Finisaje',
      handyman: 'Servicii mici pentru casa',
      complex: 'Renovare complexa',
      calc: (total) => `Cost orientativ: de la ${total} MDL`,
      desc: (service, amount, urgent) => `Ma intereseaza serviciul "${service}", volum estimat: ${amount}, urgenta: ${urgent ? 'urgenta' : 'standard'}.`,
      sending: 'Trimitem cererea...',
      sent: 'Cererea a fost trimisa. Revenim in cel mai scurt timp.',
      fail: 'Nu am putut trimite cererea. Incearca din nou.'
    }
  };

  const titleEl = document.querySelector('title');
  const descriptionEl = document.querySelector('meta[name="description"]');
  const langButtons = document.querySelectorAll('[data-lang-trigger]');
  const qService = document.getElementById('qService');
  const qAmount = document.getElementById('qAmount');
  const qUrgent = document.getElementById('qUrgent');
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');
  const contactService = document.getElementById('contactService');
  const descriptionField = document.getElementById('description');
  const leadForm = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  let lang = localStorage.getItem('site-lang') || document.documentElement.lang || 'ru';
  if (!labels[lang]) {
    lang = 'ru';
  }

  function applyLanguage(nextLang) {
    lang = nextLang;
    localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang;

    if (document.body.dataset[`title${capitalize(lang)}`]) {
      titleEl.textContent = document.body.dataset[`title${capitalize(lang)}`];
    }

    if (document.body.dataset[`description${capitalize(lang)}`]) {
      descriptionEl.setAttribute('content', document.body.dataset[`description${capitalize(lang)}`]);
    }

    document.querySelectorAll('[data-ru][data-ro]').forEach((element) => {
      element.textContent = element.dataset[lang];
    });

    document.querySelectorAll('[data-ru-placeholder][data-ro-placeholder]').forEach((element) => {
      element.setAttribute('placeholder', element.dataset[`${lang}Placeholder`]);
    });

    document.querySelectorAll('[data-ru-alt][data-ro-alt]').forEach((element) => {
      element.setAttribute('alt', element.dataset[`${lang}Alt`]);
    });

    langButtons.forEach((button) => {
      const active = button.dataset.langTrigger === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (calcResult && calcResult.textContent) {
      calculate();
    }
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function calculate() {
    if (!qService || !qAmount || !calcResult) {
      return;
    }

    const serviceKey = qService.value;
    const amount = Math.max(1, Number(qAmount.value || 1));
    const urgentMultiplier = qUrgent && qUrgent.checked ? 1.25 : 1;
    const total = Math.round((prices[serviceKey] || 0) * amount * urgentMultiplier);

    qAmount.value = String(amount);
    calcResult.textContent = labels[lang].calc(total);

    if (contactService) {
      contactService.value = serviceKey;
    }

    if (descriptionField) {
      descriptionField.value = labels[lang].desc(labels[lang][serviceKey], amount, qUrgent && qUrgent.checked);
    }

    const contactSection = document.getElementById('contact');
    if (contactSection) {
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }

  langButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.langTrigger));
  });

  if (calcBtn) {
    calcBtn.addEventListener('click', calculate);
  }

  if (qService) {
    qService.addEventListener('change', calculate);
  }

  if (qUrgent) {
    qUrgent.addEventListener('change', calculate);
  }

  if (qAmount) {
    qAmount.addEventListener('input', () => {
      if (Number(qAmount.value) < 1) {
        qAmount.value = '1';
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = Object.fromEntries(new FormData(leadForm).entries());
      formData.service = labels[lang][formData.service] || formData.service;

      submitBtn.disabled = true;
      formStatus.textContent = labels[lang].sending;
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

        formStatus.textContent = labels[lang].sent;
        formStatus.className = 'status success';
        leadForm.reset();

        if (contactService) {
          contactService.value = 'plumbing';
        }

        if (qService) {
          qService.value = 'plumbing';
        }

        if (qAmount) {
          qAmount.value = '10';
        }

        if (qUrgent) {
          qUrgent.checked = false;
        }

        if (calcResult) {
          calcResult.textContent = '';
        }
      } catch (error) {
        console.error(error);
        formStatus.textContent = labels[lang].fail;
        formStatus.className = 'status error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  applyLanguage(lang);
  calculate();
})();
