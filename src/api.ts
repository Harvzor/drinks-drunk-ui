import * as luxon from "luxon"

export class DrinkDrankDto {
    id: number
    drink_id: number
    drank_timestamp: string
}

export class DrinkDrank extends DrinkDrankDto {
    static fromDrinkDrankDto(dto: DrinkDrankDto): DrinkDrank {
        let drinkDrank = new DrinkDrank()
        
        drinkDrank.id = dto.id
        drinkDrank.drink_id = dto.drink_id
        drinkDrank.drank_timestamp = dto.drank_timestamp

        return drinkDrank
    }
    drank_timestamp_datetime() {
        return luxon.DateTime
            // API should return the time in UTC0.
            .fromISO(this.drank_timestamp, { zone: "utc" })
    }
    // drank_timestamp_date() {
    //     let dateTime = this.drank_timestamp_datetime() 

    //     return luxon.DateTime.local(dateTime.year, dateTime.month, dateTime.day, dateTime.hour)
    // }
}

export interface Drink {
    id: number
    name: string
    count: number
    deleted: boolean
    colour: string
}

export interface ListScrobblesOptions {
    itemId?: number
    skip?: number
    take?: number
    from?: luxon.DateTime
    to?: luxon.DateTime
}

export class Api {
    private _domain = 'http://localhost:8000'
    async listItems(): Promise<Drink[]> {
        const drinks: Drink[] = await fetch(this._domain + "/drinks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinks
    }
    async listScrobbles(options?: ListScrobblesOptions): Promise<DrinkDrank[]> {
        const url = new URL(this._domain + "/drink_dranks")

        let params: any = {}

        if (options?.skip)
            params.skip = options.skip.toString()

        if (options?.take)
            params.take = options.take.toString()

        if (options?.from)
            params.from = options.from.toISO({ includeOffset: false, })

        if (options?.to)
            params.to = options.to.toISO({ includeOffset: false, })

        url.search = new URLSearchParams(params).toString()

        const drinkDrankDtos: DrinkDrankDto[] = await fetch(url.toString(), {
            mode: 'cors',
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinkDrankDtos
            .map(dto => DrinkDrank.fromDrinkDrankDto(dto))
    }
    async incrementDrink(drinkId: number): Promise<DrinkDrank> {
        const drinkDrankDto: DrinkDrankDto = await fetch(this._domain + "/drink_dranks", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                drink_id: drinkId,
            }),
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return DrinkDrank.fromDrinkDrankDto(drinkDrankDto)
    }
}
