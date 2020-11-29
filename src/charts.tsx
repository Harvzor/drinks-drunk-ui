import React from 'react';
import ReactDOM from 'react-dom';

import * as luxon from "luxon"
import * as ChartJs from "chart.js"

import { Api, Drink, DrinkDrank, DrinkDrankDto } from "./api"

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

export class AllItemsChart extends React.Component {
    async renderChart() {
        const api  = new Api()

        const ctx: any = document.getElementById('all-items')
        const drinks = await api.listDrinks()

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                labels: drinks.map(drink => drink.name),
                datasets: [{
                    label: 'Drink that were drunk',
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
                title: {
                    display: true,
                    text: "Drinks",
                },
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

const groupDrinkDranksByItems = (scrobbles: DrinkDrank[], items: Drink[]): ItemGroup[] => {
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

const groupDrinkDranksByTimeStampAndDrinkId = (scrobbles: DrinkDrank[], items: Drink[]): ScrobblesGroupedByTimestampGroupedByItemId[] => {
    const itemGroups = groupDrinkDranksByItems(scrobbles, items)

    let dcrobblesGroupedByTimestampGroupedByItemId: ScrobblesGroupedByTimestampGroupedByItemId[] = []

    for (let itemGroup of itemGroups) {
        let group: ScrobblesGroupedByTimestampGroupedByItemId = {
            item: items.find(drink => drink.id == itemGroup.itemId),
            itemId: itemGroup.itemId,
            scrobblesGroupedByTimestamp: [],
        }

        for (let drinkDrank of itemGroup.scrobbles
            .sort((drinkDrankA, drinkDrankB) =>
                drinkDrankA.drank_timestamp_date().diff(drinkDrankB.drank_timestamp_date()).milliseconds
            )
        ) {
            let byTimestamp = group.scrobblesGroupedByTimestamp
                .find(x => x.timestamp.equals(drinkDrank.drank_timestamp_date()))

            if (byTimestamp) {
                byTimestamp.scrobbles.push(drinkDrank)
            } else {
                byTimestamp = {
                    timestamp: drinkDrank.drank_timestamp_date(),
                    scrobbles: [ drinkDrank ]
                }

                group.scrobblesGroupedByTimestamp.push(byTimestamp)
            }
        }

        dcrobblesGroupedByTimestampGroupedByItemId.push(group)
    }

    return dcrobblesGroupedByTimestampGroupedByItemId
}

export class WeeklyScrobbles extends React.Component {
    async renderChart() {
        const api = new Api()

        const ctx: any = document.getElementById('weekly-scrobbles')
        const drinkDranks = await api.listDrinkDranks()
        const drinks = await api.listDrinks()

        const drinkDranksGroupedByTimestampGroupedByDrinkId = groupDrinkDranksByTimeStampAndDrinkId(drinkDranks, drinks)

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: drinkDranksGroupedByTimestampGroupedByDrinkId.map(group => {
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

                // labels: timestampCounts.map(x => x.drinkId),
                // datasets: drinkGroups.map(drinkGroup => {
                //     let dataset/*: Chart.ChartDataSets*/ = {
                //         label: drinkGroup.drinkId.toString(),
                //         data: drinkGroup.drinkDranks.map(drinkDrank =>{
                //             return {
                //                 x: drinkDrank.timestamp,
                //                 y: 1
                //             }
                //         })
                //     }

                //     return dataset
                // })
            },
            options: {
                title: {
                    display: true,
                    text: "Drink Dranks",
                },
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
            <canvas id="weekly-scrobbles"></canvas>
        )
    }
}
