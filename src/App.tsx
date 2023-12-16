import { Route, Routes, Navigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import type { FC } from "react";
import { auth } from "./firebase";
import Login from "./login/Login";
import Home from "./components/Home";
import AddNotes from "./components/AddNote";
import Notes from "./components/Notes";
import NavBar from "./navbar/NavBar";
import "antd/dist/reset.css";
import "./App.css";
import { message } from "antd";

const App: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [user] = useIdToken(auth);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, [user]);

  return (
    <>
      {contextHolder}
      <div className="App">
        {isAuth && <NavBar />}
        <Routes>
          <Route path="/" element={isAuth ? <Notes /> : <Login />} />
          {isAuth && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/add-note" element={<AddNotes />} />
              <Route path="/notes" element={<Notes />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
