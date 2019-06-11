/**
 * Author: Shashank Shovit
 * Email: shashankshovit@gmail.com
 * Github: https://github.com/shashankshovit
 *
 *
 * This utility incorporates many methods which would ease your development such as 'first', 'last'.
 * As some other languages, this utility makes javascript powerful to have circular array where you
 * can access a value with negative indexes.
 *
 * Note: This class expects an array literal to instantiate unlike regular Array instantiation.
 * Note: Developers are encouraged to use property array.fromIndex(num) instead of regular 
 * array value access array[num] for circular array benefits.
 *
 * @requires 	Type 		Can be downloaded from https://github.com/shashankshovit/util/blob/master/Type.js.
 * @requires 	ObjectPlus 	Can be downloaded from https://github.com/shashankshovit/util/blob/master/ObjectPlus.js.
 */
import { Type } from './Type.js';
import { ObjectPlus } from './ObjectPlus.js';

export class ArrayPlus extends Array {
	/**
	 * @param 	{Array} 	arr 				An array which would be used by the class.
	 * @param	{Object}	[options={circular: true}]	Some options for the type of array.
	 * 								circular: any index (using fromIndex()) would result in a value (+/-).
	 *
	 * @return 	{ArrayPlus}	Returns an enriched array with many other developer friendly methods.
	 */
	constructor(arr, options) {
		ArrayPlus._validateArguments(arr, /*showUsage=*/true);
		arr = ObjectPlus.clone(arr);
		super(...arr);
		let defaults = {
			circular: true,
		};

		this.options = Object.assign(defaults, options);
	}

	/** @access private */
	static get _usageInstructions() {
		let usageStr = [
			`let myOldArr = [1, 2, 3, 4, 5];`,
			`let myArr = new ArrayPlus(myOldArr, {circular: true});`,
			`let sumOfFirstAndLast = myArr.first + myArr.last; //6`,
			`let sumOfArr = myArr.sum; //15`,
		];
		return usageStr.join('\n');
	}

	/** @access private */
	static _validateArguments(arr, showUsage=false) {
		let isValid = true;
		let errMsg = '';
		if(Array.isArray(arr)) {
			// Only Array accepted
			// pass
		} else {
			isValid = false;
			errMsg = 'Only Array arguments are accepted.';
		}

		if(!isValid) { ArrayPlus._reportError(errMsg, showUsage); }
	}

	/** @access private */
	static _reportError(msg, showUsage=false, additionalInfo='') {
		msg += showUsage ? `\n\nUsage instructions:\n${ArrayPlus._usageInstructions}` : '';
		msg += additionalInfo ? `\n\nInformation:\n${additionalInfo}` : '';

		if(msg) { throw `ArrayPlus exception =>\n${msg}`; }
	}

	/**
	 * Accessing this property would return the first element in the array.
	 *
	 * @return {any} 	First element of array.
	 */
	get first() {
		return this[0];
	}

	/**
	 * Accessing this property would return the last element of the array.
	 *
	 * @return {any} 	Last element of array.
	 */
	get last() {
		return this[this.length - 1];
	}

	/**
	 * Returns the value from specified index. Circular array values should be accessed only through this method.
	 *
	 * @param {int}		index		Index of array
	 *
	 * @return {any}			Returns the value from given index. In case of circular array, -1 gives the last element.
	 */
	fromIndex(index) {
		if(this.options.circular) {
			index = (index < 0) ? (this.length + index) : (index % this.length);
		}
		return this[index];
	}

	/** Override map */
	map(func) {
		if(!Type.isFunction(func)) {
			ArrayPlus._reportError("Map accepts only function.")
		}
		let arr = [...this];
		return new ArrayPlus(arr.map(func));
	}

	/**
	 * Adds up the values in the array and returns the sum.
	 *
	 * @return {any} 	Numbers, booleans (converted to numbers) are added, everything else concatenated.
	 */
	get sum() {
		let arr = ObjectPlus.clone(this);
		return arr.reduce((one, two) => (one + two));
	}

	/**
	 * Merges two ArrayPlus objects. Auto merge happens with some fixed rules. Custom rules can be provided.
	 *
	 * @param {Array} 	another				An Array/ArrayPlus object which is to be merged.
	 * @param {Object}	[mergeOptions=			A list of options to customize merge rule.
	 * 				{
	 * 				rule=null,		A function for custom merge.
	 * 				primary="first",	Define the primary list.
	 * 							For eg, primary[i] element being a list inserts secondary[i] element.
	 * 							While primary[i] element being string concatenates secondary[i] element if its an list.
	 * 							Accepted values : first/second.
	 *
	 * 				}
	 * 			]
	 *
	 * @return {ArrayPlus}	Returns an ArrayPlus object after merge.
	 */
	merge(another, mergeOptions) {
		ArrayPlus._validateArguments(another, /*showUsage=*/false);

		let defaults = {
			rule: null,
			primary: "first",
		};

		mergeOptions = Object.assign(defaults, mergeOptions);
		// Clone the array
		another = ObjectPlus.clone(another);
		let resultant;

		if(!mergeOptions.rule) {
			/* no merge rule provided */
			
			let acceptedValues /* for mergeOptions.primary */ = ["first", "second"];
			if(!acceptedValues.includes(mergeOptions.primary)) {
				let errMsg = "Merging needs primary array to be declared.";
				let info = `myArr.merge(newArr, { primary: "second"} )`;
				info += `Accepted values for primary: first, second.`;
				ArrayPlus._reportError(errMsg, false, info);
			}

			let thisClone = ObjectPlus.clone(this);
			let [primary, secondary] = mergeOptions.primary === 'first' ? [thisClone, another] : [another, thisClone];
			resultant = this._merge(primary, secondary);
		} else {
			/* user provided custom merge rule */
			// type check for merge rule
			if(!typeof(mergeOptions.rule) === "function") {
				let errMsg = "Provided rule must be a function accepting two arrays.";
				let additionalMsg = `let rule = function(arr1, arr2) {Your custom rule};`;
				ArrayPlus._reportError(errMsg, /*showUsage=*/false, /*additionalInfo=*/additionalMsg);
				
			} else {
				// Custom rule can have errors.
				try {
					resultant = mergeOptions.rule.call(undefined, ObjectPlus.clone(this), another);
					if(Type.isArray(resultant)) {
						resultant = new ArrayPlus(resultant);
					} else if (resultant instanceof ArrayPlus) {
						// pass
					} else {
						let errStr = `Custom mrege rule must return an array.`;
						ArrayPlus._reportError(errStr, /*showUsage=*/false);
					}
				} catch(err) {
					let errStr = `Exception occured in your merge rule. Exception details:\n${err}`;
					ArrayPlus._reportError(errStr, /*showUsage=*/false);
					
				}//try-catch
			}// if-else for merge rule type check
		}//if-else if merge rule provided
	return resultant;
	}// merge

