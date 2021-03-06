import * as Q from 'q';
import {Element} from 'lib-admin-ui/dom/Element';
import {i18n} from 'lib-admin-ui/util/Messages';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
import {Body} from 'lib-admin-ui/dom/Body';
import {KeyBindings} from 'lib-admin-ui/ui/KeyBindings';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {MostPopularItemsBlock} from './MostPopularItemsBlock';
import {RecentItemsBlock} from './RecentItemsBlock';
import {NewContentDialogItemSelectedEvent} from './NewContentDialogItemSelectedEvent';
import {NewMediaUploadEvent} from './NewMediaUploadEvent';
import {NewContentEvent} from './NewContentEvent';
import {FilterableItemsList} from './FilterableItemsList';
import {AggregateContentTypesResult} from '../resource/AggregateContentTypesResult';
import {AggregateContentTypesByPathRequest} from '../resource/AggregateContentTypesByPathRequest';
import {FileInput} from './FileInput';
import {GetNearestSiteRequest} from '../resource/GetNearestSiteRequest';
import {Content} from '../content/Content';
import {Site} from '../content/Site';
import {GetAllContentTypesRequest} from '../resource/GetAllContentTypesRequest';
import {NewContentUploader} from './NewContentUploader';
import {ContentPath} from 'lib-admin-ui/content/ContentPath';
import {IsAuthenticatedRequest} from 'lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {LoginResult} from 'lib-admin-ui/security/auth/LoginResult';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {KeyHelper} from 'lib-admin-ui/ui/KeyHelper';
import {ContentTypeSummaries} from 'lib-admin-ui/schema/content/ContentTypeSummaries';
import {ContentTypeSummary} from 'lib-admin-ui/schema/content/ContentTypeSummary';
import {UploadStartedEvent} from 'lib-admin-ui/ui/uploader/UploadStartedEvent';
import {DefaultModalDialogHeader, ModalDialog, ModalDialogConfig} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {DropzoneContainer} from 'lib-admin-ui/ui/uploader/UploaderEl';
import {SectionEl} from 'lib-admin-ui/dom/SectionEl';
import {AsideEl} from 'lib-admin-ui/dom/AsideEl';
import {ElementHiddenEvent} from 'lib-admin-ui/dom/ElementHiddenEvent';
import {FormEl} from 'lib-admin-ui/dom/FormEl';
import {KeyBinding} from 'lib-admin-ui/ui/KeyBinding';
import {PEl} from 'lib-admin-ui/dom/PEl';

