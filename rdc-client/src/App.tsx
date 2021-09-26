import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Landing from './pages/Landing';
import Host from './pages/Host';
import Controlled from './pages/Controlled';
import 'antd/dist/antd.css';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/" component={Landing} exact />
      <Route path="/host/:uid" component={Host} exact />
      <Route path="/controlled/:uid" component={Controlled} exact />
    </Switch>
  </HashRouter>
);

export default App;
