import { App } from 'vue';
import { SessionProvider, EnginesProvider, ProfilesProvider } from './components';

export * from './components';

export default {
  install: (app: App) => {
    SessionProvider.install(app);
    EnginesProvider.install(app);
    ProfilesProvider.install(app);
  },
};
