import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { green } from '@material-ui/core/colors';
import {
  IconButton,
  Snackbar,
  SnackbarContent,
  Button,
} from '@material-ui/core';
import { observer, inject } from 'mobx-react';

import InfoIcon from '@material-ui/icons/Info';
import ErrorIcon from '@material-ui/icons/Error';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  success: {
    backgroundColor: green[600],
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.unit * 2,
  },
  ul: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
});

@inject('notifiers')
@observer
class Notifiers extends React.Component {
  render() {
    const { classes, notifiers } = this.props;
    return notifiers.list.map((item, index) => {
      const actions = [
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => {
            const arr = notifiers.list;
            arr.splice(index, 1);
            notifiers.list = arr;
          }}
        >
          <CloseIcon className={classes.close} />
        </IconButton>,
      ];

      if (item.data && item.data.buttonType === 'passport') {
        actions.unshift(
          <Button
            key="passport"
            aria-label="Passport"
            color="inherit"
            href={`/passport/${item.data.file.id}`}
            target="_blank"
          >
            Passport
          </Button>,
        );
      }

      if (item.data && item.data.buttonType === 'tx') {
        actions.unshift(
          <Button
            key="tx"
            aria-label="Tx"
            color="inherit"
            href={`https://testnet.wavesexplorer.com/tx/${item.data.tx.id}`}
            target="_blank"
          >
            Explorer
          </Button>,
        );
      }

      if (item.data && item.data.buttonType === 'duplicateUser') {
        actions.unshift(
          <Button
            key="duplicateUser"
            aria-label="duplicateUser"
            color="inherit"
            onClick={() => {
              Router.push('/login');
            }}
          >
            Login
          </Button>,
        );
      }
      return (
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: item.type === 'success' ? 'left' : 'right',
          }}
          open={notifiers.list.length > 0}
          autoHideDuration={null}
          key={item.message}
        >
          <SnackbarContent
            className={classes[item.type]}
            aria-describedby="client-snackbar"
            key={`snack_${item.message}`}
            message={
              <span id="client-snackbar" className={classes.message}>
                {item.type === 'error' && <ErrorIcon className={classes.icon} />}
                {item.type === 'info' && <InfoIcon className={classes.icon} />}
                {item.type === 'success' && <SuccessIcon className={classes.icon} />}
                {item.message}
              </span>
            }
            action={actions}
          />
        </Snackbar>
      );
    });
  }
}

Notifiers.propTypes = {
  classes: PropTypes.object.isRequired,
  notifiers: PropTypes.object,
};

export default withRouter(withStyles(styles)(Notifiers));
