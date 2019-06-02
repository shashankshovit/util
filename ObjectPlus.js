/**
 * Author: Shashank Shovit
 * Email: shashankshovit@gmail.com
 * Github: https://github.com/shashankshovit
 *
 * This utility allows you to created advanced Object. The class gives an option to clone an object without
 * instantiation. This also overrides the toString() method, and prints the object in readable format.
 */

import {Type} from './Type.js';

export class ObjectPlus {

	constructor(arg) {
		let obj = ObjectPlus.clone(arg);
		for(let key in obj) { this[key] = obj[key]; }
	}

	/**
	 * This static method lets you deep clone any type of object without instantiating the class.
	 *
	 * @param {any} 	arg	The object/array to clone.
	 *
	 * @return {any}	ObjectPlus is argument is object. Same type if any other object.
	 */
	static clone(arg) {
                if(Type.isSet(arg)) {
                        return ObjectPlus.clone([...arg]);
                } else if(Type.isArray(arg)) {
                        let tempArr = []; 
                        for(let i = 0; i < arg.length; i++) {
                                tempArr.push(ObjectPlus.clone(arg[i]))
                        }   
                        return tempArr;
                } else if(Type.isFunction(arg)) {
                        return Function(`return(${arg.toString()})`)();
                } else if(Type.isNumber(arg)) {
                        return Number(arg);
                } else if(Type.isString(arg)) {
                        return String(arg);
                } else if(Type.isBoolean(arg)) {
                        return Boolean(arg);
                } else if(Type.isEmpty(arg)) {
			return arg;
		} else if(Type.isObject(arg)) {
                        let tempObj = arg instanceof Map? new Map() : new ObjectPlus(); 
                        for(let key in arg) {
                                tempObj[key] = ObjectPlus.clone(arg[key]);
                        }   
                        return tempObj;
                } else {
                        return arg;
                }   
	}

	/** @access private */
	_fetchValue(arg) {
		if(Type.isSet(arg)) {
			return [...arg];
		} else if(Type.isFunction(arg)
			|| Type.isNumber(arg)
			|| Type.isString(arg)
			|| Type.isBoolean(arg)) {
				return String(arg);
		} else if(Type.isArray(arg)) {
			return `[ ${arg.toString()} ]`;
		} else if(Type.isObject) {
			let str = '{ ';
			let keyValues = [];
			for(let key in arg) {
				keyValues.push(`${key}: ${this._fetchValue(arg[key])}`);
			}
			str += keyValues.join(', ');
			str += ' }';
			return str;
		} else {
			return arg;
		}
	}

	/**
	 * Method overriding original Object.toString() method and returns a string in readable format.
	 *
	 * @return {String} 	String in formatted key value pairs in readable format.
	 */
	toString() {
		return this._fetchValue(this);
	}
}
