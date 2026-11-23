import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';
import { createRoot } from 'react-dom/client';
import { actionsOpened } from './actions/model/actionsModel';
import { App } from './popup/App';
import './popup/popup.css';

const scope = fork();

void allSettled(actionsOpened, { scope }).then(() => {
  createRoot(document.getElementById('root')!).render(
    <Provider value={scope}>
      <App />
    </Provider>,
  );
});
