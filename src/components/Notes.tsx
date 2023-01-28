import { Button, Drawer, FloatButton, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useState } from "react";

const Notes: React.FC = () => {
    const [openQuickNote, setOpenQuickNote] = useState<boolean>(false);

    const openQuickNoteDrawer = () => {
        setOpenQuickNote(true);
    };

    const closeQuickNoteDrawer = () => {
        setOpenQuickNote(false);
    };

    const addQuickNote = () => {
        closeQuickNoteDrawer();
    };

    return (<>
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
                    <Button onClick={addQuickNote} type="primary">
                        Add
                    </Button>
                </Space>
            }
        >
            <TextArea rows={11} placeholder="maxLength is 2000" maxLength={2000} />
        </Drawer>
    </>);
}

export default Notes;