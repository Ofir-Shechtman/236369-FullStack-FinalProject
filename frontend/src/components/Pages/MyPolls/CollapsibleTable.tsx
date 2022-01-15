import React from 'react';
import PropTypes from 'prop-types';
import {
    Box, Collapse, IconButton, Table, TablePagination, TableBody, TableCell, TableContainer, TableHead,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
    TableRow, Typography, Paper, TableFooter, Grid, CircularProgress, Tooltip
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from "@material-ui/icons/Delete";
import {BarChart} from './BarChart'
import {PieChart} from './PieChart'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import ReportIcon from '@mui/icons-material/Report';
import {FaClock} from "react-icons/fa";
import '../../../App.css'
import {TableColumns} from '../../../AppConstants'
import axios from "axios";

function Row(props: any) {
    const {row, refreshPage, token} = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [open, setOpen] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);

    const handleClickOpen = () => {
        setOpenAlert(true);
    };

    const handleClose = () => {
        setOpenAlert(false);
    };

    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleDeletePoll = (poll_id: number, token: string) => {
        handleClose()
        axios({
            method: "POST",
            url: "/api/delete_poll",
            headers: {
                Authorization: 'Bearer ' + token
            },
            data: {poll_id: poll_id}
        }).then(() => refreshPage())
    }

    const handleStopPoll = (poll_id: number, token: string) => {
        const stop_msg = {poll_id: poll_id};
        axios({
            method: "POST",
            url: "/api/stop_poll",
            headers: {
                Authorization: 'Bearer ' + token
            },
            data: stop_msg
        }).then(() => refreshPage())
    }

    return (
        <React.Fragment>
            <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
                <TableCell>
                    <Tooltip title="Expand">
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell align="center">{row.poll_name}</TableCell>
                <TableCell
                    align="center">{row.poll_type == "Telegram_poll" ? "Telegram Poll" : "Telegram Inline Keyboard"}</TableCell>
                <TableCell align="center">
                    {row.allows_multiple_answers ?
                        <Tooltip title="Multiple answers allowed"><CheckRoundedIcon color="success"/></Tooltip> :
                        <Tooltip title="Multiple answers not allowed"><ClearRoundedIcon color="error"/></Tooltip>}
                </TableCell>
                <TableCell align="center">{row.answers_count.toString() + '/' + row.receivers.toString()}</TableCell>
                <TableCell align="center">{row.close_date}</TableCell>
                <TableCell align="center">
                    <Tooltip title={row.open ? "Poll Active" : "Poll Closed"}>
                        <CircleTwoToneIcon sx={{color: row.open ? "green" : "red"}}/>
                    </Tooltip>
                </TableCell>
                <TableCell align="center">
                    <Tooltip title="Stop Poll">
                        <IconButton disabled={row.poll_type != "Telegram_poll" || !row.open}>
                            <StopCircleIcon onClick={() => handleStopPoll(row.poll_id, props.token)}/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell align="center">
                    <Tooltip title="Delete Poll">
                        <IconButton>
                            <DeleteIcon onClick={handleClickOpen}/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Typography variant="h6" gutterBottom component="div">
                                {row.question}
                            </Typography>
                            <Table size="medium" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={"tableSecondHeader"}>Charts</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableCell>
                                        <Grid container>
                                            <Grid item><BarChart categories={row.poll_options}
                                                                 data={row.answers}/></Grid>
                                            <Grid item><PieChart categories={row.poll_options}
                                                                 data={row.answers}/></Grid>
                                        </Grid>
                                    </TableCell>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Typography variant="h6" gutterBottom component="div">
                                Receivers
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={"tableSecondHeader"}>Username</TableCell>
                                        <TableCell className={"tableSecondHeader"} align="center">Answers</TableCell>
                                        <TableCell className={"tableSecondHeader"} align="center">Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.poll_answers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((answer: any) => (
                                        <TableRow key={answer.user}>
                                            <TableCell component="th" scope="row">{answer.user}</TableCell>
                                            <TableCell align="center">
                                                {(answer.answers.length != 0) ? answer.answers.join(', ') : <FaClock/>}
                                            </TableCell>
                                            <TableCell align="center">{answer.time_answered}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 15, 20]}
                                        component="div"
                                        count={row.poll_answers.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableFooter>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
            <Dialog
                open={openAlert}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Poll?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this poll?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>No</Button>
                    <Button onClick={() => handleDeletePoll(row.poll_id, props.token)} autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        poll_id: PropTypes.number.isRequired,
        poll_name: PropTypes.string.isRequired,
        poll_type: PropTypes.string.isRequired,
        close_date: PropTypes.string.isRequired,
        allows_multiple_answers: PropTypes.bool.isRequired,
        question: PropTypes.string.isRequired,
        poll_options: PropTypes.arrayOf(PropTypes.string.isRequired),
        answers: PropTypes.arrayOf(PropTypes.number.isRequired),
        poll_answers: PropTypes.arrayOf(
            PropTypes.shape({
                user: PropTypes.string.isRequired,
                answers: PropTypes.arrayOf(PropTypes.string.isRequired),
                time_answered: PropTypes.string.isRequired,
            }),).isRequired,
        answers_count: PropTypes.number.isRequired,
        receivers: PropTypes.number.isRequired,
        open: PropTypes.bool.isRequired
    }).isRequired,
    refreshPage: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired
};


