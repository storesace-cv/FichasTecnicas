# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Testes

- `npm test` executa o Vitest.
- `npm test -- --runInBand` agora é aceito; a flag é ignorada porque o Vitest não a suporta. Use `npm test -- --maxWorkers=1` se precisar forçar a execução em um único worker.

## Tokens de estilo

- As variáveis de design system vivem em `src/styles/tokens.css` e seguem a convenção `--color-<family>-<peso>` e `--spacing-<passo>`.
- Paletas principais: `--color-primary-*` (azuis), `--color-secondary-*` (roxos), `--color-success-*`, `--color-warning-*`, `--color-error-*` e neutros `--color-neutral-*`.
- Superfícies e texto: `--color-surface`, `--color-surface-muted`, `--color-border-soft`, `--color-text-strong`, `--color-text-subtle`, `--color-text-muted`, `--color-text-on-primary`.
- Espaçamentos escalares disponíveis: `--spacing-1` até `--spacing-20` (0.25rem a 5rem) para uso em utilitários Tailwind com valores arbitrários.
