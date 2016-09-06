import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as categoryActions from '../actions/category';

class CategoryPage extends Component {
  render() {
    const {
      children, location, categoryActions, subjectList, categoryList,
      activeTab, priceOrder, type, categoryId
    } = this.props;

    return (
      <div>
        {children && React.cloneElement(children, {
          key: location.pathname,
          categoryActions,
          subjectList,
          categoryList,
          activeTab,
          priceOrder,
          type,
          categoryId
        })}
      </div>
    );
  }
}

CategoryPage.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  entity: PropTypes.object,
  categoryActions: PropTypes.object,
  subjectList: PropTypes.object,
  categoryList: PropTypes.object,
  productPagination: PropTypes.object,
  activeTab: PropTypes.string,
  priceOrder: PropTypes.string,
  selectedProduct: PropTypes.string,
  fromType: PropTypes.string,
  categoryId: PropTypes.number,
  productDetail: PropTypes.object,
  skuId: PropTypes.string,
  view: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  // categoryId = 类目id,fromType = 来源(从分类进入|从主题进入)
  const {skuId, view, fromType, categoryId} = ownProps.params;
  const {
    entity: {subjectList, productDetail},
    category: {productPagination, categoryList, activeTab, priceOrder, selectedProduct},
  } = state;

  let objects = {
    subjectList,
    categoryList,
    productPagination,
    activeTab,
    priceOrder,
    fromType,
    categoryId,
    selectedProduct,
    productDetail: productDetail || {},
    skuId,
    view,
  };

  // const {entity} = state;
  // console.info(categoryId);

  return objects;
}

function mapDispatchToProps(dispatch) {
  return {
    categoryActions: bindActionCreators(categoryActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPage);

