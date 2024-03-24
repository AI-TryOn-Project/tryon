import React from 'react';
import { Input } from 'antd';
import './index.less';
const CustomInput = ({labelName, labelStyle, inputStyle, labelMargin, ...props }) => {
  const labelStyles = { ...labelStyle, marginRight: labelMargin };
  return (
    <div>
      <label style={labelStyles}>{labelName}</label>
      <Input {...props} style={inputStyle} />
    </div>
  );
};

export default CustomInput;
