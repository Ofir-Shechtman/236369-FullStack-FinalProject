import React from 'react';
import '../../App.css';
import { About } from './About/About';
import { AddNewAdmin } from './AddNewAdmin/AddNewAdmin';
import { AddNewPoll } from './AddNewPoll/AddNewPoll';
import { MyPolls } from './MyPolls/MyPolls';
import { PollView } from './PollView/PollView';

export interface PageLayoutProps {
    page: number;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
                                                          page,
                                                      }) => {

    switch(page) {
        case 0:
            return <About/>
        case 1:
            return <AddNewAdmin/>
        case 2:
            return <AddNewPoll/>
        case 3:
            return <MyPolls/>
        case 4:
            return <PollView/>
        default:
            return null;

    }
}