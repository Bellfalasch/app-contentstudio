import {FormIcon} from 'lib-admin-ui/app/wizard/FormIcon';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LabelEl} from 'lib-admin-ui/dom/LabelEl';
import {InputEl} from 'lib-admin-ui/dom/InputEl';
import {i18n} from 'lib-admin-ui/util/Messages';

export class SettingsDataItemFormIcon
    extends FormIcon {

    private thumbnailSelector: SettingsIconThumbnailSelector;

    constructor(iconUrl: string) {
        super(iconUrl);

        this.thumbnailSelector = new SettingsIconThumbnailSelector();
        this.initListeners();
    }

    getThumbnailFile(): File {
        const fileInputHtmlEl: HTMLElement = this.thumbnailSelector.getInput().getHTMLElement();

        if (fileInputHtmlEl['files'] && fileInputHtmlEl['files'].length > 0) {
            return fileInputHtmlEl['files'][0];
        }

        return null;
    }

    onIconChanged(handler: () => void) {
        this.thumbnailSelector.getInput().onValueChanged(handler);
    }

    private initListeners() {
        this.thumbnailSelector.getLabel().onClicked((event: MouseEvent) => {
            event.stopPropagation();
        });

        this.onClicked(() => {
            this.thumbnailSelector.getInput().getHTMLElement().click();
        });
    }

}

class SettingsIconThumbnailSelector
    extends DivEl {

    private label: LabelEl;

    private fileInput: InputEl;

    constructor() {
        super('flag-uploader');

        this.initElements();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.fileInput.hide();
            this.appendChildren(this.label, this.fileInput);

            return rendered;
        });
    }

    getInput(): InputEl {
        return this.fileInput;
    }

    getLabel(): LabelEl {
        return this.label;
    }

    private initElements() {
        this.fileInput = new InputEl('flag-uploader-input', 'file');
        this.fileInput.getEl().setAttribute('accept', '.jpg, .jpeg, .gif, .png, .svg');
        this.label = new LabelEl(i18n('action.edit'), this.fileInput);
    }
}
