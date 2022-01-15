import React, {useState} from 'react';
import '../../../App.css';
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
    AppBar,
    Toolbar
} from "@mui/material"
import axios from "axios";


export interface AboutProps {
    token: string;
    removeToken(): void
}

export const About: React.FC<AboutProps> = ({
                                                token, removeToken
                                            }) => {
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

    const [qr, setQR] = React.useState<string>(QR_blue);

    // @ts-ignore
    return (
        <div><AppBar position="static">
            <Toolbar variant="dense">
                <Typography variant="h6" color="inherit" component="div">
                    236369 Final Project - Submitters: Ofir Shechtman & Ben Lugasi
                </Typography>
            </Toolbar>
        </AppBar>
            <Paper className="PaperAbout" style={styles.paperContainer}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item xs={8}>
                        <Card className="Card">
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        Hello <strong>{username.charAt(0).toUpperCase() + username.slice(1)}</strong>,
                                    </Typography>
                                    <Typography gutterBottom variant="h6" component="div">
                                        Welcome to our <i>'Managing Data on The World-Wide-Web'</i> Final Project.
                                    </Typography>
                                    <Typography gutterBottom variant="body1" component="div">
                                        This is the admin poll managing system,<br/>
                                        here you can Add, Delete and Review your Telegram poll results.<br/>
                                    </Typography>
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
                                        image={qr}
                                        alt="QR code"
                                        onMouseOver={(() => (setQR(QR_green)))}
                                        onMouseOut={(() => (setQR(QR_blue)))}
                                    />
                                </CardActionArea>
                            </Card>
                        </a>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className="Card">
                            <CardActionArea>
                                <Grid container justifyContent="center" alignItems="center">
                                    <Grid item sx={{maxWidth: 345}}>
                                        <CardMedia
                                            component="img"
                                            height={345 * 650 / 418}
                                            image={register_gif}
                                            alt="register gif"/>
                                    </Grid>
                                    <Grid item xs>
                                        <CardContent>
                                            <Typography gutterBottom variant="h4" component="div">
                                                Register flow
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary">
                                                Users can join the polling system by using the <a
                                                href={"https://github.com/Ofir-Shechtman/236369-FullStack-FinalProject"}>Telegram
                                                bot</a>.
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
                                <Grid container justifyContent="center" alignItems="center">
                                    <Grid item xs>
                                        <CardContent>
                                            <Typography gutterBottom variant="h4" component="div">
                                                Answer flow
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary">
                                                As an of  admin our Polling System you can send
                                                polls to registered users and they will receive and answer polls as shown here
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