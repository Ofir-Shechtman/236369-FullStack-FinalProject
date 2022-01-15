import React, {useState} from 'react';
import {FormValues, PollType} from "./FormValues";
import {Controller, FieldPath} from 'react-hook-form';
import {
    ToggleButtonGroup, ToggleButton, FormLabel, Switch, TextField, Box, InputLabel, MenuItem,
    Slider, FormControl, Select, SelectChangeEvent, IconButton, Grid, Container
}
    from "@mui/material";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import '../../../App.css';

import {v4 as uuidv4} from 'uuid';


export interface PollTypeFormProps {
    name: string;
    onChange: (value: PollType) => void;
    type_value: PollType;
    multipleSwitch: (value: boolean) => void;
    timeSwitch: (value: boolean) => void;
}


export const PollTypeForm: React.FC<PollTypeFormProps> = ({
                                                              name,
                                                              onChange,
                                                              type_value,
                                                              multipleSwitch,
                                                              timeSwitch
                                                          }) => {
    // @ts-ignore
    const changeType = (event: MouseEvent<HTMLElement, MouseEvent>, value: any) => {
        if (value == null) return;
        if (type_value == "Telegram_poll") {
            multipleSwitch(false)
            timeSwitch(false)
        }
        onChange(value)
    }

    return (
        <Box sx={{minWidth: 220}}>
            <FormControl fullWidth>
                <FormLabel>{name}</FormLabel>
                <ToggleButtonGroup
                    value={type_value}
                    exclusive
                    onChange={changeType}
                >
                    <ToggleButton value={"Telegram_poll"}>Telegram poll</ToggleButton>
                    <ToggleButton value={"Telegram_inline_keyboard"}>Telegram inline keyboard</ToggleButton>
                </ToggleButtonGroup>
            </FormControl>
        </Box>
    )
}

export interface SwitchProps {
    name: string;
    multipleSwitch: (value: boolean) => void;
    type_value: PollType;
    multiple_enable: boolean;
}

export const SwitchForm: React.FC<SwitchProps> = ({
                                                      name,
                                                      multipleSwitch,
                                                      type_value,
                                                      multiple_enable
                                                  }) => {
    const toggleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        multipleSwitch(e.target.checked);
    }
    return (
        <div>
            <InputLabel>{name}</InputLabel>
            <Switch
                value={multiple_enable}
                checked={multiple_enable}
                onChange={toggleSwitch}
                disabled={type_value == "Telegram_inline_keyboard"}
            />
        </div>
    )
}

export interface MUITextFieldProps {
    name: string;
    value: FieldPath<FormValues>;
    control: any;
}

export const MUITextField: React.FC<MUITextFieldProps> = ({
                                                              name,
                                                              value,
                                                              control,
                                                          }) => {
    return (
        <Container>
            <Controller
                render={({field}) =>

                    <TextField {...field}
                               placeholder={name}
                               variant="outlined"
                               label={name}
                               required={true}
                    />}
                name={value}
                rules={{required: true}}
                control={control}
            />
        </Container>
    )
}

interface Poll {
    poll_id: string,
    poll_name: string
}

export interface MultipleOptionsProps {
    name: string;
    inputFields: any,
    setInputFields: any,
    data: Poll[]

}

export const MultipleOptions: React.FC<MultipleOptionsProps> = ({
                                                                    name,
                                                                    inputFields,
                                                                    setInputFields,
                                                                    data
                                                                }) => {


    const handleChangeInput = (id: any, event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | SelectChangeEvent<string>>) => {
        const newInputFields = inputFields.map((i: { [x: string]: string; id: any; }) => {
            if (id === i.id) {
                // @ts-ignore
                i[event.target.name] = event.target.value
            }
            return i;
        })

        setInputFields(newInputFields);
    }


    const handleAddFields = () => {
        setInputFields([...inputFields, {id: uuidv4(), Option: '', FollowupPoll: 'None'}])
    }

    const handleRemoveFields = (id: any) => {
        const values = [...inputFields];
        values.splice(values.findIndex(value => value.id === id), 1);
        setInputFields(values);
    }


    // const onPollChange = (event: { target: { value: any; }; }) => {
    //       setSelectPoll(event.target.value)
    //   };

    function onPollChange(id: React.Key | null | undefined, event: any) {
        const newInputFields = inputFields.map((i: { [x: string]: string; id: any; }) => {
            if (id === i.id) {
                i["FollowupPoll"] = event.target.value
            }
            return i;
        })
        setInputFields(newInputFields);
    }

    return (
        <Container>
            <InputLabel>{name}</InputLabel>
            {inputFields.map((inputField: { id: React.Key | null | undefined; Option: unknown; FollowupPoll: string }) => (
                <div key={inputField.id}>
                    <TextField
                        name="Option"
                        label={'Option ' + parseInt(String(inputFields.indexOf(inputField) + 1))}
                        value={inputField.Option}
                        onChange={event => handleChangeInput(inputField.id, event)}
                        placeholder={name}
                        variant="outlined"
                        required={true}
                        className={"MultipleOptionsList"}
                    />
                    <IconButton disabled={inputFields.length === 2} onClick={() => handleRemoveFields(inputField.id)}>
                        <RemoveIcon/>
                    </IconButton>
                    <IconButton
                        disabled={inputFields.length === 10} onClick={handleAddFields}
                    >
                        <AddIcon/>
                    </IconButton>
                    <FormControl sx={{m: 1, width: 300}}>
                        <InputLabel>Follow-up Poll</InputLabel>
                        <Select onChange={event => {
                            onPollChange(inputField.id, event)
                        }}
                                value={inputField.FollowupPoll}
                                label="Follow-up Poll"
                        >
                            <MenuItem key={-1} value={"None"}>None</MenuItem>
                            {data.map((poll: Poll) => (
                                <MenuItem key={poll.poll_id} value={poll.poll_id}>{poll.poll_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            ))}
        </Container>
    )
}

export interface CloseTimeProps {
    name_switch: string;
    name_slider: string;
    type_value: PollType;
    switch_value: boolean;
    setSwitch: (value: boolean) => void;
    slider_value: number;
    setSlider: (value: number) => void;
}


export const CloseTimePicker: React.FC<CloseTimeProps> = ({
                                                              name_switch,
                                                              name_slider,
                                                              type_value,
                                                              switch_value,
                                                              setSwitch,
                                                              slider_value,
                                                              setSlider
                                                          }) => {

    const toggleSwitch = (e: { target: { value: any; }; }) => {
        setSwitch(!switch_value);
    }
    const changeSlider = (event: Event, value: number | Array<number>, activeThumb: number) => {
        if (typeof value == "number") {
            setSlider(value);
        }
    }


    return (
        <Grid container>
            <Grid item lg={2}>
                <InputLabel>{name_switch}</InputLabel>
                <Switch value={switch_value}
                        checked={switch_value}
                        disabled={type_value == "Telegram_inline_keyboard"}
                        onChange={toggleSwitch}
                />
            </Grid>
            <Grid item lg={4}>
                <InputLabel>{name_slider}</InputLabel>
                <Slider value={slider_value}
                        onChange={changeSlider}
                        aria-label={name_slider}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={10}
                        disabled={!switch_value}
                />
            </Grid>
        </Grid>
    );
}
