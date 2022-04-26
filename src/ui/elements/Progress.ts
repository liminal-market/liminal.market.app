export default class Progress {

    public show(message : string, percentage : number, warning? : boolean, hideElements? : string[]) {

        let progress = document.getElementById('progress');
        if (!progress) return;

        if (!hideElements) {
            hideElements.forEach((el: string) => {
                let element = document.getElementById(el);
                if (!element) return;
                element.style.display = 'none';
            });
        }
        progress.style.display = 'block';
        progress.innerHTML = '<div class="progress_text">' + message + '</div>';
        progress.style.width = percentage + '%';

        progress.classList.toggle('progress-bar-striped', (percentage != 100));
        progress.classList.toggle('progress-bar-animated', (percentage != 100));
        if (warning) {
            progress.classList.add('bg-warning');
            progress.classList.add('progress_text_attn');
        } else {
            progress.classList.remove('bg-warning');
            progress.classList.remove('progress_text_attn');
        }
    }

}