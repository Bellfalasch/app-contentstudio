/**
 * Created on 16.05.2018.
 * verifies : app-contentstudio#72 Keyboard shortcut to publish content(s)
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConstant = require('../../libs/app_const');
const ContentBrowsePanel = require('../../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../../libs/studio.utils.js');
const contentBuilder = require("../../libs/content.builder");
const ContentPublishDialog = require('../../page_objects/content.publish.dialog');

describe('Browse Panel - Keyboard shortcut to publish content`', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let folder;
    it(`Precondition: WHEN folder has been added THEN folder should be present in the grid`,
        () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let displayName = contentBuilder.generateRandomName('folder');
            folder = contentBuilder.buildFolder(displayName);
            return studioUtils.doAddFolder(folder).then(() => {
                return studioUtils.typeNameInFilterPanel(folder.displayName);
            }).then(() => {
                return contentBrowsePanel.waitForContentDisplayed(folder.displayName);
            }).then(isDisplayed => {
                assert.isTrue(isDisplayed, 'folder should be listed in the grid');
            });
        });
    //verifies : app-contentstudio#72 Keyboard shortcut to publish content(s)
    it(`GIVEN content is selected WHEN 'Ctrl+Alt+P' have been pressed THEN Publish Dialog should appear`,
        () => {
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            return studioUtils.findAndSelectItem(folder.displayName).then(() => {
            }).then(() => {
                return contentBrowsePanel.hotKeyPublish();
            }).then(() => {
                return contentPublishDialog.waitForDialogOpened();
            }).then(result => {
                assert.isTrue(result, 'Publish Dialog should be present');
            }).then(() => {
                //Publish button should be disabled, because this content is "Work in progress"
                return contentPublishDialog.waitForPublishNowButtonDisabled();
            })
        });

    it(`GIVEN Marked as ready folder is selected WHEN 'Ctrl+Alt+P' has been pressed THEN Publish now button should be enabled now`,
        async () => {
            let contentPublishDialog = new ContentPublishDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.findAndSelectItem(folder.displayName);
            // folder has been Marked as Ready
            await contentBrowsePanel.clickOnMarkAsReadyButtonAndConfirm();
            await contentBrowsePanel.waitForPublishButtonVisible();
            await contentBrowsePanel.hotKeyPublish();
            await contentPublishDialog.waitForDialogOpened();
            //Publish button should be disabled, because this content is "Marked as Ready"
            return contentPublishDialog.waitForPublishNowButtonEnabled();

        });
    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
