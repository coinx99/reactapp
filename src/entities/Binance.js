import { w3cwebsocket } from 'websocket';
import { EventEmitter } from 'events';
import axios from 'axios';
import { toast } from 'react-toastify';
import { logerror, logwarn, logsuccess, log } from '../std';
import moment from 'moment';
import AltcoinSeason, { StableCoins, TIMEFRAMES, filterDuplicateBaseAssets, CandlestickMap, FIATS } from './AltcoinSeason';

class Binance {
    event
    url
    WebSocket
    WebSocketFuture
    isConnected = false;
    altcoinSeason
    constructor(url = "wss://ws-api.binance.com:443/ws-api/v3", urlFuture = 'wss://fstream.binance.com:9443/ws/', event = new EventEmitter()) {
        this.url = url;
        this.urlFuture = urlFuture;
        this.event = event;
    }

    Send(object) {
        let loop = setInterval(() => {
            if (this.WebSocket.readyState == 1) {
                this.WebSocket.send(JSON.stringify(object))
                clearInterval(loop)
            }
        }, 50);
    }

    SendFuture(object) {
        let loop = setInterval(() => {
            if (this.WebSocketFuture.readyState == 1) {
                this.WebSocketFuture.send(JSON.stringify(object))
                clearInterval(loop)
            }
        }, 50);
    }

    connect() {
        this.disconnect()
        logwarn("Start connect", this.url)

        this.WebSocket = new w3cwebsocket(this.url);

        this.WebSocket.onerror = function (err) {
            this.isConnected = false;
            console.error(err);
            this.event.emit("error", err)

            // sau 5s thì kết nối lại 
            setTimeout(() => {
                this.connect()
            }, 5000);
        };

        // mở websocket server
        this.WebSocket.onopen = e => {
            this.isConnected = true
            let loop = setInterval(() => {
                if (this.WebSocket.readyState == 1) {
                    this.event.emit("connected", e, this)
                    clearInterval(loop)
                    setInterval(() => {
                        this.WebSocket.send(JSON.stringify({
                            method: 'PING',
                            id: 'PING' + Date.now(),
                        }))
                    }, 3000)
                }
            }, 50);
        }

        // khi có tin nhắn từ Binance thì gọi sự kiện Emitter, phân loại sự kiện theo id
        this.WebSocket.onmessage = msg => {
            // console.log(msg.data);
            let data = JSON.parse(msg.data)
            this.event.emit(data.id, data)
        }

        // Khi mất kết nối với Binance thì tắt chương trình
        this.WebSocket.onclose = r => {
            this.isConnected = false;
            if (r.code == 1008) {
                // sentAlertTelegram("truy vấn getKlines id quá dài", "altcoinseason", Settings)
                toast.error("truy vấn getKlines id quá dài")
            }
            console.error("WebSocket.onclosed", r);
            this.event.emit("close", r)
        }

        return this.event;

    }

    connectFuture() {
        this.disconnectFuture()

        this.WebSocketFuture = new w3cwebsocket(this.urlFuture);

        this.WebSocketFuture.onerror = function (err) {
            this.isConnected = false;
            console.error(err);
            this.event.emit("FutureError", err)

            // sau 5s thì kết nối lại 
            setTimeout(() => {
                this.connectFuture()
            }, 5000);
        };

        // mở websocket server
        this.WebSocketFuture.onopen = e => {
            this.isConnected = true
            let loop = setInterval(() => {
                if (this.WebSocketFuture.readyState == 1) {
                    this.event.emit("FutureConnected", e, this)
                    clearInterval(loop)
                }
            }, 50);
        }

        // khi có tin nhắn từ Binance thì gọi sự kiện Emitter, phân loại sự kiện theo id
        this.WebSocketFuture.onmessage = msg => {
            // console.log(msg.data);
            let data = JSON.parse(msg.data)
            this.event.emit(data.id, data)

        }

        // Khi mất kết nối với Binance thì tắt chương trình
        this.WebSocketFuture.onclose = r => {
            this.isConnected = false;
            if (r.code == 1008) {
                // sentAlertTelegram("truy vấn getKlines id quá dài", "altcoinseason", Settings)
                toast.error("truy vấn getKlines id quá dài")
            }
            console.error("WebSocketFuture.onclosed", r);
            this.event.emit("FutureClose", r)
        }
        return this.event;
    }

