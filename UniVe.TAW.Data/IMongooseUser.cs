using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UniVe.TAW.Data
{
    public interface IMongooseUser
    {
        mongoose.Types.ObjectId _id { get; }
        string Username { get; }
        DateTime RegistrationDate { get; }
        DateTime BirthDate { get; set; }
        identity.Country CountryId { get; set; }
        Role: identity.UserRole { get; set; }
    Salt: string{ get; set; }
Digest: string{ get; set; }
    SentMessages: Map<String, ChatMessage.IMongooseChatMessage[]>{ get; set; }
    BannedUntil: Date{ get; set; }
    setPassword(pwd: string) => void;
    validatePassword: (pwd: string) => boolean,
    getAge: () => number,
    logMessage: (addresseeId: mongoose.Types.ObjectId, text: string) => ChatMessage.IMongooseChatMessage
    }
}