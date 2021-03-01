import React from 'react';

import { Api, Trackable } from "./api"

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

class ScrobbleSummaryState {
    trackables: Trackable[]
    sum: number
    mostPopularTrackable: Trackable
}

export class ScrobbleSummary extends React.Component {
    state: ScrobbleSummaryState = {
        trackables: null,
        sum: null,
        mostPopularTrackable: null,
    }
    async setup() {
        const api  = new Api()
        
        const trackables = await api.listTrackables()

        const sum = trackables.reduce((s, trackable) => s + trackable.count, 0)
        const mostPopularTrackable = trackables.sort((a, b) => a.count - b.count)[0]

        this.setState({ trackables: trackables, sum, mostPopularTrackable: mostPopularTrackable, })
    }
    componentDidMount() {
        this.setup()
    }
    renderSummary(title: string, content: any): JSX.Element {
        return <Grid item sm={4}>
            <Card>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    {content
                        ? <Typography variant="h5" component="h2">
                            {content}
                        </Typography>
                        : <Skeleton />
                    }
                </CardContent>
            </Card>
        </Grid>
    }
    render() {
        return (
            <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={3}>
                {this.renderSummary('Scrobbles', this.state.sum)}
                <Grid item sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Most popular trackable
                            </Typography>
                            {this.state.mostPopularTrackable 
                                ? <Typography variant="h5" component="h2">
                                    <span style={{ color: this.state.mostPopularTrackable?.colour ?? 'inherit' }}>
                                        {this.state.mostPopularTrackable.name}
                                    </span>
                                </Typography>
                                : <Skeleton />
                            }
                        </CardContent>
                    </Card>
                </Grid>
                {this.renderSummary('Total active trackables', this.state.trackables?.length)}
            </Grid>
        )
    }
}