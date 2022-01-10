import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Collapse, IconButton, Table, TablePagination, TableBody, TableCell, TableContainer, TableHead,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
  TableRow, Typography, Paper, TableFooter, Grid, CircularProgress
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from "@material-ui/icons/Delete";
import {TableColumns} from '../../../AppConstants'
import { grey } from '@mui/material/colors';
import { Theme, createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import {BarChart} from './BarChart'
import {PieChart} from './PieChart'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReportIcon from '@mui/icons-material/Report';
import axios from "axios";

const useStyles = (theme: Theme) => createStyles({
  tableContainer:{
    borderRadius: 15,
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
  }
})

function Row(props: any) {
  const { row } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);

  const handleClickOpen = () => {
    setOpenAlert(true);
  };

  const handleClose = () => {
    setOpenAlert(false);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleDeletePoll = (poll_id: number) => {
      handleClose()
      const delete_msg = { poll_id: poll_id };
      axios.post('api/delete_poll', delete_msg).then(response => alert(response))
    }
  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="center">{row.poll_name}</TableCell>
        <TableCell align="center">{row.poll_type}</TableCell>
        <TableCell align="center">
          {row.allow_multiple_answers? <CheckRoundedIcon color="success" />:<ClearRoundedIcon color = "error" />}
        </TableCell>
        <TableCell align="center">{row.answers_count.toString() + '/' + row.receivers.toString()}</TableCell>
        <TableCell align="center">{row.close_date}</TableCell>
        <TableCell align="center">
          <IconButton>
            <DeleteIcon onClick={handleClickOpen}/>
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Poll Question
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Charts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableCell>
                    <Grid container>
                      <Grid item><BarChart categories={row.poll_options} data={row.answers}/></Grid>
                      <Grid item><PieChart categories={row.poll_options} data={row.answers}/></Grid>
                    </Grid>
                  </TableCell>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Answers Received
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Answers</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.poll_answers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((answer: any) => (
                    <TableRow key={answer.user}>
                      <TableCell component="th" scope="row">{answer.user}</TableCell>
                      <TableCell>{answer.answers.join(', ')}</TableCell>
                      <TableCell>{answer.time_answered}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    component="div"
                    count={row.poll_answers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableFooter>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    <Dialog
        open={openAlert}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Poll?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this poll?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={() => handleDeletePoll(row.poll_id)} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    poll_id: PropTypes.number.isRequired,
    poll_name: PropTypes.string.isRequired,
    poll_type: PropTypes.string.isRequired,
    close_date: PropTypes.string.isRequired,
    allow_multiple_answers: PropTypes.bool.isRequired,
    question: PropTypes.string.isRequired,
    poll_options: PropTypes.arrayOf(PropTypes.string.isRequired),
    answers: PropTypes.arrayOf(PropTypes.number.isRequired),
    poll_answers: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.string.isRequired,
        answers: PropTypes.arrayOf(PropTypes.string.isRequired),
        time_answered: PropTypes.string.isRequired,
      }),).isRequired,
    answers_count: PropTypes.number.isRequired,
    receivers: PropTypes.number.isRequired
  }).isRequired,
};


interface PollProps {
  poll_id: number,
  poll_name: string,
  poll_type:string,
  close_date: string,
  allow_multiple_answers: boolean,
  question: string,
  poll_options: Array<string>,
  answers: Array<number>,
  poll_answers: any,
  answers_count: number,
  receivers: number
}

interface CollapsibleTableState {
  data: Array<any>,
  loading: boolean,
  error: boolean
}

interface Props extends WithStyles<typeof useStyles> {}

class CollapsibleTable extends React.Component<Props, CollapsibleTableState> {
  state = {
      data: [],
      loading: true,
      error: false
    }

  refreshPage = () => {
    this.setState({loading: true, error: false})
    this.componentDidMount()
  }
  sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
  componentDidMount() {
    this.sleep(200)
        .then(r=> fetch('api/polls'))
        .then(resp => resp.json())
        .then(resp => this.setState({
          data: resp,
          loading: false
        }))
        .catch(error => this.setState({
          loading: false,
          error: true
        }));
  }

  render() {
    const { data, loading, error } = this.state;
    const { classes } = this.props;
    return (
        <div>
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeader} />
                    {TableColumns.map((column: { width: string, title: string }) => (
                        <TableCell align="center" className={classes.tableHeader}
                                   style={{width: column.width}}>{column.title}</TableCell>
                    ))}
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
                        data.map((row: PollProps) => (
                            <Row key={row.poll_id}
                                 row={row}/>
                        ))
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

export default withStyles(useStyles)(CollapsibleTable)