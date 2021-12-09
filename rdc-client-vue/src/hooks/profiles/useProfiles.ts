import { ref, inject } from 'vue';
import { Profile } from '../../api';

export const useProfiles = () => {
  const profiles = ref<Profile[] | undefined>(inject('profiles'));
  return profiles;
};
