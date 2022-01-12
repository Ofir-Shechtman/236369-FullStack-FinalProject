import React, {useState} from 'react';
import { useForm } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';


import '../../../App.css';

import {PollType, FormValues} from "./FormValues";
import {PollTypeForm, SwitchForm, MUITextField, MultipleOptions, CloseTimePicker} from './Forms'
import {v4 as uuidv4} from "uuid";
import axios from "axios";


export interface AddNewPollProps {
    token: string;
}

export const AddNewPoll: React.FC<AddNewPollProps> = ({
                                                          token
                                                      }) => {
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
    { id: uuidv4(), Option: '' }, { id: uuidv4(), Option: '' }
  ]);
    const onSubmit = (data: any) => {
      data['MultipleOptions'] = inputFields.map((inputField: { id: React.Key | null | undefined; Option: unknown; }) => (inputField.Option))
      data['PollType'] = is_poll_type
        alert(JSON.stringify(data))
      axios({
      method: "POST",
      url:"/api/add_poll",
      headers: {
        Authorization: 'Bearer ' + token
      },
          data:data
    })
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




