import React, {useEffect, useState} from 'react';
import '../../../App.css';
import axios from 'axios';


const postPoll = () => {
    const article = { title: 'React Hooks POST Request Example' };
    axios.post('http://127.0.0.1:5000/button', article)
}

export const About = () => {
    return (
        <div className='about-page-container'>
        <h2> Hi, this is the about page! </h2>
        <h4> 0 </h4>
        <button className='add-button' onClick={postPoll}> MyButton </button>
        </div>
    )
}