export class NewContentDialog
    extends ModalDialog {

    private parentContent: Content;

    private fileInput: FileInput;

    private dropzoneContainer: DropzoneContainer;

    private newContentUploader: NewContentUploader;

    private allContentTypes: FilterableItemsList;

    private mostPopularContentTypes: MostPopularItemsBlock;

    private recentContentTypes: RecentItemsBlock;

    private keyDownHandler: (event: KeyboardEvent) => void;

    protected header: NewContentDialogHeader;

    constructor() {
        super(<ModalDialogConfig>{
            title: i18n('dialog.new'),
            class: 'new-content-dialog'
        });
    }

    protected createHeader(): NewContentDialogHeader {
        return new NewContentDialogHeader(i18n('dialog.new'), '');
    }

    protected getHeader(): NewContentDialogHeader {
        return this.header;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.fileInput.hide();
            const mainSection = new SectionEl().setClass('column');
            this.appendChildToContentPanel(mainSection);

            this.mostPopularContentTypes.hide();

            const contentTypesListDiv = new DivEl('content-types-content');
            contentTypesListDiv.appendChild(this.allContentTypes);

            mainSection.appendChildren(<Element>this.fileInput, <Element>contentTypesListDiv);

            const sideBlock: AsideEl = new AsideEl();
            sideBlock.appendChild(this.mostPopularContentTypes);
            sideBlock.appendChild(this.recentContentTypes);
            this.appendChildToContentPanel(sideBlock);

            this.appendChild(this.dropzoneContainer);

            this.header.insertChild(this.newContentUploader, 1);

            return rendered;
        });
    }

    protected initElements() {
        super.initElements();
        this.initContentTypesLists();
        this.initFileUploader();
        this.fileInput = new FileInput('large').setPlaceholder(i18n('dialog.new.searchTypes'));
    }

    protected postInitElements() {
        super.postInitElements();

        this.getButtonRow().getEl().setAttribute('data-drop', i18n('dialog.new.searchTypesOrDrop'));
    }

    protected initListeners() {
        super.initListeners();

        this.allContentTypes.onSelected(this.closeAndFireEventFromContentType.bind(this));
        this.mostPopularContentTypes.getItemsList().onSelected(this.closeAndFireEventFromContentType.bind(this));
        this.recentContentTypes.getItemsList().onSelected(this.closeAndFireEventFromContentType.bind(this));
        this.initDragAndDropUploaderEvents();
        this.initKeyDownHandler();
        this.initFileInputEvents();
    }

    private initContentTypesLists() {
        this.allContentTypes = new FilterableItemsList();
        this.mostPopularContentTypes = new MostPopularItemsBlock();
        this.recentContentTypes = new RecentItemsBlock();
    }

    private initFileUploader() {
        this.dropzoneContainer = new DropzoneContainer(true);
        this.dropzoneContainer.hide();

        this.newContentUploader = new NewContentUploader()
            .setUploaderParams({parent: ContentPath.ROOT.toString()})
            .setDropzoneId(this.dropzoneContainer.getDropzone().getId());
    }

    private initFileInputEvents() {
        this.newContentUploader.onUploadStarted(this.closeAndFireEventFromMediaUpload.bind(this));
        this.newContentUploader.onUploadStarted((event: UploadStartedEvent<Content>) => {
            const names = event.getUploadItems().map((uploadItem: UploadItem<Content>) => {
                return uploadItem.getName();
            });
            this.fileInput.setText(names.join(', '));
        });

        this.fileInput.onValueChanged(() => {
            if (StringHelper.isEmpty(this.fileInput.getValue())) {
                this.mostPopularContentTypes.showIfNotEmpty();
            } else {
                this.mostPopularContentTypes.hide();
            }

            this.allContentTypes.filter(this.fileInput.getValue());
        });
    }

    private initKeyDownHandler() {
        this.keyDownHandler = (event: KeyboardEvent) => {
            const isLetterOrNumber: boolean = !event.altKey && !event.ctrlKey && KeyHelper.isAlphaNumeric(event);

            if (isLetterOrNumber) {
                this.fileInput.show();
                this.fileInput.focus();
                this.addClass('filter-visible');
                Body.get().unKeyDown(this.keyDownHandler);
            }
        };
    }

    // in order to toggle appropriate handlers during drag event
    // we catch drag enter on this element and trigger uploader to appear,
    // then catch drag leave on uploader's dropzone to get back to previous state
    private initDragAndDropUploaderEvents() {
        let dragOverEl;
        this.onDragEnter((event: DragEvent) => {
            if (this.newContentUploader.isEnabled()) {
                let target = <HTMLElement> event.target;

                if (!!dragOverEl || dragOverEl === this.getHTMLElement()) {
                    this.dropzoneContainer.show();
                }
                dragOverEl = target;
            }
        });

        this.newContentUploader.onDropzoneDragLeave(() => this.dropzoneContainer.hide());
        this.newContentUploader.onDropzoneDrop(() => this.dropzoneContainer.hide());
    }

    private closeAndFireEventFromMediaUpload(event: UploadStartedEvent<Content>) {
        const handler = (e: ElementHiddenEvent) => {
            new NewMediaUploadEvent(event.getUploadItems(), this.parentContent).fire();
            this.unHidden(handler);
        };
        this.onHidden(handler);

        this.close();
    }

    private closeAndFireEventFromContentType(event: NewContentDialogItemSelectedEvent) {
        const handler = (e: ElementHiddenEvent) => {
            new NewContentEvent(event.getItem().getContentType(), this.parentContent).fire();
            this.unHidden(handler);
        };
        this.onHidden(handler);

        this.close();
    }

    setParentContent(parent: Content) {
        this.parentContent = parent;
        this.allContentTypes.setParentContent(parent);

        const params: { [key: string]: any } = {
            parent: parent ? parent.getPath().toString() : ContentPath.ROOT.toString()
        };

        this.newContentUploader.setUploaderParams(params);
    }

    open() {
        super.open();
        const keyBindings = [
            new KeyBinding('up', () => {
                FormEl.moveFocusToPrevFocusable(Element.fromHtmlElement(<HTMLElement>document.activeElement),
                    'input,li');
            }).setGlobal(true),
            new KeyBinding('down', () => {
                FormEl.moveFocusToNextFocusable(Element.fromHtmlElement(<HTMLElement>document.activeElement),
                    'input,li');
            }).setGlobal(true)];

        KeyBindings.get().bindKeys(keyBindings);
    }

    show() {
        this.updateDialogTitlePath();
        this.resetFileInputWithUploader();

        super.show();

        if (!this.fileInput.isVisible()) {
            Body.get().onKeyDown(this.keyDownHandler);
        }

        // CMS-3711: reload content types each time when dialog is show.
        // It is slow but newly create content types are displayed.
        this.loadContentTypes();
    }

    hide() {
        this.mostPopularContentTypes.hide();
        this.fileInput.hide();
        this.removeClass('filter-visible');
        this.clearAllItems();
        Body.get().unKeyDown(this.keyDownHandler);

        super.hide();
    }

    close() {
        this.fileInput.reset();
        this.newContentUploader.reset();

        if (this.isOpen()) {
            super.close();
        }
    }

    private loadContentTypes() {
        this.showLoadMask();

        Q.all(this.sendRequestsToFetchContentData())
            .spread((contentTypes: ContentTypeSummaries, aggregations: AggregateContentTypesResult,
                     parentSite: Site) => {

                this.allContentTypes.createItems(contentTypes, parentSite);

                const popularItemsCount = this.mostPopularContentTypes.getItemsList().createItems(contentTypes, aggregations);
                this.mostPopularContentTypes.setVisible(popularItemsCount > 0);

                const recentItemsCount = this.recentContentTypes.getItemsList().createItems(this.allContentTypes.getItems());
                this.recentContentTypes.setVisible(recentItemsCount > 0);


            }).catch((reason: any) => {

            DefaultErrorHandler.handle(reason);

        }).finally(() => {
            this.fileInput.enable();
            this.toggleUploadersEnabled();
            this.hideLoadMask();
            this.mostPopularContentTypes.showIfNotEmpty();
            this.newContentUploader.focus();
        }).done();
    }

    private sendRequestsToFetchContentData(): Q.Promise<any>[] {
        const requests: Q.Promise<any>[] = [];
        requests.push(new GetAllContentTypesRequest().sendAndParse().then((contentTypes: ContentTypeSummary[]) => {
            return new IsAuthenticatedRequest().sendAndParse().then((loginResult: LoginResult) => {
                return this.filterContentTypes(ContentTypeSummaries.from(contentTypes), loginResult);
            });
        }));

        if (this.parentContent) {
            requests.push(new AggregateContentTypesByPathRequest(this.parentContent.getPath()).sendAndParse());
            requests.push(new GetNearestSiteRequest(this.parentContent.getContentId()).sendAndParse());
        } else {
            requests.push(new AggregateContentTypesByPathRequest(ContentPath.ROOT).sendAndParse());
        }

        return requests;
    }

    private filterContentTypes(contentTypes: ContentTypeSummaries, loginResult: LoginResult): ContentTypeSummaries {
        const isContentAdmin: boolean = loginResult.isContentAdmin();
        return contentTypes.filter(contentType => !contentType.isUnstructured() && (isContentAdmin || !contentType.isSite()));
    }

    private updateDialogTitlePath() {
        if (this.parentContent) {
            this.getHeader().setPath(this.parentContent.getPath().toString());
        } else {
            this.getHeader().setPath('');
        }
    }

    private clearAllItems() {
        this.mostPopularContentTypes.getItemsList().clearItems();
        this.allContentTypes.clearItems();
        this.recentContentTypes.getItemsList().clearItems();
    }

    private toggleUploadersEnabled() {
        const uploaderEnabled: boolean = !this.isTemplateFolderSelected();
        this.toggleClass('no-uploader-el', !uploaderEnabled);
        this.newContentUploader.setEnabled(uploaderEnabled);
    }

    private resetFileInputWithUploader() {
        this.addClass('no-uploader-el');
        this.fileInput.disable();
        this.fileInput.reset();
        this.newContentUploader.setEnabled(false);
        this.newContentUploader.reset();

        const hideUploader: boolean = this.isTemplateFolderSelected();
        this.newContentUploader.setVisible(!hideUploader);
    }

    private isTemplateFolderSelected(): boolean {
        return !!this.parentContent && this.parentContent.getType().isTemplateFolder();
    }
}

export class NewContentDialogHeader
    extends DefaultModalDialogHeader {

    private pathEl: PEl;

    constructor(title: string, path: string) {
        super(title);

        this.pathEl = new PEl('path');
        this.pathEl.getEl().setAttribute('data-desc', `${i18n('dialog.newContent.pathDescription')}:`);
        this.pathEl.setHtml(path);
        this.appendChild(this.pathEl);
    }

    setPath(path: string) {
        this.pathEl.setHtml(path).setVisible(!StringHelper.isBlank(path));
    }
}
