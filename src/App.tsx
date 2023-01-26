import React from 'react';
import type {FC} from 'react';
import 'antd/dist/reset.css';
import logo from './logo.svg';
import './App.css';
import Login from './login/Login';

const App: FC = () => {
  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <Login />
    </div>
  );
}

export default App;
