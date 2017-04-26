import { CALL_HISTORY_METHOD } from './actions'

/**
 * This middleware captures CALL_HISTORY_METHOD actions to redirect to the
 * provided history object. This will prevent these actions from reaching your
 * reducer or any middleware that comes after this one.
 */
/*
	这个组件捕获action CALL_HISTORY_METHOD 
	并且注意没有调用next。也就是说这个action是不可能达到后面的中间件的。也不会到达reducer
*/
export default function routerMiddleware(history) {
  return () => next => action => {
    if (action.type !== CALL_HISTORY_METHOD) {
      return next(action)
    }

    const { payload: { method, args } } = action
    history[method](...args)
  }
}
