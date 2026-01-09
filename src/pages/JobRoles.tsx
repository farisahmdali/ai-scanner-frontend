import { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Modal,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import instance from '../utils/axios';

const { Title } = Typography;

interface JobRole {
  id: string;
  name: string;
  skills: string[];
}

interface JobRoleFormValues {
  name: string;
  skills: string;
}

function JobRoles() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  const fetchJobRoles = () => {
    instance.get('/job-roles').then((response) => {
      if(response.data.jobRoles){
        setJobRoles(response.data.jobRoles);
      }
    });
  }

  useEffect(() => {
    fetchJobRoles();
  }, []);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: JobRole) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      skills: record.skills.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    instance.delete(`/job-roles/${id}`).then((response) => {
      if(response.data.jobRole){
        fetchJobRoles();
        message.success('Job role deleted successfully');
      }
    });
  };

  const handleSubmit = (values: JobRoleFormValues) => {
    // Parse skills from comma-separated string
    const skillsArray = values.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    if (skillsArray.length === 0) {
      message.warning('Please add at least one skill');
      return;
    }
    
    if (editingRole) {
      instance.patch(`/job-roles/${editingRole.id}`, {
        name: values.name,
        skills: skillsArray,
      }).then((response) => {
        if(response.data.jobRole){
          fetchJobRoles();
          message.success('Job role updated successfully');
        }
      });
    } else {
   
      instance.post('/job-roles', {
        name: values.name,
        skills: skillsArray,
      }).then((response) => {
        if(response.data.jobRole){
            fetchJobRoles();
            message.success('Job role added successfully');
        }
      });
     
    }

    form.resetFields();
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const columns: ColumnsType<JobRole> = [
    {
      title: 'Job Role',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Skills Required',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.map((skill, index) => (
            <Tag key={index} color="blue">
              {skill}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Job Role"
            description="Are you sure you want to delete this job role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Job Roles & Skills
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAdd}
          >
            Add Job Role
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={jobRoles}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} job roles`,
          }}
        />
      </Card>

      <Modal
        title={editingRole ? 'Edit Job Role' : 'Add New Job Role'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Job Role Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter job role name' },
              { whitespace: true, message: 'Job role name cannot be empty' },
            ]}
          >
            <Input
              placeholder="e.g., Software Engineer, Data Scientist"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Skills Required"
            name="skills"
            rules={[
              { required: true, message: 'Please enter at least one skill' },
            ]}
            extra="Enter skills separated by commas (e.g., C, C++, HTML, CSS, JavaScript)"
          >
            <Input.TextArea
              placeholder="C, C++, HTML, CSS, JavaScript, React"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {editingRole ? 'Update' : 'Add'} Job Role
              </Button>
              <Button onClick={handleCancel} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default JobRoles;
