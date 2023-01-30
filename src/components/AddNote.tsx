import MDEditor from "@uiw/react-md-editor";
import React from "react";

const AddNotes: React.FC = () => {
    const [value, setValue] = React.useState<string>("**Hello world!!!**");

    return (<>
        <div className="container md-container">
            <MDEditor
                value={value}
                height={920}
                onChange={(val = "") => setValue(val)}
            />
            {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
        </div>
    </>);
}

export default AddNotes;