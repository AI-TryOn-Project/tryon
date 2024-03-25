import { createSlice } from "@reduxjs/toolkit"
export interface modeSliceState {
    showMin: boolean
}

const modeSlice = createSlice({
  name: "mode",
  initialState: { showMin: false },
  reducers: {
    changeMode(state, action) {
     state.showMin = action.payload
    },
  }
})

export const { changeMode } = modeSlice.actions

export default modeSlice.reducer
