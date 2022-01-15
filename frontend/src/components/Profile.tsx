import React from 'react';
import "react-pro-sidebar/dist/css/styles.css";
import '../App.css';
import {Header} from "./Header/Header";
import {PageLayout} from "./Pages/PageLayout";
import Background from "../images/about_wallpaper.png";
import {Paper} from "@mui/material";

interface ProfileProps {
    removeToken: any;
    token: string;

}


const Profile: React.FC<ProfileProps> = ({
                                             removeToken, token
                                         }) => {

    const [page, setPage] = React.useState<number>(0);
    const changePage = (newPage: number) => {
        setPage(newPage);
        // Think about validations...
    }

    const background_styles = {
        paperContainer: {
            backgroundImage: `url(${Background})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '30%'
        }
    };

    return (
        <Paper className="Background" style={background_styles.paperContainer}>
            <div className="Profile">
                <Header changePage={changePage} removeToken={removeToken}/>
                <PageLayout changePage={changePage} page={page} token={token} removeToken={removeToken}/>
            </div>
        </Paper>
    );
}

export default Profile;
