import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CommandRegistry, Profile, createCommands } from './commands';

const prompt = 'guest@stivers.us:~$';

type HistoryEntry = {
  id: number;
  command: string;
  output: React.ReactNode;
};

function App() {
  const profile = useMemo<Profile>(
    () => ({
      name: 'Chris Stivers',
      role: 'Developer',
      location: 'San Jose, Ca',
      summary:
        'Builder of large scale web applications and services, with an eye toward developer experience.',
      links: [
        { label: 'GitHub', url: 'https://github.com/cstivers78' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/chris-stivers-86387a1/' }
      ]
    }),
    []
  );

  const commands = useMemo<CommandRegistry>(() => createCommands(profile), [profile]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    const [commandName, ...args] = raw.split(/\s+/);
    const command = commands[commandName];

    const output = command
      ? command.action({ args, profile, commands })
      : (
          <span>
            Command not found: <strong>{commandName}</strong>. Type <code>help</code> to see options.
          </span>
        );

    const nextEntry: HistoryEntry = {
      id: idRef.current++,
      command: raw,
      output
    };

    setHistory((prev) => [...prev, nextEntry]);
    setInput('');
  };

  return (
    <div className="page">
      <div className="terminal">
        <header className="terminal-header">
          <div className="lights">
            <span className="light red" />
            <span className="light amber" />
            <span className="light green" />
          </div>
          <div className="title">stivers.us terminal</div>
        </header>

        <main className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {history.map((entry) => (
            <div key={entry.id} className="history-row">
              <div className="prompt">{prompt}</div>
              <div className="command-output">
                <div className="command-input">{entry.command}</div>
                <div className="output">{entry.output}</div>
              </div>
            </div>
          ))}

          <form className="input-row" onSubmit={handleSubmit}>
            <label className="prompt" htmlFor="terminal-input">
              {prompt}
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              autoComplete="off"
              spellCheck={false}
              value={input}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
              placeholder="Type a command (try 'help')"
            />
          </form>
        </main>
      </div>
    </div>
  );
}

export default App;
