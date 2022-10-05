import FileUploadHtml from '../../html/elements/FileUpload.html';

export default class FileUpload {

    private maxFileSize: number = 8 * 1024 * 1024 * 10; //10MB
    inputId: string;
    label: string;
    accept = "image/*,.pdf";
    capture = 'environment';

    constructor(inputId: string, label: string, accept = "image/png,image/jpeg,.pdf", capture = 'environment') {
        this.inputId = inputId;
        this.label = label;
        this.accept = accept;
        this.capture = capture;
    }

    public render() {
        let template = Handlebars.compile(FileUploadHtml);
        return template(this)
    }

    public bindEvents() {
        let fileInput = document.getElementById(this.inputId) as HTMLInputElement;
        fileInput?.addEventListener('change', (evt) => {
            this.processFile(fileInput);
        });
    }


    protected processFile(element: HTMLInputElement) {
        this.hideFileRelatedInfo(element.id);

        let files = element.files;
        if (!files) return;

        let file = files[0];
        if (!file) {
            this.showFileRelatedInfo(element.id, 'No file selected. Please select file.');
            this.setBase64Input(element.id, '');
            return;
        }

        if (file.size > this.maxFileSize) {
            this.showFileRelatedInfo(element.id, 'File ' + file.name + ' is to large. Files cannot be larger then 10MB. You need to make it smaller before submitting your application');
            this.setBase64Input(element.id, '');
            return;
        }

        let reader = new FileReader();
        reader.addEventListener('load', () => {
            this.setBase64Input(element.id, reader.result as string);
        });

        reader.addEventListener('error', () => {
            this.showFileRelatedInfo(element.id, 'Could not read file ' + file.name + '. Either the file is corrupt or your browser does not allow us to read it');
        });
        reader.readAsDataURL(file);
    }

    protected setBase64Input(elementId: string, value: string) {
        let base64Input = document.getElementById(elementId + '_base64')! as HTMLInputElement;
        base64Input.value = value;
        let previewElement = document.getElementById(elementId + '_preview');
        if (!previewElement) return;

        if (value.indexOf('data:image') != -1) {
            previewElement.innerHTML = '<img src="' + base64Input.value + '" />'
        } else {
            previewElement.innerHTML = ''
        }
    }


    protected showFileRelatedInfo(elementId: string, text: string) {
        let fileRelatedInfo = document.getElementById(elementId + '_error')! as HTMLElement;
        if (!fileRelatedInfo) return;

        fileRelatedInfo.innerHTML = text;
        fileRelatedInfo.classList.remove('hidden')
    }

    protected hideFileRelatedInfo(elementId: string) {
        let fileRelatedInfo = document.getElementById(elementId + '_error') as HTMLElement;
        if (!fileRelatedInfo) return;

        fileRelatedInfo.classList.add('hidden');
    }

    static fileUploads: FileUpload[] = [];

    public static registerHandler() {
        Handlebars.registerHelper('fileUpload', (id, label) => {
            let fileUpload = new FileUpload(id, label);
            FileUpload.fileUploads.push(fileUpload);

            return fileUpload.render();
        })
    }
}