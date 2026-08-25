import { Route, Routes, Navigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import type { FC } from "react";
import { Spin } from "antd";
import { auth } from "./firebase";
import Login from "./login/Login";
import Home from "./components/Home";
import AddNotes from "./components/AddNote";
import Notes from "./components/Notes";
import NavBar from "./navbar/NavBar";
import "antd/dist/reset.css";
import "./App.css";

const App: FC = () => {
  const [user, loading] = useIdToken(auth);
  const isAuth = !!user;

  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
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
  );
};

export default App;
