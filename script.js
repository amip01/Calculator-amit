const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const modeBtn = document.getElementById('modeBtn');
const historyBtn = document.getElementById('historyBtn');

let expression = '';
let result = '';
let dark = true;

function normalize(expr) {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/%/g, '/100');
}

function safeEval(expr) {
  const normalized = normalize(expr);
  if (!normalized.trim()) return 0;
  if (!/^[0-9+\-*/().\s]+$/.test(normalized)) throw new Error('Invalid expression');
  return Function(`'use strict'; return (${normalized});`)();
}

function prettyNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-8 || abs > 1e12)) return value.toExponential(8).replace(/\.?0+e/, 'e');
  return String(Number(value.toFixed(10))).replace(/\.0+$/, '');
}

function render() {
  display.textContent = expression || result || '0';
  expressionEl.textContent = result ? `${expression || result} ` : '';
}

function append(value) {
  if (display.textContent === 'Error') clearAll();
  if (!expression && ['+', '×', '÷', '−'].includes(value)) return;

  const last = expression.slice(-1);
  const operators = ['+', '×', '÷', '−', '-'];
  if (operators.includes(value) && operators.includes(last)) {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }
  render();
}

function clearAll() {
  expression = '';
  result = '';
  render();
}

function backspace() {
  if (display.textContent === 'Error') return clearAll();
  expression = expression.slice(0, -1);
  render();
}

function calculate() {
  try {
    const val = safeEval(expression);
    result = prettyNumber(val);
    expression = result;
    expressionEl.textContent = '';
    display.textContent = result;
  } catch {
    display.textContent = 'Error';
    expressionEl.textContent = '';
    expression = '';
    result = '';
  }
}

function toggleTheme() {
  dark = !dark;
  document.body.classList.toggle('light', !dark);
  modeBtn.textContent = dark ? '☾' : '☀';
}

document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    if (value) return append(value);
    if (action === 'clear') return clearAll();
    if (action === 'backspace') return backspace();
    if (action === 'equals') return calculate();
    if (action === 'percent') return append('%');
    if (action === 'divide') return append('÷');
    if (action === 'multiply') return append('×');
    if (action === 'subtract') return append('−');
    if (action === 'add') return append('+');
  });
});

modeBtn.addEventListener('click', toggleTheme);
historyBtn.addEventListener('click', () => {
  alert('Modern Calculator\n\nKeyboard: digits, +, -, *, /, (), %, Enter, Backspace, Esc');
});

document.addEventListener('keydown', (e) => {
  const allowed = '0123456789+-*/().%';
  if (allowed.includes(e.key)) {
    if (e.key === '*') return append('×');
    if (e.key === '/') return append('÷');
    if (e.key === '-') return append('−');
    return append(e.key);
  }
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); }
  if (e.key === 'Backspace') backspace();
  if (e.key === 'Escape') clearAll();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

render();
