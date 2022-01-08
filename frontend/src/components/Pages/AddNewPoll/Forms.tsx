import React from 'react';
import {PageLayoutProps} from "../PageLayout";
import {FormValues} from "./FormValues";
import {FieldPath} from 'react-hook-form';
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
          <label>name</label>
          <input
              {...register({value},
                  {required: "Name is required",minLength: {value:5, message: "Min length is 5"}})} placeholder={name}
          />
          <p>{error}</p>
        </div>
    )
}