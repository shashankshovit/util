/**
 * Author: Shashank Shovit
 * Email: shashankshovit@gmail.com
 * Github: https://github.com/shashankshovit/
 *
 * This utility class accepts an array of objects having key value pairs with some mandatory keys as 'parent', 'id'
 * using which the library formats the result in the form of object building heirarchy.
 *
 * This utility file was primarily build for the usage of Gantt.
 * 		
 * Any suggestions are welcome.
 *
 * @requires    Type            Can be downloaded from https://github.com/shashankshovit/util/blob/master/Type.js.
 * @requires    ObjectPlus      Can be downloaded from https://github.com/shashankshovit/util/blob/master/ObjectPlus.js.
 */
import { Type } from './Type.js';
import { ObjectPlus } from './ObjectPlus.js';

export class ArrayToTree {
	/**
	 * This class needs to be instantiated with one mandatory Array argument.
	 *
	 * @param {Array}	elements				Array of objects with keys: id, parent.
	 * 								Eg, [{id: "one", parent: null, name: "something"}, ...].
	 *
	 * @param {Object}	[options= {				List of options to be provides.
	 * 				parentReferences: true,		Whether children should hold parent references.
	 * 				alterOriginal: false
	 * 			}]
	 *
	 * @throws 		Detailed exception for expected type. Provides usage info.
	 * 
	 * @example
	 * let validArr = [
	 * 	{ name: "Mary", parent: 0, id: "id_1" },
	 * 	{ name: "Jones", parent: "id_1", id: "id_2" },
	 * 	{ name: "Helen", parent: ["id_2", "id_1"], id: "id_3" },
	 * ];
	 * let converter = new ArrayToTree(validArr);
	 * let structuredData = converter.convert()';
	 */
	constructor(elements, options) {
		let defaultOptions = {
			parentReferences: true,
			alterOriginal: false
		};
		
		this.options = Object.assign(defaultOptions, options);
		this.elements = this.options.alterOriginal ? elements : ObjectPlus.clone(elements);
		this.tree = [];

		this._checkForValidity();
	}

	/**
	 * Checks if parent key has a valid value for an element.
	 *
	 * @access	private
	 */
	_isParentValid(val) {
		return (Type.isString(val)
			|| Type.isWholeNumber(val)
			|| Type.isArray(val)
			|| val === null
			|| val === undefined
		);
	}

	/**
	 * @access private
	 */
	_checkForValidity() {
		let isValid = true;
		let errMsg = '';
		let usageStr = '\nlet validArr = [';
		usageStr += '\n\t{ name: "Mary", parent: 0, id: "id_1" },';
		usageStr += '\n\t{ name: "Jones", parent: "id_1", id: "id_2" },';
		usageStr += '\n\t{ name: "Helen", parent: ["id_2", "id_1"], id: "id_3" },';
		usageStr += '\n];'
		usageStr += '\nlet converter = new ArrayToTree(validArr);';
		usageStr += '\nlet structuredData = converter.convert()';
		if(Array.isArray(this.elements)) {
			if(this.elements.every(function(ele) { return ele.id
					&& ele.hasOwnProperty('parent')
					&& this._isParentValid(ele.parent) 
					}, this)) {
				// pass
			} else {
				isValid = false;
				errMsg = "Every element of array must have keys: id (non empty), parent.";
				errMsg += "\nEvery element's parent must be either of: Array of IDs, string, whole number.";
			}
		} else {
			isValid = false;
			errMsg = "Expected arguments is an array."
		}
		
		if(!isValid) { throw `${errMsg}\nUsage: ${usageStr}`; }
	}

	/**
	 * @access 	private
	 */
	_addChildTo(parent, child) {
		if(!parent || !child) return;
		if(parent.children) {
			let isChildPresent = parent.children.filter(kid => kid.id == child.id).length;
			!isChildPresent && parent.children.push(child);
		} else {
			parent.children = [child];
		}
	}

	/**
	 * @access 	private
	 */
	_addParentReferenceTo(child, parent) {
		if(!parent || !child) return;
		if(child.parents) {
			let isParentRefPresent = child.parents.filter(prnt => prnt.id == parent.id).length;
			!isParentRefPresent && child.parents.push(parent);
		} else {
			child.parents = [parent];
		}
	}

	/**
	 * @access 	private
	 */
	_findAndLinkParentsFor(child) {
		if(!child) return;
		let parents = this.findParentsFor(child);
		if(!parents.length) {
			// no parent found for parent id, consider as root node
			this.tree.push(child);
		}
		for(let parent of parents) {
			this._addChildTo(parent, child);
			if(this.options.parentReferences) {
				this._addParentReferenceTo(child, parent);
			}
		}
	}

	/**
	 * Finds are returns all the parents for a given element.
	 *
	 * @param {Object} 	child		Child element from the array.
	 *
	 * @return {Array}	Array of parent elements. Returns 0, 1, many elements in array.
	 */
	findParentsFor(child) {
		if(!child) return;
		if(Array.isArray(child.parent)) {
			return this.elements.filter(parent => child.parent.includes(parent.id));
		} else {
			return this.elements.filter(parent => child.parent == parent.id);
		}
	}

	/**
	 * This is the main method used to convert the array into a tree structure.
	 *
	 * When initializing the class, an array of elements is expected. This method converts the
	 * array of elements into tree structure. The returned value is an array of top level parent
	 * elements under which proper hierarchy can be found.
	 *
	 * @return {Array} 	[{
	 * 				id: "one",
	 * 				parent: "zero",
	 * 				children: [{
	 *						id: "two",
	 *						parent: "one",
	 *						parents: [<reference to parent>, ...],
	 *						children: [<reference to children>, ...]
	 *					},
	 *					...
	 * 				],
	 * 				<other keys>
	 *			},
	 *			...
	 * 			]
	 */
	convert() {		
		let nonRootNodes = [];
		this.elements.forEach(ele => !ele.parent ? this.tree.push(ele) : nonRootNodes.push(ele));
		for(let child of nonRootNodes) {
			this._findAndLinkParentsFor(child);
		}
		return this.tree;
	}
}

