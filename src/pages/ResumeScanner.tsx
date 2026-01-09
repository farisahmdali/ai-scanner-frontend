import { useState, useEffect } from 'react';
import {
  Upload,
  Card,
  Typography,
  Button,
  List,
  Tag,
  Space,
  message,
  Row,
  Col,
  Empty,
  Select,
  Descriptions,
  Divider,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import instance from '../utils/axios';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

interface ScannedResume {
  id: number;
  resume: string;
  createdAt: string;
  skills: string[];
  name: string;
  userId: number;
  email: string;
  phone: string;
  updatedAt: string;
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  userId: number;
  resume: string;
  createdAt: string;
  updatedAt: string;
}

interface JobRole {
  id: number;
  name: string;
  skills: string[];
}

function ResumeScanner() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const [scannedResumes, setScannedResumes] = useState<ScannedResume[]>([]);

  // Fetch job roles
  useEffect(() => {
    fetchJobRoles();
  }, []);

  const fetchJobRoles = async () => {
    setLoadingJobRoles(true);
    try {
      const response = await instance.get('/job-roles');
      if (response.data.jobRoles) {
        setJobRoles(response.data.jobRoles);
      }
    } catch (error: any) {
      console.error('Error fetching job roles:', error);
      message.error('Failed to load job roles');
    } finally {
      setLoadingJobRoles(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'resume',
    multiple: false,
    fileList,
    accept: '.pdf',
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      
      if (!isPDF) {
        message.error('You can only upload PDF documents!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file to upload');
      return;
    }

    if (!fileList[0].originFileObj) {
      message.error('File not found. Please select a file again.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', fileList[0].originFileObj as File);

    try {
      const response = await instance.post('/upload-resume', formData);

      if (response.data.message === 'Resume uploaded successfully' && response.data.applicant) {
        message.success('Resume uploaded and scanned successfully!');
        
        // Set applicant data and show details
        setApplicant(response.data.applicant);
        setUploadCompleted(true);
        
        setFileList([]);
      } else {
        message.error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(
        error?.response?.data?.message || 
        error?.message || 
        'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setUploadCompleted(false);
    setApplicant(null);
    setSelectedJobRole(null);
    setFileList([]);
  };

  const handleJobRoleSelect = (jobRoleId: string) => {
    const role = jobRoles.find(r => r.id.toString() === jobRoleId);
    setSelectedJobRole(role || null);
  };

  // Compare skills
  const compareSkills = () => {
    if (!applicant || !selectedJobRole) return null;

    const applicantSkills = applicant.skills.map(s => s.toLowerCase().trim());
    const requiredSkills = selectedJobRole.skills.map(s => s.toLowerCase().trim());
    
    const matchingSkills = requiredSkills.filter(skill => 
      applicantSkills.some(appSkill => appSkill==skill)
    );
    
    const missingSkills = requiredSkills.filter(skill => 
      !applicantSkills.some(appSkill => appSkill==skill)
    );

    return {
      matching: matchingSkills,
      missing: missingSkills,
      matchPercentage: (matchingSkills.length / requiredSkills.length) * 100,
    };
  };

  const skillComparison = compareSkills();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApplicants = async () => {
    const response = await instance.get('/applicants');
    if (response.data.applicants) {
      setScannedResumes(response.data.applicants);
    }
  };

  useEffect(() => {
    getApplicants();
  }, []);


  const handleDownload = (resume: ScannedResume) => {
    if(resume.resume){
      instance.get(`/uploads/${resume.resume}`, {
        responseType: 'blob',
      }).then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resume.resume;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }).catch((error) => {
        console.error('Download error:', error);
        message.error('Failed to download resume');
      });
    }
  };



  return (
    <div>
      <Title level={3} style={{ marginBottom: '12px' }}>
        Resume Scanner
      </Title>

      <Row gutter={[12, 12]}>
        {/* Left Side - Upload Section or Applicant Details */}
        <Col xs={24} lg={14}>
          {!uploadCompleted ? (
            <Card
              title={
                <Space size="small">
                  <UploadOutlined />
                  <span>Upload Resume</span>
                </Space>
              }
              size="small"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Dragger {...uploadProps} style={{ padding: '20px' }}>
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text" style={{ marginBottom: '4px', fontSize: '14px' }}>
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint" style={{ fontSize: '12px' }}>
                    PDF only, max 10MB
                  </p>
                </Dragger>

                {fileList.length > 0 && (
                  <div>
                    <Text strong style={{ fontSize: '13px' }}>Selected File:</Text>
                    <div style={{ marginTop: '4px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                      <Space size="small">
                        <FileTextOutlined />
                        <Text style={{ fontSize: '13px' }}>{fileList[0].name}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ({(fileList[0].size! / 1024 / 1024).toFixed(2)} MB)
                        </Text>
                      </Space>
                    </div>
                  </div>
                )}

                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={fileList.length === 0}
                  block
                  size="middle"
                >
                  {uploading ? 'Uploading...' : 'Upload & Scan Resume'}
                </Button>
              </Space>
            </Card>
          ) : (
            <Card
              title={
                <Space size="small">
                  <UserOutlined />
                  <span>Applicant Details</span>
                </Space>
              }
              extra={
                <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>
                  New Upload
                </Button>
              }
              size="small"
              style={{ height: '100%' }}
            >
              {applicant && (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Descriptions bordered size="small" column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label={<Space size="small"><UserOutlined style={{ fontSize: '12px' }} />Name</Space>}>
                      <Text style={{ fontSize: '13px' }}>{applicant.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space size="small"><MailOutlined style={{ fontSize: '12px' }} />Email</Space>}>
                      <Text style={{ fontSize: '13px' }}>{applicant.email}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space size="small"><PhoneOutlined style={{ fontSize: '12px' }} />Phone</Space>}>
                      <Text style={{ fontSize: '13px' }}>{applicant.phone}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Uploaded At">
                      <Text style={{ fontSize: '13px' }}>{formatDate(applicant.createdAt)}</Text>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider style={{ margin: '8px 0' }}>Skills Extracted</Divider>
                  
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <Space wrap size={[4, 4]}>
                      {applicant.skills.map((skill, index) => (
                        <Tag key={index} color="blue" style={{ margin: '2px', fontSize: '12px' }}>{skill}</Tag>
                      ))}
                    </Space>
                  </div>

                  <Divider style={{ margin: '8px 0' }}>Check Job Roles</Divider>

                  <Select
                    placeholder="Select job role to compare"
                    style={{ width: '100%' }}
                    size="middle"
                    loading={loadingJobRoles}
                    onChange={handleJobRoleSelect}
                    value={selectedJobRole?.id.toString()}
                  >
                    {jobRoles.map((role) => (
                      <Option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>

                  {selectedJobRole && skillComparison && (
                    <Card size="small" style={{ marginTop: '8px' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text strong style={{ fontSize: '13px' }}>Job Role: </Text>
                          <Text style={{ fontSize: '13px' }}>{selectedJobRole.name}</Text>
                        </div>
                        
                        <Alert
                          message={`Match: ${skillComparison.matchPercentage.toFixed(1)}%`}
                          description={`${skillComparison.matching.length}/${selectedJobRole.skills.length} skills match`}
                          type={skillComparison.matchPercentage === 100 ? 'success' : skillComparison.matchPercentage >= 70 ? 'info' : 'warning'}
                          showIcon
                        />

                        <Row gutter={[16, 16]}>
                          {/* Left Side - Matching and Missing Skills */}
                          <Col xs={24} sm={24} md={14} lg={14}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              {skillComparison.matching.length > 0 && (
                                <div>
                                  <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                                    <CheckOutlined /> Matching ({skillComparison.matching.length}):
                                  </Text>
                                  <div style={{ marginTop: '4px' }}>
                                    <Space wrap size={[4, 4]}>
                                      {skillComparison.matching.map((skill, index) => {
                                        const originalSkill = selectedJobRole.skills.find(s => s.toLowerCase().trim() === skill);
                                        return (
                                          <Tag key={index} color="success" style={{ margin: '2px', fontSize: '12px' }}>{originalSkill}</Tag>
                                        );
                                      })}
                                    </Space>
                                  </div>
                                </div>
                              )}

                              {skillComparison.missing.length > 0 && (
                                <div>
                                  <Text strong style={{ color: '#ff4d4f', fontSize: '12px' }}>
                                    <CloseOutlined /> Missing ({skillComparison.missing.length}):
                                  </Text>
                                  <div style={{ marginTop: '4px' }}>
                                    <Space wrap size={[4, 4]}>
                                      {skillComparison.missing.map((skill, index) => {
                                        const originalSkill = selectedJobRole.skills.find(s => s.toLowerCase().trim() === skill);
                                        return (
                                          <Tag key={index} color="error" style={{ margin: '2px', fontSize: '12px' }}>{originalSkill}</Tag>
                                        );
                                      })}
                                    </Space>
                                  </div>
                                </div>
                              )}
                            </Space>
                          </Col>

                          {/* Right Side - Pie Chart */}
                          <Col xs={24} sm={24} md={10} lg={10}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                              <div style={{ width: '180px', height: '180px' }}>
                                <Pie
                                  data={{
                                    labels: ['Matching Skills', 'Missing Skills'],
                                    datasets: [
                                      {
                                        data: [
                                          skillComparison.matching.length,
                                          skillComparison.missing.length,
                                        ],
                                        backgroundColor: [
                                          '#52c41a', // Green for matching
                                          '#ff4d4f', // Red for missing
                                        ],
                                        borderColor: [
                                          '#52c41a',
                                          '#ff4d4f',
                                        ],
                                        borderWidth: 2,
                                      },
                                    ],
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    plugins: {
                                      legend: {
                                        position: 'bottom',
                                        labels: {
                                          padding: 10,
                                          font: {
                                            size: 11,
                                          },
                                        },
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: function(context) {
                                            const label = context.label || '';
                                            const value = context.parsed || 0;
                                            const total = skillComparison.matching.length + skillComparison.missing.length;
                                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            return `${label}: ${value} (${percentage}%)`;
                                          },
                                        },
                                      },
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  )}
                </Space>
              )}
            </Card>
          )}
        </Col>

        {/* Right Side - History Section */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space size="small">
                <ClockCircleOutlined />
                <span>Scan History</span>
              </Space>
            }
            size="small"
            style={{ height: '100%' }}
          >
            {scannedResumes.length === 0 ? (
              <Empty
                description="No scanned resumes yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            ) : (
              <List
                size="small"
                dataSource={scannedResumes}
                renderItem={(resume) => (
                  <List.Item
                    style={{ padding: '8px 0' }}
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(resume)}
                        key="view"
                      />,
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setApplicant(resume)
                            setUploadCompleted(true)
                        }}
                        key="delete"
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text strong ellipsis style={{ maxWidth: '180px', display: 'block', fontSize: '13px' }}>
                            {resume.name}
                          </Text>
                          {resume.email && (
                            <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>{resume.email}</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatDate(resume.createdAt)}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ResumeScanner;
