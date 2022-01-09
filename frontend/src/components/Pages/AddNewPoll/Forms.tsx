import React from 'react';
import {PageLayoutProps} from "../PageLayout";
import {FormValues} from "./FormValues";
import {Controller, FieldPath} from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField} from '@material-ui/core';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {FormControlLabel} from "@mui/material";

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
    control: any;
    error?: string;
    multiple_enable?: Boolean;
    onChangeType?: any;
    type_value?: string;
}

export const PollTypeForm: React.FC<ControlledProps> = ({
                                                          name,
                                                          value,
                                                          control,
                                                          onChangeType,
                                                          type_value
                                                      }) => {

    return (
        <Box sx={{ minWidth: 220 }}>
        <FormControl fullWidth>
        <InputLabel>{value}</InputLabel>
        <Controller
          render={({ field }) => (
            <Select {...field} onChange= {onChangeType} value={type_value} label={name}>
              <MenuItem value="1">Telegram Poll</MenuItem>
              <MenuItem value="2">Telegram Inline Keyboard</MenuItem>
            </Select>
          )}
          name={value}
          control={control}
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
                render={({field}) => (
                    <Switch
                        onChange={(e) => field.onChange(e.target.checked)}
                        checked={!!field.value}
                        defaultChecked={false}
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
                                                          error
                                                      }) => {
    return (
        <section>
        <Controller
          render={({ field }) => <TextField {...field} placeholder="Poll Name"/>}
          name={value}
          rules={{ required: true }}
          control={control}
        />
      <p>{error}</p>
      </section>
    )
}

