import {XData} from '../content/XData';
import {XDataJson} from './json/XDataJson';
import {ProjectBasedResourceRequest} from '../wizard/ProjectBasedResourceRequest';

export abstract class XDataResourceRequest<JSON_TYPE, PARSED_TYPE>
    extends ProjectBasedResourceRequest<JSON_TYPE, PARSED_TYPE> {

    constructor() {
        super();
        this.addRequestPathElements('schema', 'xdata');
    }

    fromJsonToXData(json: XDataJson) {
        return XData.fromJson(json);
    }
}
