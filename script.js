/**
 * Калькулятор стоимости корпусной мебели (V8)
 *
 * Формула расчёта:
 *   объём_в_дм³ = (ширина × высота × глубина) / 1000
 *   базовая_цена = объём_в_дм³ × коэффициент_материала
 *   итог = базовая_цена + сумма_выбранных_опций
 */

const CM3_PER_DM3 = 1000; // 1000 см³ = 1 дм³
const PRICE_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const ERROR_MESSAGE = 'Введите корректные размеры (числа больше 0)';
const STORAGE_KEY = 'furniture-calc-saved';

document.addEventListener('DOMContentLoaded', function () {

  // --- Элементы страницы ---
  const inputWidth = document.getElementById('width');
  const inputHeight = document.getElementById('height');
  const inputDepth = document.getElementById('depth');
  const inputMaterial = document.getElementById('material');
  const optionCheckboxes = document.querySelectorAll('.option');
  const buttonCalculate = document.getElementById('calcBtn');
  const blockResult = document.getElementById('result');
  const blockBreakdownContent = document.getElementById('breakdownContent');
  const inputCalcName = document.getElementById('calcName');
  const buttonSaveCalc = document.getElementById('saveCalcBtn');
  const savedCalcList = document.getElementById('savedCalcList');

  buttonCalculate.addEventListener('click', calculatePrice);
  buttonSaveCalc.addEventListener('click', saveCurrentCalculation);
  renderSavedList();

  function formatPrice(num) {
    return num.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽';
  }

  function getMaterialName() {
    return inputMaterial.options[inputMaterial.selectedIndex].text.split(' ')[0];
  }

  function getSelectedOptionsList() {
    const list = [];
    optionCheckboxes.forEach(function (cb) {
      if (cb.checked) {
        const name = cb.closest('.option-item').textContent.trim().split(' (+')[0];
        list.push(name);
      }
    });
    return list.length ? list.join(', ') : '—';
  }

  function getOptionStates() {
    return Array.from(optionCheckboxes).map(function (cb) { return cb.checked; });
  }

  function setOptionStates(states) {
    optionCheckboxes.forEach(function (cb, i) {
      cb.checked = states[i] === true;
    });
  }

  function getSavedCalculations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setSavedCalculations(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function saveCurrentCalculation() {
    const name = (inputCalcName.value || '').trim();
    if (!name) {
      alert('Укажите наименование расчёта.');
      inputCalcName.focus();
      return;
    }
    const widthCm = parseFloat(inputWidth.value);
    const heightCm = parseFloat(inputHeight.value);
    const depthCm = parseFloat(inputDepth.value);
    const pricePerDm3 = parseFloat(inputMaterial.value);
    const sizesAreValid = !isNaN(widthCm) && !isNaN(heightCm) && !isNaN(depthCm);
    const sizesArePositive = widthCm > 0 && heightCm > 0 && depthCm > 0;
    if (!sizesAreValid || !sizesArePositive) {
      alert('Введите корректные размеры перед сохранением.');
      return;
    }
    const volumeDm3 = (widthCm * heightCm * depthCm) / CM3_PER_DM3;
    const basePrice = volumeDm3 * pricePerDm3;
    let optionsTotal = 0;
    optionCheckboxes.forEach(function (cb) {
      if (cb.checked) optionsTotal += parseFloat(cb.dataset.price);
    });
    const totalRub = basePrice + optionsTotal;
    const optionStates = getOptionStates();
    const materialLabel = inputMaterial.options[inputMaterial.selectedIndex].text.split(' ')[0];
    const saved = {
      id: Date.now(),
      name: name,
      savedAt: new Date().toISOString(),
      width: widthCm,
      height: heightCm,
      depth: depthCm,
      materialValue: pricePerDm3,
      materialLabel: materialLabel,
      optionStates: optionStates,
      totalRub: totalRub
    };
    const list = getSavedCalculations();
    list.unshift(saved);
    setSavedCalculations(list);
    renderSavedList();
  }

  function formatSavedDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getOptionLabelsForSaved(optionStates) {
    const labels = [];
    optionCheckboxes.forEach(function (cb, i) {
      if (optionStates[i]) {
        const name = cb.closest('.option-item').textContent.trim().split(' (+')[0];
        labels.push(name);
      }
    });
    return labels.length ? labels.join(', ') : '—';
  }

  function renderSavedList() {
    const list = getSavedCalculations();
    if (list.length === 0) {
      savedCalcList.innerHTML = '<p class="saved-calc-empty">Нет сохранённых расчётов</p>';
      return;
    }
    savedCalcList.innerHTML = list.map(function (item) {
      const opts = getOptionLabelsForSaved(item.optionStates || []);
      const totalStr = (item.totalRub != null)
        ? item.totalRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽'
        : '—';
      const dateStr = item.savedAt ? formatSavedDate(item.savedAt) : '—';
      return (
        '<div class="saved-calc-item" data-id="' + item.id + '">' +
          '<div class="saved-calc-item-header">«' + escapeHtml(item.name) + '» ' + escapeHtml(dateStr) + '</div>' +
          '<div class="saved-calc-item-details">' +
            'Размеры: ' + item.width + '×' + item.height + '×' + item.depth + ' см<br>' +
            'Материал: ' + escapeHtml(item.materialLabel || '—') + '<br>' +
            'Доп. опции: ' + escapeHtml(opts) + '<br>' +
            'Итого: ' + totalStr +
          '</div>' +
          '<div class="saved-calc-item-actions">' +
            '<button type="button" class="btn-load" data-id="' + item.id + '">Загрузить</button>' +
            '<button type="button" class="btn-delete" data-id="' + item.id + '">Удалить</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    savedCalcList.querySelectorAll('.btn-load').forEach(function (btn) {
      btn.addEventListener('click', function () { loadCalculation(Number(btn.dataset.id)); });
    });
    savedCalcList.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteCalculation(Number(btn.dataset.id)); });
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadCalculation(id) {
    const list = getSavedCalculations();
    const item = list.find(function (x) { return x.id === id; });
    if (!item) return;
    inputCalcName.value = item.name;
    inputWidth.value = item.width;
    inputHeight.value = item.height;
    inputDepth.value = item.depth;
    inputMaterial.value = String(item.materialValue);
    setOptionStates(item.optionStates || []);
    blockResult.textContent = item.totalRub != null
      ? item.totalRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽'
      : '';
    const vol = (item.width * item.height * item.depth) / CM3_PER_DM3;
    const basePrice = vol * item.materialValue;
    let optionsTotal = 0;
    (item.optionStates || []).forEach(function (c, i) {
      if (c) optionsTotal += parseFloat(optionCheckboxes[i].dataset.price);
    });
    blockBreakdownContent.innerHTML =
      'Материал: ' + (item.materialLabel || '—') + ' — ' + formatPrice(basePrice) + '<br>' +
      'Доп. опции: ' + getOptionLabelsForSaved(item.optionStates || []) + ' — ' + formatPrice(optionsTotal) + '<br>' +
      'Итого: ' + (item.totalRub != null ? formatPrice(item.totalRub) : '—');
  }

  function deleteCalculation(id) {
    const list = getSavedCalculations().filter(function (x) { return x.id !== id; });
    setSavedCalculations(list);
    renderSavedList();
  }

  function calculatePrice() {
    // --- Входные данные ---
    const widthCm = parseFloat(inputWidth.value);
    const heightCm = parseFloat(inputHeight.value);
    const depthCm = parseFloat(inputDepth.value);
    const pricePerDm3 = parseFloat(inputMaterial.value);

    // --- Валидация ---
    const sizesAreValid = !isNaN(widthCm) && !isNaN(heightCm) && !isNaN(depthCm);
    const sizesArePositive = widthCm > 0 && heightCm > 0 && depthCm > 0;

    if (!sizesAreValid || !sizesArePositive) {
      blockResult.textContent = ERROR_MESSAGE;
      blockBreakdownContent.innerHTML = '';
      return;
    }

    // --- Расчёт ---
    const volumeDm3 = (widthCm * heightCm * depthCm) / CM3_PER_DM3;
    const basePrice = volumeDm3 * pricePerDm3;

    let optionsTotal = 0;
    optionCheckboxes.forEach(function (cb) {
      if (cb.checked) {
        optionsTotal += parseFloat(cb.dataset.price);
      }
    });

    const priceRub = basePrice + optionsTotal;

    // --- Итоговая сводка ---
    blockBreakdownContent.innerHTML =
      'Материал: ' + getMaterialName() + ' — ' + formatPrice(basePrice) + '<br>' +
      'Доп. опции: ' + getSelectedOptionsList() + ' — ' + formatPrice(optionsTotal) + '<br>' +
      'Итого: ' + formatPrice(priceRub);

    // --- Вывод ---
    blockResult.textContent = priceRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽';
  }
});

