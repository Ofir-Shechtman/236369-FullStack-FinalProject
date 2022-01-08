import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import "react-pro-sidebar/dist/css/styles.css";
import './App.css';
import {Header} from "./components/Header/Header";
import {PageLayout} from "./components/Pages/PageLayout";

function App() {
  const [page, setPage] = React.useState<number>(2);
  const changePage = (newPage: number) => {
    setPage(newPage);
    // Think about validations...
  }

  return (
    <div className="App">
      <Header changePage={changePage}/>
      <PageLayout page={page}/>
    </div>
  );
}

export default App;
