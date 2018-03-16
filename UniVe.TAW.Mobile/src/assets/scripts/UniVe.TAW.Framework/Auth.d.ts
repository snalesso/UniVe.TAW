declare namespace UniVe.TAW.Framework.Auth {
    class AuthService {
        readonly Port: number;
        constructor(port?: number);
        Signup(signupRequest: SignupRequest): void;
    }
    enum Country {
        Afghanistan = 0,
        Albania = 1,
        Algeria = 2,
        Andorra = 3,
        Angola = 4,
        Antigua_Barbuda = 5,
        Argentina = 6,
        Armenia = 7,
        Australia = 8,
        Austria = 9,
        Azerbaijan = 10,
        Bahamas = 11,
        Bahrain = 12,
        Bangladesh = 13,
        Barbados = 14,
        Belarus = 15,
        Belgium = 16,
        Belize = 17,
        Benin = 18,
        Bhutan = 19,
        Bolivia = 20,
        Bosnia_Herzegovina = 21,
        Botswana = 22,
        Brazil = 23,
        Brunei = 24,
        Bulgaria = 25,
        BurkinaFaso = 26,
        Burundi = 27,
        CaboVerde = 28,
        Cambodia = 29,
        Cameroon = 30,
        Canada = 31,
        CentralAfricanRepublic = 32,
        Chad = 33,
        Chile = 34,
        China = 35,
        Colombia = 36,
        Comoros = 37,
        DemocraticRepublicoftheCongo = 38,
        RepublicoftheCongo = 39,
        CostaRica = 40,
        CotedIvoire = 41,
        Croatia = 42,
        Cuba = 43,
        Cyprus = 44,
        CzechRepublic = 45,
        Denmark = 46,
        Djibouti = 47,
        Dominica = 48,
        DominicanRepublic = 49,
        Ecuador = 50,
        Egypt = 51,
        ElSalvador = 52,
        EquatorialGuinea = 53,
        Eritrea = 54,
        Estonia = 55,
        Ethiopia = 56,
        Fiji = 57,
        Finland = 58,
        France = 59,
        Gabon = 60,
        Gambia = 61,
        Georgia = 62,
        Germany = 63,
        Ghana = 64,
        Greece = 65,
        Grenada = 66,
        Guatemala = 67,
        Guinea = 68,
        Guinea_Bissau = 69,
        Guyana = 70,
        Haiti = 71,
        Honduras = 72,
        Hungary = 73,
        Iceland = 74,
        India = 75,
        Indonesia = 76,
        Iran = 77,
        Iraq = 78,
        Ireland = 79,
        Israel = 80,
        Italy = 81,
        Jamaica = 82,
        Japan = 83,
        Jordan = 84,
        Kazakhstan = 85,
        Kenya = 86,
        Kiribati = 87,
        Kosovo = 88,
        Kuwait = 89,
        Kyrgyzstan = 90,
        Laos = 91,
        Latvia = 92,
        Lebanon = 93,
        Lesotho = 94,
        Liberia = 95,
        Libya = 96,
        Liechtenstein = 97,
        Lithuania = 98,
        Luxembourg = 99,
        Macedonia = 100,
        Madagascar = 101,
        Malawi = 102,
        Malaysia = 103,
        Maldives = 104,
        Mali = 105,
        Malta = 106,
        MarshallIslands = 107,
        Mauritania = 108,
        Mauritius = 109,
        Mexico = 110,
        Micronesia = 111,
        Moldova = 112,
        Monaco = 113,
        Mongolia = 114,
        Montenegro = 115,
        Morocco = 116,
        Mozambique = 117,
        Myanmar = 118,
        Namibia = 119,
        Nauru = 120,
        Nepal = 121,
        Netherlands = 122,
        NewZealand = 123,
        Nicaragua = 124,
        Niger = 125,
        Nigeria = 126,
        NorthKorea = 127,
        Norway = 128,
        Oman = 129,
        Pakistan = 130,
        Palau = 131,
        Palestine = 132,
        Panama = 133,
        PapuaNewGuinea = 134,
        Paraguay = 135,
        Peru = 136,
        Philippines = 137,
        Poland = 138,
        Portugal = 139,
        Qatar = 140,
        Romania = 141,
        Russia = 142,
        Rwanda = 143,
        SaintKitts_Nevis = 144,
        SaintLucia = 145,
        SaintVincent_theGrenadines = 146,
        Samoa = 147,
        SanMarino = 148,
        SaoTome_Principe = 149,
        SaudiArabia = 150,
        Senegal = 151,
        Serbia = 152,
        Seychelles = 153,
        SierraLeone = 154,
        Singapore = 155,
        Slovakia = 156,
        Slovenia = 157,
        SolomonIslands = 158,
        Somalia = 159,
        SouthAfrica = 160,
        SouthKorea = 161,
        SouthSudan = 162,
        Spain = 163,
        SriLanka = 164,
        Sudan = 165,
        Suriname = 166,
        Swaziland = 167,
        Sweden = 168,
        Switzerland = 169,
        Syria = 170,
        Taiwan = 171,
        Tajikistan = 172,
        Tanzania = 173,
        Thailand = 174,
        Timor_Leste = 175,
        Togo = 176,
        Tonga = 177,
        Trinidad_Tobago = 178,
        Tunisia = 179,
        Turkey = 180,
        Turkmenistan = 181,
        Tuvalu = 182,
        Uganda = 183,
        Ukraine = 184,
        UnitedArabEmirates = 185,
        UnitedKingdom = 186,
        UnitedStatesofAmerica = 187,
        Uruguay = 188,
        Uzbekistan = 189,
        Vanuatu = 190,
        VaticanCity = 191,
        Venezuela = 192,
        Vietnam = 193,
        Yemen = 194,
        Zambia = 195,
        Zimbabwe = 196,
    }
    class SignupRequest {
        constructor(nickname: string, email: string, password: string, unixBirthDate: number, nationality: string);
        readonly Nickname: string;
        readonly Email: string;
        readonly Password: string;
        readonly UnixBirthDate: number;
        readonly Nationality: string;
    }
    class UserDto {
        constructor(id: number, nickname: string, birthDate: Date, nationality: string);
        readonly Id: number;
        readonly Nickname: string;
        readonly BirthDate: Date;
        readonly Nationality: string;
    }
}