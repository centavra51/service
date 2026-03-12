(() => {
  const prices = {
    plumbing: 220,
    electrical: 210,
    tiling: 260,
    finishing: 180,
    handyman: 140
  };

  const labels = {
    plumbing: 'Сантехника',
    electrical: 'Электрика',
    tiling: 'Плитка',
    finishing: 'Отделка',
    handyman: 'Мелкий бытовой сервис'
  };

  const serviceSelect = document.getElementById('qService');
  const amountInput = document.getElementById('qAmount');
  const urgentInput = document.getElementById('qUrgent');
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');
  const contactService = document.getElementById('contactService');
  const descriptionField = document.getElementById('description');
  const leadForm = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  function calculate() {
    const serviceKey = serviceSelect.value;
    const amount = Math.max(1, Number(amountInput.value || 1));
    const urgentMultiplier = urgentInput.checked ? 1.25 : 1;
    const total = Math.round(prices[serviceKey] * amount * urgentMultiplier);

    amountInput.value = String(amount);
    calcResult.textContent = `Предварительная стоимость: от ${total} MDL`;

    if (contactService && labels[serviceKey]) {
      contactService.value = labels[serviceKey];
    }

    if (descriptionField && !descriptionField.value.trim()) {
      descriptionField.value = `Интересует услуга "${labels[serviceKey]}", ориентировочный объём: ${amount}, срочность: ${urgentInput.checked ? 'срочно' : 'стандартно'}.`;
    }
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', calculate);
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', calculate);
  }

  if (urgentInput) {
    urgentInput.addEventListener('change', calculate);
  }

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      if (Number(amountInput.value) < 1) {
        amountInput.value = '1';
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = Object.fromEntries(new FormData(leadForm).entries());
      submitBtn.disabled = true;
      formStatus.textContent = 'Отправляем заявку...';
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

        formStatus.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
        formStatus.className = 'status success';
        leadForm.reset();

        if (calcResult) {
          calcResult.textContent = '';
        }

        if (serviceSelect) {
          serviceSelect.value = 'plumbing';
        }

        if (amountInput) {
          amountInput.value = '10';
        }

        if (urgentInput) {
          urgentInput.checked = false;
        }
      } catch (error) {
        console.error(error);
        formStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.';
        formStatus.className = 'status error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  calculate();
})();
