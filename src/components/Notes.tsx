import { Button, Drawer, FloatButton, message, Space, Tooltip, Card, Spin, Popconfirm, Col, Row, Modal } from "antd";
import { LoadingOutlined, EditFilled, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import React, { useCallback, useState } from "react";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firestore } from "../firebase";
import { NoteType } from "../utils/types";
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { createNoteObject, getDateInLocalString, noteConverter } from "../utils/helper";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Notes: React.FC = () => {
    const [openQuickNote, setOpenQuickNote] = useState<boolean>(false);
    const [quickNote, setQuickNote] = useState<string>('');
    const [editNote, setEditNote] = useState<string>('');
    const notesRef = collection(firestore, 'notes').withConverter(noteConverter);
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, loading, error] = useCollectionData(notesRef);
    const [openViewEditQuickNote, setOpenViewEditQuickNote] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [viewEditNote, setViewEditNote] = useState<NoteType | undefined>(undefined);

    const openQuickNoteDrawer = () => {
        setOpenQuickNote(true);
    };

    const closeQuickNoteDrawer = () => {
        setOpenQuickNote(false);
    };

    const closeOpenViewEditQuickNote = () => {
        setOpenViewEditQuickNote(false);
        setEditMode(false);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && event.metaKey) {
            addQuickNote();
        }
    }

    const addQuickNote = () => {
        closeQuickNoteDrawer();
        saveQuickNote();
    };

    const saveQuickNote = () => {
        if (quickNote.trim().length === 0) {
            return;
        }
        addDoc(collection(firestore, 'notes'), createNoteObject(quickNote))
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

    const openViewEditDrawer = (id?: string) => {
        if (id) {
            getNote(id);
            setOpenViewEditQuickNote(true);
        }
    }

    const getNote = (id: string) => {
        getDoc(doc(firestore, "notes", id).withConverter(noteConverter))
            .then(res => {
                setViewEditNote(res.data());
                if (res.exists()) {
                    setEditNote(res.data()?.body);
                }
            })
            .catch(err => {
                messageApi.success(`[Error] ${err}`);
            });
    }

    const handleEditSave = (id?: string) => {
        closeOpenViewEditQuickNote();
        if (id) {
            setDoc(doc(firestore, "notes", id), createNoteObject(editNote))
                .then(res => {
                    messageApi.success("Updated!");
                })
                .catch(err => {
                    messageApi.success(`[Error] ${err}`);
                });
        }
    };

    if (loading) {
        return <Spin indicator={antIcon} className="spinner" size="large" />;
    }

    return (<>
        {contextHolder}
        {!loading &&
            <div className="site-card-border-less-wrapper card-container">
                <Row gutter={30}>
                    {notes?.map((note: NoteType) => {
                        return (<Col span={4.5} key={note.ref?.id + note.id}>
                            <Card hoverable title={getDateInLocalString(note?.id)}
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
                                <p className="card-description" onClick={() => openViewEditDrawer(note.ref?.id)}>{note.body}</p>
                            </Card>
                        </Col>);
                    })}
                </Row>
            </div>
        }
        <FloatButton onClick={openQuickNoteDrawer} icon={<PlusCircleOutlined />} type="primary" style={{ right: 94 }} />
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
        <Modal
            title={`Note: ${getDateInLocalString(viewEditNote?.id)}`}
            centered
            open={openViewEditQuickNote}
            onOk={() => setEditMode(true)}
            onCancel={closeOpenViewEditQuickNote}
            width={1000}
            key={viewEditNote?.ref?.id}
            footer={[
                <>
                    {editMode
                        ? <Button type="primary" onClick={() => handleEditSave(viewEditNote?.ref?.id)}>
                            Save
                        </Button>
                        : <EditFilled style={{ color: "#00b96b" }} onClick={() => setEditMode(true)} />
                    }
                </>
            ]}
        >
            <TextArea disabled={!editMode} rows={11} placeholder="maxLength is 2000"
                maxLength={2000} value={editNote} onKeyDown={handleKeyDown}
                onChange={(e) => setEditNote(e.target.value)} />

        </Modal>
    </>);
}

export default Notes;