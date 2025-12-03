"use client";
import { Card, Typography, Space, Table, Progress, Statistic, Row, Col, Alert, Spin } from "antd";
import { DatabaseOutlined, FileTextOutlined, ShoppingOutlined, DollarOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { DATABASE_STATS_QUERY } from "@/graphql/settings/database";

const DatabaseMonitoring = () => {
  const { data, loading, error } = useQuery(DATABASE_STATS_QUERY);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error Loading Database Statistics"
          description={error.message}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const stats = data?.databaseStats;

  const collectionColumns = [
    {
      title: "Collection",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Documents",
      dataIndex: "documentCount",
      key: "documentCount",
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "Size (MB)",
      dataIndex: "sizeMB",
      key: "sizeMB",
      render: (size: number) => size.toFixed(2),
    },
    {
      title: "Avg Doc Size (KB)",
      dataIndex: "avgDocSizeKB",
      key: "avgDocSizeKB",
      render: (size: number) => size.toFixed(2),
    },
  ];

  const getProgressColor = (percent: number) => {
    if (percent < 50) return "#52c41a"; // green
    if (percent < 80) return "#faad14"; // orange
    return "#f5222d"; // red
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div>
          <Typography.Title level={5}>
            <DatabaseOutlined /> Database Monitoring
          </Typography.Title>
          <Typography.Text type="secondary">
            Real-time database statistics and storage usage
          </Typography.Text>
        </div>

        {/* Storage Overview */}
        <Card type="inner" title="Storage Overview">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Total Size"
                value={stats?.totalSizeMB}
                precision={2}
                suffix="MB / 512 MB"
              />
              <Progress
                percent={stats?.currentUsagePercent}
                strokeColor={getProgressColor(stats?.currentUsagePercent)}
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Estimated Days to Full"
                value={stats?.estimatedDaysToFull}
                suffix="days"
              />
              <Typography.Text type="secondary">
                (~{(stats?.estimatedDaysToFull / 365).toFixed(1)} years)
              </Typography.Text>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Statistic
                title="Data Size"
                value={stats?.dataSizeMB}
                precision={2}
                suffix="MB"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Index Size"
                value={stats?.indexSizeMB}
                precision={2}
                suffix="MB"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Free Space"
                value={stats?.freeSpaceMB}
                precision={2}
                suffix="MB"
              />
            </Col>
          </Row>
        </Card>

        {/* Key Metrics */}
        <Card type="inner" title="Key Metrics">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Sales"
                  value={stats?.salesCount}
                  prefix={<FileTextOutlined />}
                />
                <Typography.Text type="secondary">
                  Completed: {stats?.completedSales} | Parked: {stats?.parkedSales}
                </Typography.Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Products"
                  value={stats?.productsCount}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Items"
                  value={stats?.itemsCount}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Users"
                  value={stats?.usersCount}
                  prefix={<UserOutlined />}
                />
                <Typography.Text type="secondary">
                  Active: {stats?.activeUsers}
                </Typography.Text>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Cash Drawers"
                  value={stats?.cashDrawersCount}
                  prefix={<DollarOutlined />}
                />
                <Typography.Text type="secondary">
                  Open: {stats?.openDrawers}
                </Typography.Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Total Documents"
                  value={stats?.totalDocuments}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Collection Statistics */}
        <Card type="inner" title="Collection Statistics">
          <Table
            dataSource={stats?.collections || []}
            columns={collectionColumns}
            rowKey="name"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Warnings */}
        {stats?.currentUsagePercent > 80 && (
          <Alert
            message="High Storage Usage"
            description={`Your database is using ${stats.currentUsagePercent.toFixed(1)}% of available storage. Consider archiving old data or upgrading your plan.`}
            type="warning"
            showIcon
          />
        )}

        {stats?.openDrawers > 0 && (
          <Alert
            message="Open Cash Drawers"
            description={`You have ${stats.openDrawers} open cash drawer(s). Make sure to close them at the end of each shift.`}
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default DatabaseMonitoring;
