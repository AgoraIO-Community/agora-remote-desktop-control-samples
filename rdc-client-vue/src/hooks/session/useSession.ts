import { inject, ref, Ref } from 'vue';
import { Session } from '../../api';

export const useSession = (): Ref<Session | undefined> => {
  const session = ref(inject<Session>('session'));
  return session;
};
