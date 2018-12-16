import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@material-ui/core';

const styles = theme => ({});

@inject('files')
@observer
class EditFile extends Component {
  render() {
    const { files, classes } = this.props;
    return (
      <Dialog
        open={files.editFileIndex !== null}
        onClose={() => {
          files.editFileIndex = null;
          files.titleEdit = '';
          files.descrEdit = '';
        }}
        aria-labelledby="form-edit-dialog-title"
      >
        <DialogTitle id="form-edit-dialog-title">Update file data</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="titleEdit"
            label={`Title (${files.titleLimit - files.titleEdit.length})`}
            type="text"
            value={files.titleEdit || ''}
            onChange={e => {
              files.titleEdit =
                e.target.value.length <= files.titleLimit
                  ? e.target.value
                  : files.titleEdit;
            }}
            variant="outlined"
            error={files.titleEdit === ''}
            helperText={files.titleEdit === '' ? `Can't be blank` : null}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="descrEdit"
            label={`Description (${files.descrLimit - files.descrEdit.length})`}
            type="text"
            value={files.descrEdit}
            onChange={e => {
              files.descrEdit =
                e.target.value.length <= files.descrLimit
                  ? e.target.value
                  : files.descrEdit;
            }}
            variant="outlined"
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              files.editFileIndex = null;
              files.titleEdit = '';
              files.descrEdit = '';
            }}
          >
            Cancel
          </Button>
          <div className={classes.buttonWrapper}>
            <Button
              onClick={() => files.updateFile()}
              color="primary"
              autoFocus
              disabled={
                !files.titleEdit ||
                (files.editFileIndex &&
                  files.list[files.editFileIndex].title === files.titleEdit &&
                  files.list[files.editFileIndex].description === files.descrEdit) ||
                files.getFilesStatus === 'fetching'
              }
            >
              Save
            </Button>
            {files.getFilesStatus === 'fetching' && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </DialogActions>
      </Dialog>
    );
  }
}

EditFile.propTypes = {
  classes: PropTypes.object.isRequired,
  files: PropTypes.object,
};

export default withStyles(styles)(EditFile);
