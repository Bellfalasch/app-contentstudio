import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {ContentResourceRequest} from './ContentResourceRequest';
import {PermissionsJson} from '../access/PermissionsJson';
import {AccessControlList} from '../access/AccessControlList';

export class GetContentRootPermissionsRequest
    extends ContentResourceRequest<PermissionsJson, AccessControlList> {

    constructor() {
        super();
        this.addRequestPathElements('rootPermissions');
    }

    getParams(): Object {
        return {};
    }

    protected processResponse(response: JsonResponse<PermissionsJson>): AccessControlList {
        return AccessControlList.fromJson(response.getResult());
    }
}
