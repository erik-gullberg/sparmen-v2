import sparmen from "./sparmen.json";

function getSpexByNumber(number) {
    for (let key in sparmen) {
        if (sparmen[key].meta && sparmen[key].meta.number === number) {
            return sparmen[key];
        }
    }
    return null;
}

export default getSpexByNumber;