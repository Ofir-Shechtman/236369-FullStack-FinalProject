import React from 'react';
import '../../../App.css';
import Button from "@mui/material/Button";
import {
    Alert, AlertColor,
    Checkbox,
    Dialog, DialogActions,
    DialogContent, DialogTitle,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    Grid, FormGroup, Tooltip,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import axios from "axios";
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';

interface UserProps {
    user: string,
    chat_id: string,
    checked: boolean,
    sent: boolean
}

interface PollProps {
    poll_id: string,
    poll_name: string,
    users: Array<UserProps>
}

interface SelectPollProps {
    selected_poll_id: string;
    setSelectPoll: any;
    setUsers: any;
    data: Array<PollProps>;
}


const SelectPoll: React.FC<SelectPollProps> = ({
                                                   selected_poll_id,
                                                   setSelectPoll,
                                                   setUsers,
                                                   data
                                               }) => {
    const error = selected_poll_id == ""

    const onPollChange = (event: any) => {
        setSelectPoll(event.target.value)
        let selected_poll = data.find(({poll_id}) => poll_id == event.target.value)
        if (selected_poll != null) {
            for (let user of selected_poll.users) {
                user.checked = false
            }
            setUsers(selected_poll.users)
        }
    };


    return (
        <FormControl
            component="fieldset"
            error={error}>
            <FormLabel component="legend">Poll</FormLabel>
            <RadioGroup
                aria-label="Poll"
                name="controlled-radio-buttons-group"
                value={selected_poll_id}
                onChange={onPollChange}
            >
                {data.map((poll: PollProps) => (
                    <FormControlLabel key={poll.poll_id}
                                      value={poll.poll_id}
                                      disabled={poll.users.filter((v) => !v.sent).length == 0}
                                      control={<Radio/>}
                                      label={poll.poll_name}/>
                ))}
            </RadioGroup>
        </FormControl>
    )
}

interface SelectUsersProps {
    selected_poll_id: string;
    setUsers: any;
    users: Array<UserProps>;
    data: PollProps[];
}

const SelectUsers: React.FC<SelectUsersProps> = ({selected_poll_id, setUsers, users, data}) => {
    const error = users.filter((user) => (!user.sent) && user.checked).length == 0;

    const get_users = (poll: PollProps, selected_poll_id: string) => {
        if (poll.poll_id == selected_poll_id) {
            return (
                poll.users.map((user: UserProps) => (

                    <FormControlLabel key={user.chat_id}
                                      value={user.chat_id}
                                      disabled={user.sent}
                                      control={<Checkbox/>}
                                      label={
                                          <Grid container style={{minWidth: '200px'}}>
                                              <Grid item lg={10}>
                                                  {user.user}
                                              </Grid>
                                              <Grid item lg={2} zeroMinWidth>
                                                  {user.sent &&
                                                      <Tooltip title={"Already sent"}>
                                                          <CheckCircleTwoToneIcon color={"success"}/>
                                                      </Tooltip>
                                                  }
                                              </Grid>
                                          </Grid>
                                      }/>
                )))
        }
    }

    const onSelectedUsersChange = (event: any) => {
        let changed_user = users.find(({chat_id}) => chat_id == event.target.value)
        if (changed_user != null) {
            changed_user.checked = event.target.checked
        }
        setUsers(users)
    }


    return (
        <FormControl
            error={error}
            component="fieldset"
            variant="standard"
        >
            <FormLabel component="legend">Receivers</FormLabel>
            <FormGroup onChange={onSelectedUsersChange}>
                {data.map((poll: PollProps) => (
                    get_users(poll, selected_poll_id)))
                }
            </FormGroup>
        </FormControl>
    )
}


interface Props {
    token: string
}

export interface MyPollsProps {
    token: string;
}

interface PostResult {
    name: string,
    status: string
}

interface PostResultList {
    results: Array<PostResult>,
}

interface SendPollState {
    data: Array<any>,
    loading: boolean,
    error: boolean,
    selected_poll_id: string,
    users: Array<UserProps>,
    popup_status: boolean,
    popup_results: PostResultList,
}

export default class SendPoll extends React.Component<Props, SendPollState> {
    state = {
        data: [],
        loading: true,
        error: false,
        selected_poll_id: "",
        users: [],
        popup_status: false,
        popup_results: {results: []},
        selected_users: []
    };

    sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    refresh = () => {
        axios({
            method: "GET",
            url: "/api/polls_to_send",
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then(resp => resp.data)
            .then(resp => this.setState({
                data: resp,
                loading: false
            }))
            .catch(() => this.setState({
                loading: false,
                error: true
            }));
    }

    componentDidMount() {
        this.refresh()
    }

    render() {
        const {data} = this.state;

        const setUsers = (users: Array<UserProps>) => {
            this.setState({users: users})
        }

        const setUserForSelectedPoll = () => {
            let found_poll = data.find(({poll_id}) => poll_id == this.state.selected_poll_id)
            if (found_poll != null) {
                let selected_poll: PollProps = found_poll
                for (let user of selected_poll.users) {
                    user.checked = false
                }
                setUsers(selected_poll.users)
            }
        }

        const sendPoll = () => {
            axios({
                method: "POST",
                url: "/api/send_poll",
                headers: {
                    Authorization: 'Bearer ' + this.props.token
                },
                data: {
                    'poll': this.state.selected_poll_id,
                    'users': this.state.users.filter((v: UserProps) => v.checked)
                }
            }).then((result) => this.setState({popup_results: result.data})).then(() => console.log(this.state.popup_results))
                .then(() => this.refresh())
                .then(() => this.setState({popup_status: true}))
                .then(() => setUserForSelectedPoll())
                .catch(() => {
                    this.setState({popup_results: {results: []}})
                })
        }

        function render_severity(status: string): AlertColor {
            if (status == "PollAlreadySent") {
                return "warning";
            }
            if (status == "PollSentAgain") {
                return "error";
            }
            if (status == "PollNotSent") {
                return "error";
            }
            if (status == "DatabaseUnknownError") {
                return "error";
            }
            return "success";
        }

        return (
            <div className="Page">
                <Paper elevation={24} className="Paper">
                    <Stack spacing={3}>
                        <Typography variant={"h4"}>Send Poll</Typography>
                        <Grid container>
                            <Grid item lg={4}>
                                <SelectPoll selected_poll_id={this.state.selected_poll_id}
                                            setSelectPoll={(selected_poll_id: string) => {
                                                this.setState({
                                                    selected_poll_id: selected_poll_id
                                                })
                                            }}
                                            setUsers={(users: Array<UserProps>) => {
                                                this.setState({users: users})
                                            }}
                                            data={data}/>
                            </Grid>
                            <Grid item lg={4}>
                                <SelectUsers selected_poll_id={this.state.selected_poll_id}
                                             setUsers={setUsers}
                                             users={this.state.users}
                                             data={data}/>
                            </Grid>
                        </Grid>
                        <Button variant="contained"
                                component="label"
                                disabled={this.state.users.filter((user: UserProps) => user.checked).length == 0}
                                onClick={sendPoll}>
                            Send Poll
                        </Button>
                    </Stack>
                    <div className={"Dialog"}>
                        <Dialog
                            open={this.state.popup_status}
                            onClose={() => {
                                this.setState({
                                    popup_status: false
                                })
                            }}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description">
                            <DialogTitle id="alert-dialog-title">Sent results:</DialogTitle>
                            <DialogContent>
                                {this.state.popup_results.results.map((user_data: PostResult) => (
                                    <Alert
                                        severity={render_severity(user_data.status)}><strong>{user_data.name}</strong> - {user_data.status}
                                    </Alert>
                                ))}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    this.setState({popup_status: false})
                                }}>
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </Paper>
            </div>
        )
    }
}

