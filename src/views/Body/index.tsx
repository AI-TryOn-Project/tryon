import React from 'react';
import { Button, Checkbox, Form, type FormProps, Input } from 'antd';
import { useAppDispatch, useAppSelector } from "~src/store/store";
import type { Measurement, Measurements } from '~src/store/data-slice';

import CustomInput from '~src/components/Input';
import { bodyDimensions } from '~src/config';
import './index.less';
import BlueButton from '~src/components/Button';
import IconSize from '~resources/icon-size.svg';
const onFinish: FormProps["onFinish"] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps["onFinishFailed"] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const inputStyle = { height: '20px', width: '100px', opacity: '0.7' };


const App: React.FC = () => {
  const body_measurements = useAppSelector((state) => state.data.body_measurements);

  return (
    <div className='body-container'>
      <div className="tab-content-inner-bg tab-content-inner-bg-body">
        <Form
          name="basic"
          initialValues={{
            ...body_measurements
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          labelCol={
            {
              span: 1,
              offset: 12
            }
          }
          layout='horizontal'
        >
          {bodyDimensions.map(
            (dimension) => (
              <CustomInput
                label={dimension as Measurement}
                inputStyle={inputStyle}
              />
            )
          )}
        </Form>
      </div>
      <div className='bottom'>
        <BlueButton
          style={{
            height: '20px',
            width: '150px'
          }}
          iconStyle={{
            height: '11px',
            width: '16px'
          }}
          icon={IconSize}
          text='SIZE RECOMMENDATION'
          onClick={() => {
            // alert('Please enter all dimensions (Bust, Waist, Hips)');
          }}
        />
      </div>
    </div>

  );
};

export default App;