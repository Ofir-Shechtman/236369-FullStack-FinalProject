import React, { useRef, useState } from "react";
import '../../../App.css';
import { get, isEmpty, set } from "lodash-es";
import { FormBuilder } from "@jeremyling/react-material-ui-form-builder";
import {
  Avatar,
  Button, Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { red } from "@mui/material/colors";
import axios from "axios";


async function validate(refs, form) {
  for (const [attribute, ref] of Object.entries(refs.current)) {
    let errors;
    if (ref.validate) {
      errors = await ref.validate(get(form, attribute));
    }
    if (!isEmpty(errors)) {
      console.log(errors);
      return false;
    }
  }
  return true;
}


export default function AddNewAdmin(props) {
  const token = props.token;
  const open = props.open;
  const handleClose = props.handleClose;
  const refreshPage = props.refreshPage;
  const setAlertHeader = props.setAlertHeader;
  const setAlertBody = props.setAlertBody;
  const setPopupStatus = props.setPopupStatus;
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState();
  const refs = useRef({});

  const updateForm = (updates) => {
    const copy = { ...form };
    for (const [key, value] of Object.entries(updates)) {
      set(copy, key, value);
    }
    setForm(copy);
  };
  const updatePostReturn = (status) => {
      if(status.status===200){
          setAlertHeader("success");
          setAlertBody("Admin Successfully added!");
      }
      else{
          setAlertHeader("error");
          if(status.data === "UserExists"){
              setAlertBody("Admin already exist, choose another");
          }
          else{
              setAlertBody("Connection UnknownError");
          }
      }
  };
  const handleSubmit = async () => {
    const ok = await validate(refs, form);
    if (!ok) {
      return;
    }
    axios({
      method: "POST",
      url:"/api/add_admin",
      headers: {
        Authorization: 'Bearer ' + token
      },
      data:form
    }).then((result) => updatePostReturn(result))
      .catch(error => {updatePostReturn(error.response)})
      .then(() => handleClose())
      .then(() => refreshPage())
      .then(() => setPopupStatus(true))
  };

  const fields = [
    {
      component: "custom",
      customComponent: () => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Avatar style={{ backgroundColor: red[500], color: "white" }}>
            <LockOutlined />
          </Avatar>
        </div>
      )
    },
    {
      component: "display-text",
      title: "Add New Admin",
      titleProps: {
        style: {
          fontSize: "20px",
          fontWeight: "bold"
        }
      },
      titleContainerProps: {
        style: {
          justifyContent: "center"
        }
      }
    },
    {
      attribute: "username",
      component: "text-field",
      label: "Username",
      props: {
        required: true
      },
      validations: {
        required: true,
      }
    },
    {
      attribute: "password",
      component: "text-field",
      label: "Password",
      props: {
        type: showPassword ? "text" : "password",
        InputProps: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
          style: {
            paddingRight: 0
          }
        },
        required: true,
      },
      validations: {
        required: true,
        min: 8,
        matches: ["/[a-z]/i", "At least 1 lowercase or uppercase letter"],
        test: {
          name: "specialChar",
          test: (value) =>
              /[0-9~!@#$%^&*()_+\-={}|[\]\\:";'<>?,./]/.test(value),
          message: "At least 1 number or special character"
        }
      }
    },
    {
      attribute: "password-password_confirmation",
      component: "text-field",
      label: "Confirm Password",
      props: {
        type: "text",
        required: true
      },
      validations: {
        required: true,
        test: {
          name: "password_confirmation",
          test: (value) => form.password === value,
          message: "Passwords doesn't match"
        }
      }
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "60%" }}>
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <form>
            <FormBuilder
              fields={fields}
              form={form}
              updateForm={updateForm}
              refs={refs}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSubmit()} autoFocus>Submit</Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
}