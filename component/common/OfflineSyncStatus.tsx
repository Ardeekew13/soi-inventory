/**
 * Offline Sync Status Component
 * Shows last sync time and manual sync button
 */

'use client';

import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import { SyncOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface OfflineSyncStatusProps {
  showInline?: boolean; // Show as inline badge vs full card
}

export default function OfflineSyncStatus({ showInline = false }: OfflineSyncStatusProps) {
  const { isOnline, pendingCount, isSyncing, lastSyncTime, syncNow } = useOfflineSync();

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    return dayjs(lastSyncTime).fromNow();
  };

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    if (pendingCount > 0) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (pendingCount > 0) return `${pendingCount} pending`;
    if (lastSyncTime) return `Synced ${getLastSyncText()}`;
    return 'Not synced yet';
  };

  if (showInline) {
    // Compact inline version
    return (
      <Space size="small">
        <Tag color={getStatusColor()} icon={isOnline ? <CheckCircleOutlined /> : undefined}>
          {getStatusText()}
        </Tag>
        {lastSyncTime && (
          <Tooltip title={dayjs(lastSyncTime).format('MMM D, YYYY h:mm A')}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined /> {getLastSyncText()}
            </Text>
          </Tooltip>
        )}
        {isOnline && (
          <Button
            size="small"
            type="link"
            icon={<SyncOutlined spin={isSyncing} />}
            onClick={syncNow}
            loading={isSyncing}
            style={{ padding: 0 }}
          >
            Sync
          </Button>
        )}
      </Space>
    );
  }

  // Full card version for dashboard
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Text strong>Sync Status:</Text>
          <Tag color={getStatusColor()}>{getStatusText()}</Tag>
        </Space>
        {isOnline && (
          <Button
            size="small"
            icon={<SyncOutlined spin={isSyncing} />}
            onClick={syncNow}
            loading={isSyncing}
          >
            Sync Now
          </Button>
        )}
      </Space>
      
      {lastSyncTime && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined /> Last synced: {getLastSyncText()} 
          ({dayjs(lastSyncTime).format('MMM D, h:mm A')})
        </Text>
      )}
      
      {!lastSyncTime && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined /> No sync history yet
        </Text>
      )}
    </Space>
  );
}
