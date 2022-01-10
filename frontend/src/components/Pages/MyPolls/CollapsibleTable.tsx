import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Collapse, IconButton, Table, TablePagination,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Paper, TableFooter, Grid
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from "@material-ui/icons/Delete";
import {TableColumns} from '../../../AppConstants'
import { grey } from '@mui/material/colors';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import {BarChart} from './BarChart'
import {PieChart} from './PieChart'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

const useStyles = makeStyles((theme: Theme) => createStyles({
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
  }
}))

// function createData(poll_id: number, poll_name: string, poll_type:string, close_date: string,
//                     allow_multiple_answers: boolean, question: string, votes: Array<string>, answers: Array<number>,
//                     answer_history: any, answers_count: number, receivers: number) {
//   return {
//     poll_id,
//     poll_name,
//     poll_type,
//     close_date,
//     allow_multiple_answers,
//     question,
//     votes,
//     answer_history,
//     answers,
//     answers_count,
//     receivers
//   };
// }

function Row(props: any) {
  const { row } = props;
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const deletePoll = (poll_id: number) => {
      alert(poll_id);
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
            <DeleteIcon onClick={() => deletePoll(row.poll_id)}/>
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
                    <TableCell className = {classes.tableSecondaryHeader}>Charts</TableCell>
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
                    <TableCell className = {classes.tableSecondaryHeader}>Username</TableCell>
                    <TableCell className = {classes.tableSecondaryHeader}>Answers</TableCell>
                    <TableCell className = {classes.tableSecondaryHeader}>Date</TableCell>
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

// const history = []
// let i:number = 0
// for(i = 0; i < 100; i++) {
//    history.push({name:"ben"+i.toString(),answer:["Good","Bad"],date: "05-01-2022 10:15"});
// }
// const rows = [
//   createData(1, "Age Check","Telegram Poll", "10-01-2022 15:32",
//       true, "How old are you?", ["0-25", "25-50", "50+"], [10, 10, 10],
//       [{name:"ben",answer:["25-50"],date: "05-01-2022 10:14"}, {name:"falful",answer:["50+"],date: "06-01-2022 09:00"}],
//       30, 50),
//   createData(2, "Mood Check","Inline Keyboard", "08-01-2022 03:00",
//       false, "How are you?", ["Great", "Good", "Bad"], [5, 7, 8], history, 20, 40)
// ]

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

export class CollapsibleTable extends React.Component {
  state = {
      data: [],
      loading: true,
      error: false
    }


  componentDidMount() {
    fetch('api/polls')
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
    const classes = useStyles();
    return (
        <div>
          {loading && <div>Loading...</div>}
          {!loading && !error &&
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeader}/>
                    {TableColumns.map((column: { width: string, title: string }) => (
                        <TableCell align="center" className={classes.tableHeader}
                                   style={{width: column.width}}>{column.title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.data.map((row: PollProps) => (
                      <Row key={row.poll_id}
                           row={row}/>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          }
          {error && <div>Error message</div>}
        </div>
    );
  }
}

// // export default function CollapsibleTable() {
//   const [rows, setRows] = React.useState<Array<PollProps>>([]);
//   useEffect(() => {
//     fetch('api/polls').then(res => res.json()).then(data => {
//       {
//         setRows(data)
//       }
//     });
//   })
//   // axios.get('http://localhost:5000/api/polls').then(response => {alert(response.data);setRows(response.data)});
//
//
