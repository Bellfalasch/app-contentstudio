import {ContentLayerResourceRequest} from './ContentLayerResourceRequest';
import {ContentLayerJson} from '../json/ContentLayerJson';
import {ContentLayer} from '../../content/ContentLayer';

export class GetContentLayerRequest
    extends ContentLayerResourceRequest<ContentLayerJson, ContentLayer> {

    private name: string;

    constructor(name: string) {
        super();

        this.name = name;
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), 'get');
    }

    getParams(): Object {
        return {
            name: this.name
        };
    }

    sendAndParse(): wemQ.Promise<ContentLayer> {
        return this.send().then((response: api.rest.JsonResponse<ContentLayerJson>) => {
            return this.fromJsonToContentLayer(response.getResult());
        });
    }
}