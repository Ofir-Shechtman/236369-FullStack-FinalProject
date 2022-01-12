import React from 'react';
import '../../../App.css';
import CollapsibleTable from './CollapsibleTable'


export interface MyPollsProps {
    token: string;
}

export const MyPolls: React.FC<MyPollsProps> = ({
                                                          token
                                                      }) => {
    return (
        <div className="MyPolls">
            <CollapsibleTable token={token}/>
        </div>
    )
}