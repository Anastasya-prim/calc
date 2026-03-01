/**
 * Калькулятор стоимости корпусной мебели (V3)
 *
 * Формула расчёта:
 *   объём_в_дм³ = (ширина × высота × глубина) / 1000
 *   цена = объём_в_дм³ × коэффициент_материала
 */

// Ждём загрузки страницы — иначе элементы (поля, кнопка) ещё не существуют
document.addEventListener('DOMContentLoaded', function () {

  // ========== Шаг 1: Находим элементы на странице ==========
  const inputWidth = document.getElementById('width');
  const inputHeight = document.getElementById('height');
  const inputDepth = document.getElementById('depth');
  const inputMaterial = document.getElementById('material');
  const buttonCalculate = document.getElementById('calcBtn');
  const blockResult = document.getElementById('result');

  // ========== Шаг 2: Вешаем обработчик на кнопку ==========
  buttonCalculate.addEventListener('click', calculatePrice);

  // ========== Шаг 3: Функция расчёта ==========
  function calculatePrice() {
    // 3.1 Читаем то, что ввёл пользователь
    const widthCm = parseFloat(inputWidth.value);
    const heightCm = parseFloat(inputHeight.value);
    const depthCm = parseFloat(inputDepth.value);
    const pricePerDm3 = parseFloat(inputMaterial.value); // ₽ за 1 дм³

    // 3.2 Проверяем: введены ли корректные числа?
    const sizesAreValid = !isNaN(widthCm) && !isNaN(heightCm) && !isNaN(depthCm);
    const sizesArePositive = widthCm > 0 && heightCm > 0 && depthCm > 0;

    if (!sizesAreValid || !sizesArePositive) {
      blockResult.textContent = 'Введите корректные размеры (числа больше 0)';
      return; // выходим из функции, расчёт не делаем
    }

    // 3.3 Считаем объём в кубических дециметрах (1000 см³ = 1 дм³)
    const volumeDm3 = (widthCm * heightCm * depthCm) / 1000;

    // 3.4 Считаем цену
    const priceRub = volumeDm3 * pricePerDm3;

    // 3.5 Показываем результат (пробелы между тысячами, 2 знака после запятой)
    const formattedPrice = priceRub.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    blockResult.textContent = formattedPrice + ' ₽';
  }
});

