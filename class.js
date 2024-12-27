const fs = require("fs");
const path = require("path");
const { Random, isEqualByType } = require("./module.js");

const random = new Random();

/**
 * @module JSON
 * @description Модуль, в котором реализуется работы с JSON
 */

/**
 * Класс для работы с JSON файлами.
 * Предоставляет методы для работы с данными внутри JSON-файлом.
 * @class
 */
class FileJSON {
	/**
	 * @private
	 * @type {Object}
	 */
	#template;
	#index = [];

	/**
	 * Валидация переданных параметров и наличия загруженных данных.
	 * @protected
	 * @param {...*} parametr - Параметры для проверки.
	 * @throws {Error} Если данные не загружены или параметры не определены.
	 */
	_validate(...parametr) {
		if (!this.data)
			throw new Error(
				`JSON data not loaded from ${path.basename(this.path)}`
			);

		for (let item of parametr)
			if (item === undefined) throw new Error(`parametr(s) is undefind`);
	}

	/**
	 * Валидация наличия указанного поля в данных.
	 * @protected
	 * @param {string} field - Поле, которое необходимо проверить.
	 * @throws {Error} Если поле не найдено в данных.
	 */
	_validateField(field) {
		if (!this.data.some((item) => field in item))
			throw new Error(`field "${field}" does not exist`);
	}

	/**
	 * Создает экземпляр FileJSON.
	 * @param {string} file - Путь к файлу JSON.
	 * @constructor
	 */
	constructor(file) {
		this.path = file;
		this.data = null;
	}

	/**
	 * Загружает и парсит данные из JSON-файла.
	 * @returns {Promise<void>}
	 * @throws {Error} Если файл не найден или не удается распарсить данные.
	 */
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
				this.#template = this.data[0] ? this.data[0] : null;
			} catch (err) {
				throw new Error(`failed to parse JSON-data`);
			}
		} catch (err) {
			throw new Error(
				`failed to load JSON file from ${path.basename(this.path)}`
			);
		}
	}

	/**
	 * Записывает данные обратно в JSON-файл.
	 * @returns {Promise<void>}
	 * @throws {Error} Если не удается записать данные в файл.
	 */
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

	/**
	 * Ищет элементы в данных по заданному полю и значению.
	 * @public
	 * @param {string} field - Поле для поиска.
	 * @param {string|number} value - Значение для поиска.
	 * @returns {Array|null} Возвращает массив найденных элементов или null, если ничего не найдено.
	 */
	search(field, value) {
		this._validate(field, value);
		this._validateField(field);

		const regexp = new RegExp(value);
		this.#index = [];

		const items = this.data.filter((item, index) => {
			const result =
				typeof value === "string" || value instanceof String
					? regexp.test(item[field])
					: item[field] === value;

			if (result) {
				this.#index.push(index);
			}

			return result;
		});

		if (items.length == 0) return null;

		return items;
	}

	/**
	 * Сортирует данные по указанному полю и порядку.
	 * @public
	 * @param {string} field - Поле для сортировки.
	 * @param {boolean} [order=true] - Порядок сортировки: true - по возрастанию, false - по убыванию.
	 * @returns {Array} Отсортированный массив.
	 * @throws {Error} Если поле не существует.
	 */
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

	/**
	 * Добавляет новый элемент в дату.
	 * @public
	 * @param {Object} add - Новый элемент для добавления.
	 * @returns {string} Сообщение об успешном добавлении.
	 * @throws {TypeError} Если тип добавляемого элемента не совпадает с шаблоном.
	 * @throws {Error} Если структура добавляемого элемента не совпадает с шаблоном.
	 */
	add(add) {
		this._validate(add);

		this.#template = this.#template === null ? add : this.#template;

		const typeTemplate = typeof this.#template,
			typeAdd = typeof add;

		if (typeAdd !== typeTemplate) throw new TypeError(`type is incorrect`);

		add.ID = random.id();

		if (!isEqualByType(add, this.#template, true))
			throw new Error(`structure and exits item(s) is not a equal`);

		this.data.push(add);

		return `item was succesful add ID:${add.ID}`;
	}

	/**
	 * Удаляет элементы из данных, которые соответствуют указанным полю и значению.
	 * @param {string} field - Поле, по которому осуществляется поиск элементов.
	 * @param {*} value - Значение, по которому осуществляется поиск элементов.
	 * @throws {Error} Если значение или поле не указаны.
	 * @throws {Error} Если элементы с указанным полем и значением не найдены.
	 * @returns {string} Сообщение о успешном удалении элементов.
	 */	

	delete(field, value) {
		this._validate(value);
		this._validateField(field);

		this.search(field, value);

		if (this.#index === undefined)
			throw new Error(
				`item with field "${field}" and value "${value}" not found`
			);

		for (let index of this.#index) {
			this.data.splice(parseInt(index), 1);
		}

		return `item with ${field}: ${value} was successfully deleted`;
	}
}

module.exports = {
	FileJSON: FileJSON,
};
