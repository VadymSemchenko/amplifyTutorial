/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Amplify from 'aws-amplify';
import React from 'react';

import config from './aws-exports';

Amplify.configure(config);

class AppWrapper extends React.Component {
    rerender = () => this.forceUpdate()
    render() {
      return <App rerender={this.rerender} />
    }
  }

  AppRegistry.registerComponent(appName, () => AppWrapper);
