export default class LoadingHelper {

    public static lastElement? : HTMLElement = undefined;

    public static setLoading(element : HTMLElement) {
        if (LoadingHelper.lastElement) {
            LoadingHelper.lastElement.removeAttribute('aria-busy');
        }
        element.setAttribute('aria-busy', 'true');
        LoadingHelper.lastElement = element;
    }

    public static removeLoading() {
        if (this.lastElement) {
            this.lastElement.removeAttribute('aria-busy');
        }
    }

}