import {
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
  FAILURE_LOGIN,
  SET_AUTHRIZATION,
  REMOVE_CACHE,
  RESET_AUTHRIZATION,
  RESET_AUTHRIZATION_RESULT
} from '../constants/ActionTypes';

const defaultUserState = {
  isFetching: false,
  authrization: {},
  hasError: false,
  result: false
};

export default function user(state = defaultUserState, action) {
  switch (action.type) {
    case SET_AUTHRIZATION:
      return {
        ...state,
        authrization: action.user
      };
    case REQUEST_LOGIN:
      return {
        ...state,
        isFetching: true,
        authrization: {},
        hasError: false,
        result: false
      };
    case RECEIVE_LOGIN:
      return {
        ...state,
        isFetching: false,
        authrization: action.user,
        hasError: !!action.user.errcode,
        result: !!action.user.rs
      };
    case FAILURE_LOGIN:
      return {
        ...state,
        isFetching: false
      };
    case REMOVE_CACHE:
      if (!action.isLogin) {
        return defaultUserState;
      }
      return state;
    case RESET_AUTHRIZATION:
      return defaultUserState;
    case RESET_AUTHRIZATION_RESULT:
      return {
        ...state,
        result: false
      };
    default:
      return state;
  }
}
