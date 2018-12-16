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

@inject('user', 'pages')
@observer
class AddPage extends Component {
  render() {
    const { pages, classes } = this.props;
    return (
      <Dialog
        open={Boolean(pages.showAddModal)}
        onClose={() => {
          pages.showAddModal = false;
        }}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Create page</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            To create a page, please enter your waves blockchain address. You
            can get one&nbsp;
            <Link href="/seed">
              <a>here</a>
            </Link>
            &nbsp;or on&nbsp;
            <a href="https://client.wavesplatform.com" target="_blank">
              Waves platform
            </a>
            &nbsp;website.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="address"
            label="Blockchain address"
            type="tetx"
            value={pages.address || ''}
            error={pages.address === ''}
            helperText={pages.address === '' ? `Can't be blank` : null}
            onChange={e => {
              pages.address = e.target.value;
            }}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="title"
            label={`Title (${pages.titleLimit -
              (pages.title ? pages.title.length : 0)})`}
            type="text"
            value={pages.title || ''}
            onChange={e => {
              pages.title =
                e.target.value.length <= pages.titleLimit
                  ? e.target.value
                  : pages.title;
            }}
            error={pages.title === ''}
            helperText={pages.title === '' ? `Can't be blank` : null}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            margin="dense"
            id="description"
            label={`Description (${pages.descrLimit - pages.description.length})`}
            type="text"
            value={pages.description}
            onChange={e => {
              pages.description =
                e.target.value.length <= pages.descrLimit
                  ? e.target.value
                  : pages.description;
            }}
            variant="outlined"
            fullWidth
            multiline
            rows={6}
          />
          <FormControlLabel
            className={classes.formControl}
            control={
              <Switch
                checked={pages.isPrivate}
                color="primary"
                onChange={e => {
                  pages.isPrivate = e.target.checked;
                }}
              />
            }
            label="Private page"
          />
          <FormControlLabel
            className={classes.formControl}
            control={
              <Switch
                checked={pages.savedSeedPhrase}
                color="primary"
                onChange={e => {
                  pages.savedSeedPhrase = e.target.checked;
                }}
              />
            }
            label="Seed phrase is saved"
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              pages.showAddModal = false;
            }}
          >
            Cancel
          </Button>
          <div className={classes.buttonWrapper}>
            <Button
              onClick={() => pages.addPage()}
              color="primary"
              autoFocus
              disabled={
                !pages.address ||
                !pages.title ||
                !pages.savedSeedPhrase ||
                pages.addPageStatus === 'fetching'
              }
            >
              Create
            </Button>
            {pages.addPageStatus === 'fetching' && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </DialogActions>
      </Dialog>
    );
  }
}

AddPage.propTypes = {
  classes: PropTypes.object.isRequired,
  pages: PropTypes.object,
};

export default withStyles(styles)(AddPage);
