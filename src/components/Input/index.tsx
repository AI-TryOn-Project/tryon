import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from "~src/store/store";
import { changeBodyMeasurements } from '~src/store/data-slice';

import { Form, Input, InputNumber } from 'antd';
import './index.less';
import type { Measurement, Measurements } from '~src/store/data-slice';
const { Item } = Form;

type Iprops = {
  label: Measurement;
  inputStyle: any;
};
const InlineLabelInput = ({ label, inputStyle }: Iprops) => {
  const dispatch = useAppDispatch();
  const handleInput = (value: number) => {
    console.log(value, label);
    const obj = {};
    obj[label] = value;
    dispatch(changeBodyMeasurements(obj as Measurements));
  };
  return (
    <Item
      name={label}
      labelCol={{ flex: '0 0 auto' }}  // 控制label宽度自适应
      wrapperCol={{ flex: '1' }}         // 控制input占据剩余宽度
      style={{ display: 'flex', marginBottom: 0 }}
      label={
        <span style={{
          fontSize: '12px',
          color: '#0056B4',
          fontFamily: 'Abel'
        }}>{label}</span> // 在 label 上应用样式
      }
    // rules={[{ required: true }]}
    >
      <InputNumber style={{ ...inputStyle }}
        type="number"
        max={50}
        min={0}
        controls={false}
        onChange={handleInput}
      />
    </Item>
  );
};

export default InlineLabelInput;
