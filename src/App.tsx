import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import 'antd/dist/reset.css';
import { useIdToken } from 'react-firebase-hooks/auth';
import './App.css';
import Login from './login/Login';
import { Route, Routes, Navigate } from "react-router-dom";
import { message } from 'antd';
import Home from './components/Home';
import { auth } from "./firebase";
import NavBar from './navbar/NavBar';
import AddNotes from './components/AddNote';
import Notes from './components/Notes';

const App: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [user, loading, error] = useIdToken(auth);
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
        {/* {loading && <Spin tip="Loading" size="large" />} */}
        <Routes>
          <Route path="/" element={isAuth ? <Notes /> : <Login />} />
          {isAuth && <>
            <Route path="/home" element={<Home />} />
            <Route path="/add-note" element={<AddNotes />} />
            <Route path="/notes" element={<Notes />} />
          </>}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
