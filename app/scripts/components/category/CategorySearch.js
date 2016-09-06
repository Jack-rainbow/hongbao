import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';

//渲染商品分类搜索头
class CategorySearch extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showNavRight: false, //是否显示右侧分类
      isFocused: false //搜索输入框是否聚焦
    };
    this.showWishList = this.showWishList.bind(this);
    this.renderNavRight = this.renderNavRight.bind(this);
    this.showNavRight = this.showNavRight.bind(this);
    this.hideNavRight = this.hideNavRight.bind(this);
    this.searchInputFocus = this.searchInputFocus.bind(this);
    this.searchInputBlur = this.searchInputBlur.bind(this);
  }

  //显示心愿单
  showWishList() {
    this.context.router.push('/wishlist');
  }

  //显示隐藏右侧分类导航栏
  showNavRight() {
    this.setState({'showNavRight': true});
  }
  hideNavRight() {
    this.setState({'showNavRight': false});
  }

  //搜索框聚焦事件
  searchInputFocus(e) {
    const {searchInput} = this.refs;
    this.setState({'isFocused': true});
    searchInput.focus();
  }
  searchInputBlur() {
    const {searchInput} = this.refs;
    this.setState({'isFocused': false});
    searchInput.blur();
  }

  // 进入某一分类下的推荐商品页
  oneCateProduct(e, url, index) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    this.context.router.push(url);
  }

  //渲染右侧分类导航栏
  renderNavRight() {
    const {showNavRight} = this.state;

    if (!showNavRight) {
      return null;
    }

    const {categoryList} = this.props;
    const {ids, entity} = categoryList;

    return (
      <div className="cate-mask">
        <div className="cate-mask-wrap"
            onClick={this.hideNavRight}>
          <ul className="cate-nav-right cate-right">
            {
              ids ? ids.map((item, index) => {
                const cate = entity[item];
                const {categoryName, categoryIcon="../../images/category/icon-catelist-01.png"} = cate;

                return (
                  <li className="row" key={index}
                    onClick={(e) => this.oneCateProduct(e, `/category/${cate.id}`, index)}
                  >
                    <div className="col-5 cate-icon">
                      <img src={categoryIcon} alt={categoryName} />
                    </div>
                    <div className="col-19 text-left cate-name">{categoryName}</div>
                  </li>
                )
              }) : null
            }
          </ul>
        </div>
      </div>
    );
  }


  render() {
    const {isFocused} = this.state;
    const focusClass = classnames({
      'search-input': true,
      'col-17': !isFocused,
      'col-20': isFocused
    });
    const inputClass = classnames({
      'input-search': true,
      'p-a-0': isFocused
    })

    return (
      <div>
        <header className="cate-top-fixed">
          <div className="row header-wrap">
            <div className={focusClass}>
              {!isFocused?(<img className="icon-search" src="../../images/category/icon-search.png" />):null}
              <input type="text" className={inputClass} placeholder="搜索商品名称"
                     onClick={this.searchInputFocus}
                     ref="searchInput"
              />
              {isFocused?(<img className="icon-search-focus" src="../../images/category/icon-search-focus.png" />):null}
            </div>
            {
              !isFocused ? (<div className="icon-wishlist col-5 text-center"
                         onClick={this.showWishList}>
                <div><img src="../../images/category/icon-wish.png" alt="心愿单" /></div>
                <div>心愿单</div>
              </div>
              ) : null
            }
            {
              !isFocused ? (<div className="icon-category col-2 text-center"
                                 onClick={this.showNavRight}>
                <div><img src="../../images/category/icon-cate.png" alt="分类" /></div>
                <div>分类</div>
              </div>) : null
            }

            {isFocused?(<div
              className="icon-cancel col-4 text-center"
              style={{display: "block"}}
              onClick={this.searchInputBlur}
            >取消</div>):null}
          </div>
        </header>
        {this.renderNavRight()}
      </div>
    );
  }
}

CategorySearch.contextTypes = {
  router: PropTypes.object.isRequired
};

CategorySearch.propTypes = {
  categoryList: PropTypes.object,
};

export default CategorySearch;
