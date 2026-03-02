/**
 * Калькулятор стоимости корпусной мебели (V6)
 *
 * Формула расчёта:
 *   объём_в_дм³ = (ширина × высота × глубина) / 1000
 *   базовая_цена = объём_в_дм³ × коэффициент_материала
 *   итог = базовая_цена + сумма_выбранных_опций
 */

const CM3_PER_DM3 = 1000; // 1000 см³ = 1 дм³
const PRICE_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const ERROR_MESSAGE = 'Введите корректные размеры (числа больше 0)';

document.addEventListener('DOMContentLoaded', function () {

  // --- Элементы страницы ---
  const inputWidth = document.getElementById('width');
  const inputHeight = document.getElementById('height');
  const inputDepth = document.getElementById('depth');
  const inputMaterial = document.getElementById('material');
  const optionCheckboxes = document.querySelectorAll('.option');
  const buttonCalculate = document.getElementById('calcBtn');
  const blockResult = document.getElementById('result');

  buttonCalculate.addEventListener('click', calculatePrice);

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

    // --- Вывод ---
    blockResult.textContent = priceRub.toLocaleString('ru-RU', PRICE_FORMAT) + ' ₽';
  }
});

