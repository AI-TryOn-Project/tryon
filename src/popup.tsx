import { Provider } from "react-redux"

import { PersistGate } from "@plasmohq/redux-persist/integration/react"

import MainView from "~src/views/MainView"
import { persistor, store } from "~src/store/store"

function IndexPopup() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MainView />
      </PersistGate>
    </Provider>
  )
}

export default IndexPopup
