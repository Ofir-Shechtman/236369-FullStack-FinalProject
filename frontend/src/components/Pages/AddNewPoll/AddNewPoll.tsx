import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField, Select, MenuItem} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import '../../../App.css';
import './AddnewPoll.css'

import {FormValues} from "./FormValues";
import {TextFieldForm} from './Forms'



export default function AddNewPoll() {
  const { register, handleSubmit, formState: { errors } , control} = useForm<FormValues>();
  const [multiple_enable, multiple_switch] = React.useState<Boolean>(true);
  const onSubmit = (data: any) => alert(JSON.stringify(data));
  return (
    <div className="App">
      <h1>React Hook Form - Resolver</h1>
      <form onSubmit={handleSubmit(onSubmit)}>

        <TextFieldForm name={"Poll Name"} value={"PollName"} register={register} error={errors.PollName?.message}/>
        <TextFieldForm name={"Poll Question"} value={"PollQuestion"} register={register} error={errors.PollQuestion?.message}/>
        <section>
        <label>Poll Type</label>
        <Controller
          render={({ field }) => (
            <Select {...field}>
              <MenuItem value="1">Telegram Poll</MenuItem>
              <MenuItem value="2">Telegram Inline Keyboard</MenuItem>
            </Select>
          )}
          name="PollType"
          control={control}
        />
      </section>

        <section>
        <label>Allow Multiple Answers</label>
        <Controller
          name="MultipleAnswers"
          control={control}
          render={({ field }) => (
            <Switch
              onChange={(e) => field.onChange(e.target.checked)}
              checked={!!field.value}
              defaultChecked={false}
              disabled={false}
            />
          )}
        />
      </section>
        <section>
        <label>MUI TextField</label>
        <Controller
          render={({ field }) => <TextField {...field} placeholder="Poll Name"/>}
          name="PollName"
          rules={{ required: true }}
          control={control}
        />
      </section>

        <input type="submit" />
      </form>
    </div>
  );
}

