

export default class DocumentService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getDocuments() {
        return await this.moralis.Cloud.run('documents');
    }
}