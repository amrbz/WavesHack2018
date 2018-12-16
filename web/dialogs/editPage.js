import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

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
});

@inject('user', 'pages')
@observer
class EditPage extends Component {
  render() {
    const { pages, classes } = this.props;
    return (
      <Dialog
        open={pages.editPageIndex !== null}
        onClose={() => {
          pages.editPageIndex = null;
        }}
        aria-labelledby="form-edit-dialog-title"
      >
        <DialogTitle id="form-edit-dialog-title">Update page data</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="titleEdit"
            label={`Title (${pages.titleLimit - pages.titleEdit.length})`}
            type="text"
            value={pages.titleEdit || ''}
            onChange={e => {
              pages.titleEdit =
                e.target.value.length <= pages.titleLimit
                  ? e.target.value
                  : pages.titleEdit;
            }}
            error={pages.titleEdit === ''}
            helperText={pages.titleEdit === '' ? `Can't be blank` : null}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="descrEdit"
            label={`Description (${pages.descrLimit - pages.descrEdit.length})`}
            type="text"
            value={pages.descrEdit}
            onChange={e => {
              pages.descrEdit =
                e.target.value.length <= pages.descrLimit
                  ? e.target.value
                  : pages.descrEdit;
            }}
            variant="outlined"
            fullWidth
            multiline
            rows={6}
          />
          <FormControlLabel
            control={
              <Switch
                value={toString(pages.isPrivateEdit)}
                checked={pages.isPrivateEdit}
                color="primary"
                onChange={e => {
                  pages.isPrivateEdit = e.target.checked;
                }}
              />
            }
            label="Private"
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              pages.editPageIndex = null;
              pages.titleEdit = '';
              pages.descrEdit = '';
              pages.isPrivateEdit = '';
            }}
          >
            Cancel
          </Button>
          <div className={classes.buttonWrapper}>
            <Button
              onClick={() => pages.updatePage()}
              color="primary"
              autoFocus
              disabled={
                !pages.titleEdit ||
                (pages.editPageIndex &&
                  pages.list[pages.editPageIndex].title === pages.titleEdit &&
                  pages.list[pages.editPageIndex].description === pages.descrEdit &&
                  pages.list[pages.editPageIndex].isPrivate ===
                    pages.isPrivateEdit) ||
                pages.editPageStatus === 'fetching'
              }
            >
              Save
            </Button>
            {pages.editPageStatus === 'fetching' && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </DialogActions>
      </Dialog>
    );
  }
}

EditPage.propTypes = {
  classes: PropTypes.object.isRequired,
  pages: PropTypes.object,
};

export default withStyles(styles)(EditPage);
