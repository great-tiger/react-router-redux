react-router-redux 解析
=================
react-router 为 react 提供路由功能，但是和redux没有任何关系。
react-router-redux 的作用有3个方面:   
1、就是把location信息,保存到store中。
2、当store中的location信息改变时，更新浏览器url
3、重写了history.listen方法。history.listen用来注册监听函数，当location改变时触发回调。    
被重写了的listen函数，通过判断store中的location信息是否改变来触发监听函数的。   

```
export default function syncHistoryWithStore(history, store, {
  selectLocationState = defaultSelectLocationState,
  adjustUrlOnReplay = true
} = {}) {
  // Ensure that the reducer is mounted on the store and functioning properly.
  // 使用syncHistoryWithStore,必须使用./reducer.js
  if (typeof selectLocationState(store.getState()) === 'undefined') {
    throw new Error('')
  }

  // If the store is replayed, update the URL in the browser to match.
  // 实现作用2
  if (adjustUrlOnReplay) {
    const handleStoreChange = () => {
      const locationInStore = getLocationInStore(true)
      if (currentLocation === locationInStore || initialLocation === locationInStore) {
        return
      }
      //更新浏览器url
      history.transitionTo({
        ...locationInStore,
        action: 'PUSH'
      })
    }
	
    unsubscribeFromStore = store.subscribe(handleStoreChange)
    handleStoreChange()
  }
  
  // 实现作用1
  // Whenever location changes, dispatch an action to get it in the store
  const handleLocationChange = (location) => {
    // Tell the store to update by dispatching an action
    // 保存location信息到redux
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: location
    })
  }
  unsubscribeFromHistory = history.listen(handleLocationChange)


  // The enhanced history uses store as source of truth
  return {
    ...history,
    // The listeners are subscribed to the store instead of history
    listen(listener) {
      // Copy of last location.
      let lastPublishedLocation = getLocationInStore(true)

      // Keep track of whether we unsubscribed, as Redux store
      // only applies changes in subscriptions on next dispatch
      let unsubscribed = false
      const unsubscribeFromStore = store.subscribe(() => {
        const currentLocation = getLocationInStore(true)
        if (currentLocation === lastPublishedLocation) {
          return
        }
        lastPublishedLocation = currentLocation
        if (!unsubscribed) {
          listener(lastPublishedLocation)
        }
      })

      // History 2.x listeners expect a synchronous call. Make the first call to the
      // listener after subscribing to the store, in case the listener causes a
      // location change (e.g. when it redirects)
      if (!history.getCurrentLocation) {
        listener(lastPublishedLocation)
      }

      // Let user unsubscribe later
      return () => {
        unsubscribed = true
        unsubscribeFromStore()
      }
    }
  }
}
```