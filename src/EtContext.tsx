import React, { ReactNode, useCallback, useContext, useRef } from 'react';
import { ArrayParam, NumberParam, useQueryParam } from 'use-query-params';

import { useShallowMemoizedObject } from './hooks';
import { QUERY_PARAM_BASE_FREQUENCY, QUERY_PARAM_NOTES } from './queryParams';
import { isEqual } from 'lodash';



export const CENTS_IN_OCTAVE = 1200;
export const DEFAUL_BASE_FREQUENCY = 16.35; // C0
export const INTERCENT_FACTOR = Math.pow(2, 1 / CENTS_IN_OCTAVE);


const DEFAULT_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];
const EMPTY_NOTES: string[] = [];


interface EtContextProps {
  baseFrequency: number;
  notes: string[];
  degreeCountPerOctave: number;
  degreeSizeInCents: number;
  touched: boolean;
  setBaseFrequency: (baseFrequency: number) => void;
  setNotes: (notes: string[]) => void;
  getNoteName: (cents: number) => string;
  // parseNote('C4') => ['C', 4, 0]
  // parseNote('D4') => ['D', 4, 1]
  parseNote: (note: string) => readonly [string, number, number];
  getCent: (note: string) => number;
  getFrequency: (note: string) => number;
  reset: () => void;
}


const EtReactContext = React.createContext<EtContextProps | null>(null);


export const useEtContext = () =>
  useContext(EtReactContext)!;


export const EtContextProvider = ({ children }: EtContextProviderProps) => {
  const [
    baseFrequency = DEFAUL_BASE_FREQUENCY,
    setBaseFrequency,
  ] = useQueryParam(QUERY_PARAM_BASE_FREQUENCY, NumberParam);
  const [notesParam, setNotes] = useQueryParam(QUERY_PARAM_NOTES, ArrayParam);
  const touchedRef = useRef(false);
  const notes = notesParam || (touchedRef.current ? EMPTY_NOTES : DEFAULT_NOTES);

  const degreeSizeInCents = CENTS_IN_OCTAVE / notes.length;

  const handleSetNotes = useCallback(
    (newNotes: string[]) => {
      if (!isEqual(newNotes, notes)) {
        touchedRef.current = true;
        setNotes(newNotes);
      }
    },
    [setNotes, notes],
  );

  const handleSetBaseFrequency = useCallback(
    (frequency: number) => {
      touchedRef.current = true;
      setBaseFrequency(frequency);
    },
    [setBaseFrequency],
  );

  const getNoteName = useCallback(
    (cents: number) => {
      const roundedCents = Math.round(cents);
      const octaveNum = Math.floor(roundedCents / CENTS_IN_OCTAVE);
      const degree = (roundedCents % CENTS_IN_OCTAVE) / degreeSizeInCents;
      const note = notes[Math.round(degree)];
      if (!note) {
        throw new Error(`Could not find name for degree ${degree}`);
      }
      return `${note}${octaveNum}`;
    },
    [notes, degreeSizeInCents],
  );

  const parseNote = useCallback(
    (note: string) => {
      const match = note.match(/^([^0-9 ]+)([0-9]+)$/);
      if (!match) {
        throw new Error(`Could not parse note ${note}`);
      }
      const [, degreeName, octaveNum] = match;
      const degreeIndex = notes.findIndex(v => v === degreeName);
      if (degreeIndex === -1) {
        throw new Error(`Could not find note name ${note}`);
      }
      return [degreeName, +octaveNum, degreeIndex] as const;
    },
    [notes],
  );

  const getCent = useCallback(
    (note: string) => {
      const [, octaveNum, noteDegree] = parseNote(note);
      return CENTS_IN_OCTAVE * octaveNum + noteDegree * degreeSizeInCents;
    },
    [degreeSizeInCents, parseNote],
  );

  const getFrequency = useCallback(
    (note: string) => {
      return baseFrequency * Math.pow(INTERCENT_FACTOR, getCent(note));
    },
    [getCent, baseFrequency],
  );

  const reset = useCallback(
    () => {
      touchedRef.current = false;
      setNotes(undefined);
      setBaseFrequency(undefined);
    },
    [setNotes, setBaseFrequency],
  );

  const contextProps = useShallowMemoizedObject({
    notes,
    setNotes: handleSetNotes,
    baseFrequency,
    setBaseFrequency: handleSetBaseFrequency,
    degreeCountPerOctave: notes.length,
    degreeSizeInCents,
    getNoteName,
    parseNote,
    getCent,
    getFrequency,
    reset,
    touched: touchedRef.current,
  });

  return (
    <EtReactContext.Provider value={contextProps}>
      {children}
    </EtReactContext.Provider>
  );
};


interface EtContextProviderProps {
  children: ReactNode;
}
