//namespace unive.taw.framework {

export class Utils {

    public static nameOfFunction(fn: Function): string {
        let ret = fn.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }

    public getPropertyName(propertyFunction: Function) {
        return /\.([^\.;]+);?\s*\}$/.exec(propertyFunction.toString())[1];
    }

}
//}