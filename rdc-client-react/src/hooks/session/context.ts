import { createContext } from 'react';
import { Session } from '../../api';

export const SessionContext = createContext<Session | undefined>(undefined);
