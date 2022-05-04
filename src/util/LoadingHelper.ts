export default class LoadingHelper {

    public static lastElement? : HTMLElement = undefined;

    public static setLoading(element : HTMLElement) {
        element.setAttribute('aria-busy', 'true');
        if (LoadingHelper.lastElement) {
            LoadingHelper.lastElement.removeAttribute('aria-busy');
        }
        LoadingHelper.lastElement = element;
    }

    public static removeLoading() {
        if (this.lastElement) {
            this.lastElement.removeAttribute('aria-busy');
        }
    }

}