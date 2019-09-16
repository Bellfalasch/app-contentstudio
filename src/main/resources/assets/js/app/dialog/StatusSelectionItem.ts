import BrowseItem = api.app.browse.BrowseItem;
import Tooltip = api.ui.Tooltip;
import i18n = api.util.i18n;
import {ContentSummaryAndCompareStatus} from '../content/ContentSummaryAndCompareStatus';

export class StatusSelectionItem
    extends api.app.browse.SelectionItem<ContentSummaryAndCompareStatus> {

    private removeHandlerFn: () => void;
    private isRemovableFn: () => boolean;
    private clickTooltip: Tooltip;
    private removeClickTooltip: string = i18n('tooltip.list.itemRequired');
    private status: api.dom.DivEl;

    constructor(viewer: api.ui.Viewer<ContentSummaryAndCompareStatus>, item: BrowseItem<ContentSummaryAndCompareStatus>) {
        super(viewer, item);
    }

    public isRemovable(): boolean {
        if (!this.isRemovableFn || !this.removeHandlerFn) {
            return true;
        }

        return this.isRemovableFn();
    }

    setIsRemovableFn(fn: () => boolean) {
        this.isRemovableFn = fn;
    }

    setRemoveHandlerFn(fn: () => void) {
        this.removeHandlerFn = fn;
    }

    setRemoveButtonClickTooltip(text: string) {
        if (this.isRendered()) {
            this.clickTooltip.setText(text);
        } else {
            this.removeClickTooltip = text;
        }
    }

    doRender(): wemQ.Promise<boolean> {
        return super.doRender().then((rendered) => {

            const removeButton = this.getRemoveButton();
            this.clickTooltip = new Tooltip(removeButton, this.removeClickTooltip);
            this.clickTooltip.setTrigger(Tooltip.TRIGGER_NONE);

            let onRemoveClicked = api.util.AppHelper.debounce(() => {
                Tooltip.hideOtherInstances();
                if (this.isRemovable()) {
                    this.removeHandlerFn();
                } else {
                    this.clickTooltip.showFor(1500);
                }
            }, 1000, true);

            this.onRemoveClicked(onRemoveClicked);

            removeButton.onMouseMove(e => { // stop propagating move event to parents, otherwise parent's tooltip shown
                e.stopPropagation();
            });

            this.status = this.initStatusDiv(this.item.getModel());
            this.appendChild(this.status);

            return rendered;
        });
    }

    public setObject(obj: ContentSummaryAndCompareStatus) {
        const viewer = this.getViewer();
        this.status.removeClass(viewer.getObject().getStatusClass());

        viewer.setObject(obj);
        this.status.setHtml(obj.getStatusText());
        this.status.addClass(obj.getStatusClass());
    }

    private initStatusDiv(content: ContentSummaryAndCompareStatus) {

        let statusDiv = new api.dom.DivEl('status');

        statusDiv.setHtml(content.getStatusText());
        statusDiv.addClass(content.getStatusClass());

        return statusDiv;
    }
}
