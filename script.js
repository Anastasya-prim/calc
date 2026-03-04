/**
 * Калькулятор стоимости корпусной мебели (V8)
 *
 * Формула расчёта:
 *   объём_в_дм³ = (ширина × высота × глубина) / 1000
 *   базовая_цена = объём_в_дм³ × коэффициент_материала
 *   итог = базовая_цена + сумма_выбранных_опций
 */

// ——— Константы (значения, которые не меняются в коде) ———
const CM3_PER_DM3 = 1000;           // в 1 дм³ помещается 1000 см³
const PRICE_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 2 }; // как показывать рубли
const ERROR_MESSAGE = 'Введите корректные размеры (числа больше 0)';
const STORAGE_KEY = 'furniture-calc-saved'; // ключ в localStorage для сохранённых расчётов

document.addEventListener('DOMContentLoaded', function () {

  // ——— Ссылки на элементы страницы (получаем один раз при загрузке) ———
  const inputWidth = document.getElementById('width');       // поле "Ширина"
  const inputHeight = document.getElementById('height');    // поле "Высота"
  const inputDepth = document.getElementById('depth');       // поле "Глубина"
  const inputMaterial = document.getElementById('material');  // выпадающий список материала
  const optionCheckboxes = document.querySelectorAll('.option'); // все чекбоксы доп. опций
  const buttonCalculate = document.getElementById('calcBtn');
  const blockResult = document.getElementById('result');    // блок, куда выводится итоговая сумма
  const blockBreakdownContent = document.getElementById('breakdownContent'); // блок детализации
  const inputCalcName = document.getElementById('calcName'); // поле "Наименование расчёта"
  const buttonSaveCalc = document.getElementById('saveCalcBtn');
  const savedCalcList = document.getElementById('savedCalcList'); // список сохранённых расчётов

  // Подписываем кнопки на клики: при нажатии вызываются соответствующие функции
  buttonCalculate.addEventListener('click', calculatePrice);
  buttonSaveCalc.addEventListener('click', saveCurrentCalculation);

  // При загрузке страницы сразу показываем список сохранённых расчётов (если есть)
  renderSavedList();

  // ——— Вспомогательные функции (форматирование и чтение данных формы) ———

  /** Превращает число в строку с рублями, например: 15000.50 → "15 000,50 ₽" */
  function formatPrice(num) {
    return num.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽';
  }

  /** Возвращает название выбранного материала (ДСП, МДФ или Массив) */
  function getMaterialName() {
    const selectedOption = inputMaterial.options[inputMaterial.selectedIndex];
    const fullText = selectedOption.text; // например "ДСП (150 ₽/дм³)"
    return fullText.split(' ')[0];        // берём только первое слово
  }

  /** Возвращает строку с названиями отмеченных опций через запятую или "—", если ничего не выбрано */
  function getSelectedOptionsList() {
    const list = [];
    optionCheckboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        const label = checkbox.closest('.option-item').textContent.trim();
        const nameOnly = label.split(' (+')[0]; // убираем часть "(+5 000 ₽)"
        list.push(nameOnly);
      }
    });
    return list.length ? list.join(', ') : '—';
  }

  /** Возвращает массив: для каждого чекбокса true (включён) или false (выключен) */
  function getOptionStates() {
    return Array.from(optionCheckboxes).map(function (checkbox) {
      return checkbox.checked;
    });
  }

  /** Восстанавливает состояние чекбоксов по массиву true/false */
  function setOptionStates(states) {
    optionCheckboxes.forEach(function (checkbox, index) {
      checkbox.checked = states[index] === true;
    });
  }

  /** Читает из браузера массив сохранённых расчётов (из localStorage) */
  function getSavedCalculations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /** Записывает массив расчётов в localStorage */
  function setSavedCalculations(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  /** Сохраняет текущий расчёт: проверяет название и размеры, считает сумму, добавляет в список */
  function saveCurrentCalculation() {
    // 1. Проверяем наименование (обязательное поле)
    const name = (inputCalcName.value || '').trim();
    if (!name) {
      alert('Укажите наименование расчёта.');
      inputCalcName.focus();
      return;
    }

    // 2. Читаем размеры и материал из формы
    const widthCm = parseFloat(inputWidth.value);
    const heightCm = parseFloat(inputHeight.value);
    const depthCm = parseFloat(inputDepth.value);
    const pricePerDm3 = parseFloat(inputMaterial.value);

    // 3. Проверяем, что размеры — положительные числа
    const sizesAreValid = !isNaN(widthCm) && !isNaN(heightCm) && !isNaN(depthCm);
    const sizesArePositive = widthCm > 0 && heightCm > 0 && depthCm > 0;
    if (!sizesAreValid || !sizesArePositive) {
      alert('Введите корректные размеры перед сохранением.');
      return;
    }

    // 4. Считаем итоговую сумму (та же формула, что и в расчёте)
    const volumeDm3 = (widthCm * heightCm * depthCm) / CM3_PER_DM3;
    const basePrice = volumeDm3 * pricePerDm3;
    let optionsTotal = 0;
    optionCheckboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        optionsTotal += parseFloat(checkbox.dataset.price);
      }
    });
    const totalRub = basePrice + optionsTotal;

    // 5. Собираем объект с данными для сохранения
    const optionStates = getOptionStates();
    const materialLabel = inputMaterial.options[inputMaterial.selectedIndex].text.split(' ')[0];
    const saved = {
      id: Date.now(),              // уникальный id по текущему времени
      name: name,
      savedAt: new Date().toISOString(), // дата и время в стандартном формате
      width: widthCm,
      height: heightCm,
      depth: depthCm,
      materialValue: pricePerDm3,
      materialLabel: materialLabel,
      optionStates: optionStates,
      totalRub: totalRub
    };

    // 6. Добавляем в начало списка и сохраняем в localStorage
    const list = getSavedCalculations();
    list.unshift(saved);
    setSavedCalculations(list);
    renderSavedList();
  }

  /** Форматирует дату из ISO-строки в вид "ДД.ММ.ГГГГ, ЧЧ:ММ" */
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

  /** По массиву состояний чекбоксов возвращает строку названий выбранных опций (для отображения в карточке) */
  function getOptionLabelsForSaved(optionStates) {
    const labels = [];
    optionCheckboxes.forEach(function (checkbox, index) {
      if (optionStates[index]) {
        const label = checkbox.closest('.option-item').textContent.trim();
        const nameOnly = label.split(' (+')[0];
        labels.push(nameOnly);
      }
    });
    return labels.length ? labels.join(', ') : '—';
  }

  /** Отрисовывает список сохранённых расчётов: карточки с данными и кнопками "Загрузить" / "Удалить" */
  function renderSavedList() {
    const list = getSavedCalculations();
    if (list.length === 0) {
      savedCalcList.innerHTML = '<p class="saved-calc-empty">Нет сохранённых расчётов</p>';
      return;
    }
    // Строим HTML для каждой карточки сохранённого расчёта
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

    // Вешаем обработчики на кнопки "Загрузить" и "Удалить" у каждой карточки
    savedCalcList.querySelectorAll('.btn-load').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = Number(btn.dataset.id);
        loadCalculation(id);
      });
    });
    savedCalcList.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = Number(btn.dataset.id);
        deleteCalculation(id);
      });
    });
  }

  /** Экранирует спецсимволы строки для безопасной вставки в HTML (защита от XSS) */
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Загружает выбранный сохранённый расчёт в форму и обновляет блок детализации и результат */
  function loadCalculation(id) {
    const list = getSavedCalculations();
    const item = list.find(function (saved) { return saved.id === id; });
    if (!item) return;

    // Заполняем поля формы
    inputCalcName.value = item.name;
    inputWidth.value = item.width;
    inputHeight.value = item.height;
    inputDepth.value = item.depth;
    inputMaterial.value = String(item.materialValue);
    setOptionStates(item.optionStates || []);

    // Показываем итоговую сумму в блоке результата
    blockResult.textContent = item.totalRub != null
      ? item.totalRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽'
      : '';

    // Считаем детализацию и выводим в блок сводки
    const vol = (item.width * item.height * item.depth) / CM3_PER_DM3;
    const basePrice = vol * item.materialValue;
    let optionsTotal = 0;
    (item.optionStates || []).forEach(function (checked, index) {
      if (checked) optionsTotal += parseFloat(optionCheckboxes[index].dataset.price);
    });
    blockBreakdownContent.innerHTML =
      'Материал: ' + (item.materialLabel || '—') + ' — ' + formatPrice(basePrice) + '<br>' +
      'Доп. опции: ' + getOptionLabelsForSaved(item.optionStates || []) + ' — ' + formatPrice(optionsTotal) + '<br>' +
      'Итого: ' + (item.totalRub != null ? formatPrice(item.totalRub) : '—');
  }

  /** Удаляет сохранённый расчёт по id и обновляет список на экране */
  function deleteCalculation(id) {
    const list = getSavedCalculations().filter(function (saved) { return saved.id !== id; });
    setSavedCalculations(list);
    renderSavedList();
  }

  // ——— Основной расчёт стоимости ———

  /** Считывает данные из формы, проверяет их, считает цену и выводит результат и детализацию */
  function calculatePrice() {
    // 1. Читаем значения из полей ввода
    const widthCm = parseFloat(inputWidth.value);
    const heightCm = parseFloat(inputHeight.value);
    const depthCm = parseFloat(inputDepth.value);
    const pricePerDm3 = parseFloat(inputMaterial.value);

    // 2. Проверяем: все ли размеры заданы и положительные
    const sizesAreValid = !isNaN(widthCm) && !isNaN(heightCm) && !isNaN(depthCm);
    const sizesArePositive = widthCm > 0 && heightCm > 0 && depthCm > 0;

    if (!sizesAreValid || !sizesArePositive) {
      blockResult.textContent = ERROR_MESSAGE;
      blockBreakdownContent.innerHTML = '';
      return;
    }

    // 3. Считаем объём в дм³ и базовую цену по материалу
    const volumeDm3 = (widthCm * heightCm * depthCm) / CM3_PER_DM3;
    const basePrice = volumeDm3 * pricePerDm3;

    // 4. Суммируем цены выбранных доп. опций
    let optionsTotal = 0;
    optionCheckboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        optionsTotal += parseFloat(checkbox.dataset.price);
      }
    });

    // 5. Итоговая цена = базовая + опции
    const priceRub = basePrice + optionsTotal;

    // 6. Выводим детализацию в блок "Итоговая сводка"
    blockBreakdownContent.innerHTML =
      'Материал: ' + getMaterialName() + ' — ' + formatPrice(basePrice) + '<br>' +
      'Доп. опции: ' + getSelectedOptionsList() + ' — ' + formatPrice(optionsTotal) + '<br>' +
      'Итого: ' + formatPrice(priceRub);

    // 7. Выводим итоговую сумму в основной блок результата
    blockResult.textContent = priceRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽';
  }
});

