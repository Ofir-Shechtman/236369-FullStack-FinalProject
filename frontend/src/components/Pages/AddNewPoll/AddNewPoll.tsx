import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import '../../../App.css';
import './AddnewPoll.css'

import {FormValues} from "./FormValues";
import {TextFieldForm, PollTypeForm, SwitchForm, MUITextField} from './Forms'



export default function AddNewPoll() {
  const { register, handleSubmit, formState: { errors } , control} = useForm<FormValues>();
  const [multiple_enable, multiple_switch] = React.useState<Boolean>(true);
  const [is_poll_type, poll_type_switch] = React.useState<string>("1");
  const onSubmit = (data: any) => alert(JSON.stringify(data));
  const divOnChange = (e: { target: { value: any; }; }) => {
        multiple_switch(!multiple_enable);
        poll_type_switch(e.target.value);
    };
  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>

        {/*<TextFieldForm name={"Poll Name"} value={"PollName"} register={register} error={errors.PollName?.message}/>*/}
        {/*<TextFieldForm name={"Poll Question"} value={"PollQuestion"} register={register} error={errors.PollQuestion?.message}/>*/}
        <MUITextField name={"Poll Name"} value={"PollName"} control={control} error={errors.PollName?.message}/>
        <MUITextField name={"Poll Question"} value={"PollQuestion"} control={control} error={errors.PollQuestion?.message}/>
        <PollTypeForm name={"Poll Type"} value={"PollType"} control={control} onChangeType={divOnChange} type_value={is_poll_type}/>
        <SwitchForm name={"Allow Multiple Answers"} value={"MultipleAnswers"} control={control} multiple_enable={multiple_enable}/>
        <input type="submit" />
      </form>
    </div>
  );
}




