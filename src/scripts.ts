// import Chart from 'chart.js'
// import _ from 'lodash'

// import { Chart } from "../node_modules/chart.js/dist/Chart.bundle.js"

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

interface DrinkDrank {
    id: number,
    drinkId: number
    timestamp: Date
}

interface Drink {
    id: number
    name: string
    count: number
    deleted: boolean
    colour: string
}

class DrinksDrunkApi {
    private _domain = 'http://localhost:8000'
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
        function getRandomInt(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        const date = new Date()

        let data: DrinkDrank[] = []

        for (let i = 0; i < 7; i++) {
            data.push({
                id: data.length,
                drinkId: 1,
                timestamp: new Date(date.setHours(getRandomInt(7, 12)))
            })
        }

        for (let i = 0; i < 20; i++) {
            data.push({
                id: data.length,
                drinkId: getRandomInt(1, 5),
                timestamp: new Date(date.setHours(getRandomInt(12, 18)))
            })
        }

        if (drinkId != null) {
            data = data
                .filter(x => x.drinkId == drinkId)
        }

        return data
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


        drinkDranks.forEach(drinkDrank => {
            drinkDrank.timestamp.setMinutes(0)
            drinkDrank.timestamp.setSeconds(0)
        })

        interface DrinkGroup {
            drinkId: number,
            drinkDranks: DrinkDrank[],
        }

        let drinkGroups: DrinkGroup[] = drinkDranks
            .map(x => x.drinkId)
            .filter(onlyUnique)
            .map(x => {
                let drinkGroup: DrinkGroup = {
                    drinkId: x,
                    drinkDranks: [],
                }

                return drinkGroup
            })

        for (let drinkDrank of drinkDranks) {
            let drinkGroup = drinkGroups.find(drinkGroup => drinkGroup.drinkId == drinkDrank.drinkId)

            drinkGroup.drinkDranks.push(drinkDrank)
        }

        drinkGroups = drinkGroups
            .sort((drinkGroupA, drinkGroupB) => drinkGroupA.drinkId - drinkGroupB.drinkId)

        interface DrinkDranksGroupedByTimestamp {
            timestamp: Date,
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

            for (let drinkDrank of drinkGroup.drinkDranks.sort((drinkDrankA, drinkDrankB) => drinkDrankA.timestamp.getTime() - drinkDrankB.timestamp.getTime())) {
                let byTimestamp = group.drinkDranksGroupedByTimestamp.find(x => x.timestamp.getTime() == drinkDrank.timestamp.getTime())

                if (byTimestamp) {
                    byTimestamp.drinkDranks.push(drinkDrank)
                } else {
                    byTimestamp = {
                        timestamp: drinkDrank.timestamp,
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
                    let dataset/*: Chart.ChartDataSets*/ = {
                        label: group.drink?.name ?? group.drinkId,
                        backgroundColor: group.drink?.colour,
                        stack: group.drinkId.toString(),
                        data: group.drinkDranksGroupedByTimestamp.map(byTimestamp =>{
                            return {
                                x: byTimestamp.timestamp,
                                y: byTimestamp.drinkDranks.length,
                            }
                        })
                    }

                    return dataset
                })

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
