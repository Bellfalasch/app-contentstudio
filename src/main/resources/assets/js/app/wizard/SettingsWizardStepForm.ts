import {ContentSettingsModel} from './ContentSettingsModel';
import {Content, ContentBuilder} from '../content/Content';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {FormItemBuilder} from 'lib-admin-ui/ui/form/FormItem';
import {PrincipalComboBox} from 'lib-admin-ui/ui/security/PrincipalComboBox';
import {LocaleComboBox} from 'lib-admin-ui/ui/locale/LocaleComboBox';
import {i18n} from 'lib-admin-ui/util/Messages';
import {WizardStepForm} from 'lib-admin-ui/app/wizard/WizardStepForm';
import {PropertyChangedEvent} from 'lib-admin-ui/PropertyChangedEvent';
import {Fieldset} from 'lib-admin-ui/ui/form/Fieldset';
import {Form} from 'lib-admin-ui/ui/form/Form';
import {Principal} from 'lib-admin-ui/security/Principal';
import {assertNotNull} from 'lib-admin-ui/util/Assert';

export class SettingsWizardStepForm
    extends WizardStepForm {

    private content: Content;
    private model: ContentSettingsModel;
    private modelChangeListener: (event: PropertyChangedEvent) => void;
    private updateUnchangedOnly: boolean = false;
    private ignorePropertyChange: boolean = false;

    private localeCombo: LocaleComboBox;
    private ownerCombo: PrincipalComboBox;

    constructor() {
        super('settings-wizard-step-form');

        this.modelChangeListener = (event: PropertyChangedEvent) => {
            if (!this.ignorePropertyChange) {
                let value = event.getNewValue();
                switch (event.getPropertyName()) {
                case ContentSettingsModel.PROPERTY_LANG:
                    if (!this.updateUnchangedOnly || !this.localeCombo.isDirty()) {
                        this.localeCombo.setValue(value ? value.toString() : '');
                    }
                    break;
                case ContentSettingsModel.PROPERTY_OWNER:
                    if (!this.updateUnchangedOnly || !this.ownerCombo.isDirty()) {
                        this.ownerCombo.setValue(value ? value.toString() : '');
                    }
                    break;
                }
            }
        };
    }

    layout(content: Content) {
        this.content = content;

        this.localeCombo = <LocaleComboBox>LocaleComboBox.create().setMaximumOccurrences(1).setValue(content.getLanguage()).build();
        let localeFormItem = new FormItemBuilder(this.localeCombo).setLabel(i18n('field.lang')).build();

        let loader = new PrincipalLoader().setAllowedTypes([PrincipalType.USER]);

        this.ownerCombo = <PrincipalComboBox>PrincipalComboBox.create().setLoader(loader).setMaximumOccurrences(1).setValue(
            content.getOwner() ? content.getOwner().toString() : undefined).setDisplayMissingSelectedOptions(true).build();

        let ownerFormItem = new FormItemBuilder(this.ownerCombo).setLabel(i18n('field.owner')).build();

        let fieldSet = new Fieldset();
        fieldSet.add(localeFormItem);
        fieldSet.add(ownerFormItem);

        let form = new Form().add(fieldSet);
        this.appendChild(form);

        form.onFocus((event) => {
            this.notifyFocused(event);
        });
        form.onBlur((event) => {
            this.notifyBlurred(event);
        });

        this.setModel(new ContentSettingsModel(content));
    }

    update(content: Content, unchangedOnly: boolean = true) {
        this.updateUnchangedOnly = unchangedOnly;
        this.model.setOwner(content.getOwner()).setLanguage(content.getLanguage());
    }

    reset() {
        this.localeCombo.resetBaseValues();
        this.ownerCombo.resetBaseValues();
    }

    onPropertyChanged(listener: { (event: PropertyChangedEvent): void; }) {
        this.model.onPropertyChanged(listener);
    }

    unPropertyChanged(listener: { (event: PropertyChangedEvent): void; }) {
        this.model.unPropertyChanged(listener);
    }

    private setModel(model: ContentSettingsModel) {
        assertNotNull(model, `Model can't be null`);

        if (this.model) {
            model.unPropertyChanged(this.modelChangeListener);
        }

        // 2-way data binding
        let ownerListener = () => {
            let principals: Principal[] = this.ownerCombo.getSelectedDisplayValues();
            this.ignorePropertyChange = true;
            model.setOwner(principals.length > 0 ? principals[0].getKey() : null);
            this.ignorePropertyChange = false;
        };
        this.ownerCombo.onOptionSelected((event) => ownerListener());
        this.ownerCombo.onOptionDeselected((option) => ownerListener());

        let localeListener = () => {
            this.ignorePropertyChange = true;
            model.setLanguage(this.localeCombo.getValue());
            this.ignorePropertyChange = false;
        };
        this.localeCombo.onOptionSelected((event) => localeListener());
        this.localeCombo.onOptionDeselected((option) => localeListener());

        model.onPropertyChanged(this.modelChangeListener);

        this.model = model;
    }

    apply(builder: ContentBuilder) {
        this.model.apply(builder);
    }

    giveFocus(): boolean {
        return this.ownerCombo.giveFocus();
    }

}
