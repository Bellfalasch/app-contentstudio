import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {LiveEditModel} from './LiveEditModel';
import {ProjectContext} from '../app/project/ProjectContext';

export class InitializeLiveEditEvent
    extends Event {

    private liveEditModel: LiveEditModel;

    private modifyPermissions: boolean;

    private project: string;

    constructor(liveEditModel: LiveEditModel, modifyPermissions: boolean = false) {
        super();
        this.liveEditModel = liveEditModel;
        this.modifyPermissions = modifyPermissions;
        this.project = ProjectContext.get().getProject();
    }

    getLiveEditModel(): LiveEditModel {
        return this.liveEditModel;
    }

    hasModifyPermissions(): boolean {
        return this.modifyPermissions;
    }

    getProject(): string {
        return this.project;
    }

    static on(handler: (event: InitializeLiveEditEvent) => void, contextWindow: Window = window) {
        Event.bind(ClassHelper.getFullName(this), handler, contextWindow);
    }

    static un(handler?: (event: InitializeLiveEditEvent) => void, contextWindow: Window = window) {
        Event.unbind(ClassHelper.getFullName(this), handler, contextWindow);
    }
}
