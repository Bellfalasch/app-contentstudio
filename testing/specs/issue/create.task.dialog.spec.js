/**
 * Created on 12.01.2018.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConstant = require('../../libs/app_const');
const studioUtils = require('../../libs/studio.utils.js');
const IssueListDialog = require('../../page_objects/issue/issue.list.dialog');
const CreateTaskDialog = require('../../page_objects/issue/create.task.dialog');

describe('create.task.dialog.spec: Create Task Dialog specification', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN 'Issues List' dialog is opened WHEN 'New Task...' button has been clicked THEN 'Create Task Dialog' should be loaded`,
        async () => {
            let issueListDialog = new IssueListDialog();
            let createTaskDialog = new CreateTaskDialog();
            await studioUtils.openIssuesListDialog();
            //Click on 'New Task...' button
            await issueListDialog.clickOnNewTaskButton();
            //modal dialog should be loaded:
            await createTaskDialog.waitForDialogLoaded();
        });

    it(`WHEN 'Create Task' dialog is opened THEN all required inputs should be present`,
        async () => {
            let createTaskDialog = new CreateTaskDialog();
            await studioUtils.openCreateTaskDialog();
            let dialogTitle = await createTaskDialog.getDialogTitle();
            assert.equal(dialogTitle, "New Task", "Required dialog's title should be displayed");
            //Title input should be present:
            let result = await createTaskDialog.isTitleInputDisplayed();
            assert.isTrue(result, 'Title input should be present');

            result = await createTaskDialog.isCancelButtonTopDisplayed();
            assert.isTrue(result, 'Cancel bottom top should be present');
            result = await createTaskDialog.isCancelButtonBottomDisplayed();
            assert.isTrue(result, 'Cancel bottom button should be present');

            result = await createTaskDialog.isDescriptionTextAreaDisplayed();
            assert.isTrue(result, 'Description text area should be present');
            await createTaskDialog.isAddItemsButtonDisplayed();
            assert.isTrue(result, "'Add Items' button should be present");

            result = await createTaskDialog.isAssigneesOptionFilterDisplayed();
            assert.isTrue(result, 'Assignees option filter input should be present');

            result = await createTaskDialog.isItemsOptionFilterDisplayed();
            assert.isFalse(result, "'Items' option filter input should not be present");
        });

    it(`GIVEN 'Create Task' dialog is opened all inputs are empty WHEN 'Create Task' button has been pressed THEN validation message should appear`,
        async () => {
            let createTaskDialog = new CreateTaskDialog();
            await studioUtils.openCreateTaskDialog();
            await createTaskDialog.clickOnCreateTaskButton();

            studioUtils.saveScreenshot("check_validation_message");
            let result = await createTaskDialog.getValidationMessageForTitleInput();
            assert.equal(result, appConstant.THIS_FIELD_IS_REQUIRED, "Expected validation message should appear");
        });

    it(`GIVEN 'Create Task' has been opened WHEN 'Esc' key has been clicked THEN modal dialog closes`,
        async () => {
            let createTaskDialog = new CreateTaskDialog();
            //1. Open Issues List Dialog:
            await studioUtils.openCreateTaskDialog();
            await createTaskDialog.pause(300);
            //2. Click on Esc:
            await createTaskDialog.pressEscKey();
            await createTaskDialog.waitForDialogClosed();
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(function () {
        return studioUtils.doCloseAllWindowTabsAndSwitchToHome();
    });
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
