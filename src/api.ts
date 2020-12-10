import * as luxon from "luxon"

export class ScrobbleDto {
    id: number
    drink_id: number
    drank_timestamp: string
}

export class Scrobble extends ScrobbleDto {
    static fromItemDto(dto: ScrobbleDto) {
        let scrobble = new Scrobble()
        
        scrobble.id = dto.id
        scrobble.drink_id = dto.drink_id
        scrobble.drank_timestamp = dto.drank_timestamp

        return scrobble
    }
    scrobble_timestamp_datetime() {
        return luxon.DateTime
            // API should return the time in UTC0.
            .fromISO(this.drank_timestamp, { zone: "utc" })
    }
}

export interface Item {
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
    private async post(path: string, body: object) {
        return await fetch(this._domain + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(body),
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })
    }
    async listItems(): Promise<Item[]> {
        const drinks: Item[] = await fetch(this._domain + "/drinks", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinks
    }
    async listScrobbles(options?: ListScrobblesOptions): Promise<Scrobble[]> {
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

        const drinkDrankDtos: ScrobbleDto[] = await fetch(url.toString(), {
            mode: 'cors',
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return drinkDrankDtos
            .map(dto => Scrobble.fromItemDto(dto))
    }
    async incrementItem(itemId: number): Promise<Scrobble> {
        const itemDto: ScrobbleDto = await this.post('/drink_drank', {
            drink_id: itemId,
        })

        return Scrobble.fromItemDto(itemDto)
    }
    async createItem(name: string, colour: string): Promise<Item> {
        const item: Item = await this.post('/drinks', {
            name: name,
            colour: colour,
        })

        return item
    }
}
