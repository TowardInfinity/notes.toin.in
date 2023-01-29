import { Button, Drawer, FloatButton, message, Space, Tooltip, Card, Spin, Popconfirm } from "antd";
import { LoadingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import React, { useCallback, useState } from "react";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firestore } from "../firebase";
import { NoteType } from "../utils/types";
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { noteConverter } from "../utils/helper";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Notes: React.FC = () => {
    const [openQuickNote, setOpenQuickNote] = useState<boolean>(false);
    const [quickNote, setQuickNote] = useState<string>('');
    const notesRef = collection(firestore, 'notes').withConverter(noteConverter);
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, loading, error] = useCollectionData(notesRef);

    const openQuickNoteDrawer = () => {
        setOpenQuickNote(true);
    };

    const closeQuickNoteDrawer = () => {
        setOpenQuickNote(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && event.metaKey) {
            addQuickNote();
        }
    }

    const addQuickNote = () => {
        closeQuickNoteDrawer();
        saveQuickNote();
    };

    const saveQuickNote = async () => {
        const now: number = Date.now();
        const note: NoteType = {
            id: String(now),
            title: String(now),
            body: quickNote
        };

        addDoc(collection(firestore, 'notes'), { note })
            .then(res => {
                setQuickNote('');
                messageApi.success("Added!");
            }).catch(err => {
                messageApi.success(`[Error] ${err}`);
            })
    };

    const handleDelete = useCallback(
        (id: string | undefined) => {
            if (id) {
                deleteDoc(doc(firestore, "notes", id))
                    .then(res => {
                        messageApi.success("Removed!");
                    })
                    .catch(err => {
                        messageApi.success(`[Error] ${err}`);
                    });
            }
        },
        [],
    );


    if (loading) {
        return <Spin indicator={antIcon} className="spinner" size="large" />;
    }

    return (<>
        {contextHolder}
        {!loading &&
            <div className="site-card-border-less-wrapper card-container">
                {notes?.map((note: NoteType) => {
                    return (<Card title={new Date(Number(note.title)).toLocaleString()}
                        bordered={false} className="card" key={note.ref?.id}
                        extra={
                            <Popconfirm
                                title="Delete the note"
                                description="Are you sure to delete this note?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDelete(note.ref?.id)}
                            >
                                <DeleteOutlined />
                            </Popconfirm>
                        }>
                        <p className="card-description">{note.body}</p>
                    </Card>);
                })}
            </div>
        }
        <FloatButton onClick={openQuickNoteDrawer} />
        <Drawer
            title="Quick Note"
            placement='bottom'
            closable={false}
            open={openQuickNote}
            onClose={closeQuickNoteDrawer}
            key='quickNote'
            extra={
                <Space>
                    <Button onClick={closeQuickNoteDrawer}>Cancel</Button>

                    <Tooltip placement="topRight" title="Use Command + Enter to submit">
                        <Button onClick={addQuickNote} type="primary">
                            Add
                        </Button>
                    </Tooltip>
                </Space>
            }
        >
            <TextArea rows={11} placeholder="maxLength is 2000" maxLength={2000} value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                onKeyDown={handleKeyDown} />
        </Drawer>
    </>);
}

export default Notes;