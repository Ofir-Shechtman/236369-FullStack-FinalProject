import React, {useState} from 'react';
import '../../App.css';
import {About, AboutProps} from './About/About';
import {AddNewPoll} from "./AddNewPoll/AddNewPoll"
import { MyPolls } from './MyPolls/MyPolls';
import AdminsList from './AdminsList/AdminsList';
import SendPoll from './SendPoll/SendPoll';
import axios from "axios";

export interface PageLayoutProps {
    page: number;
    token: string;
    changePage(newPage: number): void,
    removeToken():void
}


export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          page,
                                                          token,
                                                          changePage,
    removeToken
                                                      }) => {

    switch(page) {
        case 0:
            return <div className="AboutPage" ><About token={token} removeToken={removeToken}/></div>
        case 1:
            return <div className="PageLayout" ><AdminsList changePage={changePage} token={token}/></div>
        case 2:
            return <div className="PageLayout" ><AddNewPoll token={token}/></div>
        case 3:
            return <div className="PageLayout" ><MyPolls token={token}/></div>
        case 4:
            return <div className="PageLayout" ><SendPoll token={token}/></div>
        default:
            return null;
    }
}