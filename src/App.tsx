import React from 'react';
import { EdoContextProvider, useEdoContext } from './EdoContext';
import { Keyboard } from './Keyboard';

import './App.scss';
import { KeyboardSettingsPanel } from './KeyboardSettingsPanel';
import { KeyboardSettingsContextProvider, useKeyboardSettingsContext } from './KeyboardSettingsContext';



const KeyboardContainer = () => {
  const { degreeCountPerOctave, degreeSizeInCents } = useEdoContext();
  const { startOctave, rangeInOctaves } = useKeyboardSettingsContext();
  return (
    <>
      <div className="keyboard-container">
        <h1>My {degreeCountPerOctave}-TET system</h1>
        {
          degreeCountPerOctave > 0 && (
          <div>({Math.round(degreeSizeInCents * 10) / 10} cents / degree)</div>
          )
        }
        <KeyboardSettingsPanel />
        {
          degreeCountPerOctave > 0 && (
            <Keyboard
              startOctave={startOctave}
              rangeInOctaves={rangeInOctaves}
            />
          )
        }
        {
          degreeCountPerOctave === 0 && (
            <p>A {degreeCountPerOctave}-TET system is a bit boring, isn't it?</p>
          )
        }
      </div>
    </>
  );
}


export default () => {
  return (
    <div className="App">
      <EdoContextProvider>
        <KeyboardSettingsContextProvider>
          <KeyboardContainer/>
        </KeyboardSettingsContextProvider>
      </EdoContextProvider>
    </div>
  );
}