    disconnect() {
        try {
            this.WebSocket.close()
            this.WebSocket.onopen = this.WebSocket.onmessage = this.WebSocket.onclose = this.WebSocket.onerror = null;
        } catch (err) { }
        return this.WebSocket = null;
    }

    disconnectFuture() {
        try {
            this.WebSocketFuture.close()
            this.WebSocketFuture.onopen = this.WebSocketFuture.onmessage = this.WebSocketFuture.onclose = this.WebSocketFuture.onerror = null;
        } catch (err) { }
        return this.WebSocketFuture = null;
    }

    /**
     * lấy danh sách toàn bộ coins Spot mà có cặp với USDT, BUSD
     * @param {string[]} quoteAssets 
     * @returns {string[]} danh sách các symbols
     */
    async getAllSymbolsWiths(quoteAssets = StableCoins) {
        return new Promise((rs, rj) => {
            let Ename = "getAllSymbolsWiths";
            // làm gì đó sau khi có kết quả trả về
            this.event.once(Ename, (r) => {
                try {
                    // lọc cặp với quoteAssets và không phải cặp BUSD/USDT..
                    let symbols = r.result.map(v => v.symbol).filter(v => !v.match(/BEAR|BULL|UP|DOWN/))
                        .filter(v =>
                            v.match(`(.+)(${quoteAssets.join("|")})$`)
                            && !v.match(`^(${[...FIATS, ...StableCoins].join("|")})(.+)$`)
                        )

                    // lọc trùng
                    symbols = filterDuplicateBaseAssets(symbols, quoteAssets)
                    rs(symbols);
                } catch (err) {
                    logerror(r);
                    rj(err)
                }
            })

            // gửi yêu cầu lên server 
            this.Send({
                "id": Ename,
                "method": "ticker.24hr",
            })
        })
    }

    /**
     * lấy biểu đồ nến của 1 cặp symbol
     * @param {string} Symbol 
     * @param {moment} StartTime 
     * @param {moment} EndTime 
     * @param {string} timeFrame 
     * @param {int} Limit 
     * @returns {Klines}
     */
    getKlines(Symbol, StartTime, EndTime, timeFrame = "1d", Limit = 1000) {
        return new Promise((rs, rj) => {
            let t = Math.round(Date.now() / 1000).toString()
            t = t.slice(t.length / 2 - 1)
            let params
            let Ename = "getKlines" + Symbol + timeFrame + t;
            if (Ename.length > 34) {
                logerror("quá dài Ename ", Ename, Ename.length, Symbol, timeFrame)
                this.event.emit("getKlines", {
                    error: Ename + " Ename quá dài " + Ename.length,
                    Ename: Ename
                })
            }
            // làm gì đó sau khi có kết quả trả về
            this.event.once(Ename, (r) => {
                if (r.error) {
                    switch (r.error.code) {
                        case -1003:
                            // console.error(r)
                            logerror(moment.tz(r.error.data.retryAfter, "Asia/Ho_Chi_Minh").format("DD/MM hh:mm +7"))
                            this.event.emit("retryAfter", r.error.data.retryAfter)
                            setTimeout(() => {
                                rs(this.getKlines(Symbol, StartTime, EndTime, timeFrame, Limit))
                            }, r.error.data.retryAfter - moment().valueOf() + 500);
                            break;
                        case -1121:
                            r.error.symbol = Symbol
                            rj(r.error);
                            break;
                        default:
                            console.error(r.error, params);
                            rj(r.error);
                            break;
                    }
                } else try {
                    let Klines = r.result
                    // logsuccess("nhận " + Symbol + " " + timeFrame + " " + r.id + " " + Klines.length);
                    if (Klines[Klines.length - 1])
                        Klines[Klines.length - 1][CandlestickMap.CloseTime] = moment().valueOf();

                    Klines.sort((a, b) => a[CandlestickMap.OpenTime] - b[CandlestickMap.OpenTime])
                    this.event.emit("getKlinesFinished", Klines)
                    rs(Klines);
                } catch (err) {
                    console.error(r);
                    rj(err)
                }
            })

            if ((EndTime - StartTime) / TIMEFRAMES.toMiliSecond(timeFrame) > 1000)
                StartTime = EndTime - TIMEFRAMES.toMiliSecond(timeFrame) * 999;

            params = {
                "symbol": Symbol,
                "interval": timeFrame,
                "startTime": StartTime,
                "endTime": EndTime,
                limit: Limit
            }
            // gửi yêu cầu lên server 
            // console.log(params.symbol, params.interval);
            this.Send({
                "id": Ename,
                "method": "klines",
                "params": params
            },)
            this.event.emit("getKlines", { Symbol, StartTime, EndTime, timeFrame, Limit })
        })
    }

