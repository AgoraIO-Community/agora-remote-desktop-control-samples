import { createContext } from 'react';
import { Profile } from '../../api';

export const ProfilesContext = createContext<Profile[]>([]);
