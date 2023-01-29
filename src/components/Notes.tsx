import { Button, Drawer, FloatButton, message, Space, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useCallback, useState } from "react";
import { useList } from 'react-firebase-hooks/database';
import { ref, set } from 'firebase/database';
import { database } from "../firebase";
import { QuickNoteType } from "../utils/types";

const Notes: React.FC = () => {
    const [openQuickNote, setOpenQuickNote] = useState<boolean>(false);
    const [quickNote, setQuickNote] = useState<string>('');
    const [snapshots, loading, error] = useList(ref(database, 'quick-notes'));
    const [messageApi, contextHolder] = message.useMessage();

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

    const saveQuickNote = useCallback(() => {
        const now: number = Date.now();
        const note: QuickNoteType = {
            title: String(now),
            note: quickNote
        };
        set(ref(database, `quick-notes/${now}`), note)
            .then(result => {
                messageApi.success("Added!");
                setQuickNote('');
            }).catch(error => {
                messageApi.error("[Error] " + error);
            });
    },
        [quickNote],
    );

    return (<>
        {contextHolder}
        <h1>Notes</h1>
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