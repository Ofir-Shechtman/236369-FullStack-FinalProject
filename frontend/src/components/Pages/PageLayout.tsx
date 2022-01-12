import React from 'react';
import '../../App.css';
import { About } from './About/About';
import AddNewAdmin from './AddNewAdmin/AddNewAdmin';
import AddNewPoll from "./AddNewPoll/AddNewPoll"
import { MyPolls } from './MyPolls/MyPolls';
import SendPoll from './SendPoll/SendPoll';

export interface PageLayoutProps {
    page: number;
    username: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          page,
                                                          username
                                                      }) => {

    switch(page) {
        case 0:
            return <div className="PageLayout" ><h1>Hello {username}</h1><About/></div>
        case 1:
            return <div className="PageLayout" ><AddNewAdmin/></div>
        case 2:
            return <div className="PageLayout" ><AddNewPoll/></div>
        case 3:
            return <div className="PageLayout" ><MyPolls/></div>
        case 4:
            return <div className="PageLayout" ><SendPoll/></div>

        default:
            return null;

    }
}