import { Button, Drawer, FloatButton, message, Space, Tooltip, Card, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import React, { useCallback, useEffect, useState } from "react";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firestore } from "../firebase";
import { NoteType } from "../utils/types";
import { addDoc, collection } from 'firebase/firestore';
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

    return (<>
        {contextHolder}
        {!loading ?
            <div className="site-card-border-less-wrapper card-container">
                {notes?.map((note: NoteType) => {
                    return (<Card title={note.title} bordered={false} className="card">
                        <p className="card-description">{note.body}</p>
                    </Card>);
                })}
            </div> : <Spin indicator={antIcon} />
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