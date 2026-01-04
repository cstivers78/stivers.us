import React from 'react';

export type Profile = {
  name: string;
  role: string;
  location: string;
  summary: string;
  links: Array<{ label: string; url: string }>;
};

type CommandAction = (context: {
  args: string[];
  profile: Profile;
  commands: CommandRegistry;
}) => React.ReactNode;

export type Command = {
  description: string;
  action: CommandAction;
};

export type CommandRegistry = Record<string, Command>;

export const createCommands = (profile: Profile): CommandRegistry => {
  const commands: CommandRegistry = {};

  commands.help = {
    description: 'List available commands and information about the terminal',
    action: ({ commands: commandRegistry }) => (
      <div>
        <p>stivers.us terminal — type a command and press enter.</p>
        <ul className="command-list">
          {Object.entries(commandRegistry).map(([name, command]) => (
            <li key={name}>
              <span className="command-name">{name}</span>
              <span className="command-separator">—</span>
              <span className="command-description">{command.description}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  };

  commands.about = {
    description: 'Display the developer profile',
    action: () => (
      <div className="about-block">
        <p className="about-title">{profile.name}</p>
        <p className="about-subtitle">{profile.role}</p>
        <p className="about-detail">{profile.location}</p>
        <p className="about-summary">{profile.summary}</p>
        <div className="about-links">
          {profile.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    )
  };

  return commands;
};
