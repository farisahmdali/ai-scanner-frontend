import { Result, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Go Back
            </Button>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate('/resumes')}
              size="large"
            >
              Back to Home
            </Button>
          </Space>
        }
      />
    </div>
  );
}

export default NotFound;
