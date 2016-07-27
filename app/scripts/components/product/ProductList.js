import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import PullToRefresh from 'reactjs-pull-to-refresh';
import base64 from 'js-base64';
import perfect from '../../utils/perfect'
import ProductCategory from './ProductCategory';

//图片
import noItems from '../../../images/no_items.png';

const {Base64} = base64;

class ProductList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showFoot: false,
    };

    this.handleChecked = this.handleChecked.bind(this);
    this.selectProduct = this.selectProduct.bind(this);

    this.refreshCallback = this.refreshCallback.bind(this);
    this.loadMoreCallback = this.loadMoreCallback.bind(this);
  }

  componentWillMount() {
    //延迟显示底部按钮，解决 IOS 下底部按钮设置 fixed 的问题
    setTimeout(() => {
      this.setState({
        showFoot: true
      });
    }, 300);
  }

  componentDidMount() {
    const {productActions} = this.props;
    const {getProductList, getCategoryList} = productActions;
    getCategoryList();
    getProductList();

    //添加下拉刷新相关事件
    window.addEventListener('touchstart', this.onTouchStart, false);
    window.addEventListener('scroll', this.onScroll, false);
  }

  // 下拉刷新回调函数
  refreshCallback() {
    const {productActions, priceOrder, activeCategory} = this.props;
    const {getProductList, clearSelectProduct} = productActions;
    clearSelectProduct();

    return getProductList({
      category: activeCategory,
      priceOrder
    }, true);

  }

  //加载更多
  loadMoreCallback() {
    const {
      productActions, activeCategory, priceOrder
    } = this.props;

    const {getProductList} = productActions;

    return getProductList({
      category: activeCategory,
      priceOrder
    });
  }

  // 选择商品
  handleChecked(skuId) {
    const {productActions} = this.props;
    productActions.selectProduct(skuId);
  }

  // 选择商品后点击确认
  selectProduct(e) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();

    const {selectedProduct} = this.props;
    if (!selectedProduct) {
      return;
    }

    //埋点
    perfect.setBuriedPoint('hongbao_product_confirm');

    const {
      productPagination: {entity}
    } = this.props;

    const {skuName, skuId, bizPrice, indexImg} = entity[selectedProduct];

    let detail = perfect.stringifyJSON({skuName, skuId, bizPrice, indexImg});
    detail = Base64.encode(detail);
    detail = encodeURIComponent(detail);
    //浏览器发送 http 请求数据时,会自动把 + 转换为空格,所以先对 + Unicode编码 为 %2B
    detail = detail.replace(/\+/g, '%2B');
    this.context.router.replace({
      pathname: '/',
      query: {
        detail,
      }
    });
  }

  // 进入商品详情
  productDetail(e, url, index) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    //埋点
    perfect.setBuriedPoint(`hongbao_product_goods_${index + 1}`);
    this.context.router.push(url);
  }

  renderProductItem(item, index) {
    let {skuId, skuName, indexImg, bizPrice, itemTag} = item;
    if (itemTag) {
      itemTag = itemTag.split(',');
    }

    const {selectedProduct} = this.props;
    return (
      <li key={skuId} className="row flex-items-middle">
        <div className="col-3 text-right p-y-1" onTouchTap={() => this.handleChecked(skuId)}>
          <i className={`hb-radio-gray${selectedProduct === skuId ? ' checked' : ''}`}></i>
        </div>
        <div className="col-4"
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <img className="img-fluid" src={indexImg} alt=""/>
        </div>
        <div className="col-14"
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <div className="text-truncate">{skuName}</div>
          <div className="f-sm hb-product-info">
            <span>¥ {(bizPrice / 100).toFixed(2)}</span>
            {
              itemTag && itemTag.map((item, index) => {
                let tagClass;
                /*eslint-disable indent*/
                switch (item) {
                  case '火爆':
                    tagClass = 'hb-product-tag-primary';
                    break;
                  case '新品':
                    tagClass = 'hb-product-tag-info';
                    break;
                  case '流行':
                    tagClass = 'hb-product-tag-success';
                    break;
                  default:
                    tagClass = '';
                }
                return (
                  <span key={index} className={`hb-product-tag ${tagClass}`}>{item}</span>
                );
              })
            }
          </div>
        </div>
        <div className="col-3 text-center"
             onClick={(e) => this.productDetail(e, `/product/detail/${skuId}`, index)}>
          <span className="arrow-hollow-right"></span>
        </div>
      </li>
    );
  }

  renderProduct() {
    const {
      productPagination
    } = this.props;

    const {ids, entity, lastPage} = productPagination;

    if (!ids) {
      return (
        <div className="page-loading">载入中，请稍后 ...</div>
      );
    } else if (ids.length === 0) {
      return (
        <div className="m-t-3">
          <img className="hb-no-items" src={noItems}/>
          <p className="m-t-2 text-center text-muted">暂无商品</p>
        </div>
      );
    }

    return (
      <PullToRefresh className="hb-main-panel"
                     refreshCallback={this.refreshCallback}
                     loadMoreCallback={this.loadMoreCallback}
                     hasMore={!lastPage}>
        <ul className="hb-list">
          {
            ids ? ids.map((item, index) => {
              return this.renderProductItem(entity[item], index);
            }) : null
          }
        </ul>
      </PullToRefresh>
    );
  }

  render() {
    const {
      selectedProduct, categoryList, activeCategory, priceOrder, productActions
    } = this.props;
    const {showFoot} = this.state;
    const btnDisabled = !selectedProduct;

    const categoryProps = {
      categoryList,
      activeCategory,
      priceOrder,
      productActions
    };
    return (
      <div>
        <ProductCategory {...categoryProps}/>
        {this.renderProduct()}
        {
          showFoot ? (
            <footer className="hb-footer-fixed" ref="footer">
              <button className="btn btn-block btn-primary btn-lg btn-flat"
                      disabled={btnDisabled}
                      onClick={this.selectProduct}>
                确认礼物
              </button>
            </footer>
          ) : null
        }
      </div>
    );
  }
}

ProductList.contextTypes = {
  router: PropTypes.object.isRequired
};

ProductList.propTypes = {
  productActions: PropTypes.object,
  productPagination: PropTypes.object,
  categoryList: PropTypes.object,
  activeCategory: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  priceOrder: PropTypes.string,
  selectedProduct: PropTypes.string,
};

export default ProductList;
