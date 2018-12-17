import * as identity from '../../../../../assets/unive.taw.webservice/infrastructure/identity';

export default class UserRole {

    public constructor(
        public readonly Value: identity.UserRole,
        public readonly Name: string
    ) { }
}