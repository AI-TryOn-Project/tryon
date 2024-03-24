import React from 'react';
import { Button, Checkbox, Form, type FormProps, Input } from 'antd';
import CustomInput from '~src/components/Input';
import {bodyDimensions} from '~src/config';


const onFinish: FormProps["onFinish"] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps["onFinishFailed"] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const style={
  inputStyle:{ height: '20px', width: '100px',background: 'lightblue'},
  labelStyle:{ color: 'blue', fontWeight: 'bold' }
}


const App: React.FC = () => (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
  >
    {bodyDimensions.map(
      (dimension) => (
        <Form.Item
          key={dimension}
          name={dimension}
          rules={[{ required: true, message: `Please input your ${dimension}!` }]}
        >
          <CustomInput 
          labelName={dimension}
          labelMargin="10px"
          placeholder="请输入内容"
          {
            ...style
          }
          />
        </Form.Item>
      )
    
    )}
   

    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);

export default App;