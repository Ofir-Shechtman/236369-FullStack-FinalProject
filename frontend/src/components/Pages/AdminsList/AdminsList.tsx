import React from 'react';
import '../../../App.css';
import axios from "axios";
import {
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Grid,
    Typography,
    Button, Dialog, Alert, AlertTitle
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReportIcon from "@mui/icons-material/Report";
import AddNewAdmin from './AddNewAdmin';
import AddIcon from '@mui/icons-material/Add';
import Stack from "@mui/material/Stack";


interface ListProps {
  admin: string
}


function Popup(props: { handleClose: () => void, open: boolean, alert_header: any, alert_body:string }) {
    return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "60%" }}>
        <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
            <Alert severity={props.alert_header}>
              <AlertTitle>{props.alert_header.charAt(0).toUpperCase() + props.alert_header.slice(1)}</AlertTitle>
                <Stack><div>{props.alert_body}</div>
                <Button onClick={props.handleClose}>Close</Button>
                </Stack>

            </Alert>
      </Dialog>
      </div>
    </div>
  );
}

interface AdminsListState {
  data: Array<any>,
  loading: boolean,
  error: boolean,
  openDialog: boolean,
  popup_status: boolean,
  alert_header: any,
  alert_body: string
}

interface AdminsListProps {
    token:string, changePage(newPage: number): void
}

export default class AdminsList extends React.Component<AdminsListProps, AdminsListState> {
  state = {
      data: [],
      loading: true,
      error: false,
      openDialog: false,
      popup_status: false,
      alert_header: 'success',
      alert_body: "Error"
    }

  refreshPage = () => {
    this.setState({loading: true, error: false})
    this.componentDidMount()
  }
  sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
  componentDidMount() {
    this.sleep(0)
        .then(() => axios({
      method: "GET",
      url:"/api/admins",
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
      })  )
        .then(resp => resp.data)
        .then(resp => this.setState({
          data: resp,
          loading: false
        }))
        .catch(() => this.setState({
          loading: false,
          error: true
        }));
  }

  render() {
    const {data, loading, error} = this.state;

    const handleClickOpen = () => {
        this.setState({openDialog: true})
    };


    const handleClose = () => {
        this.setState({openDialog: false})
    }

    return (
        <div>
            <TableContainer component={Paper} className={"tableContainer"} style={{width: "500px"}}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                      <TableCell className={"TableHeader"} style={{width: "250px"}}> Admins </TableCell>
                      <TableCell className={"TableHeader"} align="center" onClick={this.refreshPage}>
                        <IconButton>
                            <RefreshRoundedIcon className={"refresh_icon"}/>
                        </IconButton>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading &&
                      <TableCell sx={{ display: 'flex' }}>
                        <CircularProgress />
                      </TableCell>
                  }
                  {!loading && !error &&
                       data.map((row: ListProps) => (
                           <TableRow key={row.admin}>
                                <TableCell colSpan={2} align="left">
                                    <Grid container>
                                        <Grid item lg={2}>
                                            <Avatar alt={row.admin} src='.' className={"avatar"}/>
                                        </Grid>
                                        <Grid item lg={2} className={"name"}>
                                            <Typography variant="h6">
                                                {row.admin}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </TableCell>
                            </TableRow>
                           )
                       )}
                  {!loading && !error &&
                      <TableRow>
                        <TableCell/>
                        <TableCell align="center">
                            <Button onClick={handleClickOpen} variant="contained" startIcon={<AddIcon />}>
                              Add
                            </Button>
                            <AddNewAdmin token={this.props.token}
                                         open={this.state.openDialog}
                                         handleClose={handleClose}
                                         refreshPage={this.refreshPage}
                                         setAlertHeader={(header: any) => this.setState({alert_header: header})}
                                         setAlertBody={(body: string) => this.setState({alert_body: body})}
                                         setPopupStatus={(status: boolean) => this.setState({popup_status: status})}
                            />
                        </TableCell>
                      </TableRow>
                  }
                  {error &&
                      <TableCell sx={{display: 'flex'}}>
                        <ReportIcon fontSize="large" color = "error" />
                      </TableCell>
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <Popup open={this.state.popup_status} alert_header={this.state.alert_header} alert_body={this.state.alert_body}
               handleClose={()=>this.setState({popup_status: false})}
        />
        </div>
    );
  }
}

