import React from 'react';
import { Pages } from '../../app-constants';
import '../../App.css';


export interface NavPaneProps {
    changePage(newPage: number): void;
}

export const NavPane: React.FC<NavPaneProps> = ({
    changePage,
}) => {
    const handlePageChange = (page: string) => {
        changePage(Pages[page]);
    }

    return (
        <div className='NavPane'>
            {Object.keys(Pages).map(page =>
                <button key={page} className='nav-button' onClick={() => handlePageChange(page)}>
                    {page}
                </button>)}
        </div>
    )
}