import React from 'react';
import '../../App.css';

export interface HeaderProps {
    changePage(newPage: number): void;
}
export const Header: React.FC<HeaderProps> = ({
    changePage,
}) => {

    return (
        <div className='header-container'>
            <h1 className='app-header'> Pickle Rick 🥒 </h1>
        </div>
    )
}