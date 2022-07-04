import { useRoute } from 'vue-router';
import { reactive } from 'vue';
import { Options } from '../../interfaces';

export const useOptions = <T extends Options>(): T => {
  const route = useRoute();
  const opts = route.query.opts as string;
  const options: T = reactive(JSON.parse(window.atob(opts)));
  return options;
};
