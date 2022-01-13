import React from 'react';
import '../../../App.css';
import {Theme, createStyles, withStyles, WithStyles} from "@material-ui/core/styles";
import axios from "axios";
import {grey} from "@mui/material/colors";
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
    Button
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReportIcon from "@mui/icons-material/Report";
import AddNewAdmin from './AddNewAdmin';
import AddIcon from '@mui/icons-material/Add';


const useStyles = (theme: Theme) => createStyles({
    tableContainer:{
        borderRadius: 15,
        margin: "auto"
    },
    tableHeader:{
        fontWeight: 'bold',
        backgroundColor: grey[800],
        color: theme.palette.getContrastText(grey[900])
    },
    tableSecondaryHeader:{
        fontWeight: 'bold',
        backgroundColor: grey[500],
        color: theme.palette.getContrastText(grey[500])
    },
    refresh_icon:{
        color: 'white'
    },
    avatar:{
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.getContrastText(theme.palette.primary.light)
    },
    name:{
        fontWeight:'bold'
    }
})

interface ListProps {
  admin: string
}

interface AdminsListState {
  data: Array<any>,
  loading: boolean,
  error: boolean,
  openDialog: boolean
}

interface AdminsListProps extends WithStyles<typeof useStyles> {token:string, changePage(newPage: number): void}

class AdminsList extends React.Component<AdminsListProps, AdminsListState> {
  state = {
      data: [],
      loading: true,
      error: false,
      openDialog: false
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
    const { classes } = this.props;

    const handleClickOpen = () => {
        this.setState({openDialog: true})
    };


    const handleClose = (e: any) => {
        this.setState({openDialog: false})
    };

    return (
        <div>
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table aria-label="collapsible table">
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                      <TableCell className={classes.tableHeader} style={{width: "250px"}}> Admins </TableCell>
                      <TableCell className={classes.tableHeader} onClick={this.refreshPage}>
                        <IconButton>
                            <RefreshRoundedIcon className={classes.refresh_icon}/>
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
                                <TableCell colSpan={2} align="left" style={{ verticalAlign: 'center' }}>
                                    <Grid container>
                                        <Grid item lg={2}>
                                            <Avatar alt={row.admin} src='.' className={classes.avatar}/>
                                        </Grid>
                                        <Grid item lg={10}>
                                            <Typography color="textPrimary" variant="body1">
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
                        <TableCell>
                            <Button onClick={handleClickOpen} variant="contained" startIcon={<AddIcon />}>
                              Add
                            </Button>
                            <AddNewAdmin token={this.props.token}
                                         open={this.state.openDialog}
                                         handleClose={handleClose}
                                         refreshPage={this.refreshPage}/>
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
        </div>
    );
  }
}

export default withStyles(useStyles)(AdminsList)