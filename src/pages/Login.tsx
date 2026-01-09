import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../utils/axios';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish: FormProps<LoginFormValues>['onFinish'] = (values: LoginFormValues) => {
    console.log('Form submitted:', values);
    instance.post('/login', values).then((response) => {
      if(response.data.token){
        localStorage.setItem('token', response.data.token);
        message.success('Login successful!');
        navigate('/');
      }else{
        message.error(response.data.message);
      }
    }).catch((error) => {
      message.error(error.response.data.message);
    });
  };

  const onFinishFailed: FormProps<LoginFormValues>['onFinishFailed'] = (errorInfo: any) => {
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
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
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
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
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
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 500 }}>
                Sign up
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
