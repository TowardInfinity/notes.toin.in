import { type FC, useCallback } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Menu, message } from 'antd';
import type { MenuProps } from 'antd';
import {
    BookOutlined, FileAddOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from "react-router-dom";

const NavBar: FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleSignOut = useCallback(async () => {
        try {
            await signOut(auth);
            messageApi.success("Logged Out!");
            navigate('/');
        } catch {
            messageApi.error('SignOut Failed!');
        }
    }, [messageApi, navigate]);

    const onClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'logout') {
            void handleSignOut();
            return;
        }
        navigate(`/${key}`);
    };

    const selectedKeys = [pathname.startsWith('/add-note') ? 'add-note' : 'notes'];

    const items: MenuProps['items'] = [
        {
            label: 'Notes',
            key: 'notes',
            icon: <BookOutlined />,
        },
        {
            label: 'Add Note',
            key: 'add-note',
            icon: <FileAddOutlined />,
        },
        {
            label: 'Logout',
            key: 'logout',
            icon: <LogoutOutlined />,
        },
    ];

    return (<>
        {contextHolder}
        <Menu onClick={onClick} theme='dark' selectedKeys={selectedKeys} mode="horizontal" items={items} />
    </>);
}

export default NavBar;
