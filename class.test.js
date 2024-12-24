const { FileJSON } = require("./class.js");
const { Random, checkUnique } = require("./module.js")

const random = new Random();

describe("FileJSON", () => {
	const dataCor = [
		{
			Name: "Ключковская Снежана Андреевна",
			Date: "31.12.1976",
			ID: 1,
		},
		{
			Name: "Евсеева Людмила Геннадьевна",
			Date: "21.06.1965",
			ID: 4,
		},
		{
			Name: "Егорова Светлана Михайловна",
			Date: "05.04.1987",
			ID: 5,
		},
		{
			Name: "Вахрамеев Вахтанг Николаевич",
			Date: "22.09.1990",
			ID: 7,
		},
	];

	let newFileObj, item, data;

	beforeAll(async () => {
		newFileObj = new FileJSON("json/birthday.json");
		await newFileObj.load();
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
		{
			const result = newFileObj.search(
				data.keys[random.number(data.keys)],
				random.string()
			);

			expect(result).toBeNull();
		}

		// Проверка на нахождение случайного элементе из массива найденных значений !Item
		const results = newFileObj.search(item.field, item.value);

		const result = results.some(
			(itemRes) => itemRes[item.field] === data.item[item.field]
		);

		expect(result).toBeTruthy();
	});

	afterAll(async () => {
		await newFileObj.write();
	});
});
