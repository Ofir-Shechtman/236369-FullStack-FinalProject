import React from 'react';
import '../../../App.css';
import {createStyles, Theme, withStyles, WithStyles} from "@material-ui/core/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import {Checkbox, ListItemText, OutlinedInput} from "@mui/material";
import axios from "axios";

interface SendPollState {
  data: Array<any>,
  loading: boolean,
  error: boolean,
  selected_poll_id:string,
  users:string[]
}
interface UserProps {
  user: string,
  chat_id: string
}
interface PollProps {
  poll_id: number,
  poll_name: string,
  unsent_users:UserProps[]
}

interface SelectPollProps {
    selected_poll_id: string;
    setSelectPoll: any;
    data: PollProps[];
}


const SelectPoll: React.FC<SelectPollProps> = ({
                              selected_poll_id,
                              setSelectPoll,
                              data
                          }) => {
    const onPollChange = (e: { target: { value: any; }; }) => {
        setSelectPoll({selected_poll_id: e.target.value})
    };
    return (
        <Select onChange={onPollChange} value={selected_poll_id} label="Poll">
                    {data.map((poll: PollProps) => (
                        <MenuItem value={poll.poll_id}>{poll.poll_name}</MenuItem>
                    ))}
                </Select>)
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
    const get_users = (poll: PollProps, state:any) => {
    if(poll.poll_id == state.selected_poll_id){
    return (poll.unsent_users.map((user: UserProps) => (
        <MenuItem key={user.chat_id} value={user.chat_id}>
              <Checkbox checked={users.indexOf(user.chat_id) > -1} />
              <ListItemText primary={user.user} />
            </MenuItem>
                )))}
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
        <Select label="Poll"
                        multiple
                        value={users}
                        onChange={handleChange}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                >
                    {data.map((poll: PollProps) => (
                        get_users(poll, selected_poll_id)))
                    }
                </Select>
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
          users:[]
        };

    sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }


componentDidMount() {
    this.sleep(200)
      .then(r=>axios({
      method: "GET",
      url:"/api/polls_to_send",
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })  )
        .then(resp => resp.data)
        .then(resp => this.setState({
          data: resp,
          loading: false
        }))
        .catch(error => this.setState({
          loading: false,
          error: true
        }));
  }
render() {
    const {data} = this.state;
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
                        })
                                            }}
                        disabled={this.state.users.length===0}>
                    Submit
                </Button>
            </div>
        )
    }
}


export default withStyles(useStyles)(SendPoll)

