/**
 * Created by marknorman on 04/09/15.
 */

// XFR rules
// 1) Must be pure functions
// 2) They always return a result, where null indicates the result was filtered out

aggregateXfr = x => x;

incXfr = x => x + 1;

isEvenXfr = x => x % 2 == 0 ? x : null;

debugXfr = (x,y) => {
    if (x) {
        var str = '';
        if (SmartUtils.isArray(x) && x.length > 0) {
            str = flatten(x).join(',');
        } else {
            str = ''+ x;
        }
        console.log(y + str)
    };
    return x;
};


