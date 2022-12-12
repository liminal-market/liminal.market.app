import NetworkInfo from "../../networks/NetworkInfo";
import Progress from "../../ui/elements/Progress";
import {TradeType} from "../../enums/TradeType";
import {upperFirstLetter} from "../../util/Helper";

export default class Subscription {


    constructor() {
    }

    public getOrderBuyTablePrefix() {
        let networkInfo = NetworkInfo.getInstance();
        return networkInfo.Name;
    };

    public async subscribeToTable(tradeType: TradeType, onUpdateCallback: (object: any) => void) {
        let tableName = this.getOrderBuyTablePrefix() + 'Order' + tradeType;
        console.log('subscribe to table:' + tableName);
        /*
                let query = new this.moralis.Query(tableName);
                let subscription = await query.subscribe();

                subscription.on('update', (response : any) => {
                    const object = response.toJSON();
                    console.log('object updated', JSON.stringify(object), object);
                    let ethLink = ' <a class="white-link" target="_blank" href="https://mumbai.polygonscan.com/tx/' + object.transaction_hash + '">View transaction</a>';

                    onUpdateCallback(object);
                    console.log('status:', object.status);

                    let progress = new Progress();
                    if ((!object.status && object.confirmed) || object.status == 'money_sent') {
                        progress.show('Blockchain has confirmed, money has been sent to broker.' + ethLink, 56)
                        //blockchain has confirmed, money will arrive soon to broker
                    } else if (object.status == 'money_arrived') {
                        progress.show('Money has arrived, will now execute your buy order.' + ethLink, 70)
                        //money has arrived to broker, we will now execute your order
                    } else if (object.status == 'order_requested') {
                        //order has been executed, we are waiting on response from the stock exchange
                        progress.show('Buy order has been executed. We will update you when it has been filled.' + ethLink, 84)
                    } else if (object.status == 'order_filled') {
                        //order has been filled, you got object.filledQty of shares. You will see it soon in your wallet
                        progress.show('Order has been filled, you will receive ' + object.filledQty + ' ' + Symbol + ' soon into your wallet.' + ethLink, 100);
                    } else {
                        progress.show('Waiting for blockchain to confirm transaction.', 99);
                    }
                });
                */

    }

}