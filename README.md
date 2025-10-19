# tend-calculator — Tend (v1.1.2)

Calculadora simples em HTML/CSS/JS com suporte a expressões completas, precedência de operadores e uma variável configurável `X`.

Versão
-------
- Aplicação: Tend
- Versão atual: v1.1.2

Resumo das novidades (v1.1.2)
----------------------------
- Removidos os controles de incremento/decremento (spinners) do campo numérico da variável `X` para uma experiência mais limpa (CSS ajustado em `src/styles/styles.css`).

Arquivos principais
-------------------
- `index.html` — interface (display, painel de variáveis e botões)
- `src/styles/styles.css` — estilos e pequenas animações de feedback
- `src/scripts/ui.js` — código da UI (event handlers, render)
- `src/scripts/math.js` — lógica pura: tokenização, shunting-yard, RPN e avaliação
- `src/assets/github-mark.svg` — ícone do GitHub usado no cabeçalho

Como testar localmente
----------------------
1. Abra o diretório `tend-calculator` no seu sistema de arquivos.
2. Abra `index.html` no navegador (duplo clique).

Funcionalidades principais
--------------------------
- Montagem e edição de expressões infix completas com precedência de operadores (+, -, *, /).
- Variável `X` configurável através do campo no painel; use `X` nas expressões.
- Atalhos de teclado:
	- Dígitos e operadores: `0`–`9`, `.`, `+`, `-`, `*`, `/`
	- Avaliar: `Enter` ou `=`
	- Apagar: `Backspace` (remove último caractere)
	- Limpar: `Esc` (C)
	- Inserir X: tecla `X` (quando foco não está em um campo)
	- Append dígitos em X: `Ctrl+Alt+<digit>` (ex.: `Ctrl+Alt+4`)
	- Remover último dígito de X: `Ctrl+Alt+Backspace`

Notas de implementação
---------------------
- A lógica matemática está separada em `src/scripts/math.js` (pure functions) para facilitar testes.
- `src/scripts/ui.js` importa `toRPN`, `evalRPN` e renderiza a UI; o fallback `script.js` pode ser mantido para navegadores sem ES module support.
- O ícone do GitHub foi movido para `src/assets/github-mark.svg`. Para permitir que o ícone herde cor do CSS, o arquivo SVG foi ajustado para usar `fill="currentColor"`.

Licença
-------
Este projeto está licenciado sob a licença no repositório (ver `LICENSE`).
