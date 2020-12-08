import React from 'react';

import { Api, Drink } from "./api"

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

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
        
        const items = await api.listItems()

        const sum = items.reduce((s, item) => s + item.count, 0)
        const mostPopularItem = items.sort((a, b) => a.count - b.count)[0]

        this.setState({ items, sum, mostPopularItem, })
    }
    componentDidMount() {
        this.setup()
    }
    renderSummary(title: string, content: any): JSX.Element {
        console.log(content)

        return (
            <Grid item sm={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        {content
                            ? <Typography color="textSecondary" gutterBottom>
                                {content}
                            </Typography>
                            : <Skeleton />
                        }
                    </CardContent>
                </Card>
            </Grid>
        )
    }
    render() {
        return (
            <Grid container direction="row" justify="flex-start" alignItems="flex-start" spacing={3}>
                {this.renderSummary('Scrobbles', this.state.sum)}
                <Grid item sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Most popular item
                            </Typography>
                            {this.state.mostPopularItem 
                                ? <Typography variant="h5" component="h2">
                                    <span style={{ color: this.state.mostPopularItem?.colour ?? 'inherit' }}>
                                        {this.state.mostPopularItem.name}
                                    </span>
                                </Typography>
                                : <Skeleton />
                            }
                        </CardContent>
                    </Card>
                </Grid>
                {this.renderSummary('Total active items', this.state.items?.length)}
            </Grid>
        )
    }
}