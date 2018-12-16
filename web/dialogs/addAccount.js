import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
// import ym from 'react-yandex-metrika';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  LinearProgress,
  Typography,
  Grid,
} from '@material-ui/core';

const styles = theme => ({
  dialog: {},
});

@inject('kyc')
@observer
class AddFile extends Component {
  render() {
    const { kyc, classes } = this.props;
    return (
      <Dialog
        open={kyc.showAddAccountDialog}
        onClose={() => {
          kyc.showAddAccountDialog = false;
        }}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">New account</DialogTitle>
        <DialogContent>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="name"
                label="Name"
                type="text"
                value={kyc.name}
                onChange={e => {
                  kyc.name = e.target.value;
                }}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="address"
                label="Address"
                type="text"
                value={kyc.address}
                onChange={e => {
                  kyc.address = e.target.value;
                }}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="age"
                label="Age"
                type="number"
                value={kyc.age}
                onChange={e => {
                  kyc.age = e.target.value;
                }}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                margin="dense"
                id="residency"
                label="Residency"
                type="text"
                value={kyc.residency}
                onChange={e => {
                  if (e.target.value.length <= 2) {
                    kyc.residency = e.target.value;
                  }
                }}
                required
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              kyc.showAddAccountDialog = false;
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              kyc.addAccount();
            }}
            color="primary"
            disabled={
              kyc.name === '' ||
              kyc.residency === '' ||
              kyc.age === '' ||
              kyc.address === ''
            }
          >
            Add account
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddFile.propTypes = {
  classes: PropTypes.object.isRequired,
  kyc: PropTypes.object,
};

export default withStyles(styles)(AddFile);
