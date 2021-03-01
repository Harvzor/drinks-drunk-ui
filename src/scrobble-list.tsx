import React from 'react';
import * as luxon from "luxon"

import { Api, Trackable, Scrobble } from "./api"

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

import Skeleton from '@material-ui/lab/Skeleton';

class ScrobbleListState {
    loading: boolean
    trackables: Trackable[]
    scrobbles: Scrobble[]
}

export class ScrobbleList extends React.Component {
    state: ScrobbleListState = {
        loading: true,
        trackables: [],
        scrobbles: [],
    }
    async setup() {
        const api  = new Api()
        
        const trackables = await api.listTrackables()
        const scrobbles = (await api.listScrobbles({
                take: 10,
            }))
            .sort((a, b) => b.scrobble_timestamp_datetime().diff(a.scrobble_timestamp_datetime()).milliseconds)

        this.setState({ loading: false, trackables: trackables, scrobbles, })
    }
    componentDidMount() {
        this.setup()
    }
    render() {
        return (
            <Grid container>
                <Grid item sm={12}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableBody>
                                {this.state.loading
                                    ? <>
                                        { [...Array(10)].map((_, index) =>
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Skeleton key={index} />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton key={index} />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                    : <>
                                            {this.state.scrobbles.map((scrobble: Scrobble) => (
                                                <TableRow key={scrobble.id}>
                                                    <TableCell component="th" scope="row">
                                                        <span style={{ color: this.state.trackables.find(trackable => trackable.id === scrobble.trackable_id)?.colour ?? 'inherit' }}>
                                                            { this.state.trackables.find(trackable => trackable.id === scrobble.trackable_id)?.name ?? scrobble.trackable_id }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title={ scrobble.scrobble_timestamp_datetime().toLocaleString(luxon.DateTime.DATETIME_FULL) } placement="bottom">
                                                            <span>
                                                                { scrobble.scrobble_timestamp_datetime().toRelative() }
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </>
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        )
    }
}