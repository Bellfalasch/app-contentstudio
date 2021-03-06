/**
 * Created  on 1.12.2017.
 */
module.exports = Object.freeze({
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    itemMarkedAsReadyMessage(name){
       return  `Item \"${name}\" is marked as ready`
    },
    itemSavedNotificationMessage: function (name) {
        return `Item \"${name}\" is saved.`
    },
    itemPublishedNotificationMessage: function (name) {
        return `Item \"${name}\" is published.`
    },
    issueClosedNotificationMessage: function (name) {
        return `Issue \"${name}\" is closed.`
    },
    sortOrderTitle: function (by, order) {
        return `Sorted by \"${by}\" in ${order} order`
    },
    permissionsAppliedNotificationMessage: function (name) {
        return `Permissions for \"${name}\" are applied.`
    },
    markedAsReadyMessage: function (name) {
        return `Item \"${name}\" is marked as ready`;
    },
    publishRequestClosedMessage: function (name) {
        return `Publish request \"${name}\" is closed`;
    },
    taskClosedMessage: function (name) {
        return `Task \"${name}\" is closed`;
    },
    saveFailedAttempt: function (name) {
        return `Content \[${name}\] could not be updated. A content with that name already exists`;
    },
    THIS_PUBLISH_REQUEST_OPEN:'The publish request is Open.',
    REQUEST_CREATED_MESSAGE:'New publish request created successfully.',
    TASK_CLOSED_MESSAGE: 'The task is Closed.',
    PUBLISH_REQUEST_CLOSED_MESSAGE:'The publish request is Closed.',
    TASK_OPENED_MESSAGE: 'The task is Open.',
    TWO_ITEMS_PUBLISHED: `2 items are published.`,
    TEST_FOLDER_WITH_IMAGES: `All Content types images`,
    TEST_FOLDER_2_DISPLAY_NAME: `folder for selenium tests`,
    TEST_FOLDER_2_NAME: `selenium-tests-folder`,
    TEST_FOLDER_NAME: 'all-content-types-images',
    APP_CONTENT_TYPES: 'All Content Types App',
    SIMPLE_SITE_APP: 'Simple Site App',
    APP_WITH_CONFIGURATOR: 'Second Selenium App',
    APP_WITH_METADATA_MIXIN: 'Third Selenium App',
    THIS_FIELD_IS_REQUIRED: 'This field is required',
    YOUR_COMMENT_ADDED: 'Your comment is added to the task.',
    //waitForTimeout
    TIMEOUT_10: 10000,
    TIMEOUT_3: 3000,
    TIMEOUT_4: 4000,
    TIMEOUT_5: 5000,
    TIMEOUT_7: 7000,
    TIMEOUT_10: 10000,
    TIMEOUT_2: 2000,
    TIMEOUT_1: 1000,
    SUITE_TIMEOUT: 180000,
    DELETE_INBOUND_MESSAGE: 'The content you are about to delete has inbound references. Please verify them before deletion.',

    IMAGE_STYLE_ORIGINAL: "Original (no image processing)",
    WIDGET_TITLE: {
        VERSION_HISTORY: 'Version history',
        DEPENDENCIES: 'Dependencies'
    },
    ACCESS_MENU_ITEM: {
        CUSTOM: 'Custom...',
        CAN_PUBLISH: 'Can Publish',
        FULL_ACCESS: 'Full Access'
    },
    TEMPLATE_SUPPORT: {
        SITE: 'Site',
    },
    TEST_IMAGES: {
        HAND: 'hand',
        WHALE: 'whale',
        RENAULT: 'renault',
        SPUMANS: 'spumans',
        BOOK: 'book',
        POP_03: 'Pop_03',
        KOTEY: 'kotey',
        SHIP:'cat',
        FOSS:'foss',
        SENG:'seng',
        PES:'morgopes'
    },
    MENU_ITEMS: {
        INSERT: 'Insert',
        SAVE_AS_FRAGMENT: 'Save as Fragment',
        DETACH_FROM_FRAGMENT: 'Detach from fragment',
        SPUMANS: 'spumans',
        BOOK: 'book',
    },
    contentTypes: {
        SHORTCUT: 'Shortcut',
        FOLDER: `Folder`,
        SITE: 'Site',
        PAGE_TEMPLATE: `Page Template`,
        HTML_AREA_0_1: `htmlarea0_1`,
        HTML_AREA_2_4: `htmlarea2_4`,
        IMG_SELECTOR_0_0: 'contenttypes:imageselector0_0',
        IMG_SELECTOR_1_1: 'imageselector1_1',
        IMG_SELECTOR_2_4: 'imageselector2_4',
        ARTICLE: `article`,
        CUSTOM_RELATIONSHIP: 'custom-relationship2_4',
        DOUBLE_MIN_MAX: 'double_max',
        LONG_MIN_MAX: 'long_max',
        TEXTAREA_MAX_LENGTH: 'textarea_conf',
        TEXTLINE_MAX_LENGTH: 'textline_conf',
    },
    permissions: {
        FULL_ACCESS: `Full Access`,
        CUSTOM: `Custom...`,
        CAN_PUBLISH: `Can Publish`,
        CAN_READ: `Can Read`,
    },
    permissionOperation: {
        READ: 'Read',
        CREATE: `Create`,
        MODIFY: 'Modify',
        DELETE: `Delete`,
        PUBLISH: `Publish`,
        READ_PERMISSIONS: `Read Permissions`,
        WRITE_PERMISSIONS: 'Write Permissions',
    },
    roleName: {
        CONTENT_MANAGER_APP: 'cms.cm.app',
    },
    roleDisplayName: {
        CONTENT_MANAGER_APP: 'Content Manager App',
    },
    systemUsersDisplayName: {
        ANONYMOUS_USER: 'Anonymous User',
        EVERYONE: 'Everyone',
        SUPER_USER: 'Super User',
    },
    sortMenuItem: {
        DISPLAY_NAME: 'Display name',
        MANUALLY_SORTED: 'Manually sorted',
        MODIFIED_DATE: "Modified date",
        CREATED_DATE: "Created date",
        PUBLISHED_DATE: "Published date",
    },
    CONTENT_STATUS: {
        NEW: 'New',
        PUBLISHED: 'Published',
        UNPUBLISHED: 'Unpublished',
        MODIFIED: 'Modified',
        DELETED: 'Deleted',
    },
    PUBLISH_MENU: {
        REQUEST_PUBLISH: "Request Publishing...",
        PUBLISH: "Publish...",
        PUBLISH_TREE: "Publish Tree...",
        MARK_AS_READY: "Mark as ready",
        UNPUBLISH: "Unpublish...",
        CREATE_TASK: "Create Task..."
    },
    WORKFLOW_STATE: {
        WORK_IN_PROGRESS: 'Work in progress',
        READY_FOR_PUBLISHING: 'Ready for publishing',
        PUBLISHED: 'Published'
    },
    ISSUE_LIST_TYPE_FILTER:{
        ALL:'All',
        ASSIGNED_TO_ME: 'Assigned to Me',
        CREATED_BY_ME:'Created by Me',
        PUBLISH_REQUESTS:'Publish requests',
        TASKS:'Tasks'
    }
});