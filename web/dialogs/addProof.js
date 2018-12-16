import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import Link from 'next/link';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  TextField,
  Switch,
  Button,
  CircularProgress,
  Typography,
  Checkbox,
} from '@material-ui/core';

const styles = theme => ({
  buttonWrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    width: '100%',
  },
});

@inject('proofs')
@observer
class AddPage extends Component {
  render() {
    const { proofs } = this.props;
    return (
      <Dialog
        open={proofs.showAddProofDialog}
        onClose={() => {
          proofs.showAddProofDialog = false;
        }}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Create proof</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="age-to-confirm"
            label="Age to prove"
            type="number"
            value={proofs.ageToProve || ''}
            onChange={e => {
              proofs.ageToProve = e.target.value;
            }}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              proofs.showAddProofDialog = false;
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              proofs.createProof();
              proofs.showAddProofDialog = false;
            }}
            color="primary"
            autoFocus
            disabled={proofs.ageToProve === ''}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddPage.propTypes = {
  classes: PropTypes.object.isRequired,
  proofs: PropTypes.object,
};

export default withStyles(styles)(AddPage);
