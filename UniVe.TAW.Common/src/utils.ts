export function NameOfFunction(fn: Function): string {
    let ret = fn.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}

export function GetPropertyName(propertyFunction: Function) {
    return /\.([^\.;]+);?\s*\}$/.exec(propertyFunction.toString())[1];
}

export function GetAge(birthDate: Date) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}