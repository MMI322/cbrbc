import { Button } from '../../ui/Button';
import { useRef, useState } from 'react';
import { useUnit } from 'effector-react';
import { $players, playerAdded, playerChanged, playerRemoved } from '../model/actionsModel';
import { PlayerCard } from './PlayerCard';

export function PlayersSection() {
  const { players, addPlayer, changePlayer, removePlayer } = useUnit({
    players: $players,
    addPlayer: playerAdded,
    changePlayer: playerChanged,
    removePlayer: playerRemoved,
  });
  const [newPlayerId, setNewPlayerId] = useState('');
  const addButton = useRef<HTMLButtonElement>(null);

  return (
    <section className="players" aria-labelledby="players-heading">
      <div className="players-heading">
        <h2 id="players-heading">Игроки</h2>
        <Button variant="secondary" ref={addButton} type="button" onClick={() => {
          const id = crypto.randomUUID();
          setNewPlayerId(id);
          addPlayer(id);
        }}>+ Игрок</Button>
      </div>
      <div id="players">
        {players.map(player => <PlayerCard key={player.id} player={player} autoFocus={player.id === newPlayerId}
          onChange={changePlayer}
          onRemove={() => {
            removePlayer(player.id);
            addButton.current?.focus();
          }} />)}
      </div>
    </section>
  );
}
