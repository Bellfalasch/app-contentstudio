import {ComponentInspectionPanel, ComponentInspectionPanelConfig} from './ComponentInspectionPanel';
import {FragmentSelectorForm} from './FragmentSelectorForm';
import {FragmentComponentView} from '../../../../../../page-editor/fragment/FragmentComponentView';
import {LiveEditModel} from '../../../../../../page-editor/LiveEditModel';
import {ItemViewIconClassResolver} from '../../../../../../page-editor/ItemViewIconClassResolver';
import {LayoutItemType} from '../../../../../../page-editor/layout/LayoutItemType';
import {FragmentDropdown} from './FragmentDropdown';
import {GetContentSummaryByIdRequest} from '../../../../../resource/GetContentSummaryByIdRequest';
import {GetContentByIdRequest} from '../../../../../resource/GetContentByIdRequest';
import {ContentUpdatedEvent} from '../../../../../event/ContentUpdatedEvent';
import {EditContentEvent} from '../../../../../event/EditContentEvent';
import FragmentComponent = api.content.page.region.FragmentComponent;
import ContentSummary = api.content.ContentSummary;
import ContentSummaryAndCompareStatus = api.content.ContentSummaryAndCompareStatus;
import ContentId = api.content.ContentId;
import ComponentPropertyChangedEvent = api.content.page.region.ComponentPropertyChangedEvent;
import Option = api.ui.selector.Option;
import Content = api.content.Content;
import LayoutComponentType = api.content.page.region.LayoutComponentType;
import OptionSelectedEvent = api.ui.selector.OptionSelectedEvent;
import Button = api.ui.button.Button;
import i18n = api.util.i18n;

