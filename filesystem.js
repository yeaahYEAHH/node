const fs = require("fs");

class ObjectJSON {
	constructor(stringJSON) {
		this._data = stringJSON;
	}

	search(field, value) {
		const items = Number.isInteger(value)
			? this._data.filter((item) => item[field] == value)
			: this._data.filter((item) => new RegExp(value).test(item[field]));

		if (items.length) return items;
	}

	sort(field, order = true) {
		this._data.sort((a, b) => {
			if (a[field] > b[field]) return 1;
			if (a[field] < b[field]) return -1;
			return 0;
		});

		return order ? this._data : this._data.reverse();
	}

	delete(value, field = "ID") {
		const item = this.search(field, value)[0];
		const index = [this._data.indexOf(item)];

		this._data.splice(index, 1);
	}

	add(object) {
		object.ID = this._data.length;
		this._data.push(object);
	}

	edit(oldValue, newValue, field = "ID") {
		const item = this.search(field, oldValue)[0];
		const index = [this._data.indexOf(item)];

		this._data[index] = newValue;
	}
}
