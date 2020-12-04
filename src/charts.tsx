import React from 'react';

import * as luxon from "luxon"
import * as ChartJs from "chart.js"

import { Api, Drink, DrinkDrank } from "./api"

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

export class AllItemsChart extends React.Component {
    async renderChart() {
        const api  = new Api()

        const ctx: any = document.getElementById('all-items')
        const drinks = await api.listItems()

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                labels: drinks.map(drink => drink.name),
                datasets: [{
                    label: 'Items',
                    data: drinks.map(drink => drink.count),
                    borderWidth: 1,
                    backgroundColor: drinks.map(drink => drink.colour),
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
                //     text: "Items",
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
            <canvas id="all-items"></canvas>
        )
    }
}

interface ItemGroup {
    itemId: number,
    scrobbles: DrinkDrank[],
}

interface ScrobblesGroupedByTimestamp {
    timestamp: luxon.DateTime,
    scrobbles: DrinkDrank[],
}

interface ScrobblesGroupedByTimestampGroupedByItemId {
    item?: Drink,
    itemId: number,
    scrobblesGroupedByTimestamp: ScrobblesGroupedByTimestamp[],
}

const groupScrobblesByItems = (scrobbles: DrinkDrank[], items: Drink[]): ItemGroup[] => {
    // Create the groups to be populated.
    let itemGroups: ItemGroup[] = scrobbles
        .map(x => x.drink_id)
        .filter(onlyUnique)
        .map(x => {
            let itemGroup: ItemGroup = {
                itemId: x,
                scrobbles: [],
            }

            return itemGroup
        })

    // Populate the groups with scrobbles.
    for (let drinkDrank of scrobbles) {
        let itemGroup = itemGroups.find(drinkGroup => drinkGroup.itemId == drinkDrank.drink_id)

        itemGroup.scrobbles.push(drinkDrank)
    }

    // Sort the items in number order of the item IDs.
    itemGroups = itemGroups
        .sort((drinkGroupA, drinkGroupB) => drinkGroupA.itemId - drinkGroupB.itemId)

    return itemGroups
}

const groupScrobblesByTimeStampAndItemId = (scrobbles: DrinkDrank[], items: Drink[], roundTo: luxon.DurationUnit): ScrobblesGroupedByTimestampGroupedByItemId[] => {
    const itemGroups = groupScrobblesByItems(scrobbles, items)

    let scrobblesGroupedByTimestampGroupedByItemId: ScrobblesGroupedByTimestampGroupedByItemId[] = []

    for (let itemGroup of itemGroups) {
        let group: ScrobblesGroupedByTimestampGroupedByItemId = {
            item: items.find(drink => drink.id == itemGroup.itemId),
            itemId: itemGroup.itemId,
            scrobblesGroupedByTimestamp: [],
        }

        for (let scrobble of itemGroup.scrobbles
            .sort((drinkDrankA, drinkDrankB) =>
                drinkDrankA.drank_timestamp_datetime().diff(drinkDrankB.drank_timestamp_datetime()).milliseconds
            )
        ) {
            let byTimestamp = group.scrobblesGroupedByTimestamp
                .find(x => x.timestamp.hasSame(scrobble.drank_timestamp_datetime(), roundTo))

            if (byTimestamp) {
                byTimestamp.scrobbles.push(scrobble)
            } else {
                let t = scrobble.drank_timestamp_datetime()

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

        scrobblesGroupedByTimestampGroupedByItemId.push(group)
    }

    return scrobblesGroupedByTimestampGroupedByItemId
}

export class HourlyScrobblesChart extends React.Component {
    async renderChart() {
        const api = new Api()

        const ctx: any = document.getElementById('hourly-scrobbles')
        const scrobbles = await api.listScrobbles({
            from: luxon.DateTime.local().plus({ day: -3}),
        })
        const items = await api.listItems()

        const scrobblesGroupedByTimestampGroupedByDrinkId = groupScrobblesByTimeStampAndItemId(scrobbles, items, 'hour')

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: scrobblesGroupedByTimestampGroupedByDrinkId.map(group => {
                    return {
                        label: group.item?.name ?? group.itemId.toString(),
                        backgroundColor: group.item?.colour,
                        stack: group.itemId.toString(),
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
        const drinks = await api.listItems()

        const scrobblesGroupedByTimestampGroupedByDrinkId = groupScrobblesByTimeStampAndItemId(scrobbles, drinks, 'day')

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: scrobblesGroupedByTimestampGroupedByDrinkId.map(group => {
                    return {
                        label: group.item?.name ?? group.itemId.toString(),
                        backgroundColor: group.item?.colour,
                        stack: group.itemId.toString(),
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