export class FragmentInspectionPanel
    extends ComponentInspectionPanel<FragmentComponent> {

    private fragmentComponent: FragmentComponent;

    private fragmentView: FragmentComponentView;

    private fragmentSelector: FragmentDropdown;

    private fragmentForm: FragmentSelectorForm;

    private editFragmentButton: Button;

    private handleSelectorEvents: boolean = true;

    private componentPropertyChangedEventHandler: (event: ComponentPropertyChangedEvent) => void;

    private contentUpdatedListener: (event: any) => void;

    constructor() {
        super(<ComponentInspectionPanelConfig>{
            iconClass: ItemViewIconClassResolver.resolveByType('fragment')
        });
    }

    setModel(liveEditModel: LiveEditModel) {
        super.setModel(liveEditModel);
        if (this.fragmentSelector) {
            this.fragmentSelector.setModel(liveEditModel);
        }
        this.layout();

    }

    private layout() {

        this.removeChildren();

        this.fragmentSelector = new FragmentDropdown(this.liveEditModel);
        this.fragmentForm = new FragmentSelectorForm(this.fragmentSelector, i18n('field.fragment'));

        this.fragmentSelector.load();

        this.componentPropertyChangedEventHandler = (event: ComponentPropertyChangedEvent) => {
            // Ensure displayed selector option is removed when fragment is removed
            if (event.getPropertyName() === FragmentComponent.PROPERTY_FRAGMENT) {
                if (!this.fragmentComponent.hasFragment()) {
                    // this.fragmentSelector.setContent(null);
                    this.fragmentSelector.setSelection(null);
                }
            }
        };

        this.handleContentUpdatedEvent();
        this.initSelectorListeners();
        this.appendChild(this.fragmentForm);

        this.appendEditTemplateButton();
    }

    private appendEditTemplateButton() {
        this.editFragmentButton = new Button(i18n('action.editFragment'));
        this.editFragmentButton.addClass('blue large');

        this.editFragmentButton.onClicked(() => {
            const fragmentId: ContentId = this.fragmentComponent.getFragment();
            if (fragmentId) {
                const fragment: ContentSummary = this.fragmentSelector.getSelection(fragmentId);
                const fragmentContent: ContentSummaryAndCompareStatus = ContentSummaryAndCompareStatus.fromContentSummary(fragment);

                new EditContentEvent([fragmentContent]).fire();
            }
        });

        this.fragmentForm.appendChild(this.editFragmentButton);
    }

    private handleContentUpdatedEvent() {
        if (!this.contentUpdatedListener) {
            this.contentUpdatedListener = (event: ContentUpdatedEvent) => {
                // update currently selected option if this is the one updated
                if (this.fragmentComponent && event.getContentId().equals(this.fragmentComponent.getFragment())) {
                    this.fragmentSelector.getSelectedOption().displayValue = event.getContentSummary();
                }
            };
            ContentUpdatedEvent.on(this.contentUpdatedListener);

            this.onRemoved((event) => {
                ContentUpdatedEvent.un(this.contentUpdatedListener);
            });
        }
    }

    setFragmentComponent(fragmentView: FragmentComponentView) {
        this.fragmentView = fragmentView;
        if (this.fragmentComponent) {
            this.unregisterComponentListeners(this.fragmentComponent);
        }

        this.fragmentComponent = fragmentView.getComponent();
        this.setComponent(this.fragmentComponent);

        const contentId: ContentId = this.fragmentComponent.getFragment();
        if (contentId) {
            const fragment: ContentSummary = this.fragmentSelector.getSelection(contentId);
            if (fragment) {
                this.setSelectorValue(fragment);
            } else {
                new GetContentSummaryByIdRequest(contentId).sendAndParse().then((receivedFragment: ContentSummary) => {
                    this.setSelectorValue(receivedFragment);
                }).catch((reason: any) => {
                    if (this.isNotFoundError(reason)) {
                        this.setSelectorValue(null);
                    } else {
                        api.DefaultErrorHandler.handle(reason);
                    }
                }).done();
            }
        } else {
            this.setSelectorValue(null);
        }

        this.registerComponentListeners(this.fragmentComponent);
    }

    private registerComponentListeners(component: FragmentComponent) {
        component.onPropertyChanged(this.componentPropertyChangedEventHandler);
    }

    private unregisterComponentListeners(component: FragmentComponent) {
        component.unPropertyChanged(this.componentPropertyChangedEventHandler);
    }

    private setSelectorValue(fragment: ContentSummary) {
        this.handleSelectorEvents = false;
        if (fragment) {
            let option = this.fragmentSelector.getOptionByValue(fragment.getId().toString());
            if (!option) {
                this.fragmentSelector.addFragmentOption(fragment);
            }
        }
        this.fragmentSelector.setSelection(fragment);
        this.editFragmentButton.setEnabled(!!fragment);
        this.handleSelectorEvents = true;
    }

    private initSelectorListeners() {

        this.fragmentSelector.onOptionSelected((selectedOption: OptionSelectedEvent<ContentSummary>) => {
            if (this.handleSelectorEvents) {
                let option: Option<ContentSummary> = selectedOption.getOption();
                let fragmentContent = option.displayValue;

                if (this.isInsideLayout()) {
                    new GetContentByIdRequest(fragmentContent.getContentId()).sendAndParse().done((content: Content) => {
                        let fragmentComponent = content.getPage() ? content.getPage().getFragment() : null;

                        if (fragmentComponent &&
                            api.ObjectHelper.iFrameSafeInstanceOf(fragmentComponent.getType(), LayoutComponentType)) {
                            api.notify.showWarning(i18n('notify.nestedLayouts'));

                        } else {
                            this.fragmentComponent.setFragment(fragmentContent.getContentId(), fragmentContent.getDisplayName());
                        }
                    });
                } else {
                    this.fragmentComponent.setFragment(fragmentContent.getContentId(), fragmentContent.getDisplayName());
                }
            }
        });
    }

    private isInsideLayout(): boolean {
        let parentRegion = this.fragmentView.getParentItemView();
        if (!parentRegion) {
            return false;
        }
        let parent = parentRegion.getParentItemView();
        if (!parent) {
            return false;
        }
        return api.ObjectHelper.iFrameSafeInstanceOf(parent.getType(), LayoutItemType);
    }

    getComponentView(): FragmentComponentView {
        return this.fragmentView;
    }

}
