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
} from '@material-ui/core';

const styles = theme => ({
  dialog: {},
});

@inject('files')
@observer
class AddFile extends Component {
  render() {
    const { files, classes } = this.props;
    return (
      <Dialog
        open={files.filesToAdd.length > 0}
        onClose={() => {
          files.showAddDialod = false;
        }}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">
          {files.addFileStatus === 'fetching' ? 'Uploading...' : 'New file'}
        </DialogTitle>
        <DialogContent>
          {files.addFileStatus === 'fetching' ? (
            <div>
              <Typography variant="caption">Title</Typography>
              <Typography paragraph>{files.title}</Typography>
              <Typography variant="caption">Description</Typography>
              <Typography paragraph>{files.description || '-'}</Typography>
              <Typography paragraph>Please wait...</Typography>
              <LinearProgress
                variant="determinate"
                value={files.uploadProgress}
              />
            </div>
          ) : (
            <div>
              <Typography variant="body1" paragraph>
                Please enter a file title. The description field is optional.
                Also make sure that file size is <b>below 40 MB</b>.
              </Typography>
              <TextField
                margin="dense"
                id="title"
                label={`Title (${files.titleLimit -
                  (files.title ? files.title.length : 0)})`}
                type="text"
                value={files.title || ''}
                onChange={e => {
                  files.title =
                    e.target.value.length <= files.titleLimit
                      ? e.target.value.replace(/[^\w\s]/, '')
                      : files.title;
                }}
                error={files.title === ''}
                helperText={files.title === '' ? `Can't be blank` : null}
                fullWidth
                required
                variant="outlined"
                disabled={files.addFileStatus === 'fetching'}
              />
              <TextField
                margin="dense"
                id="description"
                label={`Description (${files.descrLimit - files.description.length})`}
                type="text"
                value={files.description}
                onChange={e => {
                  files.description =
                    e.target.value.length <= files.descrLimit
                      ? e.target.value
                      : files.description;
                }}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                disabled={files.addFileStatus === 'fetching'}
              />
              <TextField
                margin="dense"
                id="description"
                label="Seed Phrase"
                type="text"
                value={files.seedPhrase}
                onChange={e => {
                  files.seedPhrase = e.target.value;
                }}
                fullWidth
                multiline
                required
                error={files.seedPhrase === ''}
                helperText={`Sign transaction for ${files.pageAddress}`}
                variant="outlined"
                rows={3}
                className="ym-hide-content"
                disabled={files.addFileStatus === 'fetching'}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              files.filesToAdd = [];
            }}
            color="primary"
            disabled={files.addFileStatus === 'fetching'}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              files.uploadFiles();
            }}
            color="primary"
            disabled={
              !files.title ||
              files.addFileStatus === 'fetching' ||
              files.seedPhrase === ''
            }
          >
            Add file
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddFile.propTypes = {
  classes: PropTypes.object.isRequired,
  files: PropTypes.object,
};

export default withStyles(styles)(AddFile);
