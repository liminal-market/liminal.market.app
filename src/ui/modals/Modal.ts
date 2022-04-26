export default class Modal {

    public showModal(content : string, callback? : () => void, loadMore? : () => void) {
        let divId = 'liminal_market_modal_div';
        let backdropId = 'liminal_market_backdrop';
        let modalDiv = document.getElementById(divId);
        let backdropDiv = document.getElementById(backdropId);

        if (!modalDiv) {
            document.body.append('<div id="' + backdropId + '"></div>');
            document.body.append('<div id="' + divId + '"></div>');

            modalDiv = document.getElementById(divId);
            backdropDiv = document.getElementById(backdropId);

            backdropDiv.addEventListener('click', (evt) => {
                modalDiv.style.display = 'none';
                backdropDiv.style.display = 'none';
            })
        }
        modalDiv.style.display = 'block';
        backdropDiv.style.display = 'block';
        modalDiv.innerHTML = content;

        if (!loadMore) {
            modalDiv.innerHTML += '<span id="liminal_market_load_more"></span>';
            const el = document.querySelector('#liminal_market_load_more')
            const observer = new window.IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    loadMore();
                    return;
                }
            }, {
                root: null,
                threshold: 0.1, // set offset 0.1 means trigger if atleast 10% of element in viewport
            });
            observer.observe(el);
        }


    }

}