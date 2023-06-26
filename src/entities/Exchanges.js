import Binance from "./Binance";

class Exchanges {
    static Binance = "Binance"

    name

    constructor(name = Exchanges.Binance) {
        this.name = name;
        switch (name) {
            case Exchanges.Binance:
                return this.exchange = new Binance();

            default:
                break;
        }
    }

    // connect()

    // disconnect()

    // getAllSymbolsWiths(quoteAssets = StableCoins)

    // getKlines(Symbol, StartTime, EndTime, timeFrame = "1d", Limit = 1000)

    // getSymbolsKlines(Symbols = [], StartTime, EndTime, timeFrame = "1d", index = 0, TimeWait = 10)

}


export default Exchanges