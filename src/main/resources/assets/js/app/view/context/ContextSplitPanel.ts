import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {ResponsiveManager} from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import {ResponsiveItem} from 'lib-admin-ui/ui/responsive/ResponsiveItem';
import {Action} from 'lib-admin-ui/ui/Action';
import {SplitPanel, SplitPanelAlignment, SplitPanelBuilder, SplitPanelUnit} from 'lib-admin-ui/ui/panel/SplitPanel';
import {ResponsiveRanges} from 'lib-admin-ui/ui/responsive/ResponsiveRanges';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';
import {Panel} from 'lib-admin-ui/ui/panel/Panel';
import {DockedContextPanel} from './DockedContextPanel';
import {NonMobileContextPanelsManager} from './NonMobileContextPanelsManager';
import {ContextView} from './ContextView';
import {FloatingContextPanel} from './FloatingContextPanel';
import {ActiveContextPanelManager} from './ActiveContextPanelManager';
import {MobileContentItemStatisticsPanel} from '../MobileContentItemStatisticsPanel';
import {MobileContextPanel} from './MobileContextPanel';
import {ContextPanel} from './ContextPanel';
import {IsRenderableRequest} from '../../resource/IsRenderableRequest';
import {ContentSummaryAndCompareStatus} from '../../content/ContentSummaryAndCompareStatus';
import {ContentHelper} from '../../util/ContentHelper';
import {PageEditorData} from '../../wizard/page/LiveFormPanel';

