import ModalHtml from '../../html/modal/Modal.html';

export default class Modal {
    modalId = 'liminal_market_modal_div';

    public hideModal() {
        let modalDiv = document.getElementById(this.modalId)!;
        //modalDiv.style.display = 'none';
        modalDiv.removeAttribute('open');
    }

    public showModal(title : string, content: string, reuseModalIfSameTitle : boolean = false) : boolean {
        let modalDiv = document.getElementById(this.modalId);
        if (modalDiv) {
            let modalTitle = modalDiv.dataset.title;
            if (!reuseModalIfSameTitle && modalTitle && modalTitle === title) {
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
        modalDiv.addEventListener('click', (evt) => {
            if (evt.target  && (evt.target as HTMLElement).id === 'liminal_market_modal_div') {
                this.hideModal();
            }
        });
        modalDiv.setAttribute('open', '');

        return true;
    }

}