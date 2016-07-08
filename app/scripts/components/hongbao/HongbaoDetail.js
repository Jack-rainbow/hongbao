import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import deviceEnv from 'jd-wallet-sdk/lib/utils/device-env';
import Loading from '../../ui/Loading';
import perfect from '../../utils/perfect';
import Unpack from './Unpack';
import {HONGBAO_TITLE} from '../../constants/common';
import HongbaoSelfInfo from './HongbaoSelfInfo';
import HongbaoGainedList from './HongbaoGainedList';
import Initiate from '../home/Initiate';

// 红包详情
class HongbaoDetail extends Component {
  constructor(props, context) {
    super(props, context);
    const href = location.href;
    const isUnPack = href.indexOf('/unpack') !== -1;
    const thirdAccId = perfect.getThirdAccId();
    let isAuthorize = true;
    if (deviceEnv.inWx) {
      isAuthorize = Boolean(thirdAccId);
    }
    this.state = {
      showFoot: false,
      unpack: isUnPack,
      detail: isUnPack ? 'none' : 'block',
      sponsorGoal: 'new',
      showInitiate: false,
      isAuthorize// 在微信中是否授权
    };

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.reSponsor = this.reSponsor.bind(this);
    this.closeHongbao = this.closeHongbao.bind(this);
    this.closeUnpack = this.closeUnpack.bind(this);
  }

  componentWillMount() {
    if (!this.state.isAuthorize) {
      return;
    }
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, 150);

    //加载红包详情
    const {hongbaoDetailAction, identifier} = this.props;
    const accountType = perfect.getAccountType();
    const thirdAccId = perfect.getThirdAccId();
    let body = {
      identifier,
      accountType,
      thirdAccId
    };

    hongbaoDetailAction.getHongbaoDetail(body)
      .then((json) => {
        const {res} = json || {};
        const {hongbaoInfo, redbagSelf} = res || {};
        const {giftGainedNum, giftNum, status} = hongbaoInfo || {};
        if (giftGainedNum < giftNum && redbagSelf && status === 'EXPIRED') {
          this.setState({
            sponsorGoal: 'again'
          });
        }
      });

