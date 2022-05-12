

export default class DocumentService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getDocuments() {
        return await this.moralis.Cloud.run('documents');
    }

    public async getDocument(documentId : string) {
        const params = {
            documentId: documentId
        };
        return await this.moralis.Cloud.run("download", params);
    }
}