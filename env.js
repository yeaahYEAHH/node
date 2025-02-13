const auth = "admin:admin";
const PORT = 5000;

module.exports = {
	AUTH: "Basic " + Buffer.from(auth).toString("base64"),
	PORT: 5000,
    FOLDER: './json'
};
