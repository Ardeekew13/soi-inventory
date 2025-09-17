"use client";
import { supabase } from "@/lib/supabase-client";
import logo from "@/public/soi-logo.png";
import { Button, Col, Form, Input, message, Row, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginPage = () => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const router = useRouter();

	const handleSubmit = async (values: { email: string; password: string }) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password,
			});
			if (error) throw error;
			console.log("data", data);

			const { data: result, error: profileError } = await supabase.rpc(
				"get_user_profile"
			);
			if (profileError) throw profileError;

			if (!result?.success) {
				messageApi.error(result.message || "Failed to load profile");
				return;
			}

			const profile = result.profile;

			localStorage.setItem("role", profile?.role ?? "");
			localStorage.setItem("userId", profile?.id ?? "");

			messageApi.success(result.message);

			if (profile?.role?.toUpperCase() === "ADMIN") {
				router.push("/dashboard");
			} else {
				router.push("/point-of-sale");
			}
		} catch (e: Error | unknown) {
			if (e instanceof Error) {
				messageApi.error(e.message);
			} else {
				messageApi.error("An unknown error occurred");
			}
		}
	};

	return (
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
							name="email"
							rules={[
								{ required: true, message: "Please input your username!" },
							]}
						>
							<Input type="email" placeholder="Enter your username" />
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
								// loading={loading}
							>
								Login
							</Button>
						</Form.Item>
					</Form>
				</Col>
			</Row>
		</div>
	);
};

export default LoginPage;
