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

class ObjectDate extends ObjectJSON {
	sort(field, order = true, byDate) {
		if (!(byDate === null)) return super.sort(field, order);

		this._data.sort((a, b) => {
			const timeA = new Date(a[field]);
			const timeB = new Date(b[field]);

			const [dayA, monthA, yearA] = [
				timeA.getDay(),
				timeA.getMonth(),
				timeA.getFullYear(),
			];

			const [dayB, monthB, yearB] = [
				timeB.getDay(),
				timeB.getMonth(),
				timeB.getFullYear(),
			];

			switch (byDate) {
				case 1:
					return dayA - dayB;
				case 0:
					return monthA - monthB;
				case -1:
					return yearA - yearB;
			}
		});

		return order ? this._data : this._data.reverse();
	}

	date(date) {
		let time = date ? new Date(date) : new Date();
		return new Promise((resolve, reject) => {
			resolve(super.search("Date", time.toISOString().split("T")[0]));
			reject();
		});
	}
}