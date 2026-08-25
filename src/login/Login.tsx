import React, { useState } from 'react';
import { Button, Form, Input, notification, message } from 'antd';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginFormValues {
    password: string;
}

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
    'auth/wrong-password': 'Incorrect password',
    'auth/user-not-found': 'Invalid credentials',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/too-many-requests': 'Too many attempts — try again shortly',
    'auth/network-request-failed': 'Network error',
};

const Login: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [signingIn, setSigningIn] = useState(false);

    const handleLogin = async (password: string) => {
        const email: string | undefined = import.meta.env.VITE_APP_EMAIL;

        if (!email) {
            notification.error({
                message: 'Unauthorized access',
                description: 'The App seems not registered correctly.',
                duration: 3,
            });
            return;
        }

        setSigningIn(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            messageApi.success('Success!');
        } catch (error) {
            const code = error instanceof FirebaseError ? error.code : '';
            messageApi.error(FRIENDLY_AUTH_ERRORS[code] ?? 'Sign-in failed');
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <>
            {contextHolder}
            <div className="login-page">
                <Form<LoginFormValues>
                    name="login"
                    className="login-form"
                    onFinish={(values) => void handleLogin(values.password)}
                    autoComplete="off"
                >
                    <h1 className="login-title">Notes</h1>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password autoFocus />
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={signingIn}
                            disabled={signingIn}
                        >
                            Sign in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default Login;
