# Playwright · acessibilidade

[English](README.en.md)

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
[![Accessibility](https://github.com/brunobaccari/playwright-accessibility/actions/workflows/tests.yml/badge.svg)](https://github.com/brunobaccari/playwright-accessibility/actions/workflows/tests.yml)

Testes de acessibilidade no formulário hospedado do [W3C Before and After Demonstration](https://www.w3.org/WAI/demos/bad/after/survey.html). O risco aqui é conseguir preencher um formulário com mouse, mas não conseguir chegar aos campos pelo teclado ou identificá-los pelas tecnologias assistivas.

## Cenários

| Cenário | O que bloqueia a entrega |
| --- | --- |
| Formulário inicial | Qualquer violação encontrada pelo axe nas tags WCAG 2.0/2.1 A/AA |
| Skip links | Tab/Enter não levam do início ao primeiro campo |
| Grupo de opções | Setas não movem foco/seleção, mais de uma opção fica marcada ou Tab prende o foco |
| Campos de contato | Nome acessível ausente, ordem incorreta de Tab/Shift+Tab ou perda dos valores digitados |
| Formulário preenchido | Violação axe após selecionar opções e preencher campos |
| Controle negativo | Axe deixa de detectar os campos sem label e o idioma ausente da versão `before` |

O último caso confirma que o detector encontra defeitos conhecidos. Seu resultado verde **não significa que a página before seja acessível**. Todos os resultados axe, inclusive `incomplete`, são anexados ao relatório; nenhuma regra ou elemento é excluído do escopo das tags escolhidas.

## Executar

Node 24 e Python 3 para verificar o gate de CI.

```bash
npm ci
cp .env.example .env
npx playwright install chromium
npm run typecheck
npm test
npm run report
python check_summary.py
```

`BASE_URL` aponta para o demo HTTPS hospedado. Alterá-la exige uma cópia compatível das páginas `after/survey.html` e `before/survey.html`; não é um scanner genérico de qualquer site. Os dados digitados são sintéticos e o teste não envia o formulário.

## CI e diagnóstico

A execução usa um worker, Chromium e zero retries. Não há sleeps, alteração de DOM nem foco forçado: a navegação de teclado começa no documento e usa Tab, Enter, setas e Shift+Tab.

O Actions publica summary por cenário e artifact `test-results` por 7 dias: relatório HTML, JUnit, JSON completo do axe e trace/screenshot em falhas. Extraia o ZIP e abra `playwright-report/index.html`. `.env` e outputs são ignorados desde o primeiro commit.

O gate exige os seis cenários e rejeita relatório ausente, inválido, vazio ou incompleto, falhas, skips e uma etapa de testes que não terminou com sucesso. `check_summary.py` verifica essas condições com dez entradas. Uma indisponibilidade do W3C reprova a execução: investigue resposta HTTP/trace antes de rodar novamente.

Para uma violação axe, consulte regra, seletor e `helpUrl` no attachment. Confirme o problema na página antes de mudar o teste. Para foco, examine a ordem real de Tab e o nome acessível. Não aceite uma exclusão só para deixar a execução verde.

## Limites

O demo é educacional, originalmente de 2012; não é uma aplicação de cliente. Esta suíte cobre seis cenários em duas versões de uma página, não o site inteiro. Não certifica conformidade WCAG e não substitui leitor de tela, avaliação manual de contraste/foco visível, zoom, outros navegadores ou testes com pessoas com deficiência. O estado após envio não é coberto.

As verificações de axe podem marcar casos como `incomplete`; esses itens exigem revisão manual e não são tratados como aprovação automática. As asserções de foco comprovam seu destino, não a qualidade visual do indicador.

Referências consultadas em 06/10/2026: [Playwright e axe](https://playwright.dev/docs/accessibility-testing), [escopo e propósito do demo W3C](https://www.w3.org/WAI/demos/bad/Overview.html).

Screenshots do estado final também são capturados nos testes de interface aprovados e ficam nos artifacts, fora do Git.

Husky: com Node 24 e as dependências da stack instalados, rode `npm ci` para ativar o pre-commit. `npm run check:local` verifica o diff, o gate dos relatórios e os checks de tipos/lint existentes. O hook também bloqueia arquivos ignorados no índice. Testes que usam navegador, emulador ou API continuam no CI.
