import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import offset from 'perfect-dom/lib/offset';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import jdWalletApi from 'jd-wallet-sdk';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import ScrollLoad from '../../ui/ScrollLoad';
import classnames from 'classnames';
import perfect from '../../utils/perfect';
import {setSessionStorage} from '../../utils/sessionStorage';

class ReceiveHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'received', // received 已收红包， luck 手气最佳
    };
    this.switchTab = this.switchTab.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.reward = this.reward.bind(this);
  }

  componentDidMount() {
    this.adjustArrow();
    const {caches, cacheActions} = this.props;
    if (!caches.receivePagination) {
      cacheActions.addCache('receivePagination');
      this.loadMore();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      userInfo,
      receivePagination
    } = nextProps;

    if (userInfo.giftAndThirdAccUserInfoDto && receivePagination.list) {
      return true;
    }
    return false;
  }

  componentDidUpdate(nextProps, nextState) {
    this.adjustArrow();
  }

  //加载更多
  loadMore() {
    const {hongbaoActions} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    const body = {
      accountType,
      accountId: thirdAccId
    };

    if (this.state.type === 'luck') {
      body.lucky = 'LUCK';
    }
    hongbaoActions.getHongbaoList(body, 'receive');
  }

  //切换已收红包和手气最佳
  switchTab(e, type) {
    this.setState({
      type
    }, () => {
      const {hongbaoActions} = this.props;
      hongbaoActions.clearReceive();
      this.adjustArrow();
      this.loadMore();
    });
  }

  // 提现
  withdraw() {
    jdWalletApi.openModule({name: 'BALANCE'});
  }

  //兑奖
  reward({giftRecordId, skuId, identifier}) {
    setSessionStorage('skuId', skuId);
    setSessionStorage('giftRecordId', giftRecordId);
    setSessionStorage('identifier', identifier);
    this.context.router.push('/myaddress');
  }

  //调整已收红包和手气最佳箭头按钮
  adjustArrow() {
    const {type} = this.state;
    let tabEl;
    if (type === 'luck') {
      tabEl = this.refs.luckHb;
    } else {
      tabEl = this.refs.receivedHb;
    }

    const xy = offset(tabEl);
    const width = tabEl.clientWidth;
    if (this.refs.arrow) {
      this.refs.arrow.style.left = `${xy.left + width / 2 - 8}px`;
    }
  }

  /*eslint-disable indent*/
  /**
   * @param status
   // 初始化
   INIT("初始化"),
   // 等待支付
   WAIT_PAY("等待付款"),
   // 支付成功
   PAY_SUCC("支付成功"),
   // 领取完成
   RECEIVE_COMPLETE("领取完成"),
   // 过期
   EXPIRED("已过期"),
   //已退款
   REFUNDED("已退款"),
   //禁止退款
   FORBIDDEN_REFUND("禁止退款"),
   //红包全额退款
   REDBAGWHOLEREFUND("红包可全额退款"),
   //只有现金被领取实物可全退
   REDBAGGOODSREFOUND("红包实物可退款"),
   //红包实物可转发
   REDBAGGOODTRANSFER("红包实物可转发")
   * @param giftAmount
   * @param giftType
   * @param skuIcon
   * @returns {*}
   */
  getStatus({giftStatus, giftAmount, giftType, skuIcon, identifier, giftRecordId, skuId}) {
    const {type} = this.props;
    let link = `/hongbao/detail/${identifier}?type=${type}`;
    let isReward = false;
    let contentEl;
    if (giftType === 'CASH') {
      contentEl = (
        <div>
          {(giftAmount / 100).toFixed(2)}元
        </div>
      );
    } else {
      switch (giftStatus) {
        case 'GIVE_OUT':
          contentEl = (
            <div className="hb-img-text-thumb">
              <img src={skuIcon} alt=""/>
              <div className="label-text bg-info">已领取</div>
            </div>
          );
          break;
        case 'EXPIRED':
          contentEl = (
            <div className="hb-img-text-thumb">
              <img src={skuIcon} alt=""/>
              <div className="label-text bg-muted">已过期</div>
            </div>
          );
          break;
        default:
          isReward = true;
          contentEl = (
            <div className="hb-img-text-thumb">
              <img src={skuIcon} alt=""/>
              <div className="label-text bg-primary">去领取</div>
            </div>
          );
          break;
      }
    }

    if (isReward) {
      return (
        <div className="col-6 text-right" onTouchTap={() => this.reward({giftRecordId, skuId, identifier})}>
          {contentEl}
        </div>
      );
    }

    return (
      <div className="col-6 text-right">
        <Link to={link} className="hb-link-block">
          {contentEl}
        </Link>
      </div>
    );
  }

  renderItem(item) {
    const {type} = this.props;
    let {
      identifier, skuIcon, createdDate, giftAmount, giftStatus, giftType,
      thirdAccountUserInfoDtoList, giftRecordId, skuId
    } = item;
    let nickName;
    if (thirdAccountUserInfoDtoList && thirdAccountUserInfoDtoList.length > 0) {
      nickName = thirdAccountUserInfoDtoList[0].nickName;
    }
    let link = `/hongbao/detail/view/${identifier}?type=${type}`;
    return (
      <li className="row flex-items-middle" key={identifier}>
        <div className="col-18">
          <Link to={link} className="hb-link-block">
            <div className="text-truncate">{nickName}</div>
            <div className="text-muted f-sm">{perfect.formatDate(createdDate)}</div>
          </Link>
        </div>
        {this.getStatus({giftStatus, giftAmount, giftType, skuIcon, identifier, giftRecordId, skuId})}
      </li>
    );
  }

  //渲染列表
  renderList() {
    const {
      receivePagination
    } = this.props;

    let {list, isFetching, lastPage} = receivePagination;

    if (!list) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (list.length === 0) {
      return (
        <div className="m-t-3 text-center text-muted">
          没有记录
        </div>
      );
    }

    const {type} = this.state;
    return (
      <section className="m-t-1">
        <div className="arrow-hollow-top hb-arrows-active" ref="arrow"></div>
        <ReactCSSTransitionGroup
          component="div"
          transitionName="hb-opacity"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          <ScrollLoad loadMore={this.loadMore}
                      hasMore={!lastPage}
                      isLoading={isFetching}
                      className={classnames({loading: isFetching})}
                      loader={<div className=""></div>}
                      key={type}>
            <ul className="hb-list">
              {
                list ? list.map((item) => {
                  return this.renderItem(item);
                }) : null
              }
            </ul>
          </ScrollLoad>
        </ReactCSSTransitionGroup>
      </section>
    );
  }

  render() {
    const {type} = this.state;
    const {userInfo} = this.props;
    const {giftAndThirdAccUserInfoDto, redbagAssemblyRetDto} = userInfo;
    let {nickName, headpic} = (giftAndThirdAccUserInfoDto || {});

    let {gainCashBalance, gainGoodNum, gainNum} = (redbagAssemblyRetDto || {});
    if (gainCashBalance === undefined) {
      gainCashBalance = 0;
    }

    return (
      <div>
        <section className="text-center m-t-2">
          <div>
            <img className="img-circle img-thumbnail hb-figure" src={headpic} alt=""/>
          </div>
          <h3 className="m-t-1">{nickName}共收到</h3>
          <div className="h1">{(gainCashBalance / 100).toFixed(2)}</div>

          <div>
            {
              deviceEnv.inJdWallet ? (
                <button onTouchTap={this.withdraw} className="btn btn-primary btn-sm hb-fillet-1">去提现</button>
              ) : (
                <a href="https://qianbao.jd.com/p/page/download.htm?module=BALANCE"
                   className="btn btn-primary btn-sm hb-fillet-1">去京东钱包提现</a>
              )
            }
          </div>
        </section>

        <section className="row text-center m-t-1">
          <div className={`col-10 ${type === 'received' ? 'text-primary' : 'text-muted'}`}
               onTouchTap={(e) => this.switchTab(e, 'received')}>
            <div>已收红包</div>
            <div className="h1" ref="receivedHb">{gainNum}</div>
          </div>
          <div className={`col-10 offset-4 ${type === 'luck' ? 'text-primary' : 'text-muted'}`}
               onTouchTap={(e) => this.switchTab(e, 'luck')}>
            <div>手气最佳</div>
            <div className="h1" ref="luckHb">{gainGoodNum}</div>
          </div>
        </section>
        {this.renderList()}
      </div>
    );
  }
}

ReceiveHongbao.contextTypes = {
  router: PropTypes.object.isRequired
};

ReceiveHongbao.propTypes = {
  hongbaoActions: PropTypes.object,
  receivePagination: PropTypes.object,
  userInfo: PropTypes.object,
  caches: PropTypes.object,
  cacheActions: PropTypes.object,
  type: PropTypes.string
};

export default ReceiveHongbao;