export class ContextSplitPanel
    extends SplitPanel {

    private data: PageEditorData;
    private mobileMode: boolean;
    private mobilePanelSlideListeners: { (out: boolean): void }[];
    private contextView: ContextView;
    private dockedContextPanel: DockedContextPanel;
    private floatingContextPanel: FloatingContextPanel;
    private mobileContentItemStatisticsPanel: MobileContentItemStatisticsPanel;
    private actions: Action[];
    private nonMobileContextPanelsManager: NonMobileContextPanelsManager;
    private dockedModeChangedListeners: { (isDocked: boolean): void }[];
    private leftPanel: Panel;
    private mobileContextPanel: MobileContextPanel;

    constructor(leftPanel: Panel, actions: Action[], data?: PageEditorData) {
        const contextView = new ContextView(data);
        const dockedContextPanel = new DockedContextPanel(contextView);

        const builder = new SplitPanelBuilder(leftPanel, dockedContextPanel)
            .setAlignment(SplitPanelAlignment.VERTICAL)
            .setSecondPanelSize(280, SplitPanelUnit.PIXEL)
            .setSecondPanelMinSize(280, SplitPanelUnit.PIXEL)
            .setAnimationDelay(600)
            .setSecondPanelShouldSlideRight(true);

        super(builder);
        this.addClass('context-split-panel');
        this.setSecondPanelSize(280, SplitPanelUnit.PIXEL);

        this.data = data;
        this.leftPanel = leftPanel;
        this.contextView = contextView;
        this.dockedContextPanel = dockedContextPanel;
        this.actions = actions;
        this.dockedModeChangedListeners = [];
        this.mobilePanelSlideListeners = [];

        this.dockedContextPanel.onAdded(this.renderAfterDockedPanelReady.bind(this));
        this.initPanels();
    }

    private initPanels() {
        const nonMobileContextPanelsManagerBuilder = NonMobileContextPanelsManager.create();
        if (this.isPageEditorPresent()) {
            nonMobileContextPanelsManagerBuilder.setPageEditor(this.data.liveFormPanel);
            nonMobileContextPanelsManagerBuilder.setWizardPanel(<Panel>(<SplitPanel>this.leftPanel).getFirstChild());
            nonMobileContextPanelsManagerBuilder.setIsMobileMode(() => {
                return this.isMobileMode();
            });
        }
        nonMobileContextPanelsManagerBuilder.setSplitPanelWithGridAndContext(this);
        nonMobileContextPanelsManagerBuilder.setDefaultContextPanel(this.dockedContextPanel);
        this.floatingContextPanel = new FloatingContextPanel(this.contextView);
        nonMobileContextPanelsManagerBuilder.setFloatingContextPanel(this.floatingContextPanel);
        if (this.isInsideWizard()) {
            this.mobileContextPanel = new MobileContextPanel(this.contextView);
        } else {
            this.mobileContentItemStatisticsPanel = new MobileContentItemStatisticsPanel(this.actions, this.contextView);
        }

        this.nonMobileContextPanelsManager = nonMobileContextPanelsManagerBuilder.build();
    }

    private isInsideWizard(): boolean {
        return this.data != null;
    }

    private isPageEditorPresent(): boolean {
        return this.isInsideWizard() && this.data.liveFormPanel != null;
    }

    private renderAfterDockedPanelReady() {
        this.floatingContextPanel.insertAfterEl(this);

        if (this.isInsideWizard()) {
            this.addMobileContextPanel();
        } else {
            this.addMobileItemStatisticsPanel();
        }

        if (this.nonMobileContextPanelsManager.requiresCollapsedContextPanel()) {
            this.nonMobileContextPanelsManager.hideDockedContextPanel();
        }

        this.nonMobileContextPanelsManager.ensureButtonHasCorrectState();
        this.contextView.appendChild(this.nonMobileContextPanelsManager.getToggleButton());

        this.onShown(() => {
            if (this.nonMobileContextPanelsManager.getActivePanel().getActiveWidget()) {
                this.nonMobileContextPanelsManager.getActivePanel().getActiveWidget().slideIn();
            }
        });

        this.subscribeContextPanelsOnEvents(this.nonMobileContextPanelsManager);
    }

    private addMobileContextPanel() {
        this.mobileContextPanel.insertAfterEl(this);
        this.mobileContextPanel.slideOut(true);

        this.mobileContextPanel.onSlidedOut(() => this.notifyMobilePanelSlide(true));
        this.mobileContextPanel.onSlidedIn(() => this.notifyMobilePanelSlide(false));
    }

    private addMobileItemStatisticsPanel() {
        this.mobileContentItemStatisticsPanel.insertAfterEl(this);
        this.mobileContentItemStatisticsPanel.slideAllOut(true);

        this.mobileContentItemStatisticsPanel.onSlideOut(() => this.notifyMobilePanelSlide(true));
        this.mobileContentItemStatisticsPanel.onSlideIn(() => this.notifyMobilePanelSlide(false));
    }

    private getMobileContextPanel(): ContextPanel {
        return this.isInsideWizard() ? this.mobileContextPanel : this.mobileContentItemStatisticsPanel.getContextPanel();
    }

    private getMobilePanelItem(): ContentSummaryAndCompareStatus {
        if (this.isInsideWizard()) {
            return this.mobileContextPanel.getItem();
        } else {
            const item = this.mobileContentItemStatisticsPanel.getItem();
            return item && item.getModel() || null;
        }
    }

    private slideMobilePanelOut(silent?: boolean) {
        if (this.isInsideWizard()) {
            this.mobileContextPanel.slideOut(silent);
        } else {
            this.mobileContentItemStatisticsPanel.slideAllOut(silent);
        }
    }

    private subscribeContextPanelsOnEvents(nonMobileContextPanelsManager: NonMobileContextPanelsManager) {

        const debouncedResponsiveHandler = AppHelper.debounce((item: ResponsiveItem) => {
            nonMobileContextPanelsManager.handleResizeEvent();
            // Do not replace with non-strict equality!
            if (this.mobileMode === undefined) {
                this.mobileMode = item.isInRangeOrSmaller(ResponsiveRanges._540_720);
            }

            if (item.isInRangeOrSmaller(ResponsiveRanges._540_720)) {
                nonMobileContextPanelsManager.hideActivePanel(true);
                ActiveContextPanelManager.setActiveContextPanel(this.getMobileContextPanel());
                if (ResponsiveRanges._720_960.isFitOrBigger(item.getOldRangeValue())) {
                    // transition through 720 from bigger side
                    this.mobileMode = true;
                    this.notifyMobileModeChanged(true);
                }
            } else {
                this.slideMobilePanelOut(true);
                nonMobileContextPanelsManager.setActivePanel();
                if (item.isInRangeOrBigger(ResponsiveRanges._720_960)) {
                    // transition through 720 from smaller side
                    this.mobileMode = false;
                    this.notifyMobileModeChanged(false);
                }
            }
        }, 50);
        ResponsiveManager.onAvailableSizeChanged(this, debouncedResponsiveHandler);
        this.onRemoved(() => {
            ResponsiveManager.unAvailableSizeChanged(this);
        });
    }

    onMobileModeChanged(listener: (isMobile: boolean) => void) {
        this.dockedModeChangedListeners.push(listener);
    }

    unMobileModeChanged(listener: (isMobile: boolean) => void) {
        this.dockedModeChangedListeners = this.dockedModeChangedListeners.filter(curr => curr !== listener);
    }

    private notifyMobileModeChanged(isMobile: boolean) {
        this.dockedModeChangedListeners.forEach(curr => curr(isMobile));
    }

    onMobilePanelSlide(listener: (out: boolean) => void) {
        this.mobilePanelSlideListeners.push(listener);
    }

    unMobilePanelSlide(listener: (out: boolean) => void) {
        this.mobilePanelSlideListeners = this.mobilePanelSlideListeners.filter(curr => curr !== listener);
    }

    private notifyMobilePanelSlide(out: boolean) {
        this.mobilePanelSlideListeners.forEach(curr => curr(out));
    }

    setMobilePreviewItem(previewItem: ViewItem<ContentSummaryAndCompareStatus>, force?: boolean) {
        if (!this.isInsideWizard()) {
            this.mobileContentItemStatisticsPanel.getPreviewPanel().setItem(previewItem, force);
        }
    }

    setContent(content: ContentSummaryAndCompareStatus) {
        if (!this.isMobileMode()) {
            this.contextView.setItem(content);
        }
        if (this.isInsideWizard()) {
            this.mobileContextPanel.setItem(content);
        } else {
            const prevItem = this.getMobilePanelItem();
            const changed = !prevItem || prevItem.getId() !== content.getId();

            const item = ContentHelper.createView(content);
            this.mobileContentItemStatisticsPanel.setItem(item);

            if (changed) {
                const previewPanel = this.mobileContentItemStatisticsPanel.getPreviewPanel();
                previewPanel.setBlank();
                previewPanel.showMask();

                setTimeout(() => {
                    new IsRenderableRequest(content.getContentId()).sendAndParse().then((renderable: boolean) => {
                        item.setRenderable(renderable);
                        this.setMobilePreviewItem(item);
                    });
                }, 300);
            }
        }
    }

    updateRenderableStatus(renderable: boolean) {
        this.contextView.updateRenderableStatus(renderable);
    }

    showMobilePanel() {
        if (this.isInsideWizard()) {
            this.mobileContextPanel.slideIn();
        } else {
            this.mobileContentItemStatisticsPanel.slideIn();
        }
    }

    hideMobilePanel() {
        if (this.isInsideWizard()) {
            this.mobileContextPanel.slideOut();
        } else {
            this.mobileContentItemStatisticsPanel.slideAllOut();
        }
    }

    isMobileMode(): boolean {
        return this.mobileMode;
    }

    enableToggleButton() {
        this.nonMobileContextPanelsManager.getToggleButton().setEnabled(true);
    }

    disableToggleButton() {
        this.nonMobileContextPanelsManager.getToggleButton().setEnabled(false);
    }
}
