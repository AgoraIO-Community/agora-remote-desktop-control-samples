import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Landing from './pages/Landing';
import Session from './pages/Session';
import 'antd/dist/antd.min.css';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/" component={Landing} exact />
      <Route path="/session/:userId" component={Session} exact />
    </Switch>
  </HashRouter>
);

export default App;
