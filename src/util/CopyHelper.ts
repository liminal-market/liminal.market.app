export default class CopyHelper {

    public fallbackCopyTextToClipboard(text : string) {
        let textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            let successful = document.execCommand('copy');
            return successful;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            document.body.removeChild(textArea);
        }


    }

    public async copyTextToClipboard(text : string) {
        if (!navigator.clipboard) {
            return this.fallbackCopyTextToClipboard(text);
        }

        let result = await navigator.clipboard.writeText(text).then(ble => {
            console.log('ble', ble);
            return true
        }).
        catch(function(err) {
            console.info(err);
            return false;
        });
        console.log(result);
        return result;
    }

}