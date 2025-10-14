# tend-calculator

Este repositório contém uma calculadora feita com HTML, CSS e JavaScript.

Arquivos principais:

- `index.html` — interface (display e botões)
- `styles.css` — estilos simples
- `script.js` — lógica da calculadora

Como testar localmente:

1. Abra o diretório `tend-calculator` no seu sistema de arquivos.
2. Abra `index.html` no navegador (duplo clique ou arraste para o navegador).
3. Use os botões ou o teclado (0-9, ., +, -, *, /, Enter para =, Backspace para apagar, Esc para limpar).

Comportamentos e boas práticas implementadas:

- Suporte a números reais (decimais) usando `parseFloat` apenas na hora do cálculo.
- Prevenção de múltiplos pontos decimais.
- Tratamento de divisão por zero (exibe `Erro`).
- Arredondamento de resultados com `toFixed` para evitar problemas de representação binária.
- Event delegation para gerenciar cliques em botões com um único listener.
- Suporte básico a teclado para melhorar acessibilidade.
