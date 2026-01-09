import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../utils/axios';

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish: FormProps<RegisterFormValues>['onFinish'] = (values: RegisterFormValues) => {
    console.log('Form submitted:', values);
    instance.post('/register', values).then((response) => {
      if(response.data.created){
        message.success('Registration successful!');
        navigate('/login');
      }else{
        message.error(response.data.message);
      }
    }).catch((error) => {
      console.log(error.response.data.message);
      message.error( error.response.data.message);
    });
  };

  const onFinishFailed: FormProps<RegisterFormValues>['onFinishFailed'] = (errorInfo: any) => {
    console.log('Validation failed:', errorInfo);
    message.error('Please fill in all required fields correctly');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Create an Account
          </Title>
          <Text type="secondary">Sign up to get started</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter your full name',
              },
              {
                whitespace: true,
                message: 'Name cannot be empty',
              },
              {
                min: 3,
                message: 'Name must be at least 3 characters',
              }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please enter your email address',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password (min. 6 characters)"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 500 }}>
                Sign in
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
