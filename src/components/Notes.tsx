import { Button, Drawer, FloatButton, message, Space, Tooltip, Card, Spin, Popconfirm, Col, Row, Modal, Input, Empty } from "antd";
import { LoadingOutlined, EditFilled, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import React, { useCallback, useEffect, useState } from "react";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { firestore } from "../firebase";
import { NoteType } from "../utils/types";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { buildEditPatch, createNoteObject, getDateInLocalString, noteConverter, deriveTitle, getCompactDate, stripMarkdown } from "../utils/helper";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { mdSanitizeSchema } from "../utils/mdSchema";
import ViewNote from "./ViewNote";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Notes: React.FC = () => {
    const [openQuickNote, setOpenQuickNote] = useState<boolean>(false);
    const [quickNote, setQuickNote] = useState<string>('');
    const [editNote, setEditNote] = useState<string>('');
    const notesRef = collection(firestore, 'notes').withConverter(noteConverter);
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, loading] = useCollectionData(notesRef);
    const [sortedNotes, setSortedNotes] = useState<NoteType[]>([]);
    const [openViewEditQuickNote, setOpenViewEditQuickNote] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [viewEditNote, setViewEditNote] = useState<NoteType | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [saving, setSaving] = useState<boolean>(false);


    useEffect(() => {
        if (notes) {
            const sortedArr = [...notes].sort((a, b) => {
                if (a.id < b.id) {
                    return 1;
                } else if (a.id > b.id) {
                    return -1;
                } else {
                    return 0;
                }
            });
            setSortedNotes(sortedArr);
        }
    }, [notes]);

    const filteredNotes = sortedNotes.filter((note) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            note.body.toLowerCase().includes(query) ||
            getDateInLocalString(note.id).toLowerCase().includes(query)
        );
    });


    const openQuickNoteDrawer = () => {
        setOpenQuickNote(true);
    };

    const closeQuickNoteDrawer = () => {
        setOpenQuickNote(false);
    };

    const closeOpenViewEditQuickNote = () => {
        setOpenViewEditQuickNote(false);
        setEditMode(false);
        setViewEditNote(undefined);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && event.metaKey) {
            addQuickNote();
        }
    }

    const handleEditKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && event.metaKey) {
            handleEditSave(viewEditNote?.ref?.id);
        }
    }

    const addQuickNote = () => {
        saveQuickNote();
    };

    const saveQuickNote = () => {
        if (quickNote.trim().length === 0) {
            return;
        }
        addDoc(collection(firestore, 'notes'), createNoteObject(quickNote))
            .then(res => {
                closeQuickNoteDrawer();
                setQuickNote('');
                messageApi.success("Added!");
            }).catch(err => {
                messageApi.error(`[Error] ${err}`);
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
                        messageApi.error(`[Error] ${err}`);
                    });
            }
        },
        [messageApi],
    );

    const openViewEditDrawer = (id?: string) => {
        if (id) {
            getNote(id);
        }
    }

    const getNote = (id: string) => {
        getDoc(doc(firestore, "notes", id).withConverter(noteConverter))
            .then(res => {
                if (!res.exists()) {
                    messageApi.error("Note not found.");
                    return;
                }
                setViewEditNote(res.data());
                setEditNote(res.data()?.body);
                setOpenViewEditQuickNote(true);
            })
            .catch(err => {
                messageApi.error(`[Error] ${err}`);
            });
    }

    const handleEditSave = (id?: string) => {
        if (!id || saving) {
            return;
        }
        if (!editNote.trim()) {
            messageApi.warning('Note cannot be empty');
            return;
        }
        setSaving(true);
        updateDoc(doc(firestore, "notes", id), buildEditPatch(editNote))
            .then(res => {
                messageApi.success("Updated!");
                closeOpenViewEditQuickNote();
            })
            .catch(err => {
                messageApi.error(`[Error] ${err}`);
            })
            .finally(() => setSaving(false));
    };

    if (loading) {
        return <Spin indicator={antIcon} className="spinner" size="large" />;
    }

    return (<>
        {contextHolder}
        {!loading &&
            <div className="notes-container" style={{ width: '100%', padding: '0 24px' }}>
                <div className="search-header">
                    <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        style={{ maxWidth: 400, margin: '20px auto', display: 'block', height: 40, borderRadius: 20 }}
                    />
                </div>
                <div className="site-card-border-less-wrapper card-container">
                    <Row gutter={[24, 24]} justify="center" style={{ width: '100%', margin: 0 }}>
                        {(notes ?? []).length === 0 ? (
                            <Col span={24}>
                                <Empty description="No notes yet">
                                    <Button type="primary" onClick={openQuickNoteDrawer}>Add your first note</Button>
                                </Empty>
                            </Col>
                        ) : filteredNotes.length === 0 && searchQuery ? (
                            <Col span={24}>
                                <Empty description={`No notes matching "${searchQuery}"`} />
                            </Col>
                        ) : filteredNotes.map((note: NoteType) => {
                            return (<Col xs={24} sm={12} md={8} lg={6} xl={4} key={note.ref?.id + note.id}>
                                <Card hoverable bordered={false} className="card"
                                    title={deriveTitle(note.body)}
                                    extra={
                                        <Popconfirm
                                            title="Delete the note"
                                            description="Are you sure to delete this note?"
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => handleDelete(note.ref?.id)}
                                        >
                                            <Button type="text" size="small" icon={<DeleteOutlined />} aria-label={`Delete note: ${deriveTitle(note.body)}`} />
                                        </Popconfirm>
                                    }>
                                    <button type="button" className="card-open" onClick={() => openViewEditDrawer(note.ref?.id)}>
                                        <span className="card-date">{getCompactDate(note.id)}</span>
                                        <p className="card-description">{stripMarkdown(note.body)}</p>
                                    </button>
                                </Card>
                            </Col>);
                        })}
                    </Row>
                </div>
            </div>
        }
        <FloatButton onClick={openQuickNoteDrawer} icon={<PlusCircleOutlined />} type="primary" style={{ right: 40 }} tooltip="Add note" aria-label="Add note" />
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
                        <Button onClick={addQuickNote} type="primary" disabled={!quickNote.trim()}>
                            Add
                        </Button>
                    </Tooltip>
                </Space>
            }
        >
            <TextArea rows={11} placeholder="Jot a thought…" maxLength={2000} value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                onKeyDown={handleKeyDown} />
        </Drawer>
        <Modal
            title={viewEditNote ? `Note: ${getDateInLocalString(viewEditNote.id)}` : "Note"}
            centered
            open={openViewEditQuickNote}
            onOk={() => setEditMode(true)}
            onCancel={closeOpenViewEditQuickNote}
            width="min(1000px, calc(100vw - 32px))"
            key={viewEditNote?.ref?.id}
            footer={[
                <>
                    {editMode
                        ? <Button type="primary" onClick={() => handleEditSave(viewEditNote?.ref?.id)} loading={saving} disabled={saving} aria-label="Save note">
                            Save
                        </Button>
                        : <Button type="text" size="small" icon={<EditFilled style={{ color: "#00b96b" }} />} onClick={() => setEditMode(true)} aria-label="Edit note">
                            Edit
                        </Button>
                    }
                </>
            ]}
        >
            {editMode
                ? viewEditNote?.noteType === 'MARKDOWN'
                    ? <MDEditor
                        value={editNote}
                        height={300}
                        onChange={(val = "") => setEditNote(val)}
                            previewOptions={{
                                remarkPlugins: [remarkMath],
                                rehypePlugins: [[rehypeSanitize, mdSanitizeSchema], [rehypeKatex]],
                            }}
                    />
                    : <TextArea rows={11} placeholder="Jot a thought…"
                        maxLength={2000} value={editNote} onKeyDown={handleEditKeyDown}
                        onChange={(e) => setEditNote(e.target.value)} />
                : <ViewNote note={viewEditNote} />}
        </Modal>
    </>);
}

export default Notes;
