const displayElement = document.getElementById('display');
const buttonsElement = document.querySelector('.buttons');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForNewValue = false;

function updateDisplay() {
    displayElement.textContent = String(currentValue);
}

function inputDigit(digit) {
    if (waitingForNewValue) {
        currentValue = digit;
        waitingForNewValue = false;
    } else {
        currentValue = currentValue === '0' ? digit : currentValue + digit;
    }

    updateDisplay();
}

function inputDecimal() {
    if (waitingForNewValue) {
        currentValue = '0.';
        waitingForNewValue = false;
        updateDisplay();
        return;
    }

    if (!currentValue.includes('.')) {
        currentValue += '.';
        updateDisplay();
    }
}

function clearAll() {
    currentValue = '0';
    previousValue = null;
    operator = null;
    waitingForNewValue = false;
    updateDisplay();
}

function backspace() {
    if (waitingForNewValue) {
        return;
    }

    if (currentValue.length <= 1) {
        currentValue = '0';
    } else {
        currentValue = currentValue.slice(0, -1);
    }

    updateDisplay();
}

function calculate(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;

    if (op === '/') {
        if (b === 0) return 'Erro: Divisão por zero';
        
        return a / b;
    }

    return b;
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentValue);

    if (operator && waitingForNewValue) {
        operator = nextOperator;
        return;
    }

    if (previousValue == null) {
        previousValue = inputValue;
    } else if (operator) {
        const rawResult = calculate(previousValue, inputValue, operator);

        if (typeof rawResult === 'string') {
            currentValue = rawResult;
            previousValue = null;
            operator = null;
            waitingForNewValue = true;
            updateDisplay();
            return;
        }

        const result = roundIfNeeded(rawResult);
        previousValue = result;
        currentValue = String(result);
        updateDisplay();
    }

    waitingForNewValue = true;
    operator = nextOperator;
}

function handleEquals() {
    if (operator == null || waitingForNewValue) {
        return;
    }

    const inputValue = parseFloat(currentValue);
    const rawResult = calculate(previousValue, inputValue, operator);

    if (typeof rawResult === 'string') {
        currentValue = rawResult;
    } else {
        currentValue = String(roundIfNeeded(rawResult));
    }

    previousValue = null;
    operator = null;
    waitingForNewValue = true;
    updateDisplay();
}

function roundIfNeeded(value) {
    if (typeof value !== 'number' || Number.isInteger(value)) {
        return value;
    }

    return parseFloat(value.toFixed(10));
}

buttonsElement.addEventListener('click', (event) => {
    const target = event.target;

    if (!target.matches('button')) {
        return;
    }

    if (target.dataset.digit) {
        inputDigit(target.dataset.digit);
        return;
    }

    const action = target.dataset.action;

    switch (action) {
        case 'decimal':
            inputDecimal();
            break;
        case 'clear':
            clearAll();
            break;
        case 'backspace':
            backspace();
            break;
        case 'equals':
            handleEquals();
            break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            {
                const map = {
                    add: '+',
                    subtract: '-',
                    multiply: '*',
                    divide: '/'
                };
                handleOperator(map[action]);
            }
            break;
        default:
            break;
    }
});

// Suporte ao teclado
window.addEventListener('keydown', (event) => {
    if ((event.key >= '0' && event.key <= '9')) {
        inputDigit(event.key);
        event.preventDefault();
        return;
    }

    if (event.key === ',' || event.key === '.') {
        inputDecimal();
        event.preventDefault();
        return;
    }

    if (event.key === 'Enter' || event.key === '=') {
        handleEquals();
        event.preventDefault();
        return;
    }

    if (event.key === 'Backspace') {
        backspace();
        event.preventDefault();
        return;
    }

    if (event.key === 'Escape') {
        clearAll();
        event.preventDefault();
        return;
    }

    if (['+', '-', '*', '/'].includes(event.key)) {
        handleOperator(event.key);
        event.preventDefault();
        return;
    }
});

updateDisplay();