import ModalHtml from '../../html/modal/Modal.html';

export default class Modal {
    modalId = 'liminal_market_modal_div';
    onHide? : () => void;

    public hideModal() {
        let modalDiv = document.getElementById(this.modalId)!;
        modalDiv.removeAttribute('open');
        if (this.onHide) {
            this.onHide();
        }
    }

    public showModal(title : string, content: string, reuseModalIfSameTitle : boolean = false, onHide? : () => void) : boolean {
        let modalDiv = document.getElementById(this.modalId);
        if (modalDiv) {
            let modalTitle = modalDiv.dataset.title;
            if (reuseModalIfSameTitle && modalTitle && modalTitle === title) {
                //modalDiv.style.display = 'block';
                modalDiv.setAttribute('open', '');
                return false;
            }
        }

        let template = Handlebars.compile(ModalHtml);

        let obj: any = {
            title: title, content: content
        }
        let html = template(obj);

        if (modalDiv) {
            document.body.removeChild(modalDiv);
        }
        document.body.insertAdjacentHTML( 'beforeend',html);

        modalDiv = document.getElementById(this.modalId)!;
        modalDiv.addEventListener('mousedown', (evt) => {
            if (evt.target  && (evt.target as HTMLElement).id === 'liminal_market_modal_div') {
                this.hideModal();
            }
        });
        modalDiv.setAttribute('open', '');
        this.onHide = onHide;

        return true;
    }

}