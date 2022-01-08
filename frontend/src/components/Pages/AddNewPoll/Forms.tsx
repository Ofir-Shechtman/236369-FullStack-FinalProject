import React from 'react';
import {PageLayoutProps} from "../PageLayout";
import {FormValues} from "./FormValues";
import {Controller, FieldPath} from 'react-hook-form';
import {Switch} from "@material-ui/core";
import {TextField, Select, MenuItem} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

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
        <section>
        <label>{name}</label>
        <Controller
          render={({ field }) => (
            <Select {...field} onChange= {onChangeType} value={type_value}>
              <MenuItem value="1">Telegram Poll</MenuItem>
              <MenuItem value="2">Telegram Inline Keyboard</MenuItem>
            </Select>
          )}
          name={value}
          control={control}
        />
      </section>
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
        <label>{name}</label>
        <Controller
          name={value}
          control={control}
          render={({ field }) => (
            <Switch
              onChange={(e) => field.onChange(e.target.checked)}
              checked={!!field.value}
              defaultChecked={false}
              disabled={!multiple_enable}
            />
          )}
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
        <label>{name}</label>
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

