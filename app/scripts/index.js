import React from 'react';
import {render} from 'react-dom';
import {useRouterHistory} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {syncHistoryWithStore} from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import promise from 'es6-promise';
import walletApi from 'jd-wallet-sdk';
import Root from './containers/Root';
import configureStore from './store';

import 'reactjs-modal/dist/styles/modal.css';
import '../styles/main.css';

// Promise 兼容性处理
promise.polyfill();

// 初始化 tapEvent 事件, 移动端
injectTapEventPlugin();

//初始化
walletApi.initGoBackListener();

// https://github.com/reactjs/react-router/blob/latest/docs/guides/Histories.md
const browserHistory = useRouterHistory(createBrowserHistory)({
  basename: '/m-hongbao'
});

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

render(
  <Root store={store} history={history}/>,
  document.getElementById('layout')
);
