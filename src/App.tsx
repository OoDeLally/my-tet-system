import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import './App.css';


const OCTAVE_DIVISIONS = 12;
const BASE_FREQUENCY = 16.35;
const BASE_NOTE = 'C';

const INTERVAL_FACTOR = Math.pow(2, 1 / OCTAVE_DIVISIONS);


const getNoteName = (intervalNum: number) => {
  const octaveNum = Math.floor(intervalNum / OCTAVE_DIVISIONS);
  const note = String.fromCharCode(BASE_NOTE.charCodeAt(0) + (intervalNum % OCTAVE_DIVISIONS));
  return `${note}${octaveNum}`;
};

const getIntervalNum = (note: string) => {
  const octaveNum = +note[1];
  const letter = note[0];
  const rest = letter.charCodeAt(0) - BASE_NOTE.charCodeAt(0);
  return OCTAVE_DIVISIONS * octaveNum + rest;
};

const getFrequency = (note: string) => {
  return BASE_FREQUENCY * Math.pow(INTERVAL_FACTOR, getIntervalNum(note));
}



const audioContext = new window.AudioContext();


const NoteKey: React.FC<NoteKeyProps> = ({ note }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const gainNode = useMemo(
    () => {
      const node = audioContext.createGain();
      node.connect(audioContext.destination);
      node.gain.value = 0;
      return node;
    },
    [],
  );
  useEffect(
    () => {
      const osc = audioContext.createOscillator();
      osc.frequency.value = getFrequency(note);
      osc.connect(gainNode);
      osc.start();
    },
    [note, gainNode],
  );
  const start = useCallback(() => {
    audioContext.resume();
    gainNode.gain.setTargetAtTime(0.2, audioContext.currentTime, 0.05);
    setIsPlaying(true);
  }, [gainNode, setIsPlaying]);
  const stop = useCallback(() => {
    gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
    setIsPlaying(false);
  }, [gainNode, setIsPlaying]);
  return (
    <button
      className={classNames('note-key', isPlaying && 'playing')}
      onMouseDown={start}
      onMouseOut={stop}
      onMouseUp={stop}
    >
      {note}
    </button>
  );
}

interface NoteKeyProps {
  note: string;
}



export default () => {
  const intervalCountOffset = OCTAVE_DIVISIONS * 2; // 3 octaves;
  const octaveCount = 5;

  const whiteNotes = [];
  {
    const end = intervalCountOffset + OCTAVE_DIVISIONS * octaveCount + 1;
    for (let d = intervalCountOffset; d < end; d += 2) {
      whiteNotes.push(
        <NoteKey key={d} note={getNoteName(d)} />
      );
    }
  }
  const blackNotes = [];
  {
    const end = intervalCountOffset + OCTAVE_DIVISIONS * octaveCount;
    for (let d = intervalCountOffset + 1; d < end; d += 2) {
      blackNotes.push(
        <NoteKey key={d} note={getNoteName(d)} />
      );
    }
  }

  return (
    <div className="App">
      <div className="black-row">
        { blackNotes }
      </div>
      <div className="white-row">
        { whiteNotes }
      </div>
    </div>
  );
}
