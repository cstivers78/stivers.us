import React, { useEffect, useState } from 'react';

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

  type Frame = string[][];
  const T = 'transparent';
  const C = '#b5824d'; // coat
  const D = '#8e5b2f'; // darker coat
  const L = '#c99b63'; // lighter highlight
  const M = '#2b1b14'; // mane/tail
  const H = '#22150f'; // hoof
  const S = '#d9b28a'; // snout
  const E = '#ffffff'; // eye
  const N = '#0c0a0a'; // nose/outline

  const size = 64;

  const makeBlank = (): Frame => Array.from({ length: size }, () => Array(size).fill(T));

  const paintRect = (frame: Frame, x: number, y: number, w: number, h: number, color: string) => {
    for (let row = y; row < y + h; row += 1) {
      if (row < 0 || row >= size) continue;
      for (let col = x; col < x + w; col += 1) {
        if (col < 0 || col >= size) continue;
        frame[row][col] = color;
      }
    }
  };

  const paintPixel = (frame: Frame, x: number, y: number, color: string) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      frame[y][x] = color;
    }
  };

  type LegPose = {
    x: number;
    lift: number;
    forward?: boolean;
    offset?: number;
    height?: number;
  };

  const paintLeg = (
    frame: Frame,
    x: number,
    yTop: number,
    height: number,
    lift = 0,
    forward = false
  ) => {
    const legHeight = Math.max(10, height - lift);
    const width = 5;
    paintRect(frame, x, yTop + lift, width, legHeight, C);
    paintRect(frame, x, yTop + lift + legHeight - 4, width, 4, H);
    if (forward) {
      paintRect(frame, x + width, yTop + lift + legHeight - 3, 2, 3, H);
    }
  };

  const paintTail = (frame: Frame, x: number, y: number, sway: number) => {
    paintRect(frame, x, y, 6, 10, M);
    paintRect(frame, x - 2 + sway, y + 6, 8, 8, M);
    paintRect(frame, x - 4 + sway, y + 12, 10, 6, M);
    paintRect(frame, x - 6 + sway, y + 16, 12, 6, M);
  };

  const paintHead = (frame: Frame, dx: number, dy: number, tilt: number) => {
    paintRect(frame, 46 + dx, 18 + dy, 12, 10, C);
    paintRect(frame, 56 + dx, 20 + dy + tilt, 6, 8, S);
    paintRect(frame, 48 + dx, 14 + dy, 4, 6, D); // ear
    paintRect(frame, 50 + dx, 12 + dy, 2, 4, D); // ear tip
    paintRect(frame, 44 + dx, 16 + dy, 10, 4, M); // mane at head
    paintPixel(frame, 56 + dx, 22 + dy + tilt, E);
    paintPixel(frame, 57 + dx, 22 + dy + tilt, N);
    paintPixel(frame, 61 + dx, 24 + dy + tilt, N); // nose
  };

  const paintBody = (frame: Frame, yOffset: number) => {
    paintRect(frame, 14, 30 + yOffset, 34, 12, C); // main body
    paintRect(frame, 14, 40 + yOffset, 34, 4, D); // belly shade
    paintRect(frame, 12, 32 + yOffset, 6, 10, D); // hind depth
    paintRect(frame, 24, 28 + yOffset, 22, 4, L); // highlight back
  };

  const paintNeck = (frame: Frame, dy: number) => {
    paintRect(frame, 38, 22 + dy, 10, 12, C);
    paintRect(frame, 38, 20 + dy, 8, 4, M);
    paintRect(frame, 40, 26 + dy, 6, 4, D);
  };

  const buildFrame = (
    headDy: number,
    headTilt: number,
    tailSway: number,
    legs: LegPose[]
  ): Frame => {
    const frame = makeBlank();

    paintBody(frame, 0);
    paintNeck(frame, headDy);
    paintHead(frame, 2, headDy - 2, headTilt);
    paintRect(frame, 26, 18 + headDy, 12, 4, M); // mane along back
    paintRect(frame, 20, 20 + headDy, 10, 4, M);
    paintTail(frame, 10, 30, tailSway);

    const legTop = 42;
    legs.forEach((leg) => {
      paintLeg(
        frame,
        leg.x + (leg.offset ?? 0),
        legTop,
        leg.height ?? 16,
        leg.lift,
        leg.forward ?? false
      );
    });

    paintRect(frame, 14, 56, 38, 2, 'rgba(0,0,0,0.25)');

    return frame;
  };

  const horseFrames: Frame[] = [
    buildFrame(-2, -1, -2, [
      { x: 18, lift: 2, forward: false, offset: -2, height: 17 },
      { x: 26, lift: 0, forward: true, offset: 2, height: 18 },
      { x: 36, lift: 4, forward: true, offset: 3, height: 17 },
      { x: 44, lift: 1, forward: false, offset: -1, height: 18 }
    ]),
    buildFrame(2, 1, 2, [
      { x: 18, lift: 0, forward: true, offset: 2, height: 18 },
      { x: 26, lift: 3, forward: false, offset: -3, height: 17 },
      { x: 36, lift: 1, forward: false, offset: -2, height: 18 },
      { x: 44, lift: 4, forward: true, offset: 3, height: 17 }
    ]),
    buildFrame(0, 0, -1, [
      { x: 18, lift: 1, forward: false, offset: -1, height: 18 },
      { x: 26, lift: 1, forward: true, offset: 1, height: 17 },
      { x: 36, lift: 2, forward: true, offset: 2, height: 17 },
      { x: 44, lift: 0, forward: false, offset: -1, height: 18 }
    ])
  ];

  const HorseAnimation = () => {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setFrameIndex((current) => (current + 1) % horseFrames.length);
      }, 360);
      return () => clearInterval(timer);
    }, []);

    const frame = horseFrames[frameIndex];

    return (
      <div className="dance-wrapper">
        <div className="dance-grid">
          {frame.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className="dance-pixel"
                style={{ backgroundColor: color }}
              />
            ))
          )}
        </div>
        <p className="dance-caption">Happy 2026 — keep trotting forward.</p>
      </div>
    );
  };

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

  commands.horse = {
    description: 'Celebrate 2026 with a dancing horse',
    action: () => <HorseAnimation />
  };

  return commands;
};