    //滚动窗口显示底部 banner，停止隐藏
    /*window.addEventListener('touchstart', this.onTouchStart, false);
     window.addEventListener('touchmove', this.onTouchMove, false);
     window.addEventListener('touchend', this.onTouchEnd, false);*/
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hongbaoInfo} = nextProps;
    if (hongbaoInfo.skuId) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.onTouchStart, false);
    window.removeEventListener('touchmove', this.onTouchMove, false);
    window.removeEventListener('touchend', this.onTouchEnd, false);

    const {hongbaoDetailAction} = this.props;
    hongbaoDetailAction.clearHongbaoDetail();
    hongbaoDetailAction.clearParticipant();
  }

  onTouchStart(e) {
    const el = e.changedTouches[0];
    const pageY = el.pageY;
    this.pageY = pageY;
  }

  onTouchMove(e) {
    // 解决 Android bug 这会触发一次 touchstart， 一次 touchmove， touchend 不触发
    // http://www.imooc.com/video/9579
    //e.preventDefault();
    const el = e.changedTouches[0];
    const pageY = el.pageY;
    const offset = pageY - this.pageY;
    if (offset < -20 || offset > 20) {//向下滑动
      this.setState({
        showFoot: false
      });
    }
  }

  onTouchEnd(e) {
    this.setState({
      showFoot: true
    });
  }

  showDetail() {
    this.setState({
      detail: true
    });
  }

  //重新发起
  reSponsor() {
    const {sponsorGoal} = this.state;
    if (sponsorGoal === 'new') {
      this.context.router.replace('/');
    } else {
      this.setState({
        showInitiate: true
      });
    }
  }

  // 关闭发送红包
  closeHongbao() {
    this.setState({
      showInitiate: false
    });
  }

  // 关闭抢红包窗口
  closeUnpack() {
    this.setState({
      unpack: false
    });
  }

  /**
   * 根据红包状态码显示不同的进度条
   NEED_PAY 需要支付
   OK 可以
   RECEIVE_COMPLETE 红包被领取完成
   EXPIRED 红包过期
   FAIL 其他未知状态
   HAS_RECEIVE 已经领取过
   REDBAG_NOT_FOUND  红包不存在
   * @type {Array}
   */
  /*eslint-disable indent*/
  renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate}) {
    const momeyText = giftNum - goodsNum > 0 ? `，${giftNum - goodsNum}个现金红包` : '';
    switch (status) {
      case 'OK': //领取中
      case 'PAY_SUCC':
        return (
          <div className="m-l-1 text-muted">
            已领取{giftGainedNum}/{giftNum}，共{goodsNum}个奖品{momeyText}。
          </div>
        );
      case 'RECEIVE_COMPLETE':
        return (
          <div className="m-l-1 text-muted">共{goodsNum}个奖品{momeyText}。
            {perfect.formatMillisecond(finishedDate - createdDate)}抢光
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="m-l-1 text-muted">共{goodsNum}个奖品{momeyText}。该红包已过期</div>
        );
      case 'REFUNDED': //已退款
        return (
          <div className="m-l-1 text-muted">共{goodsNum}个奖品{momeyText}。该红包已退款</div>
        );
      default:
        return null;
    }
  }

  render() {
    const {
      hongbaoInfo, identifier, indexActions,
      hongbaoDetailAction, participantPagination, setModalCloseCallback, type
    } = this.props;

    /**
     skuId  String  商品SKU
     skuName  String  商品名称
     skuIcon  String  商品主图
     createdDate  Long  红包创建时间
     ownerHeadpic  String  红包发起者头像
     ownerNickname  String  红包发起者昵称
     title  String  红包标题
     giftAmount  Long  本人领取的红包金额
     goodsNum  Long  红包实物个数
     giftNum  Long  红包礼品总个数
     giftGainedNum  Long  红包礼品已领取个数
     status  String  红包状态
     */
    let {
      skuId, skuName, skuIcon, createdDate, finishedDate, ownerHeadpic, ownerNickname,
      title, goodsNum, giftNum, giftGainedNum, status, selfInfo, redbagSelf, refundStatus
    } = hongbaoInfo;

    title = title || HONGBAO_TITLE;

    if (!skuId) {
      return (
        <Loading/>
      );
    }

    const {giftRecordId} = selfInfo || {};
    const showDetail = this.showDetail;
    const unpackProps = {
      identifier, indexActions, showDetail,
      closeUnpack: this.closeUnpack, hongbaoDetailAction
    };
    const {unpack, detail, sponsorGoal, showInitiate} = this.state;

    const selfInfoProps = {
      selfInfo, giftRecordId, skuId, redbagSelf, refundStatus,
      identifier, indexActions, setModalCloseCallback, type
    };

    const gainedListProps = {
      hongbaoDetailAction, identifier, participantPagination
    };

    let initiateCom = null;
    if (sponsorGoal === 'again' && showInitiate) {
      const initiateProps = {
        skuName, title, identifier,
        status: 'true', skuIcon, closable: true,
        closeHongbao: this.closeHongbao
      };
      initiateCom = (
        <Initiate {...initiateProps}/>
      );
    }

    return (
      <div>
        {initiateCom}
        {unpack ? <Unpack {...unpackProps}/> : null}
        <article className="hb-wrap-mb" style={{display: detail}}>
          <section>
            <div className="hb-single m-t-1 m-b-1">
              <Link className="hb-link-block row flex-items-middle" to={`/product/detail/view/${skuId}`}>
                <div className="col-4">
                  <img className="img-fluid" src={skuIcon} alt=""/>
                </div>
                <div className="col-16">
                  <div className="text-truncate">{skuName}</div>
                  <div className="text-muted f-sm">发起时间：{perfect.formatDate(createdDate)}</div>
                </div>
              </Link>
            </div>

            <div className="text-center m-t-3">
              <div>
                <img className="img-circle img-thumbnail hb-figure"
                     src={ownerHeadpic} alt=""/>
              </div>
              <h3 className="m-t-2">{ownerNickname}的红包</h3>
              <p className="text-muted f-lg">{title}</p>
              <HongbaoSelfInfo {...selfInfoProps}/>
            </div>
          </section>

          <section className="m-t-3">
            {this.renderProgress({goodsNum, giftNum, giftGainedNum, status, createdDate, finishedDate})}
            {this.state.isAuthorize ? (<HongbaoGainedList {...gainedListProps}/>) : null}
          </section>
          {
            this.state.showFoot ? (
              <div className="hb-footer text-center"
                   onTouchTap={this.reSponsor}>
                <span className="hb-active-btn">{sponsorGoal === 'new' ? '我要发红包' : '继续发送'}</span>
              </div>
            ) : null
          }
        </article>
        <p className="text-center hb-logo-pos">
          <i className="hb-logo"></i>
        </p>
      </div>
    );
  }
}

HongbaoDetail.contextTypes = {
  router: PropTypes.object.isRequired
};

HongbaoDetail.propTypes = {
  identifier: PropTypes.string,
  hongbaoInfo: PropTypes.object,
  participantPagination: PropTypes.object,
  hongbaoDetailAction: PropTypes.object,
  indexActions: PropTypes.object,
  setModalCloseCallback: PropTypes.func,
  type: PropTypes.string
};

export default HongbaoDetail;
