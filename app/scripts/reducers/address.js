import {
  INIT_USER_ADD_LIST,
  SET_DEFAULT_ADDRESS,
  DELETE_ADDRESS,
  ADD_USER_ADDRESS,
  UPDATE_USER_ADDRESS
} from '../constants/AddressActionTypes';

/*eslint-disable indent*/
export default function address(state = null, action) {
  state = state || [];
  let newState = state.concat();
  switch (action.type) {
    case INIT_USER_ADD_LIST:
      return action.state.concat();
    case SET_DEFAULT_ADDRESS:
    {
      const id = action.id;
      newState.forEach((item, index) => {
        if (item.id === id) {
          item.addressDefault = true;
        } else {
          item.addressDefault = false;
        }
      });
      return newState;
    }
    case DELETE_ADDRESS:
    {
      newState.splice(action.index, 1);
      return newState;
    }
    case ADD_USER_ADDRESS:
      newState.unshift(action.state)
      return newState;
    case UPDATE_USER_ADDRESS:
    {
      let _index = action.state.index;
      newState = newState.map((item, index) => {
        if (_index === index) {
          return action.state.addedAddress;
        }
        return item;
      });
      return newState;
    }
    default:
      return state;
  }
}
