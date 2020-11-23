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

export class Charts {
    private _api = new Api()
    async build() {
        this.drinkDranksChart()
    }
    async drinkDranksChart() {
        const ctx: any = document.getElementById('drink-dranks')
        const drinkDranks = await this._api.listDrinkDranks()
        const drinks = await this._api.listDrinks()

        interface DrinkGroup {
            drinkId: number,
            drinkDranks: DrinkDrank[],
        }

        let drinkGroups: DrinkGroup[] = drinkDranks
            .map(x => x.drink_id)
            .filter(onlyUnique)
            .map(x => {
                let drinkGroup: DrinkGroup = {
                    drinkId: x,
                    drinkDranks: [],
                }

                return drinkGroup
            })

        for (let drinkDrank of drinkDranks) {
            let drinkGroup = drinkGroups.find(drinkGroup => drinkGroup.drinkId == drinkDrank.drink_id)

            drinkGroup.drinkDranks.push(drinkDrank)
        }

        drinkGroups = drinkGroups
            .sort((drinkGroupA, drinkGroupB) => drinkGroupA.drinkId - drinkGroupB.drinkId)

        interface DrinkDranksGroupedByTimestamp {
            timestamp: luxon.DateTime,
            drinkDranks: DrinkDrank[],
        }

        interface DrinkDranksGroupedByTimestampGroupedByDrinkId {
            drink?: Drink,
            drinkId: number,
            drinkDranksGroupedByTimestamp: DrinkDranksGroupedByTimestamp[],
        }

        let drinkDranksGroupedByTimestampGroupedByDrinkId: DrinkDranksGroupedByTimestampGroupedByDrinkId[] = []

        for (let drinkGroup of drinkGroups) {
            let group: DrinkDranksGroupedByTimestampGroupedByDrinkId = {
                drink: drinks.find(drink => drink.id == drinkGroup.drinkId),
                drinkId: drinkGroup.drinkId,
                drinkDranksGroupedByTimestamp: [],
            }

            for (let drinkDrank of drinkGroup.drinkDranks
                .sort((drinkDrankA, drinkDrankB) =>
                    drinkDrankA.drank_timestamp_date().diff(drinkDrankB.drank_timestamp_date()).milliseconds
                )
            ) {
                let byTimestamp = group.drinkDranksGroupedByTimestamp
                    .find(x => x.timestamp.equals(drinkDrank.drank_timestamp_date()))

                if (byTimestamp) {
                    byTimestamp.drinkDranks.push(drinkDrank)
                } else {
                    byTimestamp = {
                        timestamp: drinkDrank.drank_timestamp_date(),
                        drinkDranks: [ drinkDrank ]
                    }

                    group.drinkDranksGroupedByTimestamp.push(byTimestamp)
                }
            }

            drinkDranksGroupedByTimestampGroupedByDrinkId.push(group)
        }

        new ChartJs.Chart(ctx, {
            type: 'bar',
            data: {
                datasets: drinkDranksGroupedByTimestampGroupedByDrinkId.map(group => {
                    return {
                        label: group.drink?.name ?? group.drinkId.toString(),
                        backgroundColor: group.drink?.colour,
                        stack: group.drinkId.toString(),
                        data: group.drinkDranksGroupedByTimestamp.map(byTimestamp => {
                            return {
                                x: byTimestamp.timestamp.toString(),
                                y: byTimestamp.drinkDranks.length,
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
}
