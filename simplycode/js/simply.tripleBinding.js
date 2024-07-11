tripleBinding = function(triple, dataBinding) {
	/* 
		Triple is an object:
		{
			store : rdfStore,
			subject : rdfSubject,
			predicate : rdfPredicate
		}
	*/

	var resolveNameSpace = function(property) {
		var namespace = "xmlns:" + property.split(":")[0];
		var namespaceElement = document.body.closest("[" + CSS.escape(namespace) + "]");
		if (namespaceElement) {
			return namespaceElement.getAttribute(namespace) + property.split(":")[1];
		}
		return property;
	};
		
	var self = this;
	this.triple = triple;
	this.dataBinding = dataBinding;
	this.triple.dataBinding = dataBinding;
	this.triple.tripleBinding = this;
	this.simplyDataBindingElement = true;

	this.triple.predicate = resolveNameSpace(this.triple.predicate);

	if (typeof this.triple.store.simplyDataBindings === "undefined") {
		this.triple.store.simplyDataBindings = {};
	}
	if (typeof this.triple.store.simplyDataBindings[this.triple.subject] === "undefined") {
		this.triple.store.simplyDataBindings[this.triple.subject] = {};
	}
	if (typeof this.triple.store.simplyDataBindings[this.triple.subject][this.triple.predicate] === "undefined") {
		this.triple.store.simplyDataBindings[this.triple.subject][this.triple.predicate] = this;
	} else {
		console.log("Warning: binding to the same subject/predicate twice");
	}
	this.unbind = function() {
		if (this.dataBinding) {
			this.dataBinding.unbind(this);
		}
	};
	this.dataBindingPaused = 0;

	this.getBlankNode = function(self, subject) {
		var result = {};
		if (!self.triple.store.subjectIndex[subject]) {
			subject = "_:" + subject;
		}
		if (!self.triple.store.subjectIndex[subject]) {
			return;
		}
		self.triple.store.subjectIndex[subject].forEach(function(triple) {
			if (typeof result[triple.predicate.value] === "undefined") {
				result[triple.predicate.value] = [];
			}
			result[triple.predicate.value].push(triple.object);
		});
		return result;
	};
	
	this.getObjects = function() {
		var triples = this.getTriples();
		var objects = [];
		triples.forEach(function(triple) {
			objects.push(triple.object);
		});
		return objects;
	};

	this.getTriples = function() {
		var triples = [];
		var subject = this.triple.subject;
		var predicate = this.triple.predicate;
		var store = this.triple.store;
		var self = this;

		if (!this.triple.store.subjectIndex[subject]) {
			if (this.triple.store.subjectIndex["<" + subject + ">"]) {
				subject = "<" + subject + ">";
			} else if (this.triple.store.subjectIndex[subject.replace(/^\[(.*)\]$/, "$1")]) {
				subject = subject.replace(/^\[(.*)\]$/, "$1");
			}
		}
		if (!this.triple.store.subjectIndex[subject]) {
			return [];
		}
		this.triple.store.subjectIndex[subject].forEach(function(triple) {
			if (triple.predicate.value != predicate) {
				return;
			}
			if ((triple.object.termType == "Collection") && (triple.object.elements.length == 0)) {
				return; // empty collection, no need to add
			}
			triples.push(triple);
		});
		return triples;
	}

	this.getter = function() {
		var self = this;
		var objects = this.getObjects();
		if (!objects) {
			return;
		}
		if (this.dataBinding.mode == "field") {
			if (objects.length) {
				return objects[0].isBlank ? "[_:" + objects[0].value + "]" : objects[0].value;
				// follows the format as described in https://www.w3.org/TR/2008/REC-rdfa-syntax-20081014/#sec_5.4.5.
			}
			return;
		} else {
			var result = objects.map(function(object) {
				if (object.termType == "Collection") {
					return;
				}
				if (object.isBlank) {
					object.contents = self.getBlankNode(self, object.value);
				}
				return {
					value : (object.isBlank ? "[_:" + object.value + "]" : object.value),
					contents: object.contents
				};
			});
			return result;
		}
	};

	this.getFirstElementBinding = function(dataBinding) {
		for (var i=0; i<dataBinding.elements.length; i++) {
			if (dataBinding.elements[i] instanceof elementBinding) {
				return dataBinding.elements[i];
			}
		}
	};

	function bindChildren(item, newItem) {
		Object.keys(item).forEach(function(key) {
			var subItem;
			if (!item._bindings_ || !item._bindings_[key]) {
				return;
			}
			if (
				item._bindings_[key].elements.length &&
				self.getFirstElementBinding(item._bindings_[key]).element.getAttribute("typeof") 
			) {
				if (key !== "value") {
					subItem = new $rdf.BlankNode();
					item[key].about = "[_:" + newItem.value + "]";
					// console.log("created blank node " + subItem.value + " as child of " + newItem.value);
					self.triple.store.add(subItem, $rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), $rdf.sym(resolveNameSpace(self.getFirstElementBinding(item._bindings_[key]).element.getAttribute("typeof"))));
					self.triple.store.add(newItem, $rdf.sym(resolveNameSpace(self.getFirstElementBinding(item._bindings_[key]).element.getAttribute("property"))), subItem); // FIXME: this assumes it is nested one deep; It could be deeper though
					bindChildren(item[key], subItem);
					item._bindings_[key].resolve(true); // make sure the elements are resolved to have the correct 'about' value;
				}
			}
		});
	}

	function bindParents(value, subject) {
		value.forEach(function(item) {
			if (typeof item === "undefined") {
				return;
			}
			if (
				(typeof item.value === "undefined") ||
				((typeof item.value.about === "object") && (!item.value.about))
			) {
				var keys = Object.keys(item);
				var blankNode = new $rdf.BlankNode();
				item['value'] = "[_:" + blankNode.value + "]";
				// console.log("created blank node " + blankNode.value + " as parent");
				var predicate = self.getFirstElementBinding(item._bindings_['value']).element.getAttribute("property");
				if (!predicate) {
					predicate = self.getFirstElementBinding(item._bindings_['value']).element.parentNode.getAttribute("property");
				}
				if (!predicate) {
					return;
				}
				predicate = resolveNameSpace(predicate);
				self.triple.store.add(blankNode, $rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), $rdf.sym(resolveNameSpace(self.getFirstElementBinding(item._bindings_['value']).element.getAttribute("typeof"))));
				self.triple.store.add(self.triple.store.subjectIndex[subject][0].subject, $rdf.sym(predicate), blankNode);
				
				bindChildren(item, blankNode);
				setTimeout(function() {
					keys.forEach(function(key) {
						if (!item._bindings_ || !item._bindings_[key]) {
							return;
						}
						if (!item._bindings_[key].elements.length) {
							return;
						}
						var subject = self.getFirstElementBinding(item._bindings_[key]).element.closest("[about]").getAttribute("about");
						if (!self.triple.store.subjectIndex[subject]) {
							if (self.triple.store.subjectIndex["<" + subject + ">"]) {
								subject = "<" + subject + ">";
							} else if (self.triple.store.subjectIndex[subject.replace(/^\[(.*)\]$/, "$1")]) {
								subject = subject.replace(/^\[(.*)\]$/, "$1");
							}
						}
						if (!self.triple.store.subjectIndex[subject]) {
							return;
						}
						subject = self.triple.store.subjectIndex[subject][0].subject;
						var predicate = self.getFirstElementBinding(item._bindings_[key]).element.getAttribute("property");
						if (!predicate) {
							predicate = self.getFirstElementBinding(item._bindings_[key]).element.parentNode.getAttribute("property");
						}
						if (!predicate) {
							return;
						}
						predicate = resolveNameSpace(predicate);
						var value = item[key];
						if ((subject.isBlank ? "[_:" + subject.value + "]" : subject.value) === value) {
							return;
						}

						if (value && value.length && typeof value !== "object") {
							// console.log("adding " + predicate + " to " + subject);
							self.triple.store.add(subject, $rdf.sym(predicate), value);
						} else {
							if (!value || typeof value.forEach !== "function") {
								return;
							}
							bindParents(value, subject);
						}
							
						var triple = new tripleBinding(
							{
								store : self.triple.store,
								subject : subject.value,
								predicate: predicate,
								initFromStore : false
							},
							item._bindings_[key]
						);
						item._bindings_[key].bind(triple);
					});
				}, 10); // needs a bit to let the 'about' property get set;
			}
		});
	}				

	this.deleteBlankNode = function(store, node) {
		while (store.subjectIndex["_:" + node].length) {
			subEntry = store.subjectIndex["_:" + node][0];
			store.remove(subEntry);
			if (subEntry.object.termType === "BlankNode") {
				this.deleteBlankNode(store, subEntry.object.value);
			}
		}
	};

	this.setter = function(data) {
		var objects = this.getObjects();
		if (this.dataBinding.mode == "field") {
		/*
			if (data.indexOf("http") === 0) { // make it a symbol if it is a url
				data = $rdf.sym(data);
			}
		*/
			if (objects.length) {
				if ((data !== null) && (typeof data !== "undefined") && data !== "") {
					objects[0].value = data;
				} else {
					this.triple.store.remove(this.getTriples()[0]);
				}
			} else {
				console.log("create a new triple for value");
				console.log(data);
				console.log(this.triple);
				var subject = this.triple.subject;
				if (!this.triple.store.subjectIndex[subject]) {
					if (this.triple.store.subjectIndex["<" + subject + ">"]) {
						subject = "<" + subject + ">";
					} else if (this.triple.store.subjectIndex[subject.replace(/^\[(.*)\]$/, "$1")]) {
						subject = subject.replace(/^\[(.*)\]$/, "$1");
					}
				}
				if (!this.triple.store.subjectIndex[subject]) {
					return;
				}
				subject = this.triple.store.subjectIndex[subject][0].subject;
				if ((data !== null) && (typeof data !== "undefined") && data !== "") {
					this.triple.store.add(subject, $rdf.sym(this.triple.predicate), data);
				}
			}
		} else {
			var self = this;
			var subject = this.triple.subject;
			if (!this.triple.store.subjectIndex[subject]) {
				if (this.triple.store.subjectIndex["<" + subject + ">"]) {
					subject = "<" + subject + ">";
				} else if (this.triple.store.subjectIndex[subject.replace(/^\[(.*)\]$/, "$1")]) {
					subject = subject.replace(/^\[(.*)\]$/, "$1");
				}
			}
			if (!this.triple.store.subjectIndex[subject]) {
				return;
			}
			
			var dataNodes = data.map(function(entry) {
				return entry.value;
			});
			
			this.getTriples().forEach(function(entry) {
				if (dataNodes.indexOf(entry.object.isBlank ? "[_:" + entry.object.value + "]" : entry.object.value) === -1) {
					// node was removed;
					// console.log("remove node");
					// console.log(self.triple.subject);
					// console.log(self.triple.predicate);
					// console.log(entry.object.value);
					self.triple.store.remove(entry);
					if (entry.object.termType === "BlankNode") {
						self.deleteBlankNode(self.triple.store, entry.object.value);
					}
				}
			});
			setTimeout(function() {
				bindParents(data, subject);
			});
		}
		return data;
	};
	
	this.addListeners = function() {
	};

	this.removeListeners = function() {
	};

	this.resumeListeners = function() {
		this.triple.dataBindingPaused--;
		if (this.triple.dataBindingPaused < 0) {
			console.log("Warning: resume called of non-paused databinding");
			this.triple.dataBindingPaused = 0;
		}
	};
	this.pauseListeners = function() {
		this.triple.dataBindingPaused++;
	};

	this.fireEvent = function(event) {
	};
	this.isInDocument = function() {
		return true;
	};


	// Init triples from the rdfStore to start with;
	if (this.triple.initFromStore) {
		this.dataBinding.set(this.getter());
	}	
};

