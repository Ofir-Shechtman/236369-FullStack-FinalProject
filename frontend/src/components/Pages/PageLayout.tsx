import React from 'react';
import '../../App.css';
import { About } from './About/About';
import AddNewAdmin from './AddNewAdmin/AddNewAdmin';
import AddNewPoll from "./AddNewPoll/AddNewPoll"
import { MyPolls } from './MyPolls/MyPolls';
import SendPoll from './SendPoll/SendPoll';

export interface PageLayoutProps {
    page: number;
    token: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          page,
                                                          token
                                                      }) => {

    switch(page) {
        case 0:
            return <div className="PageLayout" ><About token={token}/></div>
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