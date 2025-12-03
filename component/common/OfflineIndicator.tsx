/**
 * Offline Status Indicator Component
 * Shows network status and pending sync count
 */

'use client';

import { Badge, Button, Space, Tooltip, Typography } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const { Text } = Typography;

export default function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();

  if (isOnline && pendingCount === 0) {
    // All synced, nothing to show
    return null;
  }

  return (
    <Space
      style={{
        position: 'fixed',
        top: 70,
        right: 20,
        zIndex: 1000,
        background: isOnline ? '#fff' : '#ff4d4f',
        padding: '8px 16px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {!isOnline ? (
        <>
          <DisconnectOutlined style={{ fontSize: 18, color: '#fff' }} />
          <Text style={{ color: '#fff', fontWeight: 500 }}>
            Offline Mode
          </Text>
          {pendingCount > 0 && (
            <Badge count={pendingCount} style={{ backgroundColor: '#fff', color: '#ff4d4f' }} />
          )}
        </>
      ) : pendingCount > 0 ? (
        <>
          <WifiOutlined style={{ fontSize: 18, color: '#52c41a' }} />
          <Text style={{ fontWeight: 500 }}>
            {pendingCount} pending
          </Text>
          <Tooltip title="Sync now">
            <Button
              type="primary"
              size="small"
              icon={isSyncing ? <SyncOutlined spin /> : <CloudUploadOutlined />}
              onClick={syncNow}
              loading={isSyncing}
            >
              Sync
            </Button>
          </Tooltip>
        </>
      ) : null}
    </Space>
  );
}
