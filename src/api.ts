import * as luxon from "luxon"

export class ScrobbleDto {
    id: number
    trackable_id: number
    timestamp: string
}

export class Scrobble extends ScrobbleDto {
    static fromDto(dto: ScrobbleDto) {
        let scrobble = new Scrobble()
        
        scrobble.id = dto.id
        scrobble.trackable_id = dto.trackable_id
        scrobble.timestamp = dto.timestamp

        return scrobble
    }
    scrobble_timestamp_datetime() {
        return luxon.DateTime
            // API should return the time in UTC0.
            .fromISO(this.timestamp, { zone: "utc" })
    }
}

export interface Trackable {
    id: number
    name: string
    count: number
    deleted: boolean
    colour: string
}

export interface ListScrobblesOptions {
    trackableId?: number
    skip?: number
    take?: number
    from?: luxon.DateTime
    to?: luxon.DateTime
}

export class Api {
    private _domain = window._env_.API_URL
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
    async listTrackables(): Promise<Trackable[]> {
        const trackables: Trackable[] = await fetch(this._domain + "/trackables", {
            mode: 'cors'
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return trackables
    }
    async listScrobbles(options?: ListScrobblesOptions): Promise<Scrobble[]> {
        const url = new URL(this._domain + "/scrobbles")

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

        const scrobbleDtos: ScrobbleDto[] = await fetch(url.toString(), {
            mode: 'cors',
        })
        .then(res => res.json())
        .catch((reason) => {
            console.error(reason)
        })

        return scrobbleDtos
            .map(dto => Scrobble.fromDto(dto))
    }
    async incrementTrackable(trackableId: number): Promise<Scrobble> {
        const scrobbleDto: ScrobbleDto = await this.post('/scrobble', {
            trackable_id: trackableId,
        })

        return Scrobble.fromDto(scrobbleDto)
    }
    async createTrackable(name: string, colour: string): Promise<Trackable> {
        const trackable: Trackable = await this.post('/trackables', {
            name: name,
            colour: colour,
        })

        return trackable
    }
}
