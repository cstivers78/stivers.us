# stivers.us terminal

A lightweight React terminal interface with pluggable commands. It starts with `help` and `about` commands and is structured so you can add new commands with minimal wiring.

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL to use the terminal. Use `npm run build` for a production bundle.

## Commands

- `help` — shows basic info and lists available commands
- `about` — shows the developer profile
- `horse` — shows a celebratory 2026 pixel-art horse animation

### Adding commands

Commands live in `src/commands.tsx`. Each command has a `name`, `description`, and an `action` function that returns React content. Add a new command by adding another property to the `commands` object:

```js
commands.greet = {
  description: 'Send a greeting',
  action: ({ args }) => <span>Hello {args[0] || 'there'}!</span>
};
```

The `action` receives `{ args, profile, commands }` so you can reuse data or call other commands.
