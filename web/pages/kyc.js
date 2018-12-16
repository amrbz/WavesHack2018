/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Paper,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Fab,
} from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import AddIcon from '@material-ui/icons/Add';

import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import Link from 'next/link';
import AppContent from '../components/AppContent';
import AddCoountDialog from '../dialogs/addAccount';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 8,
    // padding: theme.spacing.unit * 8,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
  table: {
    minWidth: 700,
  },
  paper: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
    padding: theme.spacing.unit * 4,
  },
});

@inject('kyc')
@observer
class KYC extends React.Component {
  componentDidMount() {
    this.props.kyc.getAccounts();
  }
  render() {
    const { classes, kyc } = this.props;
    return (
      <div>
        <AddCoountDialog />
        <AppContent className={classes.root}>
          <Grid container spacing={24}>
            <Grid item xs={12} md={12}>
              <Typography variant="h2">KYC Provider</Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography variant="h5">Verified accounts</Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <Paper className={classes.paper}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Residency</TableCell>
                      <TableCell numeric>Age</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kyc.list.map(row => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.address}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.residency}</TableCell>
                        <TableCell numeric>{row.age}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </AppContent>
        <Fab
          color="primary"
          aria-label="Add"
          className={classes.fab}
          onClick={() => {
            kyc.showAddAccountDialog = true;
          }}
        >
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

KYC.propTypes = {
  classes: PropTypes.object.isRequired,
  kyc: PropTypes.object,
};

export default withRouter(withStyles(styles)(KYC));
