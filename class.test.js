const { FileJSON } = require("./class.js");
const { Random, checkUnique, isEqualByType } = require("./module.js");

const random = new Random();
const newFileObj = new FileJSON("json/birthday.json");

describe("FileJSON", () => {
	const dataCor = [];
	let item, data;

	beforeAll(async () => {
		await newFileObj.load();

		let i = 0;
		for (;;) {
			if (i === 10) break;
			dataCor.push(newFileObj.data[i]);
			i++;
		}
	});

	beforeEach(() => {
		item = random.item(dataCor, true);
		data = random.get();
	});

	test(`FileJSON all ID is unique`, () => {
		const result = checkUnique(newFileObj.data, "ID");

		expect(result).toBeTruthy();
	});

	test(`FileJSON.search() is correct work`, () => {

		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.search()).toThrowError("parametr(s) is undefind");
		expect(() => newFileObj.search(random.field(data.keys))).toThrowError(
			"parametr(s) is undefind"
		);

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.search(random.string(), item.value)
		).toThrowError(/field .* does not exist/);

		// Отлов ошибки при несущеструющем значение !Null
		for(let i = 0; i > 3;){
			const result = newFileObj.search(
				data.keys[random.number(data.keys.length)],
				random.string()
			);

			expect(result).toBeNull();

			i++;
		}

		// Проверка на нахождение случайного элементе из массива найденных значений !Item
		const items = newFileObj.search(item.field, item.value);

		expect(items).toContainEqual(data.item);
	});

	test(`FileJSON.add() is correct work`, () => {
		const length = newFileObj.data.length;
	
		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.add()).toThrowError(
			"parametr(s) is undefind"
		);

		// Ошибка при несоотвествии типу !Item шаблону
		expect(() => newFileObj.add(random.boolean())).toThrowError(
			"type is incorrect"
		);

		// Ошибка при несоотвествии структуре !Item, существующими шаблону
		expect(() =>
			newFileObj.add([random.number(), random.boolean()])
		).toThrowError("structure and exits item(s) is not a equal");

		// Проверка на успешное добавление !Item
		const add = {};
		for (let i in data.item) {
			if (i === "ID") continue;
			add[i] = data.item[i];
		}

		result = newFileObj.add(add);

		expect(result).toMatch(/item was succesful add ID:.*/);

		// Проверка на изменения FileJSON.data
		expect(length < newFileObj.data.length).toBeTruthy();
	});

	test(`FileJSON.delete() is correct work`, () => {
		const length = newFileObj.data.length;

		// Проверка на вызов без параметр(ов) !Error
		expect(() => newFileObj.delete()).toThrowError(
			"parametr(s) is undefind"
		);

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.delete(random.string(), item.value)
		).toThrowError(/field .* does not exist/);

		// Отлов ошибки при несущеструющем значение !Error
		for (let i = 0; i > 3; ) {
			const result = newFileObj.delete(
				data.keys[random.number(data.keys.length)],
				random.string()
			);

			expect(result).toThrowError(
				/item with field ".*" and value ".*" not found/
			);

			i++;
		}

		// Проверка на успешное удаление !Item(s)
		const result = newFileObj.delete(item.field, item.value);
		expect(result).toMatch(/item with \w*: .* was successfully deleted/);

		// Проверка на изменения FileJSON.data
		expect(length > newFileObj.data.length).toBeTruthy();
	});

	test(`FileJSON.edit() is correct work`, () => {});

	// test(`FileJSON.sort() is correct work`, () => {});

	// afterAll(async () => {
	// 	await newFileObj.write();
	// });
});
