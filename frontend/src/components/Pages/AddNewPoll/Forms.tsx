import React, {useState} from 'react';
import {PageLayoutProps} from "../PageLayout";
import {FormValues} from "./FormValues";
import {Controller, FieldPath} from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField} from '@material-ui/core';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {ToggleButtonGroup, ToggleButton, FormControlLabel, FormLabel} from "@mui/material";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import { v4 as uuidv4 } from 'uuid';
import OutlinedInput from "@mui/material/OutlinedInput";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import axios from "axios";


export interface TextFieldProps {
    name: string;
    value: FieldPath<FormValues>;
    register: any,
    error: any

}

export const TextFieldForm: React.FC<TextFieldProps> = ({
                                                          name,
                                                          value,
                                                          register,
                                                          error
                                                      }) => {
    return (
        <div>
          <label>{name}</label>
          <input
              {...register(value,
                  {required: "Name is required",minLength: {value:5, message: "Min length is 5"}})} placeholder={name}
          />
          <p>{error}</p>
        </div>
    )
}


export interface ControlledProps {
    name: string;
    value: FieldPath<FormValues>;
    control?: any;
    error?: string;
    multiple_enable?: Boolean;
    onChange?: any;
    type_value?: string;
}

export const PollTypeForm: React.FC<ControlledProps> = ({
                                                          name,
                                                          value,
                                                          control,
                                                          onChange,
                                                          type_value
                                                      }) => {

    return (
        <Box sx={{ minWidth: 220 }}>
        <FormControl fullWidth>
        <FormLabel>{name}</FormLabel>
            <Controller
          name={value}
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
                {...field}
                value={type_value}
                exclusive
                onChange={onChange}
                >
            <ToggleButton value={"Telegram_poll"} >Telegram poll
      </ToggleButton>
      <ToggleButton value={"Telegram_inline_keyboard"}>Telegram inline keyboard
      </ToggleButton>
      </ToggleButtonGroup>
          )}
        />
      </FormControl>
    </Box>
    )
}


export const SwitchForm: React.FC<ControlledProps> = ({
                                                          name,
                                                          value,
                                                          control,
                                                          multiple_enable
                                                      }) => {
    return (
        <section>
        <FormControlLabel control={
            <Controller
                name={value}
                control={control}
                defaultValue = {multiple_enable}
                render={({field}) => (
                    <Switch
                        onChange={(e) => field.onChange(e.target.checked)}
                        checked={!!field.value && !!multiple_enable}
                        disabled={!multiple_enable}
                    />
                )}
            />}
                          label={name}
        />
    </section>
    )
}

export const MUITextField: React.FC<ControlledProps> = ({
                                                          name,
                                                          value,
                                                          control,
                                                      }) => {
    return (
        <Container>
        <Controller
          render={({ field }) =>

              <TextField {...field}
                placeholder={name}
                variant="outlined"
                         label={name}
                         // helperText={"Please enter your " + name.toLowerCase()}
                         required={true}
              />}
          name={value}
          rules={{ required: true }}
          control={control}
        />
    </Container>
    )
}

export interface MultipleOptionsProps {
    name: string;
    inputFields: any,
    setInputFields: any

}

export const MultipleOptions: React.FC<MultipleOptionsProps> = ({
                                                          name,
                                                          inputFields,
                                                          setInputFields,
                                                      }) => {


  const handleChangeInput = (id: any, event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | SelectChangeEvent<string>>) => {
    const newInputFields = inputFields.map((i: { [x: string]: string; id: any; }) => {
      if(id === i.id) {
          // @ts-ignore
          i[event.target.name] = event.target.value
      }
      return i;
    })

    setInputFields(newInputFields);
  }


  const handleAddFields = () => {
    setInputFields([...inputFields, { id: uuidv4(),  Option:'', FollowupPoll:'None'}])
  }

  const handleRemoveFields = (id:any) => {
    const values  = [...inputFields];
    values.splice(values.findIndex(value => value.id === id), 1);
    setInputFields(values);
  }

  const [data, setData] = React.useState<Poll[]>([]);

  interface Poll {
  poll_id: string,
  poll_name: string
}

  React.useEffect(() => {
    axios({
      method: "GET",
      url:"/api/polls_to_send",
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then((response) => {
      setData(response.data);
    });
  }, []);

  if (!data) return null;




  // const onPollChange = (event: { target: { value: any; }; }) => {
  //       setSelectPoll(event.target.value)
  //   };

    function onPollChange(id: React.Key | null | undefined, event:any) {
        const newInputFields = inputFields.map((i: { [x: string]: string; id: any; }) => {
      if(id === i.id) {
          i["FollowupPoll"] = event.target.value
      }
      return i;
    })
        setInputFields(newInputFields);
    }

    return (
        <Container>
        <InputLabel>{name}</InputLabel>
        {inputFields.map((inputField: { id: React.Key | null | undefined; Option: unknown; FollowupPoll:string }) => (
          <div key={inputField.id}>
              <TextField
              name="Option"
              label={'Option '+parseInt(String(inputFields.indexOf(inputField) + 1))}
              value={inputField.Option}
              onChange={event => handleChangeInput(inputField.id, event)}
              placeholder={name}
              variant="outlined"
              required={true}
            />
            <IconButton disabled={inputFields.length === 2} onClick={() => handleRemoveFields(inputField.id)}>
              <RemoveIcon />
            </IconButton>
            <IconButton
              disabled={inputFields.length === 10} onClick={handleAddFields}
            >
              <AddIcon />
            </IconButton>
                    <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel>Follow-up Poll</InputLabel>
            <Select onChange={event => {onPollChange(inputField.id, event)}}
                    value={inputField.FollowupPoll}
                    label="Follow-up Poll"
            >
                <MenuItem key={-1} value={"None"}>None</MenuItem>
                {data.map((poll: Poll) => (
                    <MenuItem key={poll.poll_id} value={poll.poll_id}>{poll.poll_name}</MenuItem>
                ))}
            </Select></FormControl>
          </div>
        )) }
    </Container>
    )
}

export interface CloseTimeProps {
    name_switch: string;
    name_slider: string;
    value_switch: FieldPath<FormValues>;
    value_slider: FieldPath<FormValues>;
    control: any;
    multiple_enable: Boolean;
}


export const CloseTimePicker: React.FC<CloseTimeProps> = ({
                                                          name_switch,
                                                          name_slider,
                                                          value_switch,
                                                          value_slider,
                                                          control,
                                                          multiple_enable
                                                      }) => {
    const [auto_close_switch, SetSwitch] = React.useState<Boolean>(false);
    const ToggleSwitch = (e: { target: { value: any; }; }) => {
        SetSwitch(!auto_close_switch);
    }
    return (

                    <Grid container spacing={4}>
                        <Grid item xs={5}>
                    <InputLabel>{name_switch}</InputLabel>
                            <Controller
                name = {value_switch}
                control={control}
                defaultValue = {!auto_close_switch}
                render={({field}) => (
                    <Switch {...field}
                    disabled={!multiple_enable}
                    checked={!auto_close_switch}
                    onChange={ToggleSwitch}
                    /> )}
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <InputLabel>{name_slider}</InputLabel>
                      <Controller
    name = {value_slider}
    control={control}
    render={({field}) => (
        <Slider {...field}
                aria-label={name_slider}
                defaultValue={5}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
                disabled={!!auto_close_switch || !multiple_enable}
        />)}
    />
                  </Grid>
                    </Grid>

  );
}
