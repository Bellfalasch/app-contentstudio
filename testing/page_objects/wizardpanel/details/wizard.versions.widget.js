/**
 * Created on 30/07/2018.
 */
const BaseVersionsWidget = require('../../details_panel/base.versions.widget');
const appConst = require('../../../libs/app_const');
const lib = require('../../../libs/elements');

const xpath = {
    widget: `//div[contains(@id,'ContentWizardPanel')]//div[contains(@id,'VersionsWidgetItemView')]`,
    versionsList: `//ul[contains(@id,'VersionsView')]`,
    versionItem: `//li[contains(@class,'content-version-item')]`,
    versionItemExpanded: `//li[contains(@class,'content-version-item expanded')]`,
};

class WizardVersionsWidget extends BaseVersionsWidget {

    get versionsWidget() {
        return xpath.widget;
    }

    get compareWithCurrentVersionButton() {
        return xpath.widget + lib.COMPARE_WITH_CURRENT_VERSION;
    }

    get versionItems() {
        return xpath.widget + xpath.versionsList + xpath.versionItem;
    }

    isWidgetVisible() {
        return this.isElementDisplayed(xpath.widget);
    }

    //waits for Version Widget is loaded, Exception will be thrown after the timeout exceeded
    waitForVersionsLoaded() {
        return this.waitForElementDisplayed(this.versionsWidget, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot("err_load_versions_widget");
            throw new Error('Content Wizard: Version Widget was not loaded in ' + appConst.TIMEOUT_2);
        });
    }

    //waits for Version Widget is loaded, returns false after the timeout exceeded
    isWidgetLoaded() {
        return this.waitForElementDisplayed(this.versionsWidget, appConst.TIMEOUT_2).catch(err => {
            return false;
        });
    }

    async clickOnRevertButton() {
        try {
            let selector = xpath.versionItemExpanded + "//button/span[text()='Revert']";
            await this.waitForElementDisplayed(selector);
            await this.clickOnElement(selector);
            return await this.pause(2000);
        } catch (err) {
            throw new Error("Version Widget - error when clicking on 'Restore' button " + err);
        }
    }

    async

    clickOnCompareWithCurrentVersionButton(index) {
        try {
            //wait for the list of versions is loaded:
            await
            this.waitForElementDisplayed(xpath.widget + xpath.versionsList);
            let elements = await
            this.findElements(this.compareWithCurrentVersionButton);
            await
            elements[index].click();
            return await
            this.pause(400);
        } catch (err) {
            throw new Error("Version Widget - error when clicking on CompareWithCurrentVersionButton " + err);
        }
    }
};
module.exports = WizardVersionsWidget;

