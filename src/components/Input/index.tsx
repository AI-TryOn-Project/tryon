import React, { useState } from 'react';
import { Form, Input, InputNumber } from 'antd';
import './index.less';
const { Item } = Form;

const InlineLabelInput = ({ label, inputStyle, ...inputProps }) => {
  return (
    <Item
      // label={label}
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
      <InputNumber {...inputProps} style={{ ...inputStyle }}
        type="number"
        max={50}
        min={0}
        controls={false}
      />
    </Item>
  );
};

export default InlineLabelInput;
