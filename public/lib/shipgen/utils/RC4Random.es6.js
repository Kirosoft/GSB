

Rc4Random = class {


    constructor(seed) {
        this._keySchedule = [];
        this._keySchedule_i = 0;
        this._keySchedule_j = 0;

        for (let i = 0; i < 256; i++)
            this._keySchedule[i] = i;

        var j = 0;
        for (let i = 0; i < 256; i++)
        {
            j = (j + this._keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;

            var t = this._keySchedule[i];
            this._keySchedule[i] = this._keySchedule[j];
            this._keySchedule[j] = t;
        }
    }

    getRandomNumber() {
        var number = 0;
        var multiplier = 1;
        for (let i = 0; i < 8; i++) {
            number += this._getRandomByte() * multiplier;
            multiplier *= 256;
        }
        return number / 18446744073709551616;
    }


    _getRandomByte() {
        this._keySchedule_i = (this._keySchedule_i + 1) % 256;
        this._keySchedule_j = (this._keySchedule_j + this._keySchedule[this._keySchedule_i]) % 256;

        var t = this._keySchedule[this._keySchedule_i];
        this._keySchedule[this._keySchedule_i] = this._keySchedule[this._keySchedule_j];
        this._keySchedule[this._keySchedule_j] = t;

        return this._keySchedule[(this._keySchedule[this._keySchedule_i] + this._keySchedule[this._keySchedule_j]) % 256];
    };

};
