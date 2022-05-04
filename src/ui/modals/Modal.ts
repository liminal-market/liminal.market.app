import ModalHtml from '../../html/modal/Modal.html';
import HtmlCache from "./HtmlCache";

export default class Modal {
    modalId = 'liminal_market_modal_div';
    static cache : Map<string, HtmlCache> = new Map<string, HtmlCache>();

    public hideModal() {
        let modalDiv = document.getElementById(this.modalId)!;
        //modalDiv.style.display = 'none';
        modalDiv.removeAttribute('open');
    }

    public showModal(title : string, content: string, cacheKey? : string, callback?: () => void, loadMore?: () => void) : boolean {
        let modalDiv = document.getElementById(this.modalId);
        if (modalDiv) {
            let modalTitle = modalDiv.dataset.title;
            if (modalTitle && modalTitle === title) {
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
            console.log(evt);
            if (evt.target  && (evt.target as HTMLElement).id === 'liminal_market_modal_div') {
                this.hideModal();
            }
        });
        modalDiv.setAttribute('open', '');

        return true;


    }

}