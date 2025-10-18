const expressionElement = document.getElementById('expression');
const displayElement = document.getElementById('display');
const buttonsElement = document.querySelector('.buttons');
const insertXBtn = document.getElementById('insert-x');
const varXInput = document.getElementById('var-x');

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
    // Decide whether to push the currentToken. We want to allow '0' as a
    // first operand (e.g. 0 + 5) or when the previous token is an operator
    // (user typed something like '+ 0'). But we must NOT append a default
    // '0' when the expression already ends with an operand (e.g. '5 + X')
    const last = tokens[tokens.length - 1];

    if (currentToken === '0') {
        // push '0' if expression is empty (first operand) or last token is an operator
        if (tokens.length === 0 || (last && operators[last])) {
            tokens.push(currentToken);
            currentToken = '0';
        }
        // otherwise skip pushing the default '0'
        return;
    }

    // normal non-zero number: always push
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
        // Finaliza o token de numero somente quando necessário.
        // Se o último token já for um operando (número ou identificador como 'X'),
        // não devemos empurrar o currentToken (que normalmente é '0').
        const last = tokens[tokens.length - 1];
        if (!isOperand(last)) {
            pushCurrentToken();
        }
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

const identifierRegex = /^[A-Za-z_]\w*$/;

function isOperand(token) {
    return token != null && ( !isNaN(token) || identifierRegex.test(token) );
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
        // identifiers (variáveis como X)
        if (identifierRegex.test(token)) {
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
        // identifier: look up variable value
        if (identifierRegex.test(token)) {
            // allow empty input as zero, but error on invalid numbers
            const raw = (varXInput && typeof varXInput.value === 'string') ? varXInput.value.trim() : '';
            if (raw === '') {
                stack.push(0);
            } else {
                const v = parseFloat(raw);
                if (Number.isNaN(v)) throw new Error('Erro: Variável X inválida');
                stack.push(v);
            }
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
    else if (action === 'insert-x') {
        // behave like previous insertXBtn
        if (evaluated) {
            tokens = [];
            currentToken = 'X';
            evaluated = false;
            updateUI();
            return;
        }
        if (currentToken !== '0') pushCurrentToken();
        tokens.push('X');
        currentToken = '0';
        updateUI();
        return;
    }
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

// insert X handled via the main button grid click handler (data-action="insert-x")

// Suporte ao teclado
window.addEventListener('keydown', (event) => {
    const key = event.key;

    // If user is typing in an input/textarea/contenteditable, don't intercept keys
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return;
    }

    // Shortcut: insert digits into variable X using modifier+digit
    // Supported combos: Ctrl+Alt+Digit (recommended) or Shift+Digit
    // We check event.code so Shift+Digit is distinguishable from symbols (!@#...)
    const code = event.code || '';
    const isDigitKey = code.startsWith('Digit') || code.startsWith('Numpad');
    if (isDigitKey && ((event.ctrlKey && event.altKey) || event.shiftKey)) {
        let digit;
        if (code.startsWith('Digit')) digit = code.slice(5);
        else digit = code.slice(6); // Numpad

        if (varXInput) {
            // append digit to variable input; replace initial 0
            const cur = (typeof varXInput.value === 'string') ? varXInput.value : '';
            if (cur === '' || cur === '0') varXInput.value = digit;
            else varXInput.value = cur + digit;

            // small visual feedback: flash the input
            varXInput.classList.add('flash');
            clearTimeout(varXInput._flashTimeout);
            varXInput._flashTimeout = setTimeout(() => varXInput.classList.remove('flash'), 250);
        }

        event.preventDefault();
        return;
    }

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
    if (key === 'x' || key === 'X') {
        // behave like insert X
        if (evaluated) { tokens = []; currentToken = 'X'; evaluated = false; updateUI(); event.preventDefault(); return; }
        if (currentToken !== '0') pushCurrentToken();
        tokens.push('X');
        updateUI();
        event.preventDefault();
        return;
    }
});

updateUI();