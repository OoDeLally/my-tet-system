import React from 'react';

import { HIGHEST_OCTAVE_NUMBER, useKeyboardSettingsContext } from './KeyboardSettingsContext';
import { NumberInput } from './NumberInput';
import { useEtContext } from './EtContext';




export const KeyboardSettingsPanel = () => {
  const { degreeCountPerOctave } = useEtContext();
  const {
    startOctave, rangeSize,
    setStartOctave, setRangeSize,
  } = useKeyboardSettingsContext();


  return (
    <div className="keyboard-settings-panel">
      {
        degreeCountPerOctave > 0 && (
          <>
            <p>
              Show&nbsp;
              <NumberInput
                enableManualEdit={false}
                min={1}
                max={HIGHEST_OCTAVE_NUMBER - 1}
                initialValue={rangeSize}
                onChange={setRangeSize}
              />
              &nbsp;octaves starting from octave #
              <NumberInput
                enableManualEdit={false}
                min={1}
                max={HIGHEST_OCTAVE_NUMBER - 1}
                initialValue={startOctave}
                onChange={setStartOctave}
              />.
            </p>
          </>
        )
      }
    </div>
  );
};
