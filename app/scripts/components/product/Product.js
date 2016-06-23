import React, {Component, PropTypes} from 'react';
import ProductSwiper from './ProductSwiper';

class Product extends Component {
  constructor(props, context) {
    super(props, context);
    this.selectProduct = this.selectProduct.bind(this);
  }

  componentDidMount() {
    const {productActions, skuId} = this.props;
    const {getProductDetail} = productActions;
    getProductDetail(skuId);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {productDetail} = nextProps;
    if (productDetail.skuId) {
      return true;
    }
    return false;
  }

  selectProduct() {
    const {productDetail} = this.props;
    const {skuName, skuId, bizPrice} = productDetail;
    this.context.router.push({
      pathname: '/',
      query: {
        skuName,
        skuId,
        bizPrice
      }
    });
  }

  render() {
    const {productDetail, view} = this.props;
    let {skuId, skuName, bizPrice, images, bigDetail} = productDetail;
    if (!skuId) {
      return null;
    }

    const items = images.map((item, index) => {
      return {id: index, src: item, title: ''}
    });

    if (bigDetail) {
      bigDetail = bigDetail.replace(/<script[^>]*?>[\s\S]*?<\/script>/ig, ''); //替换script标签
      bigDetail = bigDetail.replace(/<style[^>]*?>[\s\S]*?<\/style>/ig, ''); //替换style标签
      bigDetail = bigDetail.replace(/<(?!img)[^>]+>/ig, ''); //去掉除了 img 标签的所有标签
      bigDetail = bigDetail.replace(/\n/g, '');
    }
    /*eslint-disable react/no-danger*/
    return (
      <div>
        <article className="hb-wrap-mb">
          <ProductSwiper items={items}/>
          <section className="hb-product-title">
            <p className="text-truncate-2 f-lg">
              {skuName}
            </p>
            <div className="text-center h2 text-primary">￥{(bizPrice / 100).toFixed(2)}</div>
          </section>
          <section className="m-t-1">
            <h3 className="text-center f-lg">－ 商品详情 －</h3>
            <div className="hb-product-detail" dangerouslySetInnerHTML={{__html: bigDetail}}>
            </div>
          </section>
        </article>

        {
          view !== 'view' ? (
            <footer className="hb-footer-fixed">
              <button className="btn btn-block btn-primary btn-lg btn-flat" onTouchTap={this.selectProduct}>
                确认商品
              </button>
            </footer>
          ) : null
        }
      </div>
    );
  }
}

Product.contextTypes = {
  router: PropTypes.object.isRequired
};

Product.propTypes = {
  productActions: PropTypes.object,
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

export default Product;
