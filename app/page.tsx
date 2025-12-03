"use client";
import AuthGuard from "@/component/auth/AuthGuard";
import { Mutation } from "@/generated/graphql";
import { LOGIN_MUTATION } from "@/graphql/login/login";
import { ME_QUERY } from "@/graphql/auth/me";
import logo from "@/public/soi-logo.png";
import { useMutation, useApolloClient } from "@apollo/client";
import { Button, Col, Form, Input, message, Row, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [login, { loading }] = useMutation<Mutation>(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data?.login?.success) {
        messageApi.success(data?.login?.message);
        
        // Clear any stale cache data and update with new user data
        await apolloClient.resetStore();
        
        // Update Apollo cache with user data so Navbar shows immediately
        if (data.login.user) {
          apolloClient.writeQuery({
            query: ME_QUERY,
            data: {
              me: {
                ...data.login.user,
                permissions: data.login.user.permissions || {},
              },
            },
          });
        }
        
        router.push("/dashboard");
      } else {
        messageApi.error(data?.login?.message);
      }
    },
    onError: (error) => {
      messageApi.error(error.message);
    },
  });

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      await login({
        variables: { username: values.username, password: values.password },
      });
    } catch (e: Error | unknown) {
      if (e instanceof Error) {
        messageApi.error(e.message);
      } else {
        messageApi.error("An unknown error occurred");
      }
    }
  };

  return (
    // <AuthGuard>
      <div style={{ minHeight: "100vh", background: "#fff", padding: 20 }}>
        {contextHolder}
        <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
          <Col xs={24} lg={8} xl={8}>
            <Form
              form={form}
              name="login"
              layout="vertical"
              onFinish={handleSubmit}
              style={{
                background: "#fff",
                padding: 30,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Typography.Title level={3} style={{ textAlign: "center" }}>
                Welcome to
              </Typography.Title>

              <Row justify="center" style={{ marginBottom: 24 }}>
                <Image src={logo} alt="logo" width={150} height={150} />
              </Row>

              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input placeholder="Enter your username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>

              <Form.Item>
                <Button
                  block
                  type="primary"
                  form="login"
                  htmlType="submit"
                  loading={loading}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    // </AuthGuard>
  );
};

export default LoginPage;
