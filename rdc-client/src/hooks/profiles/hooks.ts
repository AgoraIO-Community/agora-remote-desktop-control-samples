import { useContext } from 'react';
import { ProfilesContext } from './context';

export const useProfiles = () => {
  const profiles = useContext(ProfilesContext);
  return profiles;
};
