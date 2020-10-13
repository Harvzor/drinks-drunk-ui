// import Chart from 'chart.js'

const ctx: any = document.getElementById('chart')


interface Drink {
    id: number
    name: string
    count: number
    deleted: boolean
}

class DrinksDrunkApi {
    private _domain = 'http://localhost:8000'
    constructor() {
        
    }
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
}

class Page {
    private _drinkDrunkApi = new DrinksDrunkApi()
    constructor() {

    }
    async build() {
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
}

new Page()
    .build()
