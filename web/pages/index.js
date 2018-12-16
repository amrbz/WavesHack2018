/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import * as WavesAPI from 'waves-api';

import {
  Typography,
  Grid,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stepper,
  Step,
  StepLabel,
  TextField,
  LinearProgress,
  Fab,
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { observer, inject } from 'mobx-react';

import { withStyles } from '@material-ui/core/styles';
import UpdateIcon from '@material-ui/icons/Cached';
import AddIcon from '@material-ui/icons/Add';

import Router, { withRouter } from 'next/router';
import Link from 'next/link';
import AppContent from '../components/AppContent';
import AddProofDialog from '../dialogs/addProof';
import Wrapper from '../components/Wrapper';
import Account from '../store/AccountStore';
import { autorun } from 'mobx';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 8,
    padding: theme.spacing.unit * 8,
  },
  paper: {
    padding: theme.spacing.unit * 4,
    width: '100%',
    overflowX: 'auto',
  },
  stepper: {
    padding: 0,
    marginBottom: theme.spacing.unit * 4,
  },
  stepButton: {
    marginRight: theme.spacing.unit * 2,
  },
  stepButtonSuccess: {
    marginRight: theme.spacing.unit * 2,
    background: green[500],
    '&:hover': {
      background: green[700],
    },
  },
  seed: {
    marginBottom: theme.spacing.unit * 2,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});

@inject('account', 'proofs', 'kyc')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    const { kyc, proofs } = this.props;

    autorun(() => {
      if (kyc.list.length > 0) {
        proofs.getProofs();
      }
    });
  }

  componentDidMount() {
    this.props.kyc.getAccounts();
  }
  render() {
    const { classes, account, proofs, kyc } = this.props;
    const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);
    const steps = ['Identify yourself', 'Become smart', 'Apply to KYC'];
    let inList = false;
    for (let i = 0; i < kyc.list.length; i += 1) {
      if (
        kyc.list[i].address ===
        Waves.Seed.fromExistingPhrase(account.seed).address
      ) {
        inList = true;
      }
    }
    return (
      <div>
        <AddProofDialog />
        <Wrapper>
          <AppContent className={classes.root}>
            {kyc.getAccountStatus === 'fetching' && <LinearProgress />}
            <Grid container spacing={24}>
              {!inList && kyc.getAccountStatus === 'success' && (
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <Stepper
                      activeStep={account.activeStep}
                      className={classes.stepper}
                    >
                      {steps.map(label => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    {account.activeStep === 0 && (
                      <div>
                        <TextField
                          margin="dense"
                          id="description"
                          label="Seed Phrase"
                          type="text"
                          value={account.seed}
                          onChange={e => {
                            account.seed = e.target.value;
                          }}
                          className={classes.seed}
                          fullWidth
                          multiline
                          required
                          variant="outlined"
                          rows={3}
                        />
                        <Button
                          disabled={account.seed === ''}
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            account.activeStep += 1;
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    {account.activeStep === 1 && (
                      <div>
                        <Typography variant="h6">
                          Upgrade to smart account&nbsp;
                          <span role="img" aria-label="rocket">
                            🚀
                          </span>
                        </Typography>
                        <Typography
                          variant="caption"
                          paragraph
                          color="textSecondary"
                        >
                          {Waves.Seed.fromExistingPhrase(account.seed).address}
                        </Typography>
                        <Typography paragraph>
                          In order to be able to create zero-knowledge proofs
                          make sure your account is upgraded to the status of a
                          Smart Account.
                        </Typography>
                        <Button
                          variant="contained"
                          className={classes.stepButton}
                          onClick={() => {
                            account.activeStep -= 1;
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          className={account.isSmart ? classes.stepButtonSuccess : classes.stepButton}
                          onClick={() => {
                            if (account.isSmart === false) {
                              account.becomeSmart();
                            }
                          }}
                        >
                          Become smart
                        </Button>
                        <Button
                          disabled={account.isSmart === false}
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            account.activeStep += 1;
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    {account.activeStep === 2 && (
                      <div>
                        <Typography variant="h6">
                          Verify your account&nbsp;
                          <span role="img" aria-label="lock">
                            🔐
                          </span>
                        </Typography>
                        <Typography paragraph>
                          Now please verify your account at a KYC provider.
                          After that please update the status and feel free to
                          purchase STO tokens.
                        </Typography>
                        <Button
                          variant="contained"
                          className={classes.stepButton}
                          onClick={() => {
                            account.activeStep -= 1;
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          // disabled
                          variant="contained"
                          color="primary"
                          className={classes.stepButton}
                          onClick={() => {
                            kyc.getAccounts();
                          }}
                        >
                          <UpdateIcon className={classes.rightIcon} />
                        </Button>
                      </div>
                    )}
                  </Paper>
                </Grid>
              )}

              {inList && kyc.getAccountStatus === 'success' && (
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <Typography variant="h5" paragraph>
                      Proofs
                    </Typography>
                  </Grid>
                  <Paper className={classes.paper}>
                    <Table className={classes.table}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Proof</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proofs.list.map(row => (
                          <TableRow className={classes.row} key={row.id}>
                            <TableCell component="th" scope="row">
                              <Typography noWrap>
                                {row.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap>
                                {row.proof}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </AppContent>
        </Wrapper>
        {inList && kyc.getAccountStatus === 'success' && (
          <Fab
            color="primary"
            aria-label="Add"
            className={classes.fab}
            onClick={() => {
              // proofs.createProof();
              proofs.showAddProofDialog = true;
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object,
  proofs: PropTypes.object,
  kyc: PropTypes.object,
};

export default withRouter(withStyles(styles)(Index));
