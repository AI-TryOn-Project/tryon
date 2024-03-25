import { createSlice } from "@reduxjs/toolkit"
import {CUR_TAB} from '../config/index'
export interface TabSliceState {
  curTab: CUR_TAB
}

const curTabSlice = createSlice({
  name: "curTab",
  initialState: { curTab: CUR_TAB.BODY },
  reducers: {
    changeTab(state, action) {
     state.curTab = action.payload
    },
  }
})

export const { changeTab } = curTabSlice.actions

export default curTabSlice.reducer
