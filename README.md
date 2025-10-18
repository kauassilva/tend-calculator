# tend-calculator

Uma calculadora simples escrita em HTML, CSS e JavaScript. Esta versão inclui suporte a expressão completa com precedência de operadores e uma variável X que pode ser usada em expressões.

Versão
-------
- Aplicação: Tend
- Versão visível no UI: v1.0.0 (considerar essa como a versão inicial)

Arquivos principais
-------------------
- `index.html` — interface (display, painel de variáveis e botões)
- `styles.css` — estilos e pequenas animações de feedback
- `script.js` — lógica (tokenização, shunting-yard, avaliação RPN, e manipulação de UI)

Como testar localmente
----------------------
1. Abra o diretório `tend-calculator` no seu sistema de arquivos.
2. Abra `index.html` no navegador (duplo clique ou arraste para o navegador).
3. Use os botões ou o teclado para testar as funcionalidades listadas abaixo.

Funcionalidades notáveis
------------------------
- Avaliação de expressões com precedência de operações (+, -, *, /) usando shunting-yard → RPN.
- Variável `X` suportada nas expressões (ex.: `2 * X + 1`). Defina o valor de `X` no campo "X".
- Persistência da expressão após `=` (o resultado aparece no display, expressão permanece visível).
- Inserção da variável `X` por botão ou tecla `X` no teclado (quando foco não está em inputs).

Atalhos de teclado úteis
------------------------
- Números e operadores: `0`–`9`, `.`, `+`, `-`, `*`, `/` — funciona normalmente.
- `Enter` ou `=` — avaliar expressão.
- `Backspace` — apaga último caractere do display.
- `Esc` — limpar (C).
- Inserir X: pressione `X` (quando foco não está dentro de um input).
- Inserir dígitos na variável X via atalho: `Ctrl+Alt+<digit>` (ex.: `Ctrl+Alt+4`) — append do dígito ao valor de X.
- Remover último dígito de X: `Ctrl+Alt+Backspace` — remove o último dígito (se ficar vazio, vira `0`).

Observações de implementação
---------------------------
- A lógica matemática é implementada de forma simples e local no `script.js` (tokenização, shunting-yard, avaliação em RPN), sem dependências.
- Valores na variável `X` são interpretados como números via `parseFloat` no momento da avaliação; entradas vazias são tratadas como `0`.
- O código inclui pequenas ajudas de UX (flash visual quando a variável X é atualizada via atalho, tokens clicáveis para editar).

Licença
-------
Este projeto está licenciado sob a licença do repositório (ver `LICENSE`).
