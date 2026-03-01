/**
 * Калькулятор стоимости корпусной мебели (V1)
 * Формула: (ширина * высота * глубина / 1000) * 150 = цена в рублях
 */

// Ждём загрузки DOM, чтобы элементы были доступны
document.addEventListener('DOMContentLoaded', function () {
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const depthInput = document.getElementById('depth');
  const calcBtn = document.getElementById('calcBtn');
  const resultEl = document.getElementById('result');

  calcBtn.addEventListener('click', calculatePrice);

  function calculatePrice() {
    // Получаем значения из полей ввода
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const depth = parseFloat(depthInput.value);

    // Проверка: все поля должны быть заполнены и больше 0
    if (isNaN(width) || isNaN(height) || isNaN(depth) || width <= 0 || height <= 0 || depth <= 0) {
      resultEl.textContent = 'Введите корректные размеры (числа больше 0)';
      return;
    }

    // Формула расчёта: объём в дм³ * цена за дм³
    // (ширина * высота * глубина / 1000) — объём в кубических дециметрах
    // 150 — цена за 1 дм³ в рублях
    const price = (width * height * depth / 1000) * 150;

    // Форматируем результат: 2 знака после запятой
    resultEl.textContent = price.toFixed(2) + ' ₽';
  }
});
