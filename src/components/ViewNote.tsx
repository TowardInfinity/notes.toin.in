import MDEditor from "@uiw/react-md-editor";
import { Typography } from "antd";
import React from "react";
import { NoteType } from "../utils/types";

type Props = {
    note?: NoteType
}

const { Paragraph } = Typography;

const ViewNote: React.FC<Props> = ({ note }) => {

    if (!note) {
        return <></>;
    }

    switch (note.noteType) {
        case "MARKDOWN":
            return <MDEditor
                value={note.body}
                height={300}
                preview="preview"
                hideToolbar={true}
            />;
        case "QUICK":
            return (<Typography>
                <Paragraph>
                    <pre>{note.body}</pre>
                </Paragraph>
            </Typography>);
        default:
            return <></>;
    }
};

export default ViewNote;