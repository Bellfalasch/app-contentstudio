import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {ContentResourceRequest} from './ContentResourceRequest';
import {ContentVersionJson} from './json/ContentVersionJson';
import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';

export class RevertVersionRequest
    extends ContentResourceRequest<ContentVersionJson, string> {

    private versionId: string;

    private contentKey: string;

    constructor(versionId: string, contentKey: string) {
        super();
        this.setMethod(HttpMethod.POST);
        this.versionId = versionId;
        this.contentKey = contentKey;
        this.addRequestPathElements('revert');
    }

    getParams(): Object {
        return {
            versionId: this.versionId,
            contentKey: this.contentKey
        };
    }

    protected processResponse(response: JsonResponse<ContentVersionJson>): string {
        return response.getResult().id;
    }
}
