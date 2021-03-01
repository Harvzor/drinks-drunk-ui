import React from 'react';

import * as luxon from "luxon"
import * as ChartJs from "chart.js"

import { Api, Trackable, Scrobble } from "./api"

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

export class AllTrackablesChart extends React.Component {
    async renderChart() {
        const api  = new Api()

        const ctx: any = document.getElementById('all-trackables')
        const trackables = await api.listTrackables()

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                labels: trackables.map(trackable => trackable.name),
                datasets: [{
                    label: 'trackables',
                    data: trackables.map(trackable => trackable.count),
                    borderWidth: 1,
                    backgroundColor: trackables.map(trackable => trackable.colour),
                }]
                // datasets: drinks.map(drink => {
                //     let dataset/*: Chart.ChartDataSets*/ = {
                //         label: drink.name.toString(),
                //         backgroundColor: drink.colour,
                //         data: [drink.count],
                //     }

                //     return dataset
                // }),
            },
            options: {
                legend: {
                    display: false,
                },
                // title: {
                //     display: true,
                //     text: "Trackables",
                // },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                        }
                    }]
                }
            }
        })
    }
    componentDidMount() {
        this.renderChart()
    }
    render() {
        return (
            <canvas id="all-trackables"></canvas>
        )
    }
}

interface ScrobbleGroup {
    trackableId: number,
    scrobbles: Scrobble[],
}

interface ScrobblesGroupedByTimestamp {
    timestamp: luxon.DateTime,
    scrobbles: Scrobble[],
}

interface ScrobblesGroupedByTimestampGroupedByTrackableId {
    trackable?: Trackable,
    trackableId: number,
    scrobblesGroupedByTimestamp: ScrobblesGroupedByTimestamp[],
}

const groupScrobblesByTrackables = (scrobbles: Scrobble[], trackables: Trackable[]): ScrobbleGroup[] => {
    // Create the groups to be populated.
    let scrobbleGroups: ScrobbleGroup[] = scrobbles
        .map(x => x.trackable_id)
        .filter(onlyUnique)
        .map(x => {
            let scrobbleGroup: ScrobbleGroup = {
                trackableId: x,
                scrobbles: [],
            }

            return scrobbleGroup
        })

    // Populate the groups with scrobbles.
    for (let scrobble of scrobbles) {
        let scrobbleGroup = scrobbleGroups.find(scrobbleGroup => scrobbleGroup.trackableId == scrobble.trackable_id)

        scrobbleGroup.scrobbles.push(scrobble)
    }

    // Sort the trackables in number order of the trackable IDs.
    scrobbleGroups = scrobbleGroups
        .sort((a, b) => a.trackableId - b.trackableId)

    return scrobbleGroups
}

const groupScrobblesByTimeStampAndTrackableId = (scrobbles: Scrobble[], trackables: Trackable[], roundTo: luxon.DurationUnit): ScrobblesGroupedByTimestampGroupedByTrackableId[] => {
    const scrobbleGroups = groupScrobblesByTrackables(scrobbles, trackables)

    let scrobblesGroupedByTimestampGroupedByTrackableId: ScrobblesGroupedByTimestampGroupedByTrackableId[] = []

    for (let scrobbleGroup of scrobbleGroups) {
        let group: ScrobblesGroupedByTimestampGroupedByTrackableId = {
            trackable: trackables.find(trackable => trackable.id == scrobbleGroup.trackableId),
            trackableId: scrobbleGroup.trackableId,
            scrobblesGroupedByTimestamp: [],
        }

        for (let scrobble of scrobbleGroup.scrobbles
            .sort((a, b) =>
                a.scrobble_timestamp_datetime().diff(b.scrobble_timestamp_datetime()).milliseconds
            )
        ) {
            let byTimestamp = group.scrobblesGroupedByTimestamp
                .find(x => x.timestamp.hasSame(scrobble.scrobble_timestamp_datetime(), roundTo))

            if (byTimestamp) {
                byTimestamp.scrobbles.push(scrobble)
            } else {
                let t = scrobble.scrobble_timestamp_datetime()

                if (roundTo === "hour") {
                    t = t.plus({ minutes: -t.minute, seconds: -t.second, milliseconds: -t.millisecond })
                } else if (roundTo === 'day') {
                    t = t.plus({ hours: -t.hour, minutes: -t.minute, seconds: -t.second, milliseconds: -t.millisecond })
                } else {
                    throw "Unhandled duration unit."
                }

                byTimestamp = {
                    timestamp: t,
                    scrobbles: [ scrobble ]
                }

                group.scrobblesGroupedByTimestamp.push(byTimestamp)
            }
        }

        scrobblesGroupedByTimestampGroupedByTrackableId.push(group)
    }

    return scrobblesGroupedByTimestampGroupedByTrackableId
}

