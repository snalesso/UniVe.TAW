import * as identityDTOs from "./identity";

export interface INewMessage {
    readonly Text: string;
    readonly AddresseeId: string;
}

export interface IChatMessageDto {
    readonly IsMine: boolean;
    readonly SenderId?: string;
    readonly Text: string;
    readonly Timestamp: Date;
}

export interface IChatHistoryHeaderDto {
    readonly Interlocutor: identityDTOs.ISimpleUserDto;
    readonly LastMessage: IChatMessageDto;
}

export interface IChatDto {
    readonly Interlocutor: identityDTOs.ISimpleUserDto;
    Messages: IChatMessageDto[];
}