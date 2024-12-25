const { FileJSON } = require("./class.js");
const { Random, checkUnique } = require("./module.js")

const random = new Random();
const newFileObj = new FileJSON("json/birthday.json");

describe("FileJSON", () => {
	const dataCor = [];

	let item, data;

	beforeAll(async () => {
		await newFileObj.load();

		let i = 0;
		for(;;) {
			if(i === 10) break;
			dataCor.push(newFileObj.data[i]);
			i++;
		}
	});

	beforeEach(() => {
		item = random.item(dataCor);
		data = random.get();
	});

	test(`FileJSON all ID is unique`, () => {
		const result = checkUnique(newFileObj.data, "ID");
		expect(result).toBeTruthy();
	});

	test(`FileJSON.search() is correct work`, () => {
		const item = random.item(dataCor, true);
		const data = random.get();

		// Проверка на вызов без параметров !Error
		expect(() => newFileObj.search()).toThrowError();

		// Проверка на вызов с одним параметром !Error
		expect(() => newFileObj.search(random.field(data.keys))).toThrowError();

		// Отлов ошибки при несуществующем поле !Error
		expect(() =>
			newFileObj.search(random.string(), item.value)
		).toThrowError();

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
		const results = newFileObj.search(item.field, item.value);

		const result = results.some(
			(itemRes) => itemRes[item.field] === data.item[item.field]
		);

		expect(result).toBeTruthy();
	});

	test(`FileJSON.add() is correct work`, () => {});

	test(`FileJSON.delete() is correct work`, () => {});

	test(`FileJSON.edit() is correct work`, () => {});

	test(`FileJSON.sort() is correct work`, () => {});

	afterAll(async () => {
		await newFileObj.write();
	});
});