interface PollProps {
    poll_id: number,
    poll_name: string,
    poll_type: string,
    close_date: string,
    allows_multiple_answers: boolean,
    question: string,
    poll_options: Array<string>,
    answers: Array<number>,
    poll_answers: any,
    answers_count: number,
    receivers: number,
    open: boolean
}

interface CollapsibleTableState {
    data: Array<any>,
    loading: boolean,
    error: boolean
}

interface Props {
    token: string,
}

export default class CollapsibleTable extends React.Component<Props, CollapsibleTableState> {
    state = {
        data: [],
        loading: true,
        error: false,
    }


    refreshPage = () => {
        this.setState({loading: true, error: false})
        this.componentDidMount()
    }
    sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    componentDidMount() {
        this.sleep(0)
            .then(() => axios({
                method: "GET",
                url: "/api/polls",
                headers: {
                    Authorization: 'Bearer ' + this.props.token
                }
            }))
            .then(resp => resp.data)
            .then(resp => this.setState({
                data: resp,
                loading: false
            }))
            .catch(() => this.setState({
                loading: false,
                error: true
            }));
    }

    render() {
        const {data, loading, error} = this.state;
        return (
            <div>
                <TableContainer component={Paper} elevation={24} className={"tableContainer"}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={"TableHeader"}/>
                                {TableColumns.map((column: { width: string, title: string }) => (
                                    <TableCell align="center" className={"TableHeader"}
                                               style={{width: column.width}}>{column.title}</TableCell>
                                ))}
                                <TableCell className={"TableHeader"} onClick={this.refreshPage}>
                                    <Tooltip title="Refresh">
                                        <IconButton>
                                            <RefreshRoundedIcon className={"refresh_icon"}/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading &&
                                <TableCell sx={{display: 'flex'}}>
                                    <Tooltip title="Loading">
                                        <CircularProgress/>
                                    </Tooltip>
                                </TableCell>
                            }
                            {!loading && !error &&
                                data.map((row: PollProps) => (
                                    <Row key={row.poll_id}
                                         row={row}
                                         refreshPage={this.refreshPage}
                                         token={this.props.token}
                                    />
                                ))
                            }
                            {error &&
                                <TableCell sx={{display: 'flex'}}>
                                    <Tooltip title="Can't load data">
                                        <ReportIcon fontSize="large" color="error"/>
                                    </Tooltip>
                                </TableCell>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}