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
        return luxon.DateTime.fromISO(this.drank_timestamp)
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

export class Api {
    private _domain = 'http://localhost:8000'
    async listDrinks(): Promise<Drink[]> {
        const drinks: Drink[] = await fetch(this._domain + "/drinks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinks
    }
    async listDrinkDranks(drinkId?: number): Promise<DrinkDrank[]> {
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
