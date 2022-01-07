import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);
// axios.post('https://reqres.in/api/articles', article)
//         .then(response => setArticleId(response.data.id));
  const addCharacter = () => {
    const article = { title: 'React Hooks POST Request Example' };
    axios.post('http://127.0.0.1:5000/button', article)
    }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button className='add-button' onClick={addCharacter}> MyButton </button>
        <p>The current time is {currentTime}.</p>
      </header>
    </div>
  );
}

export default App;