    /**
     * lấy biểu đồ nến của danh sách symbols
     * @param {string[]} Symbols danh sách cặp tiền
     * @param {moment} StartTime thời gian bắt đầu
     * @param {moment} EndTime thời gian kết thúc
     * @param {string} timeFrame khung thời gian
     * @param {int} index thứ tự
     * @param {int} TimeWait thời gian chờ mỗi truy vấn milisecond
     * @returns {object} danh sách {Symbol : Kline}
     */
    getSymbolsKlines(Symbols = [], StartTime, EndTime, timeFrame = "1d", index = 0, TimeWait = 10) {
        return new Promise(async (rs, rj) => {
            if (index < Symbols.length) {
                setTimeout(async () => {
                    let Symbol = Symbols[index]
                    // logwarn(" getSymbolsKlines >>> " + index + " " + Symbol + " " + Symbols.length + " " + timeFrame)

                    let next = await this.getSymbolsKlines(Symbols, StartTime, EndTime, timeFrame, index + 1)

                    try {
                        let Klines = await this.getKlines(Symbol, StartTime, EndTime, timeFrame);

                        this.event.emit("getKlinesFinish", { Symbols, Klines, StartTime, EndTime, timeFrame, index })
                        if (Klines && Klines.length > 0) {
                            next[Symbol] = Klines;
                        }
                    } catch (err) {
                        // logerror(err)
                        // rj(err)
                    }

                    if (index == (Symbols.length - 1)) this.event.emit("getSymbolsKlinesFinished", next)
                    rs(next);

                }, TimeWait);
            } else {
                rs({})
            };
        })
    }

    // Tìm các đồng tiền mà có cặp với BTC, trả về đồng cặp với StableCoins, ví dụ: ETH/BTC => ETH/USDT
    async getSymbolsQuoteBTCQuoteWith(With = StableCoins) {
        let QuoteAssets = ["BTC", ...With] // 
        let _Symbols = await this.getAllSymbolsWiths([])
        let endsWithBTC = _Symbols.filter(Symbol => Symbol.endsWith("BTC"))
        let Symbols = endsWithBTC.map(Symbol => {
            let matched = Symbol.match(`(.+)(BTC)$`)
            if (matched) {
                const [baseAsset, quoteAsset] = matched.slice(1);
                // console.log(baseAsset);
                return _Symbols.find(S => {
                    return (S.startsWith(baseAsset) && !S.endsWith("BTC"));
                })
            }
        }).filter(v => v)
        // log(s, _Symbols.filter(v => {
        //     return QuoteAssets.some(q => v.endsWith(q))
        // }))

        return filterDuplicateBaseAssets(Symbols);
    }

