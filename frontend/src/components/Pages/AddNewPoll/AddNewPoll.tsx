import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField, Select, MenuItem} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import '../../../App.css';
import './AddnewPoll.css'

type FormValues = {
  PollName: string;
  PollQuestion: string;
  PollType: string;
  MultipleAnswers: string;
};



export default function AddNewPoll() {
  const { register, handleSubmit, formState: { errors } , control} = useForm<FormValues>();
  const onSubmit = (data: any) => alert(JSON.stringify(data));
  return (
    <div className="App">
      <h1>React Hook Form - Resolver</h1>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div>
          <label>Poll Name</label>
          <input
              {...register("PollName",
                  {required: "Name is required",minLength: {value:5, message: "Min length is 5"}})} placeholder="Poll Name"
          />
          <p>{errors.PollName?.message}</p>
        </div>
        <div>
          <label>Poll Question</label>
          <input
              {...register("PollQuestion",
                  {required: "Question is required",minLength: {value:5, message: "Min length is 5"}})} placeholder="Poll Question"
          />
          <p>{errors.PollQuestion?.message}</p>
        </div>
        <div>
          <label>Poll Type</label>
        <select {...register("PollType")}>
        <option value="1">Telegram Poll</option>
        <option value="2">Telegram Inline Keyboard</option>
      </select>
        </div>

        <section>
        <label>Allow Multiple Answers</label>
        <Controller
          name="MultipleAnswers"
          control={control}
          render={({ field }) => (
            <Switch
              onChange={(e) => field.onChange(e.target.checked)}
              checked={!!field.value}
            />
          )}
        />
      </section>

        <input type="submit" />
      </form>
    </div>
  );
}