	/** @access private */
	_merge(primary, secondary) {
		let resultant=[];
		let loopSize = Math.max(primary.length, secondary.length);

		try {
		// Converting Array, Object to string could result in exception
		for(let i=0; i<loopSize; i++) {
			let first = primary[i], second = secondary[i], result;
			let noRuleError = `Undefined merge rule for value: ${first},${second}.`;

			if(Type.isEmpty(second)) { result = first; }
			else if(Type.isBoolean(first)) {
			// primary -> Boolean
				result = Type.isEmpty(second) ? false : true;
			} else if(Type.isNumber(first)) {
			// primary -> Number
				if(Type.isArray(second)) { second.push(first); result = second; }
				else if(Type.isNumberPossible(second)) { result = first + Number(second); }
				else if(Type.isString(second)) { result = first + second; }
				else if(Type.isObject(second)) { second[first] = first; result = second; }
				else { ArrayPlus._reportError(noRuleError); }
			} else if(Type.isString(first)) {
			// primary -> String
				if(Type.isNumber(second) || Type.isString(second) || Type.isBoolean(second)) {
					result = first + second;
				} else if(Type.isArray(second)) { result = `${first} ${second.toString()}`; }
				else if(Type.isObject(second)) { let obj = new ObjectPlus(second); result = `${first} ${obj}`; }
				else { ArrayPlus._reportError(noRuleError); }
			} else if(Type.isArray(first)) {
			// primary -> Array
				if(Type.isNumber(second) || Type.isString(second) || Type.isBoolean(second)) {
					first.push(second); result = first;
				} else if(Type.isArray(second)) { result = first.concat(second); }
				else if(Type.isObject(second)) { first.push(second); result = first; }
				else { ArrayPlus._reportError(noRuleError); }
			} else if(Type.isObject(first)) {
			// primary -> Object
				if(Type.isNumber(second) || Type.isString(second) || Type.isBoolean(second)) {
					first[second] = second; result = first;
				} else if(Type.isObject(second)) { result = Object.assign(first, second); }
				else { ArrayPlus._reportError(noRuleError); }
			} else if(Type.isEmpty(first)) {
			// primary -> Empty
				result = first || second;
			} else {
			// No more rules
				ArrayPlus._reportError(noRuleError);
			}

			resultant.push(result);
		}
		} catch(err) {
			let errMsg = `Exception occured while merging. Exception details:\n${err}`;
			ArrayPlus._reportError(errMsg);
		}

		return resultant;
	}// _merge

	/**
	 * Returns unique values in the array.
	 *
	 * @param
	 *
	 * @return {Array}
	 */
	unique(options) {
		let isSameType = (new Set(this.map(i => Type.typeOf(i)))).size === 1;
		if(!isSameType) {
			ArrayPlus._reportError("All elements of the list must be of same type for unique method.");
		}
		//options = Object.assign({ key: null, func: function(){} }, options);
		if(options && options.func && !Type.isFunction(func)) {
			ArrayPlus._reportError("Only function accepted as callback.");
		}
		if(options && options.func) {
			// Custom unique rule
			let result = options.func.call(undefined, ObjectPlus.clone(this));
			if(!result) {
				ArrayPlus._reportError("Custom rule for unique must return an array.");
			}
			return new ArrayPlus(result);
		} else {
			// Custom unique rule not provided
			if(Type.isPrimitive(this.first)) {
				return new ArrayPlus([...new Set(this)]);
			} else {
			 try {
			 	if(options && (options.key || ((Type.isArray(this.first) && options.key==0)))) {
					let uniq = {};
					for(let ele of this) {
						ele[options.key] && !uniq[ele[options.key]] && (uniq[ele[options.key]] = ele);
					}
					return new ArrayPlus(Object.values(uniq));
				} else {
					ArrayPlus._reportError("Please provide a key based on which the elements should be considered unique.");
				}
			 } catch(e) {
			 	ArrayPlus._reportError("Unique isn't supported for this kind of array. Please provide your custom function.", false, e);
			 }
			}
		}
		
	}
}