editor.field.storedInit = editor.field.init;
editor.list.storedInit = editor.list.init;


var initRdflibTriple = function(element) {
	if (
		(typeof element.dataBinding.config.data.value !== "undefined") &&
		((typeof element.dataBinding.config.data.value.about === "object") && (!element.dataBinding.config.data.value.about))
	) {
		// wait for the 'about' to be set;
		setTimeout(function() {
			initRdflibTriple(element);
		}, 250);
		return;
	}

	var about = element.closest("[about]");
	if (!about) {
		return;
	}
	if (!element.hasAttribute("property")) {
		return;
	}

	var subject = element.closest("[about]").getAttribute("about"); // FIXME: this goes wrong if the 'about' is slow to get set for new elements;
	var property = element.getAttribute("property");
	var initFromStore = true;
	if (element.getAttribute("data-set-to-store")) {
		initFromStore = false;
	}
	if (element.dataBinding) {
		if (
			!simplyApp.rdfStore.simplyDataBindings ||
			!simplyApp.rdfStore.simplyDataBindings[subject] ||
			!simplyApp.rdfStore.simplyDataBindings[subject][property]
		) {
			element.dataBinding.bind(
				new tripleBinding(
					{
						store: simplyApp.rdfStore,
						subject : subject,
						predicate : property,
						initFromStore: initFromStore
					},
					element.dataBinding
				)
			);
		}
	}
}

editor.field.init = function(field, dataParent, useDataBinding) {
	editor.field.storedInit(field, dataParent, useDataBinding);
	initRdflibTriple(field);
}
editor.list.init = function(list, dataParent, useDataBinding) {
	editor.list.storedInit(list, dataParent, useDataBinding);
	initRdflibTriple(list);
}
