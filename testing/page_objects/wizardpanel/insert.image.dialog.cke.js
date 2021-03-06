const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const ComboBox = require('../components/loader.combobox');

const XPATH = {
    container: `//div[contains(@id,'ImageModalDialog')]`,
    insertButton: `//button[contains(@id,'DialogButton') and child::span[text()='Insert']]`,
    updateButton: `//button[contains(@id,'DialogButton') and child::span[text()='Update']]`,
    cancelButton: `//button[contains(@id,'DialogButton') and child::span[text()='Cancel']]`,
    styleSelector: `//div[contains(@id,'ImageStyleSelector')]`,
    styleOptionFilterInput: "//input[contains(@id,'DropdownOptionFilterInput')]",
    customWidthCheckbox: "//div[contains(@class,'custom-width-checkbox')]",
    imageRangeValue: "//div[contains(@class,'custom-width-range-container')]//span[contains(@class,'custom-width-board')]",
    selectedOptionView: "//div[contains(@id,'ImageStyleSelector')]//div[contains(@id,'SelectedOptionView')]"
};

class InsertImageDialog extends Page {

    get styleOptionsFilterInput() {
        return XPATH.container + XPATH.styleSelector + lib.DROPDOWN_OPTION_FILTER_INPUT;
    }

    get imageOptionsFilterInput() {
        return XPATH.container + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }

    get styleSelector() {
        return XPATH.container + XPATH.styleSelector;
    }

    get customWidthCheckbox() {
        return XPATH.container + XPATH.customWidthCheckbox;
    }

    get styleSelectorDropDownHandle() {
        return XPATH.container + XPATH.styleSelector + lib.DROP_DOWN_HANDLE;
    }

    get cancelButton() {
        return XPATH.container + XPATH.cancelButton;
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    get insertButton() {
        return XPATH.container + XPATH.insertButton;
    }

    get updateButton() {
        return XPATH.container + XPATH.updateButton;
    }

    clickOnCustomWidthCheckBox() {
        return this.waitForElementDisplayed(this.customWidthCheckbox, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(this.customWidthCheckbox);
        }).then(() => {
            return this.pause(400);
        }).catch(err => {
            this.saveScreenshot("err_clicking_on_custom_width_checkbox");
            throw new Error('Error when clicking on custom width checkbox! ' + err);
        });
    }

    isCustomWidthCheckBoxSelected() {
        return this.waitForElementDisplayed(this.customWidthCheckbox, appConst.TIMEOUT_2).then(() => {
            return this.isSelected(this.customWidthCheckbox + lib.CHECKBOX_INPUT);
        }).catch(err => {
            this.saveScreenshot("err_clicking_on_custom_width_checkbox");
            throw new Error('Error when clicking on custom width checkbox! ' + err);
        })
    }

    waitForCustomWidthCheckBoxDisabled() {
        return this.waitForElementDisabled(this.customWidthCheckbox + lib.CHECKBOX_INPUT, appConst.TIMEOUT_2);
    }

    waitForCustomWidthCheckBoxEnabled() {
        return this.waitForElementEnabled(this.customWidthCheckbox + lib.CHECKBOX_INPUT, appConst.TIMEOUT_2);
    }

    clickOnStyleSelectorDropDownHandle() {
        return this.clickOnElement(this.styleSelectorDropDownHandle).catch(() => {
            this.saveScreenshot("err_style_selector_drop_down_handle");
            throw new Error('Error when clicking on drop down handle! ' + err);
        })
    }

    async doFilterStyleAndClickOnOption(styleOption) {
        let optionSelector = lib.slickRowByDisplayName(XPATH.container, styleOption);
        try {
            await this.waitForElementDisplayed(this.styleOptionsFilterInput, appConst.TIMEOUT_5);
            await this.typeTextInInput(this.styleOptionsFilterInput, styleOption);
            await this.waitForElementDisplayed(optionSelector, appConst.TIMEOUT_3);
            await this.clickOnElement(optionSelector);
            return this.pause(400);
        } catch (err) {
            this.saveScreenshot('err_select_option');
            throw new Error('Insert Image Dialog, Style selector ' + styleOption + ' ' + err);
        }
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    clickOnInsertButton() {
        return this.clickOnElement(this.insertButton).catch(err => {
            this.saveScreenshot('err_click_on_insert_image_button');
            throw new Error('Insert Image Dialog, error when click on the Insert button  ' + err);
        }).then(() => {
            return this.waitForDialogClosed();
        }).then(() => {
            return this.pause(500);
        });
    }

    clickOnUpdateButton() {
        return this.clickOnElement(this.updateButton).catch(err => {
            this.saveScreenshot('err_click_on_update_image_button');
            throw new Error('Insert Image Dialog, error when click on the Update button  ' + err);
        }).then(() => {
            return this.waitForDialogClosed();
        }).then(() => {
            return this.pause(500);
        });
    }

    waitForDialogVisible() {
        return this.waitForElementDisplayed(this.cancelButton, appConst.TIMEOUT_2).catch(err => {
            this.saveScreenshot('err_open_insert_image_dialog');
            throw new Error('Insert Image Dialog should be opened!' + err);
        });
    }

    waitForDialogClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.TIMEOUT_2);
    }

    async waitForImageRangeValue() {
        try {
            await this.waitForElementDisplayed(XPATH.imageRangeValue, appConst.TIMEOUT_2);
            return await this.getText(XPATH.imageRangeValue);
        } catch (err) {
            throw new Error("Error when getting text in element with image range " + err);
        }

    }

    waitForImageRangeNotVisible() {
        return this.waitForElementNotDisplayed(XPATH.imageRangeValue, appConst.TIMEOUT_2);
    }

    filterAndSelectImage(imageDisplayName) {
        let comboBox = new ComboBox();
        return this.waitForElementDisplayed(this.imageOptionsFilterInput, appConst.TIMEOUT_2).then(() => {
            return comboBox.typeTextAndSelectOption(imageDisplayName, XPATH.container);
        }).then(() => {
            return this.waitForSpinnerNotVisible(appConst.TIMEOUT_2);
        })
    }

    waitForStyleSelectorVisible() {
        return this.waitForElementDisplayed(this.styleSelector, appConst.TIMEOUT_2);
    }

    async getStyleSelectorOptions() {
        await this.clickOnStyleSelectorDropDownHandle();
        await this.pause(1000);
        let selector = lib.SLICK_ROW + "//div[contains(@id,'ImageStyleNameView')]" + "//h6[contains(@class,'main-name')]";
        return await this.getTextInElements(selector);
    }

    getSelectedStyleName() {
        let selectedOption = XPATH.container + XPATH.selectedOptionView + "//h6[contains(@class,'main-name')]";
        return this.getText(selectedOption);
    }
};
module.exports = InsertImageDialog;

