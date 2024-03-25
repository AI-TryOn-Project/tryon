import React from 'react';
import { Button, Checkbox, Form, type FormProps, Input } from 'antd';
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


const App: React.FC = () => (
  <div className='body-container'>
    <div className="tab-content-inner-bg tab-content-inner-bg-body">
      <Form
        name="basic"
        initialValues={{ remember: true }}
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
            // <Form.Item
            //   key={dimension}
            //   name={dimension}
            //   rules={[{ required: true, message: `Please input your ${dimension}!` }]}
            //   label={
            //     <label className='label'>{dimension}</label>
            //   }
            // >
            <CustomInput
              label={dimension}
              inputStyle={inputStyle}
            />
            // </Form.Item>
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
        onClick={() => { }}
      />
    </div>
  </div>

);

export default App;