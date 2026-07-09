export interface PlatformService {

    readonly name:string;

    initialize():Promise<void>|void;

    dependencies?():string[];
}