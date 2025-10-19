// Pure math utilities: token helpers, shunting-yard (toRPN), RPN evaluation
const identifierRegex = /^[A-Za-z_]\w*$/;

export const operators = {
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
        func: (a, b) => a * b
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
};

export function isOperand(token) {
    return token != null && (!isNaN(token) || identifierRegex.test(token));
}

export function toRPN(inputTokens) {
    const out = [];
    const stack = [];

    for (const token of inputTokens) {
        if (token == null || token === '')
            continue;
        if (!isNaN(token) || identifierRegex.test(token)) {
            out.push(token);
            continue;
        }
        if (operators[token]) {
            const o1 = token;
            while (stack.length > 0 && operators[stack[stack.length - 1]]) {
                const o2 = stack[stack.length - 1];
                if ((operators[o1].associativity === 'left' && operators[o1].precedence <= operators[o2].precedence) ||
                    (operators[o1].associativity === 'right' && operators[o1].precedence < operators[o2].precedence)) {
                    out.push(stack.pop());
                    continue;
                }
                break;
            }
            stack.push(o1);
        }
    }

    while (stack.length > 0)
        out.push(stack.pop());

    return out;
}

export function evalRPN(rpn, resolveIdentifier) {
    const stack = [];

    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(parseFloat(token));
            continue;
        }
        if (identifierRegex.test(token)) {
            const v = resolveIdentifier ? resolveIdentifier(token) : 0;

            if (Number.isNaN(v))
                throw new Error('Erro: Variável inválida');

            stack.push(v);
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

export function roundIfNeeded(value) {
    if (typeof value !== 'number' || Number.isInteger(value))
        return value;
    
    return parseFloat(value.toFixed(10));
}
