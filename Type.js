/**
 * Author: Shashank Shovit
 * Email: shashankshovit@gmail.com
 * Github: https://github.com/shashankshovit
 *
 * This utility would make your type checking while development easier. Instead of checking a whole
 * lot of conditions, you can use this utility which provides a number of pre written checks which
 * are required by developers mostly.
 *
 * All the methods are static methods. Hence, object instantiation isn't required.
 * 
 */
export class Type {

	/** Checks whether the argument value is a number. */
	static isNumber(val) {
		return typeof(val) === "number" || val instanceof Number;
	}

	/** Checks whether the argument value is integer. */
	static isInteger(val) {
		return Type.isNumber(val) && (val % 1 === 0);
	}

	/** Checks whether the argument value is float. */
	static isFloat(val) {
		return Type.isNumber(val) && !Type.isInteger(val);
	}

	/** Checks whether the argument value is a whole number. */
	static isWholeNumber(val) {
		return Type.isInteger(val) && (val >= 0);
	}

	/** Checks whether the argument value can be converted to number. */
	static isNumberPossible(val) {
		return !(isNaN(Number(val)) || Number(val) === Infinity);
	}

	/** Checks whether the argument value is string. */
	static isString(val) {
		return typeof(val) === "string" || val instanceof String;
	}

	/** Checks whether the argument value is boolean. */
	static isBoolean(val) {
		return typeof(val) === "boolean" || val instanceof Boolean;
	}

	/** Checks whether the argument value is empty (null, undefined, 0, empty string, empty array, empty object, false). */
	static isEmpty(val) {
		return (val === null
			|| val === undefined
			|| val === 0
			|| val === ''
			|| val === false
			|| (typeof(val) === "object" && !Object.keys(val).length)
		);
	}

	/** Checks if the argument value is either null or undefined. */
	static isNullable(val) {
		return (val === null || val === undefined);
	}

	/** Checks whether the argument value is an array. */
	static isArray(val) {
		return Array.isArray(val);
	}

	/** Checks whether the argument value is an object. */
	static isObject(val) {
		return !Type.isNullable(val) && (typeof(val) === "object" || val instanceof Object);
	}

	/** Checks whether the argument value is a set */
	static isSet(val) {
		return val instanceof Set;
	}
	
	/** Checks whether the argument value is a function */
	static isFunction(val) {
		return typeof(val) === "function";
	}
}
