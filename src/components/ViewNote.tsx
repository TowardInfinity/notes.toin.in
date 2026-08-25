import MDEditor from "@uiw/react-md-editor";
import { Typography } from "antd";
import React from "react";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { mdSanitizeSchema } from "../utils/mdSchema";
import 'katex/dist/katex.css';
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
                preview="preview"
                hideToolbar={true}
                height={400}
                previewOptions={{
                    remarkPlugins: [remarkMath],
                    rehypePlugins: [[rehypeSanitize, mdSanitizeSchema], [rehypeKatex]],
                }}
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