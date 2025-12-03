"use client";

import {
  MY_CURRENT_SHIFT_QUERY,
  MY_SHIFT_HISTORY_QUERY,
  RECORD_SHIFT_EVENT_MUTATION,
} from "@/graphql/shift/shiftTracking";
import {
  dateFormatterWithMonth,
  dateFormatterWithMonthAndTime,
  dateFormatterWithTime,
} from "@/utils/helper";
import {
  uploadImageToCloudinary,
} from "@/utils/imageUpload";
import {
  CameraOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Divider,
  Image,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  App,
} from "antd";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useEffect, useRef, useState } from "react";

dayjs.extend(duration);

const { Title, Text } = Typography;

interface ShiftEvent {
  _id: string;
  eventType: string;
  timestamp: string;
  photo: string;
  notes: string;
}

interface Shift {
  _id: string;
  userId: string;
  employeeName: string;
  date: string;
  attendanceStatus: string;
  scheduledStartTime?: string;
  actualStartTime?: string;
  events: ShiftEvent[];
  totalHoursWorked: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const eventTypeLabels: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  SHIFT_START: {
    label: "Shift Start",
    icon: <PlayCircleOutlined />,
    color: "green",
  },
  LUNCH_BREAK_START: {
    label: "Lunch Break Start",
    icon: <CoffeeOutlined />,
    color: "orange",
  },
  LUNCH_BREAK_END: {
    label: "Lunch Break End",
    icon: <CoffeeOutlined />,
    color: "blue",
  },
  SHIFT_END: { label: "Shift End", icon: <LogoutOutlined />, color: "red" },
};

