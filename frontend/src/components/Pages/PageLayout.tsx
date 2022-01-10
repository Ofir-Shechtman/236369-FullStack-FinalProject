import React from 'react';
import '../../App.css';
import { About } from './About/About';
import { AddNewAdmin } from './AddNewAdmin/AddNewAdmin';
import AddNewPoll from "./AddNewPoll/AddNewPoll"
import { MyPolls } from './MyPolls/MyPolls';
// import SignInPage from '../LogInPage/LogInPage'

export interface PageLayoutProps {
    page: number;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          page,
                                                      }) => {

    switch(page) {
        case 0:
            return <div className="PageLayout" ><About/></div>
        case 1:
            return <div className="PageLayout" ><AddNewAdmin/></div>
        case 2:
            return <div className="PageLayout" ><AddNewPoll/></div>
        case 3:
            return <div className="PageLayout" ><MyPolls/></div>
        default:
            return null;

    }
}