    getFutureAllSymbolsWithsx(quoteAssets = StableCoins) {
        return new Promise((rs, rj) => {
            let Ename = "getFutureAllSymbolsWiths" + Math.round(Date.now() / 1000);
            // làm gì đó sau khi có kết quả trả về
            this.event.once(Ename, (r) => {
                console.log(r);
                try {
                    // lọc cặp với quoteAssets và không phải cặp BUSD/USDT..
                    let symbols = r.result.map(v => v.symbol).filter(v => !v.match(/1000|BEAR|BULL/))
                        .filter(v => v.match(`(.+)(${quoteAssets.join("|")})$`) && !v.match(`^(${StableCoins.join("|")})(.+)$`))
                    // lọc trùng
                    symbols = filterDuplicateBaseAssets(symbols, quoteAssets)
                    rs(symbols);
                } catch (err) {
                    logerror(r);
                    rj(err)
                }
            })
            console.log(Ename, Ename.length);
            // gửi yêu cầu lên server 
            this.Send({
                "id": Ename,
                "method": "!ticker@arr",
            })
        })
    }

    /**
     * lấy trên future các cặp tiền 
     * @param {string[]} quoteAssets /USDT /BUSD
     * @returns 
     */
    async getFutureAllSymbolsWiths(quoteAssets = StableCoins) {
        try {
            const response = await axios.get('https://fapi.binance.com/fapi/v1/exchangeInfo');
            const pairs = response.data.symbols.map(symbol => symbol.symbol);
            let symbols = filterDuplicateBaseAssets(pairs, quoteAssets)
            return symbols.filter(v => !v.match(/1000/))
        } catch (err) {
            throw err;
        }
    }


    async getAll() {
        return axios.get(`https://api.binance.com/api/v3/ticker/24hr`, { responseType: 'json', })
            .then(response => response.data)
        // .catch(console.error)
    }

    /**
     * Lấy top những cặp tiền có giá trị vốn hóa lớn hơn...
     * @param {int} min 
     * @param {int} limit 
     */

    async getTopLargestCap(min = 100_000_000, limit = 100, quoteAssets = StableCoins,) {
        let all = await this.getAll();
        log(all.length, quoteAssets)
        let found = all
            .filter(v =>
                // có cặp tiền với quote, ví dụ USDT, BUSD
                quoteAssets.some(quote =>
                    v.symbol.endsWith(quote)
                )
                && quoteAssets.every(quote =>
                    !v.symbol.startsWith(quote)
                )
                // cap tối thiểu lớn hơn min
                // && parseFloat(v.quoteVolume) >= min
                && parseFloat(v.quoteVolume) * parseFloat(v.weightedAvgPrice) >= min
            )
            .sort((a, b) => b.quoteVolume - a.quoteVolume)
        let filterDuplicate = filterDuplicateBaseAssets(found.map(v => v.symbol), quoteAssets)
        return found.filter(v => filterDuplicate.includes(v.symbol))
            .slice(0, limit)

    }
    // còn bao lâu nữa đóng nến

    timer(Timeframes = ["4h"], index = 0) {
        new Promise(async (rs, rj) => {
            try {
                let Timeframe = Timeframes[index]
                let now = Date.now()
                let TimeframeMS = TIMEFRAMES.toMiliSecond(Timeframe)

                // lấy cây nến cuối
                let Klines = await this.getKlines('BTCUSDT', now - TimeframeMS, now, Timeframe, 1);

                if (Klines.length > 0) {
                    let openTime = Klines[Klines.length - 1][CandlestickMap.OpenTime]
                    let closeTime = openTime + TimeframeMS;

                    setInterval((event = this.event) => {
                        const elapsedTime = Date.now() - closeTime;
                        if (elapsedTime >= 0) {
                            openTime = closeTime
                            closeTime += TimeframeMS
                        }
                        const percentageRemaining = (elapsedTime / TimeframeMS) * 100;
                        // console.log("timer ", Timeframe, percentageRemaining);
                        event.emit("percentageRemaining", { Timeframe, openTime, closeTime, percentageRemaining, elapsedTime });
                    }, 1000);

                }
            } catch (err) { console.error(Timeframes); }
            if (index < Timeframes.length - 1)
                this.timer(Timeframes, index + 1)
        })

        return this.event;
    }
}

export default Binance;