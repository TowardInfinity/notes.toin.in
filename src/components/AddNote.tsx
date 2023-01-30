import MDEditor from "@uiw/react-md-editor";
import { FloatButton, message } from "antd";
import { addDoc, collection } from "firebase/firestore";
import React from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase";
import { createNoteObject } from "../utils/helper";

const AddNotes: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [value, setValue] = React.useState<string>("**Hello world!!!**");
    const navigate = useNavigate();

    const handleSave = () => {
        saveQuickNote()
    }

    const saveQuickNote = () => {
        if (value.trim().length === 0) {
            return;
        }
        addDoc(collection(firestore, 'notes'), createNoteObject(value, "MARKDOWN"))
            .then(res => {
                messageApi.success("Added!");
                navigate("notes");
            }).catch(err => {
                messageApi.success(`[Error] ${err}`);
            })
    };

    return (<>
    {contextHolder}
        <div className="container md-container">
            <MDEditor
                value={value}
                height={920}
                onChange={(val = "") => setValue(val)}
            />
            <FloatButton onClick={handleSave} />
        </div>
    </>);
}

export default AddNotes;