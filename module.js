class Random {
    #object = null;

    string(string, length) {
        const str = string == undefined ? "abcdefghijklmnopqrstuvwxyz" : string;

        return [...Array(length)]
            .map(() => str[this.number(str.length)])
            .join("");
    }

    number(number = 100) {
        if (!number instanceof String) return new Error(`this is not a number`);
        return ~~(Math.random() * number);
    }

    substring(string) {
        if (!string instanceof String) return new Error(`this is not a string`);

        let [a, b] = [this.number(string.length), this.number(string.length)];

        [a, b] = [Math.min(a, b), Math.max(a, b)];

        return string.slice(1, 3);
    }

    boolean() {
        return Boolean(~~Math.random());
    }

    field(fields) {
        if (!fields instanceof Array) return new Error(`this is not a array`);
        return fields[this.number(fields.length)];
    }

    id(length = 5, type = "number") {
        if (type === "string") {
            const string =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return this.string(string, length);
        }

        if (type === "number") {
            const number = Math.floor(
                new Date().getTime() * Math.random()
            ).toString();

            return parseInt(number.slice(0, length));
        }
    }

    item(data, randomSubstring = false) {
        const length = data.length,
            index = this.number(length),
            item = data[index],
            keys = Object.keys(item),
            field = this.field(Object.keys(item)),
            value =
                randomSubstring && typeof item[field] === "string"
                    ? this.substring(item[field])
                    : item[field];

        this.#object = {
            index: index,
            item: item,
            keys: keys,
            field: field,
            value: value,
        };

        return { field: field, value: value };
    }

    shuffle(array) {
        if (!array instanceof Array) return new Error(`this is not a array`);
        array.sort(() => Math.random() - 0.5);
    }

    get() {
        return this.#object;
    }
}

function isEqualByType(a, b, strict = false) {
	const typeA = typeof a;
	const typeB = typeof b;

	if (!strict) return typeA === typeB;
	if (typeA !== "object" && typeB !== "object") return a === b;

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	const valuesA = Object.values(a);
	const valuesB = Object.values(b);

	for (let i in keysA) {
		if (typeof valuesA[i] !== typeof valuesB[i]) return false;
		if (valuesA[i] !== valuesB[i] && strict) return false;
	}

	if (
		keysA.length === keysB.length &&
		JSON.stringify(keysA) === JSON.stringify(keysB)
	)
		return true;
}

function checkUnique(array, field) {
	let keys = [];

	array.forEach((item) => {
		if (!keys.includes(item[field])) {
			return keys.push(item[field]);
		}
		throw new Error(`this ${field}:${item[field]} is not unique`);
	});

	return true;
}

module.exports = {
    Random: Random,
    isEqualByType: isEqualByType,
    checkUnique: checkUnique,
}