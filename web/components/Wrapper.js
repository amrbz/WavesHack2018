import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import Link from 'next/link';
import Router from 'next/router';
import { observer, inject } from 'mobx-react';
import { indigo } from '@material-ui/core/colors';
import classNames from 'classnames';

import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Hidden,
  Divider,
  Button,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

import StoreIcon from '@material-ui/icons/Store';
import AccountIcon from '@material-ui/icons/AccountCircle';
import MessagesIcon from '@material-ui/icons/Chat';
import AboutIcon from '@material-ui/icons/Info';
import NewAddressIcon from '@material-ui/icons/Receipt';
import FaucetIcon from '@material-ui/icons/OfflineBolt';
import DeleteIcon from '@material-ui/icons/Delete';
import AppContent from './AppContent';

import DeletDemoDetaDialog from '../dialogs/cleadDemo';
import Account from '../store/AccountStore';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  flex: {
    flexGrow: 1,
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    boxShadow: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
    },
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
    },
  },
  logo: {
    padding: '14px 0 0 20px',
    fontFamily: 'Ubuntu, sans-serif',
    fontSize: 32,
    cursor: 'pointer',
    '& a': {
      textDecoration: 'none',
      color: indigo[700],
    },
  },
});

// @inject('kyc')
// @observer
class Wrapper extends React.Component {
  constructor(props) {
    super(props);
    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    this.state = {
      mobileOpen: false,
    };
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        {/* <DeletDemoDetaDialog /> */}
        <div className={classNames(classes.toolbar, classes.logo)}>
          {/* <Link href="/">
            <a href="/">KCY</a>
          </Link> */}
        </div>
        <Divider />
        <MenuList>
          <MenuItem
            className={classes.menuItem}
            onClick={() => Router.push('/')}
          >
            <ListItemIcon className={classes.icon}>
              <AccountIcon />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.primary }}
              inset
              primary="Account"
            />
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => Router.push('/tokensale')}
          >
            <ListItemIcon className={classes.icon}>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.primary }}
              inset
              primary="Tokensale"
            />
          </MenuItem>
        </MenuList>
      </div>
    );

    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar} color="default">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
              className={classes.navIconHide}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              color="inherit"
              className={classes.flex}
              noWrap
            />
          </Toolbar>
        </AppBar>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <AppContent>{this.props.children}</AppContent>
        </main>
      </div>
    );
  }
}

Wrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  children: PropTypes.node,
  // user: PropTypes.object,
  // seed: PropTypes.object,
  // pages: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(Wrapper);
