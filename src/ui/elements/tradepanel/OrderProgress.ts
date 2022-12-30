import App from "../../../main";

export default class OrderProgress {
    progressNr: number = 0;
    private static instance: OrderProgress = new OrderProgress();

    private constructor() {
    }

    public static getInstance() {
        return this.instance;
    }

    public clearProgressText() {
        let executingOrderProgress = document.getElementById('executing-order-progress')
        executingOrderProgress?.classList.add('hidden');
        this.progressNr = 0;
    }

    public setProgressText(progressNr: number, text: string, hash: string) {
        console.log('thisNr', this.progressNr, 'nr', progressNr, 'text', text);
        if (progressNr < this.progressNr) return;

        let executingOrderProgress = document.getElementById('executing-order-progress')
        if (!executingOrderProgress) return;

        let progressText = document.getElementById('progress-text');
        if (!progressText) return;

        let networkInfo = App.Network;
        progressText.innerHTML = text + '<br /><a href="' + networkInfo.BlockExplorer + '/tx/' + hash + '" target="_blank" style="font-size:10px">View</a>';
        executingOrderProgress.classList.remove('hidden');
        this.progressNr = progressNr;
    }

}