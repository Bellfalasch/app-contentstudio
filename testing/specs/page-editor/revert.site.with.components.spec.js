/**
 * Created on 05.11.2019.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConstant = require('../../libs/app_const');
const studioUtils = require('../../libs/studio.utils.js');
const ContentWizard = require('../../page_objects/wizardpanel/content.wizard.panel');
const contentBuilder = require("../../libs/content.builder");
const PageComponentView = require("../../page_objects/wizardpanel/liveform/page.components.view");
const LiveFormPanel = require("../../page_objects/wizardpanel/liveform/live.form.panel");
const ImageInspectPanel = require('../../page_objects/wizardpanel/liveform/inspection/image.inspection.panel');
const WizardVersionsWidget = require('../../page_objects/wizardpanel/details/wizard.versions.widget');

describe("revert.site.with.component.spec: Insert image component then revert the previous version and check Live Frame",
    function () {
        this.timeout(appConstant.SUITE_TIMEOUT);
        webDriverHelper.setupBrowser();

        let IMAGE_DISPLAY_NAME = 'seng';
        let SITE;
        let CONTROLLER_NAME = 'main region';

        it(`Preconditions: new site should be created`,
            async () => {
                let displayName = contentBuilder.generateRandomName('site');
                SITE = contentBuilder.buildSite(displayName, 'description', [appConstant.APP_CONTENT_TYPES], CONTROLLER_NAME);
                await studioUtils.doAddSite(SITE);
            });

        it(`Preconditions: GIVEN existing site is opened AND a test image has been inserted`,
            async () => {
                let contentWizard = new ContentWizard();
                let pageComponentView = new PageComponentView();
                let imageInspectPanel = new ImageInspectPanel();
                let liveFormPanel = new LiveFormPanel();
                await studioUtils.selectContentAndOpenWizard(SITE.displayName);
                //1. Open  'Page Component View' dialog:
                await contentWizard.clickOnShowComponentViewToggler();
                //2. Open the context menu:
                await pageComponentView.openMenu("main");
                //3. Click on the 'Insert image' menu item:
                await pageComponentView.selectMenuItem(["Insert", "Image"]);
                //4. Close the 'Page Component View' dialog:
                await contentWizard.clickOnHideComponentViewToggler();
                //5. Select the image in the Page Editor:
                await liveFormPanel.selectImageByDisplayName(IMAGE_DISPLAY_NAME);
                //6. The image should appear in Live Frame:
                await liveFormPanel.waitForImageDisplayed(IMAGE_DISPLAY_NAME);
                await contentWizard.switchToMainFrame();
                //The site should be saved automatically!
                await contentWizard.waitForSaveButtonDisabled();
            });

        //Verifies https://github.com/enonic/xp/issues/7603  (Page changes are not reverted on version revert )
        it(`GIVEN existing site with image component is opened WHEN the version without the image has been reverted THEN the image should not be present in Live Edit frame`,
            async () => {
                let contentWizard = new ContentWizard();
                let versionPanel = new WizardVersionsWidget();
                let imageInspectPanel = new ImageInspectPanel();
                let liveFormPanel = new LiveFormPanel();
                await studioUtils.selectContentAndOpenWizard(SITE.displayName);
                //1. Open  'Versions Panel':
                await contentWizard.openVersionsHistoryPanel();
                //2. Revert the previous version:
                await versionPanel.clickAndExpandVersion(1);
                await versionPanel.clickOnRevertButton();
                studioUtils.saveScreenshot("site_reverted1");

                await contentWizard.switchToLiveEditFrame();
                //3. Image should not be present in Live Frame
                await liveFormPanel.waitForImageNotDisplayed(IMAGE_DISPLAY_NAME);
                await contentWizard.switchToMainFrame();
                //4. Save button should be disabled after the reverting:
                await contentWizard.waitForSaveButtonDisabled();
            });

        beforeEach(() => studioUtils.navigateToContentStudioApp());
        afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
        before(() => {
            return console.log('specification starting: ' + this.title);
        });
    });