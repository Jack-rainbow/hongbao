import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import walletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import {setSessionStorage, getSessionStorage} from '../utils/sessionStorage';
import * as cacheActions from '../actions/caches';
import * as indexActions from '../actions/index';
import perfect from '../utils/perfect';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.setClientInfo = this.setClientInfo.bind(this);
  }

  //跳转到设置客户端信息
  setClientInfo(callback) {
    //如果不在京东钱包中打开,直接调用回调函数
    if (!deviceEnv.inJdWallet) {
      return callback(true);
    }

    let clientInfo = getSessionStorage('clientInfo');
    clientInfo = perfect.parseJSON(clientInfo) || {};

    walletApi.getClientInfo((info) => {
      info = perfect.parseJSON(info) || {};
      //如果没有设置clientInfo 或者 auth 过期，则需重新设置

      if (!clientInfo.auth || info.auth !== clientInfo.auth) {
        if (info.auth && String(info.isLogin) === '1') {
          this.updateClientInfo(info, callback);
        } else {
          this.login(callback);
        }
      } else {
        this.executeCallback(callback, true);
      }
    });
  }

  //登录
  login(callback) {
    walletApi.login(() => {
      // 再一次的检测，如果登录失败或没有登录，需跳回到首页
      walletApi.getClientInfo((info) => {
        info = perfect.parseJSON(info) || {};
        if (info.auth && String(info.isLogin) === '1') {
          //登录成功后
          this.updateClientInfo(info, callback);
        } else {
          this.executeCallback(callback, false);
        }
      });
    });
  }

  // 更新钱包客户端信息
  updateClientInfo(info, callback) {
    //处理一下 Android 和 ios 数据类型不一致的问题
    info.isLogin = String(info.isLogin);
    info.isRealName = String(info.isRealName);
    setSessionStorage('clientInfo', perfect.stringifyJSON(info));
    this.executeCallback(callback, true);
  }

  //执行回调
  executeCallback(callback, isLogin, delay) {
    if (callback && typeof callback === 'function') {
      if (delay) {
        setTimeout(() => {
          callback(isLogin);
        }, 50);
      } else {
        callback(isLogin);
      }
    }
  }

  render() {
    const {
      children, location, caches, cacheActions, errorMessage, indexActions
    } = this.props;

    return (
      <div>
        {children && React.cloneElement(children, {
          key: location.pathname,
          caches,
          cacheActions,
          errorMessage,
          indexActions,
          setClientInfo: this.setClientInfo
        })}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  cacheActions: PropTypes.object,
  caches: PropTypes.object,
  errorMessage: PropTypes.string,
  indexActions: PropTypes.object
};

function mapStateToProps(state) {
  const {caches, errorMessage} = state;
  return {
    caches,
    errorMessage
  };
}

function mapDispatchToProps(dispatch) {
  return {
    cacheActions: bindActionCreators(cacheActions, dispatch),
    indexActions: bindActionCreators(indexActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
