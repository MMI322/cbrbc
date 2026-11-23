import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useRef, useState } from 'react';
import { useUnit } from 'effector-react';
import { $opponentEntries, $players, $storageWarning, opponentAdded, opponentChanged, opponentCopied, opponentRemoved,
  attacksRequested } from '../model/actionsModel';
import { OpponentCard } from './OpponentCard';

export function OpponentsSection() {
  const { opponentEntries, players, warning, addOpponent, changeOpponent, copyOpponent, removeOpponent, requestAttacks } = useUnit({
    opponentEntries: $opponentEntries,
    players: $players,
    warning: $storageWarning,
    addOpponent: opponentAdded,
    changeOpponent: opponentChanged,
    copyOpponent: opponentCopied,
    removeOpponent: opponentRemoved,
    requestAttacks: attacksRequested,
  });
  const [newOpponentId, setNewOpponentId] = useState('');
  const addButton = useRef<HTMLButtonElement>(null);

  function addOrCopyOpponent(sourceOpponentId?: string) {
    const id = 'opponent-' + crypto.randomUUID();
    setNewOpponentId(id);
    if (sourceOpponentId === undefined) addOpponent(id);
    else copyOpponent({ sourceOpponentId, id });
  }

  return (
    <>
      <div className="toolbar">
        <Button variant="secondary" ref={addButton} type="button" onClick={() => addOrCopyOpponent()}>+ Противник</Button>
        <Badge>Всего: {opponentEntries.length}</Badge>
        <Button size="default" variant="default" className="primary" type="button" disabled={opponentEntries.length === 0}
          onClick={() => requestAttacks({})}>Бросить за всех</Button>
      </div>
      {warning && <p className="warning" role="status">Хранилище недоступно. Изменения могут потеряться при закрытии окна.</p>}
      <section aria-label="Противники">
        {opponentEntries.map(entry => (
          <OpponentCard key={entry.id} opponent={entry.opponent} players={players}
            outcome={entry.outcome} autoFocus={entry.id === newOpponentId}
            onChange={(opponent, isValid) => changeOpponent({ id: entry.id, opponent, isValid })}
            onRoll={() => requestAttacks({ opponentId: entry.id })}
            onCopy={() => addOrCopyOpponent(entry.id)}
            onRemove={() => {
              removeOpponent(entry.id);
              addButton.current?.focus();
            }} />
        ))}
      </section>
    </>
  );
}
