import React, {useState} from 'react';
import '../../../App.css';
import {makeStyles, Theme, createStyles} from "@material-ui/core/styles";
import GitHubIcon from '@mui/icons-material/GitHub';
import Background from '../../../images/about_wallpaper.png';
import QR_blue from '../../../images/qr_blue.jpg';
import QR_green from '../../../images/qr_green.jpg';

import register_gif from '../../../videos/register.gif';
import answer_gif from '../../../videos/answer.gif';
import {
    Button,
    Paper,
    Card,
    CardMedia,
    Typography,
    CardActionArea,
    CardContent,
    Grid,
    AppBar
} from "@mui/material"
import axios from "axios";

const useStyles = makeStyles((theme: Theme) => createStyles({
    body: {
        color: '#272e5d',
        fontSize: 24,
        textAlign: 'justify',
        lineHeight: 1.5,
    },
    button: {
        borderRadius: 15,
        display: "block",
        float: "left",
        margin: "0 7px 0 0",
        color: "#f5f5f5",
        borderTop: "1px solid #eee",
        borderLeft: "1px solid #eee",
        fontFamily: "Lucida Grande, Tahoma, Arial, Verdana, sans-serif",
        fontSize: "100%",
        lineHeight: "130%",
        textDecoration: "none",
        fontWeight: "bold",
        backgroundColor: "#565656",
        cursor: "pointer",
        padding: "5px 10px 6px 7px"
    }
}))

export interface AboutProps {
    token: string;

    removeToken(): void
}

export const About: React.FC<AboutProps> = ({
                                                token, removeToken
                                            }) => {
    const classes = useStyles();
    const [username, setProfileData] = useState<string>("")

    function getData() {
        axios({
            method: "GET",
            url: "/api/profile",
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then((response) => {
                const res = response.data
                setProfileData(res.username)
            }).catch((error) => {
            if (error.response) {
                if (Math.floor(error.response.status / 100) !== 2) {
                    removeToken()
                }
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
        })
    }

    React.useEffect(() => {
        getData();
    }, []);


    const styles = {
        paperContainer: {
            backgroundImage: `url(${Background})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '30%'
        }
    };

    // @ts-ignore
    return (
        <div><AppBar position="static">
            <Typography variant="h3"> Hello {username.charAt(0).toUpperCase() + username.slice(1)} Welcome!</Typography>
        </AppBar>
            <Paper elevation={24} className="PaperAbout" style={styles.paperContainer}>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Card className="Card">
                            <CardActionArea>
                                <CardContent>
                                    <h2> 236369 Managing Data on The World-Wide Web Final Project </h2>
                                    <h3> Submitters: Ofir Shechtman & Ben Lugasi </h3>
                                    <div>
                                        <p>
                                            This is the admin poll managing system,<br/>
                                            here you can Add, Delete and Review your Telegram poll results.<br/>
                                            register our bot by starting a conversation with @FullStackBenOfirBot here
                                            is a
                                            short demo:
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            for more information, see:
                                        </p>
                                        <Button variant="contained"
                                                href="https://github.com/Ofir-Shechtman/236369-FullStack-FinalProject"
                                                target="_blank"
                                                startIcon={<GitHubIcon/>}>
                                            GitHub
                                        </Button>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <a href="https://telegram.me/FullStackBenOfirBot" target="_blank" rel="noopener noreferrer">
                            <Card className="Card">
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        image={QR_blue}
                                        alt="QR code"
                                        // onMouseOver={(e: MouseEventHandler<HTMLDivElement>) => (e.currentTarget.src = {QR_green})}
                                    />
                                </CardActionArea>
                            </Card>
                        </a>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className="Card">
                            <CardActionArea>
                                <Grid container>
                                    <Grid item sx={{maxWidth: 345}}>
                                        <CardMedia
                                            component="img"
                                            height={345 * 650 / 418}
                                            image={register_gif}
                                            alt="register gif"/>
                                    </Grid>
                                    <Grid item xs>
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div" align='center'>
                                                Lizard
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Lizards are a widespread group of squamate reptiles, with over 6,000
                                                species, ranging across all continents except Antarctica
                                            </Typography>
                                        </CardContent>
                                    </Grid>
                                </Grid>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className="Card">
                            <CardActionArea>
                                <Grid container>
                                    <Grid item xs>
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                Lizard
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Lizards are a widespread group of squamate reptiles, with over 6,000
                                                species, ranging across all continents except Antarctica
                                            </Typography>
                                        </CardContent>
                                    </Grid>
                                    <Grid item sx={{maxWidth: 345}}>
                                        <CardMedia
                                            component="img"
                                            height={345 * 650 / 418}
                                            image={answer_gif}
                                            alt="answer gif"/>
                                    </Grid>
                                </Grid>
                            </CardActionArea>
                        </Card>
                    </Grid>
                </Grid>


            </Paper>
        </div>
    )
}