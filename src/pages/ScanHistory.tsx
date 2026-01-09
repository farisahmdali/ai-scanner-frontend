import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Upload,
    Modal,
    message,
    Row,
    Col,
    Descriptions,
    Select,
    Alert,
    Divider,
    Input,
} from 'antd';
import {
    UploadOutlined,
    PlusOutlined,
    FileTextOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckOutlined,
    CloseOutlined,
    SearchOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

function ScanHistory() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);
    const [loadingJobRoles, setLoadingJobRoles] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Debounce search - update searchText after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchText(searchInput);
            setPagination(prev => ({
                ...prev,
                current: 1, // Reset to first page when search changes
            }));
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchApplicants();
        fetchJobRoles();
    }, [pagination.current, pagination.pageSize, searchText]);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.current.toString(),
                limit: pagination.pageSize.toString(),
                search: searchText || '',
            });

            const response = await instance.get(`/applicants?${params.toString()}`);
            if (response.data.applicants) {
                setApplicants(response.data.applicants);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || 0,
                }));
            }
        } catch (error: any) {
            console.error('Error fetching applicants:', error);
            message.error('Failed to load scan history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

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

    // Calculate match percentage for an applicant against selected job role
    const calculateMatchPercentage = (applicant: Applicant): number | null => {
        if (!selectedJobRole) return null;

        const applicantSkills = applicant.skills.map(s => s.toLowerCase().trim());
        const requiredSkills = selectedJobRole.skills.map(s => s.toLowerCase().trim());

        const matchingSkills = requiredSkills.filter(skill =>
            applicantSkills.some(appSkill => appSkill === skill)
        );

        return requiredSkills.length > 0
            ? (matchingSkills.length / requiredSkills.length) * 100
            : 0;
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
            return false;
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
                setUploadModalVisible(false);
                setFileList([]);
                fetchApplicants(); // Refresh the list
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

    const handleViewDetails = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setDetailModalVisible(true);
    };

    const handleDownload = async (filename: string) => {
        try {
            const response = await instance.get(`/uploads/${filename}`, {
                responseType: 'blob', // Important: tell axios to expect binary data
            });

            // Create blob from response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            message.success('File downloaded successfully');
        } catch (error: any) {
            console.error('Download error:', error);
            message.error('Failed to download file');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            console.log(id);
            const response = await instance.delete(`/applicants/${id}`);
            if (response.data.message === 'Applicant deleted successfully') {
                message.success('Applicant deleted successfully');
                fetchApplicants();
            }
        }
        catch (error: any) {
            console.error('Delete error:', error);
            message.error('Failed to delete applicant');
        }
    };

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

    const columns: ColumnsType<Applicant> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => (
                <Space>
                    <MailOutlined />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text: string) => (
                <Space>
                    <PhoneOutlined />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Skills Count',
            key: 'skills',
            render: (_: any, record: Applicant) => (
                <Tag color="blue">{record.skills.length} skills</Tag>
            ),
        },
        ...(selectedJobRole ? [{
            title: `Match % (${selectedJobRole.name})`,
            key: 'match',
            render: (_: any, record: Applicant) => {
                const matchPercentage = calculateMatchPercentage(record);
                if (matchPercentage === null) return null;

                const color = matchPercentage === 100 ? 'success' : matchPercentage >= 70 ? 'processing' : 'error';
                return (
                    <Tag color={color} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {matchPercentage.toFixed(1)}%
                    </Tag>
                );
            },
        }] : []),
        {
            title: 'Uploaded At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatDate(text)}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Applicant) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        size="small"
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record.resume)}
                        size="small"
                    >
                        Download
                    </Button>
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        size="small"
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    // Use applicants directly since backend handles pagination
    const paginatedData = applicants;

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Scan History
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Search by name, email, or phone"
                            prefix={<SearchOutlined />}
                            allowClear
                            style={{ width: 250 }}
                            size="middle"
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onPressEnter={(e) => {
                                setSearchText(e.currentTarget.value);
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                        />
                        <Select
                            placeholder="Select job role to check match"
                            style={{ width: 200 }}
                            size="middle"
                            loading={loadingJobRoles}
                            allowClear
                            onChange={(value) => {
                                if (value) {
                                    const role = jobRoles.find(r => r.id.toString() === value);
                                    setSelectedJobRole(role || null);
                                } else {
                                    setSelectedJobRole(null);
                                }
                            }}
                            value={selectedJobRole?.id.toString()}
                        >
                            {jobRoles.map((role) => (
                                <Option key={role.id} value={role.id.toString()}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setUploadModalVisible(true)}
                        >
                            Add New Applicant
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card size="small">
                <Table
                    columns={columns}
                    dataSource={paginatedData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} applicants`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize || 10,
                            }));
                        },
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />
            </Card>

            {/* Upload Modal */}
            <Modal
                title={
                    <Space>
                        <UploadOutlined />
                        <span>Upload Resume</span>
                    </Space>
                }
                open={uploadModalVisible}
                onCancel={() => {
                    setUploadModalVisible(false);
                    setFileList([]);
                }}
                footer={null}
                width={600}
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
                    >
                        {uploading ? 'Uploading...' : 'Upload & Scan Resume'}
                    </Button>
                </Space>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Applicant Details</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedApplicant(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setDetailModalVisible(false);
                        setSelectedApplicant(null);
                    }}>
                        Close
                    </Button>,
                ]}
                width={700}
            >
                {selectedApplicant && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label={<Space size="small"><UserOutlined style={{ fontSize: '12px' }} />Name</Space>}>
                                <Text style={{ fontSize: '13px' }}>{selectedApplicant.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<Space size="small"><MailOutlined style={{ fontSize: '12px' }} />Email</Space>}>
                                <Text style={{ fontSize: '13px' }}>{selectedApplicant.email}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<Space size="small"><PhoneOutlined style={{ fontSize: '12px' }} />Phone</Space>}>
                                <Text style={{ fontSize: '13px' }}>{selectedApplicant.phone}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Uploaded At">
                                <Text style={{ fontSize: '13px' }}>{formatDate(selectedApplicant.createdAt)}</Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider style={{ margin: '8px 0' }}>Skills Extracted</Divider>

                        <div>
                            <Text strong style={{ fontSize: '13px' }}>Skills ({selectedApplicant.skills.length}):</Text>
                            <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                <Space wrap size={[4, 4]}>
                                    {selectedApplicant.skills.map((skill, index) => (
                                        <Tag key={index} color="blue" style={{ margin: '2px', fontSize: '12px' }}>
                                            {skill}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        </div>

                        {selectedJobRole && (() => {
                            const applicantSkills = selectedApplicant.skills.map(s => s.toLowerCase().trim());
                            const requiredSkills = selectedJobRole.skills.map(s => s.toLowerCase().trim());

                            const matchingSkills = requiredSkills.filter(skill =>
                                applicantSkills.some(appSkill => appSkill === skill)
                            );

                            const missingSkills = requiredSkills.filter(skill =>
                                !applicantSkills.some(appSkill => appSkill === skill)
                            );

                            const matchPercentage = requiredSkills.length > 0
                                ? (matchingSkills.length / requiredSkills.length) * 100
                                : 0;

                            return (
                                <>
                                    <Divider style={{ margin: '8px 0' }}>Job Role Comparison</Divider>

                                    <div>
                                        <Text strong style={{ fontSize: '13px' }}>Job Role: </Text>
                                        <Text style={{ fontSize: '13px' }}>{selectedJobRole.name}</Text>
                                    </div>

                                    <Alert
                                        message={`Match: ${matchPercentage.toFixed(1)}%`}
                                        description={`${matchingSkills.length} out of ${selectedJobRole.skills.length} required skills match`}
                                        type={matchPercentage === 100 ? 'success' : matchPercentage >= 70 ? 'info' : 'warning'}
                                        showIcon
                                    />

                                    <Row gutter={[16, 16]}>
                                        {/* Left Side - Matching and Missing Skills */}
                                        <Col xs={24} sm={24} md={14} lg={14}>
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                {matchingSkills.length > 0 && (
                                                    <div>
                                                        <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                                                            <CheckOutlined /> Matching Skills ({matchingSkills.length}):
                                                        </Text>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Space wrap size={[4, 4]}>
                                                                {matchingSkills.map((skill, index) => {
                                                                    const originalSkill = selectedJobRole.skills.find(s => s.toLowerCase().trim() === skill);
                                                                    return (
                                                                        <Tag key={index} color="success" style={{ margin: '2px', fontSize: '12px' }}>
                                                                            {originalSkill}
                                                                        </Tag>
                                                                    );
                                                                })}
                                                            </Space>
                                                        </div>
                                                    </div>
                                                )}

                                                {missingSkills.length > 0 && (
                                                    <div>
                                                        <Text strong style={{ color: '#ff4d4f', fontSize: '12px' }}>
                                                            <CloseOutlined /> Missing Skills ({missingSkills.length}):
                                                        </Text>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <Space wrap size={[4, 4]}>
                                                                {missingSkills.map((skill, index) => {
                                                                    const originalSkill = selectedJobRole.skills.find(s => s.toLowerCase().trim() === skill);
                                                                    return (
                                                                        <Tag key={index} color="error" style={{ margin: '2px', fontSize: '12px' }}>
                                                                            {originalSkill}
                                                                        </Tag>
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
                                                                        matchingSkills.length,
                                                                        missingSkills.length,
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
                                                                            const total = matchingSkills.length + missingSkills.length;
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
                                </>
                            );
                        })()}
                    </Space>
                )}
            </Modal>
        </div>
    );
}

export default ScanHistory;
