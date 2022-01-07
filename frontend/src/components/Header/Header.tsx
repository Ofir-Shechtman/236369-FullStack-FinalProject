import React from 'react';
import '../../App.css';
import {NavPane} from "../NavPane/NavPane";

export interface HeaderProps {
    changePage(newPage: number): void;
}

export const Header: React.FC<HeaderProps> = ({
    changePage,
}) => {
    return (
        <div className='Header'>
            <div className='Title'>Hi</div>
            <NavPane changePage={changePage}/>
        </div>
    )
}