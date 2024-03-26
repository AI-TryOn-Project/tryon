import { createSlice } from "@reduxjs/toolkit"
export type Measurement = "bust" | "hips" | "waist";

export type Measurements = {
  [key in Measurement]: string;
};
export interface modeSliceState {
        base64_image:string,
        body_measurements:{
            bust:number|undefined,
            hips:number|undefined,
            waist:number|undefined
        }
}

const dataSlice = createSlice({
  name: "data",
  initialState: { 
    base64_image:'',
    body_measurements:{
        bust:undefined,
        hips:undefined,
        waist:undefined
    }
  },
  reducers: {
    changeImg(state, action) {
     state.base64_image = action.payload
    },
    changeBodyMeasurements(state,action:{
        type:string,
        payload:Measurements
    }){
        state.body_measurements = {
            ...state.body_measurements,
            ...action.payload
        }
    },
  },
  // https://juejin.cn/post/7101688098781659172
})

export const { changeImg,changeBodyMeasurements } = dataSlice.actions

export default dataSlice.reducer
