import React, {useState} from 'react';
import { useForm } from 'react-hook-form';


import '../../../App.css';

import {PollType, FormValues} from "./FormValues";
import {PollTypeForm, SwitchForm, MUITextField, MultipleOptions, CloseTimePicker} from './Forms'
import {v4 as uuidv4} from "uuid";
import axios, {AxiosResponse} from "axios";
import {Alert, AlertColor, AlertTitle, Dialog, Paper, Typography, Button, Stack} from "@mui/material";

export interface AddNewPollProps {
    token: string;
}

function Popup(props: { handleClose: () => void, open: boolean, alert_header: AlertColor, alert_body:string }) {
    return (
    <div className={"Dialog"}>
        <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
            <Alert severity={props.alert_header}>
              <AlertTitle>{props.alert_header.charAt(0).toUpperCase() + props.alert_header.slice(1)}</AlertTitle>
                <Stack><div>{props.alert_body}</div>
                <Button onClick={props.handleClose}>Close</Button>
                </Stack>
            </Alert>
        </Dialog>
    </div>
  );
}

export const AddNewPoll: React.FC<AddNewPollProps> = ({
                                                          token
                                                      }) => {
    const [data, setData] = React.useState<Poll[]>([]);

    interface Poll {
      poll_id: string,
      poll_name: string
    }

    function refresh() {
        axios({
      method: "GET",
      url:"/api/polls_to_send",
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then((response) => {
      setData(response.data);
    })
    }

    React.useEffect(() => {
    refresh()
  }, []);
  const {handleSubmit, control} = useForm<FormValues>();
  const [multiple_enable, multipleSwitch] = React.useState<boolean>(true);
  const [poll_type, setPollSwitch] = React.useState<PollType>("Telegram_poll");
  const [switch_value, setTimeSwitch] = React.useState<boolean>(false);
  const [slider_value, setTimeSlider] = React.useState<number>(5);


    const [inputFields, setInputFields] = useState([
    { id: uuidv4(), Option: '', FollowupPoll:'None'}, { id: uuidv4(), Option: '', FollowupPoll:'None'}
  ]);
    const [popup_status, setPopupStatus] = useState<boolean>(false);
    const [alert_header, setAlertHeader] = React.useState<AlertColor>('success');
    const [alert_body, setAlertBody] = React.useState<string>("Error");

    const updatePostReturn = (status: AxiosResponse<any, any>) => {
        if(status.status===200){
            setAlertHeader("success");
            setAlertBody("Your poll successfully added!");
        }
        else{
            setAlertHeader("error");
            if(status.data == "PollExists"){
                setAlertBody("Your poll name already in the system  — choose another name!");
            }
            else if(status.data == "OptionExists"){
                setAlertBody("Your poll contain 2 identical options  — fix it!");
            }
            else if(status.data == "Database UnknownError"){
                setAlertBody("Database UnknownError");
            }
            else if(status.data == "Server UnknownError"){
                setAlertBody("Server UnknownError");
            }
            else{
                setAlertBody("Connection UnknownError");
            }
        }
    };


    const onSubmit = (data: any) => {
      data['MultipleAnswers'] = multiple_enable
      data['MultipleOptions'] = Array.from(inputFields).map((inputField: { id: React.Key | null | undefined; Option: unknown; FollowupPoll:unknown}) => ({"option":inputField.Option, "poll_id":inputField.FollowupPoll}))
      data['PollType'] = poll_type
      data['AutoClosingSwitch'] = switch_value
      data['AutoCloseTime'] = slider_value
      axios({
          method: "POST",
          url:"/api/add_poll",
          headers: {
            Authorization: 'Bearer ' + token
          },
          data:data
        }).then((result) => updatePostReturn(result))
          .catch(error => {updatePostReturn(error.response)})
          .then(()=>refresh())
          .then(() => setPopupStatus(true))
    }
    return (
    <div className="Page">
        <Paper elevation={24} className="Paper">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <Typography variant={"h4"}>Add New Poll</Typography>
                    <MUITextField name={"Poll Name"} value={"PollName"} control={control}/>
                    <MUITextField name={"Poll Question"} value={"PollQuestion"} control={control}/>
                    <PollTypeForm name={"Poll Type"} onChange={setPollSwitch} type_value={poll_type}
                                  multipleSwitch={multipleSwitch} timeSwitch={setTimeSwitch}/>
                    <SwitchForm name={"Allow Multiple Answers"} type_value={poll_type} multiple_enable={multiple_enable}
                                multipleSwitch={multipleSwitch}/>
                    <CloseTimePicker name_switch={"Auto Closing"} name_slider={"Minutes to close"}
                                     type_value={poll_type} switch_value={switch_value} setSwitch={setTimeSwitch}
                                     slider_value={slider_value} setSlider={setTimeSlider}/>
                    <MultipleOptions name={"Multiple Options"} inputFields={inputFields} setInputFields={setInputFields}
                                     data={data}/>
                    <Button variant="contained" component="label">
                        Add Poll
                        <input type="submit" hidden/>
                    </Button>
                    <Popup open={popup_status} alert_header={alert_header} alert_body={alert_body}
                           handleClose={() => setPopupStatus(false)}
                    />
                </Stack>
            </form>
        </Paper>
    </div>
  );
}




