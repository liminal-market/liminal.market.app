import BaseService from "./BaseService";


export default class DocumentService extends BaseService {


    constructor() {
        super();
    }

    public async getDocuments() {
        return await this.get('documents');
    }

    public async getDocument(documentId: string) {
        const params = {
            documentId: documentId
        };
        return await this.get("download", params);
    }
}