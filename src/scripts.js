"use strict";
// import Chart from 'chart.js'
// import _ from 'lodash'
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = __importDefault(require("luxon"));
const Chart_bundle_js_1 = require("../node_modules/chart.js/dist/Chart.bundle.js");
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
class DrinkDrankDto {
}
class DrinkDrank extends DrinkDrankDto {
    static fromDrinkDrankDto(dto) {
        let drinkDrank = new DrinkDrank();
        drinkDrank.id = dto.id;
        drinkDrank.drink_id = dto.drink_id;
        drinkDrank.drank_timestamp = dto.drank_timestamp;
        return drinkDrank;
    }
    drank_timestamp_datetime() {
        return luxon_1.default.DateTime.fromISO(this.drank_timestamp);
    }
    drank_timestamp_date() {
        let dateTime = this.drank_timestamp_datetime();
        dateTime.minute = 0;
        dateTime.second = 0;
        dateTime.millisecond = 0;
        return dateTime;
    }
}
class DrinksDrunkApi {
    constructor() {
        this._domain = 'http://localhost:8000';
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const drinks = yield fetch(this._domain + "/drinks", {
                mode: 'cors'
            })
                .then(res => res.json())
                .catch((reason) => {
                console.error(reason);
            });
            return drinks;
        });
    }
    drinkDranks(drinkId) {
        return __awaiter(this, void 0, void 0, function* () {
            const drinkDrankDtos = yield fetch(this._domain + "/drink_dranks", {
                mode: 'cors'
            })
                .then(res => res.json())
                .catch((reason) => {
                console.error(reason);
            });
            return drinkDrankDtos
                .map(dto => DrinkDrank.fromDrinkDrankDto(dto));
        });
    }
}
class Page {
    constructor() {
        this._drinkDrunkApi = new DrinksDrunkApi();
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.allDrinks();
            this.drinkDranks();
        });
    }
    allDrinks() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = document.getElementById('all-drinks');
            const drinks = yield this._drinkDrunkApi.list();
            new Chart_bundle_js_1.Chart(ctx, {
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
            });
        });
    }
    drinkDranks() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = document.getElementById('drink-dranks');
            const drinkDranks = yield this._drinkDrunkApi.drinkDranks();
            const drinks = yield this._drinkDrunkApi.list();
            let drinkGroups = drinkDranks
                .map(x => x.drink_id)
                .filter(onlyUnique)
                .map(x => {
                let drinkGroup = {
                    drinkId: x,
                    drinkDranks: [],
                };
                return drinkGroup;
            });
            for (let drinkDrank of drinkDranks) {
                let drinkGroup = drinkGroups.find(drinkGroup => drinkGroup.drinkId == drinkDrank.drink_id);
                drinkGroup.drinkDranks.push(drinkDrank);
            }
            drinkGroups = drinkGroups
                .sort((drinkGroupA, drinkGroupB) => drinkGroupA.drinkId - drinkGroupB.drinkId);
            let drinkDranksGroupedByTimestampGroupedByDrinkId = [];
            for (let drinkGroup of drinkGroups) {
                let group = {
                    drink: drinks.find(drink => drink.id == drinkGroup.drinkId),
                    drinkId: drinkGroup.drinkId,
                    drinkDranksGroupedByTimestamp: [],
                };
                for (let drinkDrank of drinkGroup.drinkDranks
                    .sort((drinkDrankA, drinkDrankB) => drinkDrankA.drank_timestamp_date().diff(drinkDrankB.drank_timestamp_date()).milliseconds)) {
                    let byTimestamp = group.drinkDranksGroupedByTimestamp
                        .find(x => x.timestamp.equals(drinkDrank.drank_timestamp_date()));
                    if (byTimestamp) {
                        byTimestamp.drinkDranks.push(drinkDrank);
                    }
                    else {
                        byTimestamp = {
                            timestamp: drinkDrank.drank_timestamp_date(),
                            drinkDranks: [drinkDrank]
                        };
                        group.drinkDranksGroupedByTimestamp.push(byTimestamp);
                    }
                }
                drinkDranksGroupedByTimestampGroupedByDrinkId.push(group);
            }
            console.log(drinkDranksGroupedByTimestampGroupedByDrinkId);
            new Chart_bundle_js_1.Chart(ctx, {
                type: 'bar',
                data: {
                    datasets: drinkDranksGroupedByTimestampGroupedByDrinkId.map(group => {
                        var _a, _b, _c;
                        let dataset = {
                            label: (_b = (_a = group.drink) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : group.drinkId.toString(),
                            backgroundColor: (_c = group.drink) === null || _c === void 0 ? void 0 : _c.colour,
                            stack: group.drinkId.toString(),
                            data: group.drinkDranksGroupedByTimestamp.map(byTimestamp => {
                                return {
                                    x: byTimestamp.timestamp,
                                    y: byTimestamp.drinkDranks.length,
                                };
                            })
                        };
                        return dataset;
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
            });
        });
    }
}
new Page()
    .build();
