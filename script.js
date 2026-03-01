/**
 * Калькулятор стоимости корпусной мебели (V2)
 * Формула: (ширина * высота * глубина / 1000) * коэффициент_материала = цена в рублях
 */

// Ждём загрузки DOM, чтобы элементы были доступны
document.addEventListener('DOMContentLoaded', function () {
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const depthInput = document.getElementById('depth');
  const materialSelect = document.getElementById('material');
  const calcBtn = document.getElementById('calcBtn');
  const resultEl = document.getElementById('result');

  calcBtn.addEventListener('click', calculatePrice);

  function calculatePrice() {
    // Получаем значения из полей ввода
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const depth = parseFloat(depthInput.value);
    // Коэффициент материала (₽/дм³): ДСП 150, МДФ 250, Массив 500
    const materialCoeff = parseFloat(materialSelect.value);

    // Проверка: все поля должны быть заполнены и больше 0
    if (isNaN(width) || isNaN(height) || isNaN(depth) || width <= 0 || height <= 0 || depth <= 0) {
      resultEl.textContent = 'Введите корректные размеры (числа больше 0)';
      return;
    }

    // Формула: объём в дм³ * коэффициент материала
    const volume = (width * height * depth) / 1000;
    const price = volume * materialCoeff;

    // Форматирование: пробелы как разделитель тысяч, 2 знака после запятой
    resultEl.textContent = price.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  }
});
