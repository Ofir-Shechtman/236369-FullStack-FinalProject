import React, {useState} from 'react';
import { useForm } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';


import '../../../App.css';

import {PollType, FormValues} from "./FormValues";
import {PollTypeForm, SwitchForm, MUITextField, MultipleOptions, CloseTimePicker} from './Forms'
import {v4 as uuidv4} from "uuid";
import axios, {AxiosResponse} from "axios";
import {Alert, AlertColor, AlertTitle, Dialog, DialogActions, DialogContent} from "@mui/material";


export interface AddNewPollProps {
    token: string;
}

function Popup(props: { handleClose: () => void, open: boolean, alert_header: AlertColor, alert_body:string }) {


    return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "60%" }}>
        <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
            <Alert severity={props.alert_header}>
              <AlertTitle>{props.alert_header.charAt(0).toUpperCase() + props.alert_header.slice(1)}</AlertTitle>
                <Stack><div>{props.alert_body}</div>
                <Button onClick={props.handleClose}>Close</Button>
                </Stack>

            </Alert>
      </Dialog>
      </div>
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
  const [multiple_enable, multiple_switch] = React.useState<Boolean>(true);
  const [is_poll_type, poll_type_switch] = React.useState<PollType>("Telegram_poll");
  // @ts-ignore
    const handleTypeChange = (event, newType) => {
      if (newType !== null) {
        poll_type_switch(newType);
        multiple_switch(newType === "Telegram_poll");
      }
    };

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
      data['MultipleOptions'] = inputFields.map((inputField: { id: React.Key | null | undefined; Option: unknown; FollowupPoll:unknown}) => ({"option":inputField.Option, "poll_id":inputField.FollowupPoll}))
      data['PollType'] = is_poll_type
      if(!data.AutoCloseTime){
          data['AutoCloseTime']=5;
      }
      if(!data.AutoClosingSwitch){
          data['AutoClosingSwitch']=false;
      }
        alert(JSON.stringify(data))
      axios({
      method: "POST",
      url:"/api/add_poll",
      headers: {
        Authorization: 'Bearer ' + token
      },
          data:data
    }).then((result) => updatePostReturn(result)).catch(error => {
    updatePostReturn(error.response)
}).then(()=>refresh()).then(() => setPopupStatus(true))
    }
    return (
    <div className="Page">
      <form onSubmit={handleSubmit(onSubmit)}>
<Stack spacing={3}>
        <MUITextField name={"Poll Name"} value={"PollName"} control={control}/>
        <MUITextField name={"Poll Question"} value={"PollQuestion"} control={control}/>
        <PollTypeForm name={"Poll Type"} value={"PollType"} control={control} onChange={handleTypeChange} type_value={is_poll_type}/>
        <SwitchForm name={"Allow Multiple Answers"} value={"MultipleAnswers"} control={control} multiple_enable={multiple_enable}/>
        <CloseTimePicker name_switch={"Auto Closing"} name_slider={"Minutes to close"} value_switch={"AutoClosingSwitch"} value_slider={"AutoCloseTime"}  control={control} multiple_enable={multiple_enable}/>
        <MultipleOptions name={"Multiple Options"} inputFields={inputFields} setInputFields={setInputFields} data={data}/>
        <Button variant="contained" component="label">
            Add Poll
              <input type="submit" hidden />
        </Button>
        <Popup open={popup_status} alert_header={alert_header} alert_body={alert_body}
               handleClose={()=>setPopupStatus(false)}
        />
  </Stack>
      </form>
    </div>
  );
}




