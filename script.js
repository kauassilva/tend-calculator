const expressionElement = document.getElementById('expression');
const displayElement = document.getElementById('display');
const buttonsElement = document.querySelector('.buttons');

// tokens da expressão
let tokens = [];
let currentToken = '0';
let evaluated = false; // Se torna true depois de pressionar equals; Mantem a expressao visivel

const operators = {
    '+': {
        precedence: 1,
        associativity: 'left',
        func: (a, b) => a + b
    },
    '-': {
        precedence: 1,
        associativity: 'left',
        func: (a, b) => a - b
    },
    '*': {
        precedence: 2,
        associativity: 'left',
        func: (a, b) => a * b,
    },
    '/': {
        precedence: 2,
        associativity: 'left',
        func: (a, b) => {
            if (b === 0)
                throw new Error('Erro: Divisão por zero');

            return a / b;
        }
    }
}

function updateUI() {
    expressionElement.textContent = tokens.join(' ');
    displayElement.textContent = currentToken;
}

function pushCurrentToken() {
    if (!currentToken || currentToken === '')
        return;
    // Sempre empurra o token atual (inclui '0' como primeiro valor válido)
    tokens.push(currentToken);
    currentToken = '0';
}

function inputDigit(digit) {
    // Se a expressao foi avaliada, iniciar uma nova expressao ao digitar um numero
    if (evaluated) {
        tokens = [];
        currentToken = digit;
        evaluated = false;
        updateUI();
        return;
    }
    if (currentToken === '0')
        currentToken = digit;
    else
        currentToken += digit;

    updateUI();
}

function inputDecimal() {
    if (evaluated) {
        tokens = [];
        currentToken = '0.';
        evaluated = false;
        updateUI();
        return;
    }
    if (!currentToken.includes('.')) {
        currentToken += '.';
        updateUI();
    }
}

function inputOperator(operator) {
    if (evaluated) {
        tokens = [currentToken];
        evaluated = false;
    } else {
        // Finaliza o token de numero
        pushCurrentToken();
    }

    const last = tokens[tokens.length - 1];

    if (last && operators[last])
        tokens[tokens.length - 1] = operator;
    else
        tokens.push(operator);

    currentToken = '0';
    updateUI();
}

function clearAll() {
    tokens = [];
    currentToken = '0';
    evaluated = false;
    updateUI();
}

function backspace() {
    if (evaluated) {
        tokens = [];
        evaluated = false;
    }
    if (currentToken.length > 1)
        currentToken = currentToken.slice(0, -1);
    else
        currentToken = '0';

    updateUI();
}

function toRPN(inputTokens) {
    const out = [];
    const stack = [];

    for (const token of inputTokens) {
        if (token == null || token === '')
            continue;
        if (!isNaN(token)) {
            out.push(token);
            continue;
        }
        if (operators[token]) {
            const o1 = token;

            while (stack.length > 0 && operators[stack[stack.length - 1]]) {
                const o2 = stack[stack.length - 1];

                if ((operators[o1].associativity === 'left' && operators[o1].precedence <= operators[o2].precedence) || (operators[o1].associativity === 'right' && operators[o1].precedence < operators[o2].precedence)) {
                    out.push(stack.pop());
                    continue;
                }

                break;
            }

            stack.push(o1);
            continue;
        }
    }

    while (stack.length > 0)
        out.push(stack.pop());

    return out;
}

function evalRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(parseFloat(token));
            continue;
        }
        if (operators[token]) {
            const b = stack.pop();
            const a = stack.pop();

            if (a == null || b == null)
                throw new Error('Erro: Expressão inválida');

            stack.push(operators[token].func(a, b));
            continue;
        }

        throw new Error('Erro: Token desconhecido: ' + token);
    }

    if (stack.length !== 1)
        throw new Error('Erro: Expressão inválida');

    return stack[0];
}

function handleEquals() {
    pushCurrentToken();

    try {
        const rpn = toRPN(tokens);
        const raw = evalRPN(rpn);
        const result = roundIfNeeded(raw);
        // Mantem a expressao visivel apos avaliar
        currentToken = String(result);
        evaluated = true;
        updateUI();
    } catch (error) {
        currentToken = 'Erro';
        tokens = [];
        evaluated = false;
        updateUI();
    }
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

    if (action === 'decimal')
        inputDecimal();
    else if (action === 'clear')
        clearAll();
    else if (action === 'backspace')
        backspace();
    else if (action === 'equals')
        handleEquals();
    else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        const map = {
            add: '+',
            subtract: '-',
            multiply: '*',
            divide: '/'
        };

        inputOperator(map[action]);
    }
});

// Suporte ao teclado
window.addEventListener('keydown', (event) => {
    const key = event.key;

    if ((key >= '0' && key <= '9')) {
        inputDigit(key);
        event.preventDefault();
        return;
    }
    if (key === ',' || key === '.') {
        inputDecimal();
        event.preventDefault();
        return;
    }
    if (key === 'Enter' || key === '=') {
        handleEquals();
        event.preventDefault();
        return;
    }
    if (key === 'Backspace') {
        backspace();
        event.preventDefault();
        return;
    }
    if (key === 'Escape') {
        clearAll();
        event.preventDefault();
        return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
        inputOperator(key);
        event.preventDefault();
        return;
    }
});

updateUI();