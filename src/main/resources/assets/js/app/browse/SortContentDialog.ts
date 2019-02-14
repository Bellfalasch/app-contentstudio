import {SaveSortedContentAction} from './action/SaveSortedContentAction';
import {SortContentTreeGrid} from './SortContentTreeGrid';
import {SortContentTabMenu} from './SortContentTabMenu';
import {ContentGridDragHandler} from './ContentGridDragHandler';
import {OpenSortDialogEvent} from './OpenSortDialogEvent';
import {OrderChildContentRequest} from '../resource/OrderChildContentRequest';
import {OrderChildMovements} from '../resource/order/OrderChildMovements';
import {OrderContentRequest} from '../resource/OrderContentRequest';
import {Content} from '../content/Content';
import {ContentSummaryAndCompareStatus} from '../content/ContentSummaryAndCompareStatus';
import ChildOrder = api.content.order.ChildOrder;
import TabMenuItemBuilder = api.ui.tab.TabMenuItemBuilder;
import DialogButton = api.ui.dialog.DialogButton;
import i18n = api.util.i18n;

export class SortContentDialog extends api.ui.dialog.ModalDialog {

    private sortAction: SaveSortedContentAction;

    private parentContent: ContentSummaryAndCompareStatus;

    private contentGrid: SortContentTreeGrid;

    private sortContentMenu: SortContentTabMenu;

    private curChildOrder: ChildOrder;

    private prevChildOrder: ChildOrder;

    private gridDragHandler: ContentGridDragHandler;

    private gridLoadedHandler: () => void;

    private saveButton: DialogButton;

    constructor() {
        super(<api.ui.dialog.ModalDialogConfig>{
            title: i18n('dialog.sort'),
            class: 'sort-content-dialog'
        });
    }

    protected initElements() {
        super.initElements();

        this.initTabMenu();
        this.sortContentMenu = new SortContentTabMenu();
        this.contentGrid = new SortContentTreeGrid();
        this.gridDragHandler = new ContentGridDragHandler(this.contentGrid);
        this.sortAction = new SaveSortedContentAction(this);
        this.saveButton = this.addAction(this.sortAction);
    }

    protected postInitElements() {
        super.postInitElements();

        this.setElementToFocusOnShow(this.sortContentMenu.getDropdownHandle());
    }

    protected initListeners() {
        super.initListeners();

        this.sortContentMenu.onSortOrderChanged(() => {
            this.handleOnSortOrderChangedEvent();
            this.saveButton.giveFocus();
        });


        this.gridDragHandler.onPositionChanged(() => {
            this.sortContentMenu.selectManualSortingItem();
        });

        this.sortAction.onExecuted(() => {
            this.handleSortAction();
        });

        this.gridLoadedHandler = () => {
            this.notifyResize();
            this.contentGrid.render(true);
        };

        OpenSortDialogEvent.on((event) => {
            this.handleOpenSortDialogEvent(event);
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.saveButton.addClass('save-button');
            this.sortContentMenu.show();
            this.appendChildToHeader(this.sortContentMenu);

            const header = new api.dom.H6El();
            header.setHtml(i18n('dialog.sort.preface'));
            this.appendChildToContentPanel(header);

            this.contentGrid.getEl().addClass('sort-content-grid');
            this.appendChildToContentPanel(this.contentGrid);
            this.addCancelButtonToBottom();

            return rendered;
        });
    }

    show() {
        this.contentGrid.getGrid().resizeCanvas();
        super.show();
        this.contentGrid.onLoaded(this.gridLoadedHandler);
        this.contentGrid.reload(this.parentContent);
        this.sortContentMenu.focus();
    }

    close() {
        this.remove();
        this.contentGrid.unLoaded(this.gridLoadedHandler);
        super.close();
        this.contentGrid.setChildOrder(null);
        this.gridDragHandler.clearContentMovements();
    }

    getContent(): ContentSummaryAndCompareStatus {
        return this.parentContent;
    }

    private initTabMenu() {
        const menu = new api.ui.tab.TabMenu();
        const tabMenuItem = (<TabMenuItemBuilder>new TabMenuItemBuilder().setLabel(i18n('field.sortType'))).build();
        tabMenuItem.setActive(true);
        menu.addNavigationItem(tabMenuItem);
        menu.selectNavigationItem(0);
        menu.show();
    }

    private handleSortAction() {
        if (this.curChildOrder.equals(this.getParentChildOrder()) && !this.curChildOrder.isManual()) {
            this.close();
        } else {
            this.showLoadingSpinner();

            if (this.curChildOrder.isManual()) {
                this.setManualReorder(this.hasChangedPrevChildOrder() ? this.prevChildOrder : null,
                    this.gridDragHandler.getContentMovements())
                    .catch(reason => api.DefaultErrorHandler.handle(reason))
                    .done(() => this.onAfterSetOrder());
            } else {
                this.setContentChildOrder(this.curChildOrder)
                    .catch(reason => api.DefaultErrorHandler.handle(reason))
                    .done(() => this.onAfterSetOrder());
            }
        }
    }

    private handleOpenSortDialogEvent(event: OpenSortDialogEvent) {
        this.parentContent = event.getContent();
        this.curChildOrder = this.getParentChildOrder();
        this.prevChildOrder = null;
        this.sortContentMenu.selectNavigationItemByOrder(this.curChildOrder);

        if (!this.parentContent.hasChildren()) {
            this.contentGrid.getEl().setAttribute('data-content', event.getContent().getPath().toString());
            this.contentGrid.addClass('no-content');
        } else {
            this.contentGrid.removeClass('no-content');
            this.contentGrid.getEl().removeAttribute('data-content');
        }

        this.open();
    }

    private handleOnSortOrderChangedEvent() {
        const newOrder = this.sortContentMenu.getSelectedNavigationItem().getSelectedChildOrder();

        if (!this.curChildOrder.equals(newOrder)) {

            if (!newOrder.isManual()) {
                this.curChildOrder = newOrder;

                this.contentGrid.setChildOrder(this.curChildOrder);
                this.contentGrid.reload(this.parentContent);

                this.gridDragHandler.clearContentMovements();
            } else {
                this.prevChildOrder = this.curChildOrder;
                this.curChildOrder = newOrder;
                this.contentGrid.setChildOrder(this.curChildOrder);
            }
        }
    }

    private onAfterSetOrder() {
        this.hideLoadingSpinner();
        this.close();
    }

    private hasChangedPrevChildOrder(): boolean {
        return this.prevChildOrder && !this.prevChildOrder.equals(this.getParentChildOrder());
    }

    private showLoadingSpinner() {
        this.saveButton.addClass('spinner');
    }

    private hideLoadingSpinner() {
        this.saveButton.removeClass('spinner');
    }

    private setContentChildOrder(order: ChildOrder, silent: boolean = false): wemQ.Promise<Content> {

        return new OrderContentRequest()
            .setSilent(silent)
            .setContentId(this.parentContent.getContentId())
            .setChildOrder(order)
            .sendAndParse();
    }

    private setManualReorder(order: ChildOrder, movements: OrderChildMovements,
                             silent: boolean = false): wemQ.Promise<Content> {

        return new OrderChildContentRequest()
            .setSilent(silent)
            .setManualOrder(true)
            .setContentId(this.parentContent.getContentId())
            .setChildOrder(order)
            .setContentMovements(movements)
            .sendAndParse();
    }

    private getParentChildOrder(): ChildOrder {
        if (this.parentContent && this.parentContent.getContentSummary()) {
            return this.parentContent.getContentSummary().getChildOrder();
        }

        return null;
    }
}
