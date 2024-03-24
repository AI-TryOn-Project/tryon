import { persistor, store } from "~src/store/store"

persistor.subscribe(() => {
  console.log("State changed with: ", store?.getState())
})
