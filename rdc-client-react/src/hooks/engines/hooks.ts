import { useContext } from 'react';
import { EnginesContext } from './context';

export const useEngines = () => {
  const context = useContext(EnginesContext);
  return context;
};
