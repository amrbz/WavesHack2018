// import { action, observable } from 'mobx';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Typography,
} from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

const styles = theme => ({
  root: {},
});

@inject('pages')
@observer
class ClearDemoData extends React.Component {
  render() {
    const { classes, pages } = this.props;
    return (
      <Dialog
        open={pages.showDeleteDemoDataDialog}
        onClose={() => {
          pages.showDeleteDemoDataDialog = false;
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Great!
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" paragraph>
            You are going to delete demo data. Create you first page, request
            your free CNFY tokens and upload your first file&nbsp;
            <span role="img" aria-label="rocket">
              🚀
            </span>
          </Typography>
          <Typography color="textSecondary">
            Just in case. This action can&apos;t be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              pages.showDeleteDemoDataDialog = false;
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => pages.clearDemoData()}
            color="primary"
            autoFocus
            disabled={pages.deleteDemoDataStaus === 'fetching'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ClearDemoData.propTypes = {
  classes: PropTypes.object.isRequired,
  pages: PropTypes.object,
};

export default withStyles(styles)(ClearDemoData);
