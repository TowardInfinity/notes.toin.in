import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Menu, message } from 'antd';
import type { MenuProps } from 'antd';
import { useIdToken } from 'react-firebase-hooks/auth';
import {
    BookOutlined, FileAddOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
    const [error] = useIdToken(auth);
    const [messageApi, contextHolder] = message.useMessage();
    const [current, setCurrent] = React.useState<string>('notes');
    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut(auth).then(result => {
            messageApi.success("Logged Out!");
        }).catch(error => {
            messageApi.error('SignOut Failed!');
        });
    };

    if (error) {
        handleSignOut();
    }

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        if (e.key !== 'logout') {
            navigate(e.key);
        }
    };

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
            disabled: false,
        },
        {
            label: (<a href="/" onClick={handleSignOut}>Logout</a>),
            key: 'logout',
            icon: <LogoutOutlined />,
            disabled: false,
        },
    ];

    return (<>
        {contextHolder}
        <Menu onClick={onClick} theme='light' selectedKeys={[current]} mode="horizontal" items={items} />
    </>);
}

export default NavBar;