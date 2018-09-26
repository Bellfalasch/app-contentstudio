// With this dialog we hide original cke dialog and replicate all actions from our dialog to original one
import {HtmlAreaModalDialogConfig, ModalDialog} from './ModalDialog';

export abstract class CKEBackedDialog
    extends ModalDialog {

    protected ckeOriginalDialog: CKEDITOR.dialog;

    constructor(config: HtmlAreaModalDialogConfig) {
        super(config);

        this.ckeOriginalDialog = config.dialog;
        this.hideOriginalCKEDialog();
        this.setDialogInputValues();
        (<CKEDITOR.editor>this.getEditor()).focusManager.add(new CKEDITOR.dom.element(this.getHTMLElement()), true);
    }

    close() {
        super.close();
        this.ckeOriginalDialog.getElement().$.style.display = 'block';
        this.ckeOriginalDialog.hide();
    }

    private hideOriginalCKEDialog() {
        this.ckeOriginalDialog.getElement().$.style.display = 'none';
        (<HTMLElement>this.ckeOriginalDialog.getElement().$.ownerDocument.getElementsByClassName(
            'cke_dialog_background_cover')[0]).style.left = '-10000px';
    }

    protected abstract setDialogInputValues();

    protected getElemFromOriginalDialog(pageId: string, elementId: string): CKEDITOR.ui.dialog.uiElement {
        return this.ckeOriginalDialog.getContentElement(pageId, elementId);
    }
}