export default function ShiftTracking() {
  const { message } = App.useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [photoTimestamp, setPhotoTimestamp] = useState<Date | null>(null);
  const [currentEventType, setCurrentEventType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);

  const { data: currentShiftData, refetch: refetchCurrentShift } = useQuery(
    MY_CURRENT_SHIFT_QUERY
  );
  const { data: historyData, refetch: refetchHistory } = useQuery(
    MY_SHIFT_HISTORY_QUERY,
    {
      variables: { limit: 10, offset: 0 },
    }
  );

  const [recordShiftEvent, { loading: recording }] = useMutation(
    RECORD_SHIFT_EVENT_MUTATION
  );

  const currentShift = currentShiftData?.myCurrentShift as Shift | null;
  const shiftHistory = (historyData?.myShiftHistory as Shift[]) || [];

  // Get available event options for flexible recording
  const getAvailableEvents = () => {
    if (!currentShift) return ["SHIFT_START"];
    
    const eventTypes = currentShift.events.map((e: ShiftEvent) => e.eventType);
    const available: string[] = [];
    
    // If shift ended, no more events
    if (eventTypes.includes("SHIFT_END")) return [];
    
    // If shift not started, only shift start
    if (!eventTypes.includes("SHIFT_START")) return ["SHIFT_START"];
    
    const hasLunchStart = eventTypes.includes("LUNCH_BREAK_START");
    const hasLunchEnd = eventTypes.includes("LUNCH_BREAK_END");
    
    console.log("Shift state:", { eventTypes, hasLunchStart, hasLunchEnd });
    
    // If on lunch break, can only end lunch
    if (hasLunchStart && !hasLunchEnd) {
      console.log("On active break - showing LUNCH_BREAK_END");
      return ["LUNCH_BREAK_END"];
    }
    
    // Can start lunch if not started yet
    if (!hasLunchStart) {
      available.push("LUNCH_BREAK_START");
    }
    
    // Can always end shift after it started (unless currently on break)
    if (!hasLunchStart || hasLunchEnd) {
      available.push("SHIFT_END");
    }
    
    console.log("Available events:", available);
    return available;
  };

  const availableEvents = getAvailableEvents();

  // Camera functions
  const startCamera = async (eventType: string) => {
    setCurrentEventType(eventType);
    setIsCameraOpen(true);
    setCameraLoading(true);
    
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });

      console.log("Camera stream obtained:", stream);
      console.log("Video tracks:", stream.getVideoTracks());
      
      streamRef.current = stream;

      // Wait for next render cycle
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          console.log("Attaching stream to video element");
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current?.play().then(() => {
              console.log("Video playing");
              setCameraLoading(false);
            }).catch((err) => {
              console.error("Video play error:", err);
              message.error(`Video play failed: ${err.message}`);
              setCameraLoading(false);
            });
          };
        } else {
          console.error("Video ref not available", { 
            hasVideoRef: !!videoRef.current, 
            hasStream: !!streamRef.current 
          });
          setCameraLoading(false);
        }
      }, 300);
    } catch (error: any) {
      console.error("Camera access error:", error);
      message.error(`Failed to access camera: ${error.message}`);
      setIsCameraOpen(false);
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraLoading(false);
    setCapturedPhoto("");
    setPhotoTimestamp(null);
    setNotes("");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas to lower resolution to save space
      canvas.width = 320;
      canvas.height = 240;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Capture the current timestamp
        const timestamp = new Date();
        setPhotoTimestamp(timestamp);

        // Convert to base64 with low quality (0.5 = 50% quality)
        const photoData = canvas.toDataURL("image/jpeg", 0.5);
        setCapturedPhoto(photoData);

        // Stop camera preview
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  const submitEvent = async (skipPhoto: boolean = false) => {
    try {
      let photoURL = undefined;

      if (!skipPhoto && capturedPhoto) {
        // Show loading message
        const hideLoading = message.loading("Uploading photo...", 0);

        // Get user ID from current shift or generate a temporary one
        const userId = currentShift?.userId || "temp-user";

        // Upload photo to Cloudinary (with compression)
        photoURL = await uploadImageToCloudinary(
          capturedPhoto,
          "shift-photos", // folder
          userId,
          true // Enable compression
        );

        hideLoading();
      }

      // Record event with or without photo
      const input: any = {
        eventType: currentEventType,
        photo: photoURL, // Will be undefined if no photo
        notes: notes.trim() || undefined,
      };
      
      await recordShiftEvent({
        variables: { input },
      });

      message.success(
        `${eventTypeLabels[currentEventType].label} recorded successfully`
      );

      // Refetch data
      await refetchCurrentShift();
      await refetchHistory();

      // Close modal
      stopCamera();
    } catch (error: any) {
      console.error("Error submitting event:", error);
      message.error(error.message || "Failed to record event");
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const eventColumns = [
    {
      title: "Event",
      dataIndex: "eventType",
      key: "eventType",
      render: (type: string) => (
        <Tag
          color={eventTypeLabels[type].color}
          icon={eventTypeLabels[type].icon}
        >
          {eventTypeLabels[type].label}
        </Tag>
      ),
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => dateFormatterWithTime(timestamp),
    },
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (photo: string) => 
        photo ? (
          <Image
            src={photo}
            alt="Event photo"
            width={60}
            height={45}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <Tag color="default">No Photo</Tag>
        ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
  ];

  const historyColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dateFormatterWithMonth(date),
    },
    {
      title: "Attendance",
      dataIndex: "attendanceStatus",
      key: "attendanceStatus",
      render: (status: string) => (
        <Tag
          color={
            status === "ON_TIME"
              ? "green"
              : status === "LATE"
              ? "orange"
              : "blue"
          }
        >
          {status?.replace(/_/g, " ") || "ON TIME"}
        </Tag>
      ),
    },
    {
      title: "Hours Worked",
      dataIndex: "totalHoursWorked",
      key: "totalHoursWorked",
      render: (hours: number) => {
        if (!hours) return "-";
        const dur = dayjs.duration(hours, "hours");
        return `${dur.hours()}h ${dur.minutes()}m`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "green" : "blue"}>
          {status.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "Events",
      dataIndex: "events",
      key: "events",
      render: (events: ShiftEvent[]) => events.length,
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ClockCircleOutlined /> Employee Shift Tracking
      </Title>

      {/* Current Shift */}
      <Card title="Current Shift" style={{ marginBottom: 24 }}>
        {currentShift ? (
          <>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong>Employee: </Text>
                <Text>{currentShift.employeeName}</Text>
                <br />
                <Text strong>Date: </Text>
                <Text>{dateFormatterWithMonth(currentShift.date)}</Text>
                <br />
                <Text strong>Attendance: </Text>
                <Tag
                  color={
                    currentShift.attendanceStatus === "ON_TIME"
                      ? "green"
                      : currentShift.attendanceStatus === "LATE"
                      ? "orange"
                      : "blue"
                  }
                >
                  {currentShift.attendanceStatus?.replace(/_/g, " ") || "ON TIME"}
                </Tag>
                <br />
                <Text strong>Status: </Text>
                <Tag color="processing">IN PROGRESS</Tag>
                {currentShift.scheduledStartTime && currentShift.actualStartTime && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Scheduled: {dateFormatterWithTime(currentShift.scheduledStartTime)} 
                      {" | "}
                      Actual: {dateFormatterWithTime(currentShift.actualStartTime)}
                    </Text>
                  </>
                )}
              </div>

              <Divider />

              <Table
                dataSource={currentShift.events}
                columns={eventColumns}
                rowKey="_id"
                pagination={false}
                size="small"
              />

              {availableEvents.length > 0 && (
                <>
                  <Divider />
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: availableEvents.length === 1 ? "1fr" : "repeat(2, 1fr)", 
                    gap: "16px",
                    maxWidth: "600px"
                  }}>
                    {availableEvents.map((eventType) => {
                      const eventInfo = eventTypeLabels[eventType];
                      if (!eventInfo) return null; // Safety check
                      
                      return (
                        <Card
                          key={eventType}
                          hoverable
                          style={{ 
                            textAlign: "center",
                            border: `2px solid ${
                              eventInfo.color === "green" ? "#52c41a" :
                              eventInfo.color === "orange" ? "#fa8c16" :
                              eventInfo.color === "blue" ? "#1890ff" :
                              "#f5222d"
                            }`,
                            cursor: "pointer"
                          }}
                          onClick={() => startCamera(eventType)}
                        >
                          <Space direction="vertical" size="small">
                            <div style={{ 
                              fontSize: "48px", 
                              color: eventInfo.color === "green" ? "#52c41a" :
                                     eventInfo.color === "orange" ? "#fa8c16" :
                                     eventInfo.color === "blue" ? "#1890ff" :
                                     "#f5222d"
                            }}>
                              {eventInfo.icon}
                            </div>
                            <Text strong style={{ fontSize: "16px" }}>{eventInfo.label}</Text>
                          </Space>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </Space>
          </>
        ) : (
          <Space
            direction="vertical"
            style={{ width: "100%", padding: "20px 0" }}
            size="large"
          >
            <Text type="secondary" style={{ textAlign: "center", display: "block" }}>
              No active shift - Click to start your shift
            </Text>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr", 
              gap: "16px",
              maxWidth: "300px",
              margin: "0 auto"
            }}>
              {/* Only show Shift Start when no active shift */}
              <Card
                hoverable
                style={{ 
                  textAlign: "center",
                  border: "2px solid #52c41a",
                  cursor: "pointer"
                }}
                onClick={() => startCamera("SHIFT_START")}
              >
                <Space direction="vertical" size="small">
                  <PlayCircleOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
                  <Text strong style={{ fontSize: "16px" }}>Shift Start</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Begin your shift
                  </Text>
                </Space>
              </Card>
            </div>
          </Space>
        )}
      </Card>

      {/* Shift History */}
      <Card title="Shift History">
        <Table
          dataSource={shiftHistory}
          columns={historyColumns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Camera Modal */}
      <Modal
        title={eventTypeLabels[currentEventType]?.label}
        open={isCameraOpen}
        onCancel={stopCamera}
        footer={null}
        width={700}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {!capturedPhoto ? (
            <>
              <div style={{ position: "relative" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: "100%", 
                    minHeight: "400px",
                    backgroundColor: "#000",
                    borderRadius: 8 
                  }}
                />
                {cameraLoading && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: 8
                  }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary" style={{ color: "#fff" }}>Starting camera...</Text>
                    </div>
                  </div>
                )}
              </div>
              <Space style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={capturePhoto}
                  size="large"
                  disabled={cameraLoading}
                  style={{ flex: 1 }}
                >
                  Capture Photo
                </Button>
                <Button
                  onClick={() => submitEvent(true)}
                  size="large"
                  loading={recording}
                  danger
                >
                  Skip Photo
                </Button>
              </Space>
            </>
          ) : (
            <>
              <img
                src={capturedPhoto}
                alt="Captured"
                style={{ width: "100%", borderRadius: 8 }}
              />
              {photoTimestamp && (
                <Text
                  type="secondary"
                  style={{ textAlign: "center", display: "block" }}
                >
                  Photo taken:{" "}
                  {dateFormatterWithMonthAndTime(photoTimestamp.toISOString())}
                </Text>
              )}
              <input
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                }}
              />
              <Space style={{ width: "100%" }}>
                <Button
                  onClick={() => {
                    setCapturedPhoto("");
                    setPhotoTimestamp(null);
                  }}
                >
                  Retake
                </Button>
                <Button
                  type="primary"
                  onClick={() => submitEvent(false)}
                  loading={recording}
                  style={{ flex: 1 }}
                >
                  Submit
                </Button>
              </Space>
            </>
          )}
        </Space>
      </Modal>

      {/* Hidden canvas for photo compression */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
