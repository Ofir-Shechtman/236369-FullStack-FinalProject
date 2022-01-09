import * as React from 'react';
import PropTypes from 'prop-types';
import {Box, Collapse, IconButton, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Paper} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from "@material-ui/icons/Delete";
import {TableColumns} from '../../../AppConstants'
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root:{
    color: '#2c9b9f',
    backgroundColor : '#20626e',
    fontFamily: 'Raleway, Arial',
    fontSize: 50,
    fontWeight: 300
  }
}))

function createData(poll_id: number, poll_name: string, poll_type:string, created_date:string, close_date: string,
                    allow_multiple_answers: boolean, question: string, votes: Array<string>, answer_history: any,
                    answers_count: number, receivers: number) {
  return {
    poll_id,
    poll_name,
    poll_type,
    created_date,
    close_date,
    allow_multiple_answers,
    question,
    votes,
    answer_history,
    answers_count,
    receivers
  };
}

function Row(props: any) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

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
        <TableCell component="th" scope="row">{row.poll_id}</TableCell>
        <TableCell align="center">{row.poll_name}</TableCell>
        <TableCell align="center">{row.poll_type}</TableCell>
        <TableCell align="center">{row.created_date}</TableCell>
        <TableCell align="center">{row.close_date}</TableCell>
        <TableCell align="center">{row.allow_multiple_answers.toString()}</TableCell>
        <TableCell align="center">{row.answers_count}</TableCell>
        <TableCell align="center">{row.receivers}</TableCell>
        <TableCell align="center">
          <IconButton>
            <DeleteIcon />
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
                    <TableCell>{row.question}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.votes.map((vote: string) => (
                    <TableRow key={vote}>
                      <TableCell component="th" scope="row">{vote}</TableCell>
                    </TableRow>
                  ))}
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
                    <TableCell>Name</TableCell>
                    <TableCell>Answer</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.answer_history.map((history_record: any) => (
                    <TableRow key={history_record.name}>
                      <TableCell component="th" scope="row">{history_record.name}</TableCell>
                      <TableCell>{history_record.answer.join(', ')}</TableCell>
                      <TableCell>{history_record.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
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
    created_date: PropTypes.string.isRequired,
    close_date: PropTypes.string.isRequired,
    allow_multiple_answers: PropTypes.bool.isRequired,
    question: PropTypes.string.isRequired,
    votes: PropTypes.arrayOf(PropTypes.string.isRequired),
    answer_history: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        answer: PropTypes.arrayOf(PropTypes.string.isRequired),
        date: PropTypes.string.isRequired,
      }),).isRequired,
    answers_count: PropTypes.number.isRequired,
    receivers: PropTypes.number.isRequired
  }).isRequired,
};

const rows = [
  createData(1, "Age Check","Telegram Poll", "01-01-2022 15:32", "10-01-2022 15:32",
      true, "How old are you?", ["0-25", "25-50", "50+"],
      [{name:"ben",answer:["25-50"],date: "05-01-2022 10:14"}, {name:"falful",answer:["50+"],date: "06-01-2022 09:00"}],
      30, 50),
  createData(2, "Mood Check","Inline Keyboard", "02-01-2022 10:55", "08-01-2022 03:00",
      true, "How are you?", ["Great", "Good", "Bad"],
      [{name:"ben",answer:["Good","Bad"],date: "05-01-2022 10:15"},
                  {name:"falful",answer:["Bad"],date: "06-01-2022 09:01"}],
      20, 40)
]

export default function CollapsibleTable() {
  const classes = useStyles();
  return (
    <TableContainer component={Paper} className={classes.root}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.root}/>
            {TableColumns.map((column: {width: string, title: string}) =>(
                <TableCell align="center" className={classes.root}
                           style={{ width: column.width }}>{column.title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.poll_id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
