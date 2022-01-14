import React from 'react';
import '../../../App.css';
import {createStyles, Theme, withStyles, WithStyles} from "@material-ui/core/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import {
    Alert, AlertColor,
    AlertTitle,
    Checkbox,
    Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
    FormControl,
    ListItemText,
    OutlinedInput
} from "@mui/material";
import axios from "axios";
import InputLabel from "@mui/material/InputLabel";

interface PostResultList {
    results:Array<PostResult>,
}

interface PostResult {
    name:string,
    status:string
}

interface SendPollState {
  data: Array<any>,
  loading: boolean,
  error: boolean,
  selected_poll_id:string,
  users:string[],
  popup_status:boolean,
  popup_results:PostResultList

}
interface UserProps {
  user: string,
  chat_id: string
}
interface PollProps {
  poll_id: string,
  poll_name: string,
  unsent_users:UserProps[]
}

interface SelectPollProps {
    selected_poll_id: string;
    setSelectPoll: any;
    data: PollProps[];
}

const get_poll_name=function(poll_id:string, data:PollProps[]){
    data.forEach((poll: PollProps) => {
        if(poll.poll_id == poll_id){
            return poll.poll_name
        }
    })
}


const SelectPoll: React.FC<SelectPollProps> = ({
                                                   selected_poll_id,
                                                   setSelectPoll,
                                                   data
                                               }) => {
    // @ts-ignore
    const onPollChange = (event) => {
        setSelectPoll(event.target.value)
    };

    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel>Poll</InputLabel>
            <Select onChange={onPollChange}
                    value={selected_poll_id}
                    label="Poll"
            >
                {data.map((poll: PollProps) => (
                    <MenuItem key={poll.poll_id} value={poll.poll_id}>{poll.poll_name}</MenuItem>
                ))}
            </Select></FormControl>)
}

interface SelectUsersProps {
    selected_poll_id: string;
    users: string[];
    setUsers:any;
    data: PollProps[];
}

const SelectUsers: React.FC<SelectUsersProps> = ({
                              selected_poll_id,
                              users,
                              setUsers,
                              data
                          }) => {
    const get_users = (poll: PollProps, selected_poll_id:string) => {
    if(poll.poll_id == selected_poll_id){
        return (poll.unsent_users.map((user: UserProps) => (
            <MenuItem key={user.chat_id} value={user.user}>
                  <Checkbox checked={users.indexOf(user.user) > -1} />
                  <ListItemText primary={user.user} />
                </MenuItem>
                    )))
    }
    }
    const handleChange = (event: { target: { value: any; }; }) => {
        const {
            target: {value},
        } = event;
        // @ts-ignore
        setUsers(typeof value === 'string' ? value.split(',') : value);
    }
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };
    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel >Receivers</InputLabel>
            <Select label="Receivers"
                    multiple
                    value={users}
                    onChange={handleChange}
                    input={<OutlinedInput label="Receivers" />}
                    renderValue={(selected) => selected.join(', ')}
                    // @ts-ignore
                    // renderValue={(selected) => {
                    //     return get_user_name(selected, data, selected_poll_id);
                    // }}
                    MenuProps={MenuProps}
            >
                {data.map((poll: PollProps) => (
                    get_users(poll, selected_poll_id)))
                }
            </Select>
        </FormControl>
    )
}



const useStyles = (theme: Theme) => createStyles({})
interface Props extends WithStyles<typeof useStyles> {token:string}

export interface MyPollsProps {
    token: string;
}


class SendPoll extends React.Component<Props,SendPollState> {
    state = {
          data: [],
          loading: true,
          error: false,
          selected_poll_id:"",
          users:[],
          popup_status:false,
          popup_results:{results:[]}
        };

    sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    refresh = () =>{
        axios({
      method: "GET",
      url:"/api/polls_to_send",
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(resp => resp.data)
        .then(resp => this.setState({
          data: resp,
          loading: false
        }))
        .catch(error => this.setState({
          loading: false,
          error: true
        }));
    }


componentDidMount() {
    this.refresh()
  }
render() {
    const {data} = this.state;

    function render_severity(status: string):AlertColor {
        if(status=="PollAlreadySent") {
            return "warning";
        }
        if(status=="PollSentAgain") {
            return "error";
        }
        if(status=="DatabaseUnknownError") {
            return "error";
        }
        return "success";
    }

    return (
            <div className="SendPoll">
                <SelectPoll selected_poll_id={this.state.selected_poll_id} setSelectPoll={(selected_poll_id:string)=>{this.setState({
                    selected_poll_id: selected_poll_id})}} data={data}/>
                <SelectUsers selected_poll_id={this.state.selected_poll_id} setUsers={(newvalue:any[])=>{this.setState({
                    users: newvalue})}} users={this.state.users} data={data}/>
                <Button variant="contained"
                        component="label"
                        onClick={() => {
                        axios({
                          method: "POST",
                          url:"/api/send_poll",
                          headers: {
                            Authorization: 'Bearer ' + this.props.token
                          },
                              data:{'poll':this.state.selected_poll_id, 'users':this.state.users}
                        }).then((result) => this.setState({popup_results: result.data})).then(()=>console.log(this.state.popup_results))
                          .then(()=>this.refresh())
                            .then(() => this.setState({
                    popup_status: true, users:[]})).catch(error => {
    this.setState({popup_results: {results:[]}})
})
                                            }}
                        disabled={this.state.users.length===0}>
                    Submit
                </Button>
                <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "60%" }}>
        <Dialog
        open={this.state.popup_status}
        onClose={()=>{this.setState({
                    popup_status: false})}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      ><DialogTitle id="alert-dialog-title">
          Sent results:
        </DialogTitle>
        <DialogContent>
                {this.state.popup_results.results.map((user_data: PostResult) => (
                    <Alert severity={render_severity(user_data.status)}><strong>{user_data.name}</strong> - {user_data.status}</Alert>
                    ))}
            </DialogContent>
            <DialogActions>
          <Button onClick={()=>{this.setState({
                    popup_status: false})}}>Close</Button>        </DialogActions>
      </Dialog>
      </div>
    </div>
            </div>
        )
    }
}


export default withStyles(useStyles)(SendPoll)

