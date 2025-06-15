import {useCallback, useState} from 'react'

import Menu from './Menu'
import SpinStandard from './SpinStandard'
import SpinUniqueCollectible from './SpinUniqueCollectible'

import loadingGif from './gifs/loading.gif';

import './App.css';

function App() {
  const [screen, setScreen] = useState('menu')
  const goMenu = useCallback(() => setScreen('menu'), []);
  const isMaintaining = true

  return (
      <>
        {isMaintaining && (
            <div className="maintenance-overlay">
              <div className="maintenance-content">
                <p>Maintain in progress</p>
                <img src={loadingGif} alt="Loading..." />
              </div>
            </div>
        )}

        {screen === 'menu' && (
            <Menu
                onStandard={() => setScreen('spinStandard')}
                onUniqueCollectible={() => setScreen('spinUniqueCollectible')}
            />
        )}

        {screen === 'spinStandard' && (
            <SpinStandard onBack={goMenu} />
        )}

        {screen === 'spinUniqueCollectible' && (
            <SpinUniqueCollectible onBack={goMenu} />
        )}
      </>
  );
}

export default App