export class HourlyScrobblesChart extends React.Component {
    async renderChart() {
        const api = new Api()

        const ctx: any = document.getElementById('hourly-scrobbles')
        const scrobbles = await api.listScrobbles({
            from: luxon.DateTime.local().plus({ day: -3}),
        })
        const trackables = await api.listTrackables()

        const scrobblesGroupedByTimestampGroupedByTrackableId = groupScrobblesByTimeStampAndTrackableId(scrobbles, trackables, 'hour')

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: scrobblesGroupedByTimestampGroupedByTrackableId.map(group => {
                    return {
                        label: group.trackable?.name ?? group.trackableId.toString(),
                        backgroundColor: group.trackable?.colour,
                        stack: group.trackableId.toString(),
                        data: group.scrobblesGroupedByTimestamp.map(byTimestamp => {
                            return {
                                x: byTimestamp.timestamp.toString(),
                                y: byTimestamp.scrobbles.length,
                            }
                        }) as ChartJs.ChartPoint[]
                    }
                }) as ChartJs.ChartDataSets[]
            },
            options: {
                // title: {
                //     display: true,
                //     text: "Hourly view of scrobbles (last 3 days)",
                // },
                scales: {
                    xAxes: [{
                        type: 'time',
                        // distribution: 'series',
                        // offset: true,
                        // stacked: true,
                        time: {
                            unit: 'hour'
                        },
                        ticks: {
                            min: luxon.DateTime.local().plus({ days: -3 }).toISO(),
                            max: luxon.DateTime.local().toString(),
                            // beginAtZero: true,
                            stepSize: 1,
                        }
                    }],
                    yAxes: [{
                        // stacked: true,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                        }
                    }]
                }
            }
        })
    }
    componentDidMount() {
        this.renderChart()
    }
    render() {
        return (
            <canvas id="hourly-scrobbles"></canvas>
        )
    }
}

export class DailyScrobblesChart extends React.Component {
    async renderChart() {
        const api = new Api()

        const ctx: any = document.getElementById('daily-scrobbles')
        const scrobbles = await api.listScrobbles({
            from: luxon.DateTime.local().plus({ month: -1 }),
        })
        const trackables = await api.listTrackables()

        const scrobblesGroupedByTimestampGroupedByTrackableId = groupScrobblesByTimeStampAndTrackableId(scrobbles, trackables, 'day')

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: scrobblesGroupedByTimestampGroupedByTrackableId.map(group => {
                    return {
                        label: group.trackable?.name ?? group.trackableId.toString(),
                        backgroundColor: group.trackable?.colour,
                        stack: group.trackableId.toString(),
                        data: group.scrobblesGroupedByTimestamp.map(byTimestamp => {
                            return {
                                x: byTimestamp.timestamp.toString(),
                                y: byTimestamp.scrobbles.length,
                            }
                        }) as ChartJs.ChartPoint[]
                    }
                }) as ChartJs.ChartDataSets[]
            },
            options: {
                // title: {
                //     display: true,
                //     text: "Daily view of scrobbles (last 30 days)",
                // },
                scales: {
                    xAxes: [{
                        type: 'time',
                        // distribution: 'series',
                        // offset: true,
                        // stacked: true,
                        time: {
                            unit: 'day',
                        },
                        ticks: {
                            min: luxon.DateTime.local().plus({ days: -30 }).toISO(),
                            max: luxon.DateTime.local().toString(),
                            // beginAtZero: true,
                            stepSize: 1,
                        }
                    }],
                    yAxes: [{
                        // stacked: true,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                        }
                    }]
                }
            }
        })
    }
    componentDidMount() {
        this.renderChart()
    }
    render() {
        return (
            <canvas id="daily-scrobbles"></canvas>
        )
    }
}
