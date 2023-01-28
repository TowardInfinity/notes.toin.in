import React, { useState } from 'react';
import { Form, Input, notification, message } from 'antd';
import { UserOutlined, SmileOutlined } from '@ant-design/icons';
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    function handleLogin(password: string) {
        const email: string | undefined = process.env.REACT_APP_EMAIL;

        if (!email) {
            notification.open({
                message: 'Unauthorized access',
                description: 'The App seems not registered correctly.',
                icon: <SmileOutlined style={{ color: '#00b96b' }} />,
                duration: 3,
            });
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user);
                messageApi.success("Success!");
                navigate("/home");
            })
            .catch((error) => {
                onFinishFailed(error);
            });
    }

    const onFinish = (values: any) => {
        console.log('Password:', values.password);
        handleLogin(values.password);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        const errorMessage = errorInfo.message;
        messageApi.warning(errorMessage);
    };

    return (
        <>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: false }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label=""
                        name="password"
                        rules={[{ required: true, message: '' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default Login;
