const fs = require("fs");
const path = require("path");
const { Random, isEqualByType } = require("./module.js");

const random = new Random();

class FileJSON {
	#template;

	_validate(...parametr) {
		if (!this.data)
			throw new Error(
				`JSON data not loaded from ${path.basename(this.path)}`
			);

		for (let item of parametr)
			if (item === undefined) throw new Error(`parametrs is undefind`);
	}

	_validateField(field) {
		if (!this.data.some((item) => field in item))
			throw new Error(`field "${field}" is not exist`);
	}

	constructor(file) {
		this.path = file;
		this.data = null;
	}

	async load() {
		try {
			await fs.promises.access(this.path, fs.constants.F_OK);

			console.log(`file ${path.basename(this.path)} was loaded`);
		} catch (err) {
			throw new Error(`file not found: ${this.path}`);
		}

		try {
			const data = await fs.promises.readFile(this.path, "utf-8");
			try {
				this.data = JSON.parse(data);
				this.#template = this.data[0];
			} catch (err) {
				throw new Error(`failed to parse JSON-data`);
			}
		} catch (err) {
			throw new Error(
				`failed to load JSON file from ${path.basename(this.path)}`
			);
		}
	}

	async write() {
		try {
			const data = JSON.stringify(this.data, null, 2);
			await fs.promises.writeFile(this.path, data);

			console.log(
				`succesful write JSON-data to file: ${path.basename(this.path)}`
			);
		} catch (err) {
			throw new Error(
				`failed to process JSON-data or write to file: ${err.message}`
			);
		}
	}

	// async create() {} для создание файла

	// async save() {} для обновления и сохранения файла

	search(field, value) {
		this._validate(field, value);
		this._validateField(field);

		const regexp = new RegExp(value);

		const items = this.data.filter((item) => {
			return typeof value === "string" || value instanceof String
				? regexp.test(item[field])
				: item[field] === value;
		});

		if (items.length == 0) return null;

		return items;
	}

	sort(field, order = true) {
		this._validate(field, order);
		this._validateField(field);

		const sortedData = [...this.data].sort((a, b) => {
			if (a[field] > b[field]) return order ? 1 : -1;
			if (a[field] < b[field]) return order ? -1 : 1;
			return 0;
		});

		return sortedData;
	}

	add(add) {
		this._validate(add);

		const typeTemplate = typeof this.#template,
			typeAdd = typeof add;

		if (!typeAdd === typeTemplate) throw new Error(`type is incorrect`);

		add.ID = random.id();

		if (isEqualByType(add, this.#template))
			throw new Error(`structure and exits item(s) is not a equal`);

		this.data.push(add);

		return `Item was succesful add ID:${add.ID}`;
	}
}

module.exports = {
	FileJSON: FileJSON,
};
