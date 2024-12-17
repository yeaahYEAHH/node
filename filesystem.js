const http = require("http");
const fs = require("fs");
const path = require("path");

function timeStamp() {
	return new Intl.DateTimeFormat("ru", {
		timeZone: "Asia/Yekaterinburg",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date());
}

class FileJSON {
	#cacheSearch = new WeakMap();
	#cacheReg = new WeakMap();
	#cacheSort = new WeakMap();

	_validate(...parametr) {
		if (!this.data)
			throw new Error(
				`JSON data not loaded from ${path.basename(this.path)}`
			);

		for (let item of parametr)
			if (item === undefined) throw new Error(`Args is undefind`);
	}

	_validateField(field) {
		if (!this.data.some((item) => field in item))
			throw new Error(`Field "${field}" is not exist`);
	}

	constructor(file) {
		this.path = file;
		this.data = null;
	}

	async load() {
		try {
			await fs.promises.access(this.path, fs.constants.F_OK);
		} catch (err) {
			throw new Error(`File not found: ${this.path}`);
		}

		try {
			const data = await fs.promises.readFile(this.path, "utf-8");
			try {
				this.data = data;
			} catch (err) {
				throw new Error(`Failed to parse JSON-data`);
			}
		} catch (err) {
			throw new Error(`Failed to load JSON file from ${path.basename(this.path)}`);
		}

	}

	search(field, value) {
		this._validate(field, value);
		this._validateField(field);

		const regexp = this.#cacheReg.has(value)
			? this.#cacheSearch.get(value)
			: this.#cacheSearch.set(value, new RegExp(value));

		const cacheLocal = new Map();

		const items = this.data.filter((item, index) => {
			if (cacheLocal.has(index)) return true;

			const found =
				typeof value === "string" || value instanceof String
					? regexp.test(item[field])
					: item[field] === value;

			if (found) cacheLocal.set(index, item);

			return found;
		});

		if (items.length == 0)
			throw new Error(`Item was not exist by ${field}:${value}`);

		this.#cacheReg.set(value, new RegExp(value));

		for (const [index, item] of cacheLocal)
			this.#cacheSearch.set(item, index);

		return items;
	}

	sort(field, order = true) {
		this._validate(field, order);
		this._validateField(field);

		const cacheKeySort = field + (order ? "_desc" : "_asc");

		if (this.#cacheSort.has(cacheKeySort))
			return this.#cacheSort.get(cacheKeySort);

		const sortedData = [...this.data].sort((a, b) => {
			if (a[field] > b[field]) return order ? 1 : -1;
			if (a[field] < b[field]) return order ? -1 : 1;
			return 0;
		});

		this.#cacheSort.set(cacheKeySort, sortedData);

		console.log();
		return sortedData;
	}

	delete(value, field = "ID") {
		this.search(field, value);

		for (let index of this.#cacheSearch.keys()) {
			this.data.splice(index, 1);
		}

		return `Item was succesful delete by ${field}:${value}`;
	}

	add(object) {
		this._validate(object);

		object.ID = Math.floor(
			(new Date().getTime() / 100_000_000) * Math.random()
		);
		this.data.push(object);

		return `Item was succesful add ID:${object.ID}`;
	}
}