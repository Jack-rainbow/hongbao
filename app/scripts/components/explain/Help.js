import React, {Component, PropTypes} from 'react';

// 帮助
class Help extends Component {

  componentDidMount() {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }

  componentWillUnmount() {
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
  }

  render() {
    return (
      <div className="hb-help-panel">
        <h3>常见问题</h3>
        <h4>Q1：付款成功后，不小心关掉了页面，未成功发起红包怎么办？</h4>
        <p>
          在【我的红包】-【我发出的红包】-【发起记录】找到对应的商品，在支付成功后的24小时内可再次发起红包，
          <span className="text-primary">24小时后红包过期可申请退款（需扣除手续费）或继续发送。</span>
        </p>
        <h4>Q2：红包未被领取怎么办？</h4>
        <p>
          京东红包在发出后的24小时后未被领取，发起者可再次发起红包活动，或者可申请退款（需扣除手续费），期间已被领取的现金红包仍然有效。
        </p>
        <h4>Q3：何种情况下可申请退款？</h4>
        <ol className="text-muted">
          <li>京东红包实物商品未在指定时间内被领取的；</li>
          <li>抽中实物的用户未在指定期限内填写提交配送信息的；</li>
        </ol>

        <h4>Q4：退款为什么不是全额退款？</h4>
        <p>退款时需扣除平台提供的服务费，服务费收取规则如下：</p>

        <table>
          <tbody>
          <tr>
            <td width="213">商品价格区间</td>
            <td width="213">服务费</td>
          </tr>
          <tr>
            <td width="213">0~113元（含）</td>
            <td width="213">商品价格*8.5%+运费</td>
          </tr>
          <tr>
            <td width="213">113元~2180元（含）</td>
            <td width="213">商品价格*8.5%</td>
          </tr>
          <tr>
            <td width="213">2180元以上</td>
            <td width="213">180元</td>
          </tr>
          </tbody>
        </table>

        <h4>Q5：抢得的红包如何领取？</h4>
        <p>领取实物红包可点击领取实物奖品，填写收货地址，由京东商城配送；领取现金红包需下载安装京东钱包，
        并用抢红包时的京东账号登陆，点击账号余额查看。</p>

        <h4>Q6：同一个红包，对方只能领一次吗？</h4>
        <p>同一个红包发送给好友，好友仅能领取一次。</p>
        <h4>Q7：中得实物商品后逾期未填写收货地址怎么办？</h4>
        <p>
          中得实物奖品后用户需<span className="text-primary">15</span>天内未填写收货地址，逾期未填写或者收货信息错误的，实物商品将失效无法再被领取。
        </p>

        <h4>Q8：中得实物商品并收货后可以申请退货么？</h4>
        <p>商品一经领取，一概不能退货。</p>
        <h4>Q9：实物商品出现质量问题怎么办？</h4>
        <p>用户通过参与京东红包获得的商品，享受该商品生产厂家提供的三包服务，具体三包规定以该商品生产厂家公布的为准。
        用户获得的实物红包商品不支持换货，若出现严重质量问题，可联系客服95118协商处理。
        </p>

        <h4>Q10：如何发起红包？</h4>
        <p>方法一：打开“京东钱包”，点击【生活】->【京东红包】，选择商品并填写红包个数，选择发送给微信好友/群；</p>
        <p>方法二：打开“京东钱包微信公众号”，点击底部菜单“京东红包”，选择商品并填写红包个数，选择发送给微信好友/群。</p>
        <h4>Q11：红包提现何时到账？</h4>
        <p>成功申请提现后两小时内到账。</p>
        <h4>Q12：现金红包有哪些用途？</h4>
        <p>现金红包可提现，也可以参与夺宝吧、话费充值、信用卡还款等。</p>

      </div>
    );
  }
}

export default Help;
