// import Chart from 'chart.js'
// import _ from 'lodash'

interface DrinkDrank {
    drinkId: number
    timestamp: Date
}

interface Drink {
    id: number
    name: string
    count: number
    deleted: boolean
}

class DrinksDrunkApi {
    private _domain = 'http://localhost:8000'
    async list(): Promise<Drink[]> {
        return await fetch(this._domain + "/drinks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .then(res => res)
        .catch((reason) => {
            console.error(reason)
        })
    }
    async drinkDranks(drinkId?: number): Promise<DrinkDrank[]> {
        function getRandomInt(max: number): number {
            return Math.floor(Math.random() * Math.floor(max));
        }

        const date = new Date()

        let data: DrinkDrank[] = []
        

        for (let i = 0; i < 20; i++) {
            data.push({
                drinkId: getRandomInt(5),
                timestamp: new Date(date.setHours(date.getHours() - getRandomInt(3)))
            })
        }

        if (drinkId != null) {
            data = data
                .filter(x => x.drinkId == drinkId)
        }

        return data;
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
                    label: 'Drink that were drank',
                    data: drinks.map(drink => drink.count),
                    borderWidth: 1
                }]
            },
            options: {
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
        const data = await this._drinkDrunkApi.drinkDranks()

        interface TimestampCount {
            timestamp: Date,
            count: number
        }

        const timestampCounts: TimestampCount[] = []

        data.forEach(x => {
            let item = timestampCounts.find(timestampCount => timestampCount.timestamp.getTime() == x.timestamp.getTime())

            if (item != null) {
                item.count++;
            } else {
                timestampCounts.push({
                    timestamp: x.timestamp,
                    count: 1,
                })
            }
        })

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestampCounts.map(x => x.timestamp),
                datasets: [{
                    label: 'Drinks times',
                    data: timestampCounts.map(x => {
                        return {
                            x: x.timestamp,
                            y: x.count,
                        }
                    }),
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        // offset: true,
                        time: {
                            unit: 'hour'
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                        }
                    }],
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
}

new Page()
    .build()
