namespace UniVe.TAW.Framework {

    export class Utils {

        public static NameOf_Function(fn: Function): string {
            let ret = fn.toString();
            ret = ret.substr('function '.length);
            ret = ret.substr(0, ret.indexOf('('));
            return ret;
        }
    }
}