// import Chart from 'chart.js'
// import _ from 'lodash'

import * as luxon from "luxon"
import * as Chart from "chart.js"

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

class DrinkDrankDto {
    id: number
    drink_id: number
    drank_timestamp: string
}

class DrinkDrank extends DrinkDrankDto {
    static fromDrinkDrankDto(dto: DrinkDrankDto): DrinkDrank {
        let drinkDrank = new DrinkDrank()
        
        drinkDrank.id = dto.id
        drinkDrank.drink_id = dto.drink_id
        drinkDrank.drank_timestamp = dto.drank_timestamp

        return drinkDrank
    }
    drank_timestamp_datetime() {
        return luxon.DateTime.fromISO(this.drank_timestamp)
    }
    drank_timestamp_date() {
        let dateTime = this.drank_timestamp_datetime() 

        return luxon.DateTime.local(dateTime.year, dateTime.month, dateTime.day, dateTime.hour)
    }
}

interface Drink {
    id: number
    name: string
    count: number
    deleted: boolean
    colour: string
}

class DrinksDrunkApi {
    private _domain = 'http://localhost:9999'
    async list(): Promise<Drink[]> {
        const drinks: Drink[] = await fetch(this._domain + "/drinks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinks
    }
    async drinkDranks(drinkId?: number): Promise<DrinkDrank[]> {
        const drinkDrankDtos: DrinkDrankDto[] = await fetch(this._domain + "/drink_dranks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinkDrankDtos
            .map(dto => DrinkDrank.fromDrinkDrankDto(dto))
    }
}

class Page {
    private _drinkDrunkApi = new DrinksDrunkApi()
    async build() {
        this.allDrinks()
        this.drinkDranks()
    }
    async allDrinks() {
        const ctx: any = document.getElementById('all-drinks')
        const drinks = await this._drinkDrunkApi.list()

        new Chart(ctx, {
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
    async drinkDranks() {
        const ctx: any = document.getElementById('drink-dranks')
        const drinkDranks = await this._drinkDrunkApi.drinkDranks()
        const drinks = await this._drinkDrunkApi.list()

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

        console.log(drinkDranksGroupedByTimestampGroupedByDrinkId)

        new Chart(ctx, {
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
                        }) as Chart.ChartPoint[]
                    }
                }) as Chart.ChartDataSets[]

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

new Page()
    .build()
