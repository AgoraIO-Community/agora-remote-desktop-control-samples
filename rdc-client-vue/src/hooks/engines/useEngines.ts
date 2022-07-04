import { inject } from 'vue';
import { Engines } from './interface';

export const useEngines = () => {
  const engines = inject<Engines>('engines');
  return engines;
};
