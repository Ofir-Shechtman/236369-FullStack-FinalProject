import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import {Header} from "./components/Header/Header";
import {NavPane} from "./components/NavPane/NavPane";
import {PageLayout} from "./components/Pages/PageLayout";

function App() {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  const [page, setPage] = React.useState<number>(0);

  const changePage = (newPage: number) => {
    setPage(newPage);
    // Think about validations...
  }

  const addCharacter = () => {
    const article = { title: 'React Hooks POST Request Example' };
    axios.post('http://127.0.0.1:5000/button', article)
    }

  return (
    <div className="App">
      <header className="App-header">
        <Header/>
        <NavPane changePage={changePage}/>
        <PageLayout page={page}/>
        <button className='add-button' onClick={addCharacter}> MyButton </button>
        <p>The current time is {currentTime}.</p>
      </header>
    </div>
  );
}

export default App;
