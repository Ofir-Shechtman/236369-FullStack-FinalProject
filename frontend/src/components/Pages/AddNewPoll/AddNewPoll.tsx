import React, {useState} from 'react';
import { useForm, Controller } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';


import '../../../App.css';

import {FormValues} from "./FormValues";
import {TextFieldForm, PollTypeForm, SwitchForm, MUITextField, MultipleOptions, CloseTimePicker} from './Forms'
import {v4 as uuidv4} from "uuid";
import axios from "axios";



export default function AddNewPoll() {
  const {handleSubmit, control} = useForm<FormValues>();
  const [multiple_enable, multiple_switch] = React.useState<Boolean>(true);
  const [is_poll_type, poll_type_switch] = React.useState<string>("Telegram_poll");
  const divOnChange = (e: { target: { value: any; }; }) => {
        if(e.target.value==="Telegram_poll"){multiple_switch(true);}
        if(e.target.value==="Telegram_inline_keyboard"){multiple_switch(false);}
        multiple_switch(!multiple_enable);
        poll_type_switch(e.target.value);
    };
    const [inputFields, setInputFields] = useState([
    { id: uuidv4(), Option: '' }, { id: uuidv4(), Option: '' }
  ]);
    const onSubmit = (data: any) => {
      data['MultipleOptions'] = inputFields.map((inputField: { id: React.Key | null | undefined; Option: unknown; }) => (inputField.Option))
      alert(JSON.stringify(data))
      axios.post('api/add_poll', data)
    }
    return (
    <div className="PageLayout">
      <form onSubmit={handleSubmit(onSubmit)}>
<Stack spacing={3}>
        <MUITextField name={"Poll Name"} value={"PollName"} control={control}/>
        <MUITextField name={"Poll Question"} value={"PollQuestion"} control={control}/>
        <PollTypeForm name={"Poll Type"} value={"PollType"} control={control} onChange={divOnChange} type_value={is_poll_type}/>
        <SwitchForm name={"Allow Multiple Answers"} value={"MultipleAnswers"} control={control} multiple_enable={multiple_enable}/>
        <CloseTimePicker name_switch={"Auto Closing"} name_slider={"Minutes to close"} value_switch={"AutoClosingSwitch"} value_slider={"AutoCloseTime"}  control={control} multiple_enable={multiple_enable}/>
        <MultipleOptions name={"Multiple Options"} inputFields={inputFields} setInputFields={setInputFields} />
        <Button variant="contained" component="label">
            Submit
              <input type="submit" hidden />
        </Button>
  </Stack>
      </form>
    </div>
  );
}




