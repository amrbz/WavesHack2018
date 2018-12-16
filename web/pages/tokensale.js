/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Typography,
  Grid,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
} from '@material-ui/core';
import { observer, inject } from 'mobx-react';

import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import Link from 'next/link';
import AppContent from '../components/AppContent';
import Wrapper from '../components/Wrapper';
import Account from '../store/AccountStore';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 8,
    padding: theme.spacing.unit * 8,
  },
  media: {
    height: 180,
  },
});

@inject('sto')
@observer
class Index extends React.Component {
  render() {
    const { classes, sto } = this.props;
    return (
      <Wrapper>
        <AppContent className={classes.root}>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <Typography variant="h2" paragraph>
                Tokensale
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card className={classes.card}>
                <div>
                  <CardMedia
                    className={classes.media}
                    image="static/art.jpg"
                    title="Real estate"
                  />
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      Artist creation
                    </Typography>
                    <Typography variant="caption" paragraph>
                      Ezmc5iyssHRF9qgCoa6h8ejPG4JFD17qEGZdPUBU1MqL
                    </Typography>
                    <Typography component="p" paragraph>
                      Be the part of the upcoming creation of a worldwide
                      famouns artist Giovanni Giorgio.
                    </Typography>
                    <Typography variant="subtitle2">
                      Investor Requirements
                    </Typography>
                    <Typography>&bull; Minimal age 21</Typography>
                  </CardContent>
                </div>
                <CardActions>
                  <Button size="small" color="primary">
                    Purchase
                  </Button>
                  <Button size="small" color="primary">
                    Paper
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card className={classes.card}>
                <div>
                  <CardMedia
                    className={classes.media}
                    image="/static/oil.jpg"
                    title="Real estate"
                  />
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      Russian offshore oilfield
                    </Typography>
                    <Typography variant="caption" paragraph>
                      2RQPX1Y1m8u29fZSjkoi1Bi3ZkVZfXSV8QnJxLtmxs1e
                    </Typography>
                    <Typography component="p" paragraph>
                      Oilfield development license is owned by Shell corp. and
                      Rosneft corp.
                    </Typography>
                    <Typography variant="subtitle2">
                      Investor Requirements
                    </Typography>
                    <Typography>&bull; Minimal age 18</Typography>
                  </CardContent>
                </div>
                <CardActions>
                  <Button size="small" color="primary">
                    Purchase
                  </Button>
                  <Button size="small" color="primary">
                    Paper
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </AppContent>
      </Wrapper>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  sto: PropTypes.object,
};

export default withRouter(withStyles(styles)(Index));
