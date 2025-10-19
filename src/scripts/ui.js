import { toRPN, evalRPN, roundIfNeeded, isOperand } from './math.js';

const expressionElement = document.getElementById('expression');
const displayElement = document.getElementById('display');
const buttonsElement = document.querySelector('.buttons');
const varXInput = document.getElementById('var-x');

let tokens = [];
let currentToken = '0';
let evaluated = false;

function renderExpression() {
    expressionElement.innerHTML = '';

    tokens.forEach((t, idx) => {
        const span = document.createElement('span');
        span.className = 'token';
        span.tabIndex = 0;
        span.dataset.index = idx;
        span.textContent = t;
        expressionElement.appendChild(span);
    });
}

function updateUI() {
    renderExpression();
    displayElement.textContent = currentToken;
}

function pushCurrentToken() {
    if (!currentToken || currentToken === '')
        return;

    const last = tokens[tokens.length - 1];

    if (currentToken === '0') {
        if (tokens.length === 0 || (last && Object.prototype.hasOwnProperty.call({ '+': 1, '-': 1, '*': 1, '/': 1 }, last))) {
            tokens.push(currentToken);
            currentToken = '0';
        }

        return;
    }

    tokens.push(currentToken); currentToken = '0';
}

function inputDigit(digit) {
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
        const last = tokens[tokens.length - 1];
        if (!isOperand(last))
            pushCurrentToken();
    }
    
    const last = tokens[tokens.length - 1];
    
    if (last && Object.prototype.hasOwnProperty.call({ '+': 1, '-': 1, '*': 1, '/': 1 }, last)) 
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

function handleEquals() {
    pushCurrentToken();
    try {
        const rpn = toRPN(tokens);

        const raw = evalRPN(rpn, (id) => {
            const rawVal = (varXInput && typeof varXInput.value === 'string') ? varXInput.value.trim() : '';

            if (rawVal === '')
                return 0;
            
            const v = parseFloat(rawVal);
        
            if (Number.isNaN(v))
                throw new Error('Erro: Variável X inválida');
            
            return v;
        });

        const result = roundIfNeeded(raw);
        currentToken = String(result);
        evaluated = true;
        updateUI();
    } catch (err) {
        currentToken = 'Erro';
        tokens = [];
        evaluated = false;
        updateUI();
    }
}

buttonsElement.addEventListener('click', (event) => {
    const target = event.target;
    
    if (!target.matches('button'))
        return;
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
        if (evaluated) {
            tokens = [];
            currentToken = 'X';
            evaluated = false;
            updateUI();
            return;
        }
        if (currentToken !== '0')
            pushCurrentToken();
        
        tokens.push('X');
        currentToken = '0';
        updateUI();
        return;
    } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        const map = { add: '+', subtract: '-', multiply: '*', divide: '/' };
        inputOperator(map[action]);
    }
});

expressionElement.addEventListener('click', (ev) => {
    const t = ev.target;
    
    if (t && t.classList && t.classList.contains('token')) {
        const idx = Number(t.dataset.index);
        
        if (Number.isFinite(idx)) {
            const tok = tokens[idx];
            tokens = tokens.slice(0, idx).concat(tokens.slice(idx + 1));
            currentToken = tok;
            evaluated = false;
            updateUI();
            displayElement.focus?.();
        }
    }
});

if (varXInput)
    varXInput.addEventListener('focus', (e) => {
        try {
            e.target.select();
        } catch (err) {}
});

window.addEventListener('keydown', (event) => {
    const key = event.key;
    const active = document.activeElement;

    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable))
        return;

    const code = event.code || '';
    const isDigitKey = code.startsWith('Digit') || code.startsWith('Numpad');

    if (isDigitKey && ((event.ctrlKey && event.altKey) || event.shiftKey)) {
        let digit;
        if (code.startsWith('Digit'))
            digit = code.slice(5);
        else
            digit = code.slice(6);
        if (varXInput) {
            const cur = (typeof varXInput.value === 'string') ? varXInput.value : '';
            
            if (cur === '' || cur === '0')
                varXInput.value = digit;
            else
                varXInput.value = cur + digit;

            varXInput.classList.add('flash');
            clearTimeout(varXInput._flashTimeout);
            varXInput._flashTimeout = setTimeout(() => varXInput.classList.remove('flash'), 250);
        }

        event.preventDefault();
        return;
    }

    const isCmdOrCtrl = event.ctrlKey || event.metaKey;
    
    if (isCmdOrCtrl && event.altKey && key === 'Backspace') {
        if (varXInput) {
            const cur = (typeof varXInput.value === 'string') ? varXInput.value : '';
            
            if (!cur || cur.length <= 1)
                varXInput.value = '0';
            else
                varXInput.value = cur.slice(0, -1);
            
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
        if (evaluated) {
            tokens = [];
            currentToken = 'X';
            evaluated = false;
            updateUI();
            event.preventDefault();
            return;
        }
        if (currentToken !== '0')
            pushCurrentToken();
        
        tokens.push('X');
        updateUI();
        event.preventDefault();
        return;
    }
});

updateUI();
