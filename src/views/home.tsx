import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import { AllTrackablesChart, HourlyScrobblesChart, DailyScrobblesChart } from '../charts';
import { ScrobbleList } from '../scrobble-list';
import { ScrobbleSummary } from '../scrobble-summary';

export class Home extends React.Component {
    render() {
        return (
            <>
                <h1>Scrobbler</h1>
                <ScrobbleSummary />
                <h2>Recent</h2>
                <ScrobbleList />
                <h2>Top Trackables</h2>
                <Card>
                    <CardContent>
                        <AllTrackablesChart/>
                    </CardContent>
                </Card>
                <h2>Hourly View of Scrobbles (last 3 days)</h2>
                <Card>
                    <CardContent>
                        <HourlyScrobblesChart />
                    </CardContent>
                </Card>
                <h2>Daily View of Scrobbles (last 30 days)</h2>
                <Card>
                    <CardContent>
                        <DailyScrobblesChart />
                    </CardContent>
                </Card>
            </>
        )
    }
}
