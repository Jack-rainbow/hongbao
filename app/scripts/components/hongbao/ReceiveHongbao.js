import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import offset from 'perfect-dom/lib/offset';
import perfect from '../../utils/perfect';

class ReceiveHongbao extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: 'received', // received 已收红包， luck 手气最佳
    };
    this.switchTab = this.switchTab.bind(this);
  }

  componentDidMount() {
    this.loadData();
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

  loadData() {
    const {hongbaoActions, thirdAccId, accountType} = this.props;
    const body = {
      accountType: accountType || perfect.getAccountType(),
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
      this.adjustArrow();
      this.loadData();
    });
  }

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
    this.refs.arrow.style.left = `${xy.left + width / 2 - 8}px`;
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
  getStatus({status, giftAmount, giftType, skuIcon}) {
    if (giftType === 'CASH') {
      return (
        <div>
          {(giftAmount / 100).toFixed(2)}元
        </div>
      );
    }

    switch (status) {
      case 'PAY_SUCC':
        return (
          <div className="hb-img-text-thumb">
            <img src={skuIcon} alt=""/>
            <div className="label-text bg-primary">未领取</div>
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div className="hb-img-text-thumb">
            <img src={skuIcon} alt=""/>
            <div className="label-text bg-info">已领取</div>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="hb-img-text-thumb">
            <img src={skuIcon} alt=""/>
            <div className="label-text bg-muted">已过期</div>
          </div>
        );
      default:
        return null;
    }
  }

  renderItem(item) {
    let {identifier, skuIcon, createdDate, giftAmount, status, giftType, thirdAccountUserInfoDtoList} = item;
    let nickName;
    if (thirdAccountUserInfoDtoList && thirdAccountUserInfoDtoList.length > 0) {
      nickName = thirdAccountUserInfoDtoList[0].nickName;
    }
    let {thirdAccId, accountType} = this.props;
    accountType = accountType || perfect.getAccountType();
    let link = `/hongbao/detail/${identifier}?accountType=${accountType}`;
    if (thirdAccId) {
      link += `&thirdAccId=${thirdAccId}`;
    }
    return (
      <li key={identifier}>
        <Link to={link} className="hb-link-block row flex-items-middle">
          <div className="col-18">
            <div className="text-truncate">{nickName}</div>
            <div className="text-muted f-sm">{perfect.formatDate(createdDate)}</div>
          </div>
          <div className="col-6 text-right">
            {this.getStatus({status, giftAmount, giftType, skuIcon})}
          </div>
        </Link>
      </li>
    );
  }

  //渲染列表
  renderList() {
    const {
      receivePagination
    } = this.props;

    const list = receivePagination.list;

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

    return (
      <section className="m-t-1">
        <div className="arrow-hollow-top hb-arrows-active" ref="arrow"></div>
        <ul className="hb-list">
          {
            list ? list.map((item) => {
              return this.renderItem(item);
            }) : null
          }
        </ul>
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
            <button className="btn btn-primary btn-sm hb-fillet-1">去京东钱包提现</button>
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
  thirdAccId: PropTypes.string,
  accountType: PropTypes.string,
};

export default ReceiveHongbao;
