import { useState } from 'react';

type NamePromptProps = {
  defaultName: string;
  onSubmit: (name: string) => void;
};

export function NamePrompt({ defaultName, onSubmit }: NamePromptProps) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="name-prompt">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(name.trim() || defaultName);
        }}
      >
        <label htmlFor="player-name">你的名字</label>
        <input id="player-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        <button type="submit">确认</button>
      </form>
    </div>
  );
}
