export function alertBla() {
    alert("bla");
}

export class SignupRequestDto {

    // public constructor(
    //     username: string,
    //     password: string,
    //     birthDate: Date,
    //     countryId: number) {
    //     this.Username = username;
    //     this.Password = password;
    //     this.BirthDate = birthDate;
    //     this.CountryId = countryId;
    // }

    // public readonly Username: string;
    // public readonly Password: string;
    // public readonly BirthDate: Date;
    // public readonly CountryId: number;

    public Username: string;
    public Password: string;
    public BirthDate: Date;
    public CountryId: number;
}

export class UserDto {

    public constructor(
        id: string,
        username: string,
        password: string,
        birthDate: Date,
        countryId: number) {
        this.Id = id;
        this.Username = username;
        this.Password = password;
        this.BirthDate = birthDate;
        this.CountryId = countryId;
    }

    public readonly Id: string;
    public readonly Username: string;
    public readonly Password: string;
    public readonly BirthDate: Date;
    public readonly CountryId: number;

    // public static CreateFrom(signupRequest: SignupRequestDto, id: number) {
    //     return new UserDto(id, signupRequest.Username, signupRequest.Password, signupRequest.BirthDate, signupRequest.CountryId);
    // }
}

export enum Country {
    Afghanistan = 1,
    Albania,
    Algeria,
    Andorra,
    Angola,
    Antigua_Barbuda,
    Argentina,
    Armenia,
    Australia,
    Austria,
    Azerbaijan,
    Bahamas,
    Bahrain,
    Bangladesh,
    Barbados,
    Belarus,
    Belgium,
    Belize,
    Benin,
    Bhutan,
    Bolivia,
    Bosnia_Herzegovina,
    Botswana,
    Brazil,
    Brunei,
    Bulgaria,
    BurkinaFaso,
    Burundi,
    CaboVerde,
    Cambodia,
    Cameroon,
    Canada,
    CentralAfricanRepublic,
    Chad,
    Chile,
    China,
    Colombia,
    Comoros,
    DemocraticRepublicoftheCongo,
    RepublicoftheCongo,
    CostaRica,
    CotedIvoire,
    Croatia,
    Cuba,
    Cyprus,
    CzechRepublic,
    Denmark,
    Djibouti,
    Dominica,
    DominicanRepublic,
    Ecuador,
    Egypt,
    ElSalvador,
    EquatorialGuinea,
    Eritrea,
    Estonia,
    Ethiopia,
    Fiji,
    Finland,
    France,
    Gabon,
    Gambia,
    Georgia,
    Germany,
    Ghana,
    Greece,
    Grenada,
    Guatemala,
    Guinea,
    Guinea_Bissau,
    Guyana,
    Haiti,
    Honduras,
    Hungary,
    Iceland,
    India,
    Indonesia,
    Iran,
    Iraq,
    Ireland,
    Israel,
    Italy,
    Jamaica,
    Japan,
    Jordan,
    Kazakhstan,
    Kenya,
    Kiribati,
    Kosovo,
    Kuwait,
    Kyrgyzstan,
    Laos,
    Latvia,
    Lebanon,
    Lesotho,
    Liberia,
    Libya,
    Liechtenstein,
    Lithuania,
    Luxembourg,
    Macedonia,
    Madagascar,
    Malawi,
    Malaysia,
    Maldives,
    Mali,
    Malta,
    MarshallIslands,
    Mauritania,
    Mauritius,
    Mexico,
    Micronesia,
    Moldova,
    Monaco,
    Mongolia,
    Montenegro,
    Morocco,
    Mozambique,
    Myanmar,
    Namibia,
    Nauru,
    Nepal,
    Netherlands,
    NewZealand,
    Nicaragua,
    Niger,
    Nigeria,
    NorthKorea,
    Norway,
    Oman,
    Pakistan,
    Palau,
    Palestine,
    Panama,
    PapuaNewGuinea,
    Paraguay,
    Peru,
    Philippines,
    Poland,
    Portugal,
    Qatar,
    Romania,
    Russia,
    Rwanda,
    SaintKitts_Nevis,
    SaintLucia,
    SaintVincent_theGrenadines,
    Samoa,
    SanMarino,
    SaoTome_Principe,
    SaudiArabia,
    Senegal,
    Serbia,
    Seychelles,
    SierraLeone,
    Singapore,
    Slovakia,
    Slovenia,
    SolomonIslands,
    Somalia,
    SouthAfrica,
    SouthKorea,
    SouthSudan,
    Spain,
    SriLanka,
    Sudan,
    Suriname,
    Swaziland,
    Sweden,
    Switzerland,
    Syria,
    Taiwan,
    Tajikistan,
    Tanzania,
    Thailand,
    Timor_Leste,
    Togo,
    Tonga,
    Trinidad_Tobago,
    Tunisia,
    Turkey,
    Turkmenistan,
    Tuvalu,
    Uganda,
    Ukraine,
    UnitedArabEmirates,
    UnitedKingdom,
    UnitedStatesofAmerica,
    Uruguay,
    Uzbekistan,
    Vanuatu,
    VaticanCity,
    Venezuela,
    Vietnam,
    Yemen,
    Zambia,
    Zimbabwe
}