import * as identity from '../../../../../assets/imported/unive.taw.webservice/infrastructure/identity';

export default class UserRole {

    public constructor(
        public readonly Value: identity.UserRoles,
        public readonly Name: string
    ) { }
}