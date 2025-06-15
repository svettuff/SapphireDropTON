import {useCallback, useState} from 'react'

import Menu from './Menu'
import SpinStandard from './SpinStandard'
import SpinUniqueCollectible from './SpinUniqueCollectible'

import { Helix } from 'ldrs/react'
import 'ldrs/react/Helix.css'

import './App.css';

function App() {
  const [screen, setScreen] = useState('menu')
  const goMenu = useCallback(() => setScreen('menu'), []);
  const isMaintaining = false

  return (
      <>
        {isMaintaining && (
            <div className="maintenance-overlay">
              <div className="maintenance-content">
                <p>Maintain in progress</p>
                <Helix
                    size="75"
                    speed="2.5"
                    color="white"
                />
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
