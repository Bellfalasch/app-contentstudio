import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ContentId} from 'lib-admin-ui/content/ContentId';
import {ContentPath} from 'lib-admin-ui/content/ContentPath';
import {ContentSummary} from 'lib-admin-ui/content/ContentSummary';
import {UploadItem} from 'lib-admin-ui/ui/uploader/UploadItem';
import {ContentTypeName} from 'lib-admin-ui/schema/content/ContentTypeName';
import {ContentIconUrlResolver} from 'lib-admin-ui/content/util/ContentIconUrlResolver';

export class MediaSelectorDisplayValue {

    private uploadItem: UploadItem<ContentSummary>;

    private content: ContentSummary;

    private empty: boolean;

    static fromUploadItem(item: UploadItem<ContentSummary>): MediaSelectorDisplayValue {
        return new MediaSelectorDisplayValue().setUploadItem(item);
    }

    static fromContentSummary(content: ContentSummary) {
        return new MediaSelectorDisplayValue().setContentSummary(content);
    }

    static makeEmpty() {
        return new MediaSelectorDisplayValue().setEmpty(true);
    }

    isEmptyContent(): boolean {
        return this.empty;
    }

    setEmpty(value: boolean): MediaSelectorDisplayValue {
        this.empty = value;
        return this;
    }

    setUploadItem(item: UploadItem<ContentSummary>): MediaSelectorDisplayValue {
        this.uploadItem = item;
        return this;
    }

    setContentSummary(contentSummary: ContentSummary): MediaSelectorDisplayValue {
        this.content = contentSummary;
        return this;
    }

    getUploadItem(): UploadItem<ContentSummary> {
        return this.uploadItem;
    }

    getContentSummary(): ContentSummary {
        return this.content;
    }

    getId(): string {
        return this.content ? this.content.getId() : this.uploadItem.getId();
    }

    getContentId(): ContentId {
        return this.content ? this.content.getContentId() : null;
    }

    getContentPath(): ContentPath {
        return this.content ? this.content.getPath() : null;
    }

    getImageUrl(): string {
        return this.content ? new ContentIconUrlResolver().setContent(this.content).resolve() : null;
    }

    getIconUrl(): string {
        return this.content ? new ContentIconUrlResolver().setContent(this.content).resolve() : null;
    }

    getLabel(): string {
        return this.content ? this.content.getName().toString() : this.uploadItem.getName();
    }

    getDisplayName(): string {
        return this.content ? this.content.getDisplayName() : this.uploadItem ? this.uploadItem.getFileName() : null;
    }

    getType(): ContentTypeName {
        return this.content ? this.content.getType() : null;
    }

    getTypeLocaleName(): string {
        return (this.content && this.content.getType()) ? this.content.getType().getLocalName() : null;
    }

    hasChildren(): boolean {
        return this.content ? this.content.hasChildren() : false;
    }

    getPath(): ContentPath {
        return this.content ? this.content.getPath() : this.uploadItem ? new ContentPath([]) : null;
    }

    equals(o: Equitable): boolean {

        if (!ObjectHelper.iFrameSafeInstanceOf(o, ClassHelper.getClass(this))) {
            return false;
        }

        let other = <MediaSelectorDisplayValue>o;

        if (!ObjectHelper.equals(this.uploadItem, other.getUploadItem())) {
            return false;
        }

        if (!ObjectHelper.equals(this.content, other.getContentSummary())) {
            return false;
        }

        if (this.empty !== other.isEmptyContent()) {
            return false;
        }

        return true;
    }
}
