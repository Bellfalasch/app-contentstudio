/**
 * Created on 22.07.2019.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConst = require('../../libs/app_const');
const ContentBrowsePanel = require('../../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../../libs/studio.utils.js');
const contentBuilder = require("../../libs/content.builder");
const ContentPublishDialog = require('../../page_objects/content.publish.dialog');
const ContentWizard = require('../../page_objects/wizardpanel/content.wizard.panel');

describe('content.publish.dialog.spec - opens publish modal dialog and checks control elements`', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    let FOLDER1_NAME;
    let PARENT_FOLDER;
    let CHILD_FOLDER;

    let SITE;
    it(`GIVEN folder is opened AND 'Marked as ready' done WHEN publish dialog has been opened AND 'Publish' button pressed THEN 'New' status should be displayed on the dialog`,
        async () => {
            let contentWizard = new ContentWizard();
            let contentPublishDialog = new ContentPublishDialog();
            FOLDER1_NAME = contentBuilder.generateRandomName('folder');
            await studioUtils.openContentWizard(appConst.contentTypes.FOLDER);
            await contentWizard.typeDisplayName(FOLDER1_NAME);
            //the folder should be marked as ready.
            await contentWizard.clickOnMarkAsReadyButton();
            await contentWizard.clickOnPublishButton();
            studioUtils.saveScreenshot("wizard_publish_dialog_single_folder");
            let status = await contentPublishDialog.getContentStatus(FOLDER1_NAME);

            assert.equal(status, "New", "'New' status should be displayed in the dialog");
            let isPresent = await contentPublishDialog.isAddScheduleButtonDisplayed();
            assert.isTrue(isPresent, "Add schedule button should be displayed");

            let isRemovable = await contentPublishDialog.isPublishItemRemovable(FOLDER1_NAME);
            assert.isFalse(isRemovable, "One publish item should be displayed and it should not be removable");
        });

    it(`GIVEN existing folder is selected in grid WHEN 'Publish' button has been pressed THEN 'New' status should be displayed on the dialog`,
        async () => {
            let contentWizard = new ContentWizard();
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();

            await studioUtils.findAndSelectItem(FOLDER1_NAME);
            //Click on 'Publish...' button
            await contentBrowsePanel.clickOnPublishButton();
            studioUtils.saveScreenshot("grid_publish_dialog_single_folder");
            let status = await contentPublishDialog.getContentStatus(FOLDER1_NAME);
            assert.equal(status, "New", "'New' status should be displayed in the dialog");
            let isPresent = await contentPublishDialog.isAddScheduleButtonDisplayed();
            assert.isTrue(isPresent, "Add schedule button should be displayed");
            let isRemovable = await contentPublishDialog.isPublishItemRemovable(FOLDER1_NAME);
            assert.isFalse(isRemovable, "One publish item should be displayed and it should not be removable");

            //the folder has no children!
            let isDisplayed = await contentPublishDialog.isIncludeChildTogglerDisplayed();
            assert.isFalse(isDisplayed, "Include child icon should not be visible");
        });

    it(`GIVEN existing folder with children is selected in grid WHEN 'Publish' button has been pressed THEN expected control elements should be displayed on the dialog`,
        async () => {
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();

            await studioUtils.findAndSelectItem(appConst.TEST_FOLDER_NAME);
            //Click on 'Publish...' button
            await contentBrowsePanel.clickOnPublishButton();
            studioUtils.saveScreenshot("grid_publish_dialog_parent_folder");

            let status = await contentPublishDialog.getContentStatus(appConst.TEST_FOLDER_WITH_IMAGES);
            assert.equal(status, "New", "'New' status should be displayed in the dialog");

            let isPresent = await contentPublishDialog.isAddScheduleButtonDisplayed();
            assert.isTrue(isPresent, "Add schedule button should be displayed");

            let isRemovable = await contentPublishDialog.isPublishItemRemovable(appConst.TEST_FOLDER_WITH_IMAGES);
            assert.isFalse(isRemovable, "Parent item should be displayed and it should not be removable");

            //the folder has no children!
            let isDisplayed = await contentPublishDialog.isIncludeChildTogglerDisplayed();
            assert.isTrue(isDisplayed, "Include child icon should be visible");

            //'Publish Now' button should be enabled!
            let result = await contentPublishDialog.waitForPublishNowButtonEnabled();

            //Log message link should be displayed
            let isLinkDisplayed = await contentPublishDialog.isLogMessageLinkDisplayed();
            assert.isTrue(isLinkDisplayed, "Log message link should be displayed");
        });

    it(`GIVEN folder with children is selected AND Publish wizard is opened WHEN 'Include children' button has been pressed THEN 'Show dependent items' gets visible`,
        async () => {
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();

            await studioUtils.findAndSelectItem(appConst.TEST_FOLDER_NAME);
            //Click on 'Publish...' button
            await contentBrowsePanel.clickOnPublishButton();

            //'Include children' has been clicked
            await contentPublishDialog.clickOnIncludeChildrenToogler();

            //'Show Dependent items' gets visible!
            await contentPublishDialog.waitForShowDependentButtonDisplayed();

            let items = await contentPublishDialog.getNumberItemsToPublish();
            assert.equal(items, 13, "13 items to publish should be in the dialog");

        });

    it(`GIVEN folder is selected AND Publish dialog is opened WHEN 'Include children' and Show dependent items button have been pressed THEN 'Hide dependent items' gets visible`,
        async () => {
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();

            await studioUtils.findAndSelectItem(appConst.TEST_FOLDER_NAME);
            //Click on 'Publish...' button
            await contentBrowsePanel.clickOnPublishButton();

            //'Include children' has been clicked
            await contentPublishDialog.clickOnIncludeChildrenToogler();

            //'Show Dependent items' has been clicked
            await contentPublishDialog.clickOnShowDependentItems();
            //Hide dependant items gets visible.
            await contentPublishDialog.waitForHideDependentItemsDisplayed();

            //child item should be removable.
            let isRemovable = await contentPublishDialog.isPublishItemRemovable(appConst.TEST_IMAGES.BOOK);
            assert.isTrue(isRemovable, "Child item should be removable");

        });

    it(`GIVEN 'Content Publish' dialog is opened WHEN cancel button on the bottom has been clicked THEN dialog is closing`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentPublishDialog = new ContentPublishDialog();
            // folder with children is selected and 'Publish' button pressed"
            await studioUtils.findAndSelectItem(appConst.TEST_FOLDER_NAME);
            await contentBrowsePanel.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();

            // "button 'Cancel' on the bottom of dialog has been pressed"
            await contentPublishDialog.clickOnCancelTopButton();
            // "dialog is closing. Otherwise, exception will be thrown after the timeout."
            await contentPublishDialog.waitForDialogClosed();
        });

    it(`GIVEN parent folder with child is selected and 'Publish' button clicked WHEN child has been removed in the dialog THEN dependents item gets not visible`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentPublishDialog = new ContentPublishDialog();
            let displayName1 = contentBuilder.generateRandomName('folder');
            let displayName2 = contentBuilder.generateRandomName('folder');
            PARENT_FOLDER = contentBuilder.buildFolder(displayName1);
            CHILD_FOLDER = contentBuilder.buildFolder(displayName2);
            await studioUtils.doAddReadyFolder(PARENT_FOLDER);
            await studioUtils.findAndSelectItem(PARENT_FOLDER.displayName);
            await studioUtils.doAddReadyFolder(CHILD_FOLDER);

            //opens Publish Content dialog
            await contentBrowsePanel.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();

            await contentPublishDialog.clickOnIncludeChildrenToogler();
            await contentPublishDialog.clickOnShowDependentItems();
            //Dependent item has been removed on the modal dialog
            await contentPublishDialog.removeDependentItem(CHILD_FOLDER.displayName);
            let result = await contentPublishDialog.getItemsToPublish();
            assert.isTrue(result.length === 1, "Only one item should be present in the dialog");
            assert.equal(result[0], PARENT_FOLDER.displayName, "Parent folder should be in items to publish");

        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });

    function addNotValidFolder() {
        return studioUtils.findAndSelectItem(SITE.displayName).then(() => {
            return studioUtils.openContentWizard(appConstant.contentTypes.FOLDER);
        }).then(() => {
            return studioUtils.doCloseWizardAndSwitchToGrid();
        });
    }
});