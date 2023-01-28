import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import 'antd/dist/reset.css';
import { useIdToken } from 'react-firebase-hooks/auth';
import './App.css';
import Login from './login/Login';
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Alert, Space, Spin } from 'antd';
import Home from './components/Home';
import { auth } from "./firebase";
import NavBar from './navbar/NavBar';

const App: FC = () => {
  const [user, loading, error] = useIdToken(auth);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, [user]);

  return (
    <div className="App">
      {isAuth && <NavBar />}
      {/* {loading && <Spin tip="Loading" size="large" />} */}
      <Routes>
        <Route path="/" element={isAuth ? <Home /> : <Login />} />
        {isAuth && 
          <Route path="/home" element={<Home />} />
        }
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
}

export default App;
