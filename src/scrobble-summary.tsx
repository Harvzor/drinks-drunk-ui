import React from 'react';

import { Api, Drink } from "./api"

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class ScrobbleSummaryState {
    items: Drink[]
    sum: number
    mostPopularItem: Drink
}

export class ScrobbleSummary extends React.Component {
    state: ScrobbleSummaryState = {
        items: null,
        sum: null,
        mostPopularItem: null,
    }
    async setup() {
        const api  = new Api()
        
        const items = await api.listDrinks()

        const sum = items.reduce((s, item) => s + item.count, 0)
        const mostPopularItem = items.sort((a, b) => a.count - b.count)[0]

        this.setState({ items, sum, mostPopularItem, })
    }
    componentDidMount() {
        this.setup()
    }
    render() {
        return (
            <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={3}>
                <Grid item sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Scrobbles
                            </Typography>
                            <Typography variant="h5" component="h2">
                                {this.state.sum ? this.state.sum : 'Loading...'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Most popular item
                            </Typography>
                            <Typography variant="h5" component="h2">
                                {this.state.mostPopularItem ? this.state.mostPopularItem.name : 'Loading...'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total active items
                            </Typography>
                            <Typography variant="h5" component="h2">
                                {this.state.items ? this.state.items.length : 'Loading...'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        )
    }
}