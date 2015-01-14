/*
Copyright (c) 2015 Corentin Peltier c0rent1n.devel@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var browse_schema = {
	"v": { //views
		"t": { //translations 
			"load": {
				"func": function(f) { //f = browseView()
					main_djmLanguage.load(
						'translations',
						function() {
							if (typeof f == 'function') {
								f();
							}
						}
					);
				},
				"css": {
					"0": "translations"
				}
			},
			"m": {
				"priority": 0,
				"defaultValue": "e",
				"values": {
					"e": {
						"func": function(f) {
							$('#content').hide(
								'fade',
								{"direction": "left"},
								100,
								function() {
									$('#content').html('');
									if (typeof f == 'function') {
										f();
									}
									
									translations_initialize();
									
									$('#content').show(
										'fade',
										{"direction": "right"},
										300, 
										function() {
											translations_resize();
											main_titleUpdate();
										}
									);
								}
							);
						}
					}
				}
			}
		},
		"home": { //home
			"m": {
				"priority": 0,
				"defaultValue": "e",
				"values": {
					"e": {
						"func": function(f) {
							$('#content').hide(
								'fade',
								{"direction": "left"},
								100,
								function() {
									if (typeof f == 'function') {
										f();
									}
									$('#content').html($('<div id="home" style="visibility:hidden"/>'));
									// user_loadHome();
									
									// $('#bgContent').css('minHeight', 0);
									$('#home').css('visibility', 'visible');
									$('#content').show(
										'fade',
										{"direction": "right"},
										300, 
										function() {
											main_titleUpdate();
										}
									);
								}
							);
						}
					}
				}
			}
		},
		"introduction": { //introduction
			"m": {
				"priority": 0,
				"defaultValue": "e",
				"values": {
					"e": {
						"func": function(f) {
							$('#content').hide(
								'fade',
								{"direction": "left"},
								100,
								function() {
									if (typeof f == 'function') {
										f();
									}
									$('#content').html($('<div id="home" style="visibility:hidden"/>'));
									// user_loadHome();
									
									// $('#bgContent').css('minHeight', 0);
									$('#home').css('visibility', 'visible');
									$('#content').show(
										'fade',
										{"direction": "right"},
										300, 
										function() {
											main_titleUpdate();
										}
									);
								}
							);
						}
					}
				}
			}
		}
	}
}
var browse_hashes = {};
var browse_previousHashes;
var browse_storedCss = {};
var browse_storedScripts = {
	"callbackIncrement": 0,
	"scripts": {}
};

function browse_getCssOnce(relativePath) 
{
	if (!browse_storedCss.hasOwnProperty(relativePath)) {
		$('head').prepend('<link type="text/css" rel="stylesheet" media="screen" href="' + main_httpRoot + relativePath + '" />');
		browse_storedCss[relativePath] = true;
	}
}
function browse_getScriptOnce(relativePath, callback)
{
	if (browse_storedScripts.scripts.hasOwnProperty(relativePath)) {
		if (typeof callback == 'function') {
			if (browse_storedScripts.scripts[relativePath].loaded == true) {
				callback();
			} else {
				browse_storedScripts.callbackIncrement++;
				browse_storedScripts.scripts[relativePath].callbacks[browse_storedScripts.callbackIncrement] = function() {
					callback();
				};
			}
		}
	} else {
		browse_storedScripts.scripts[relativePath] = {
			loaded: false,
			callbacks: {}
		};
		if (typeof callback == 'function') {
			browse_storedScripts.callbackIncrement++;
			browse_storedScripts.scripts[relativePath].callbacks[browse_storedScripts.callbackIncrement] = function() {
				callback();
			};
		}
		$.getScript(main_httpRoot + relativePath)
			.done(function() {
				browse_storedScripts.scripts[relativePath].loaded = true;
				for (var key in browse_storedScripts.scripts[relativePath].callbacks) {
					browse_storedScripts.scripts[relativePath].callbacks[key]();
					
					delete browse_storedScripts.scripts[relativePath].callbacks[key];
				}
			}).fail(function(jqxhr, settings, exception) {
				 if (settings[0].readyState == 0){
					//failed to load
					main_dialog('error', 'failedToLoad');
				} else {
					//failed to parse
					main_dialog('error', 'failedToParseScript', {
						"script": relativePath,
						"exception": exception.toString()
					});
				}
			}
		);
	}
}

function browse_updateViewButtons(viewName) {
	$('.currentViewButton').removeClass('currentViewButton');
	$('.viewButton_' + viewName).addClass('currentViewButton');
}

function browse_changeView(viewName, optionalHashes)
{
	var v = browse_schema.v[browse_getHash('v')];
	for (var viewKey in v) {
		var hashKey = 'v_' + viewKey;
		var hashValue = browse_getHash(hashKey, true);
		if (hashValue) {
			delete browse_hashes[hashKey];
		}
	}
	browse_hashes.v = viewName;
	
	if (typeof optionalHashes == 'object') {
		for (hashKey in optionalHashes) {
			browse_hashes[hashKey] = optionalHashes[hashKey];
		}
	}
	
	oldLocationHash = location.hash;
	browse_putHashesOnUrl();
	
	if (oldLocationHash != location.hash) {
		browse_updateViewButtons(viewName);
	}
}


function browse_changePane(paneKey, paneValue)
{
	var currentValue = browse_getHash('p_' + paneKey);
	if (paneValue == currentValue || paneValue == 'close') {
		// if (browse_schema.p[paneKey].hasOwnProperty('options')) {
			// var paneOptions = browse_schema.p[paneKey].options;
			// for (var o in paneOptions) {
				// var hashKey = 'p_' + paneKey + '_' + o;
				// var hashValue = browse_getHash(hashKey, true);
				// if (hashValue) {
					// delete browse_hashes[hashKey];
				// }
			// }
		// }
		browse_removeHash('p_' + paneKey);
	} else {
		browse_setHash('p_' + paneKey, paneValue);
	}
}

function browse_initialize()
{
	if (!browse_getHash('v')) {
		// browse_setHash('v', 'p');
		browse_setHash('v', 'home');
	}
	$(window).bind('hashchange', function(e) { 
		browse_handleHashChange();
	});
	browse_handleHashChange();
}


function browse_handleHashChange()
{
	var urlHash = location.hash.substring(1);
	if (urlHash != '') {
		browse_hashes = {};
		var hashes = urlHash.split('+');
		for (var i = 0; i < hashes.length; i++) {
			if (typeof hashes[i] == 'string') {
				var hash = hashes[i].split('.');
				browse_hashes[hash[0]] = hash[1];
			}
		}
		browse_engine();
		// console.log(browse_previousHashes);
	}
}

function browse_reloadView(settings)
{	
	var v = browse_schema.v[browse_getHash('v')];
	for (var viewKey in v) {
		var hashKey = 'v_' + viewKey;
		var hashValue = browse_getHash(hashKey, true);
		if (hashValue) {
			delete browse_previousHashes[hashKey];
		}
	}
	
	browse_engine(settings);	
}

function browse_engine(settings)
{	
	// if (typeof settings == 'object') {
		// if (settings.disableFx == true) {
			// settings.oldDisableFx = $.fx.off;
		// }
	// }	
	
	var previousHashes = $.extend(true, {}, browse_hashes);
	
	//VIEW
	if (!browse_hashes.hasOwnProperty('v')) {
		return false;
	} else if (typeof browse_previousHashes == 'undefined' 
			   || browse_previousHashes.v != browse_hashes.v) {
		browse_updateViewButtons(browse_hashes.v);
	}
	
	// var view = jsonHashes.v;
	// delete jsonHashes.v;
	var browseView = function(viewName) {
		var v = browse_schema.v[viewName];
		var toDo = [];
		// console.log(browse_hashes);
		// console.log();
		for (var viewKey in v) {
			var hashKey = 'v_' + viewKey;
			var hashValue = browse_getHash(hashKey, true);
			if (browse_schema.v[viewName].hasOwnProperty(viewKey)
				&& browse_schema.v[viewName][viewKey].hasOwnProperty('values')
			) {
				var priority = (browse_schema.v[viewName][viewKey].hasOwnProperty('priority')
								? browse_schema.v[viewName][viewKey].priority
								: 0);
								
				if (hashValue
					&& browse_schema.v[viewName][viewKey].values.hasOwnProperty(hashValue)
				) {
					// var browseHash = browse_schema.v[viewName][viewKey].values[hashValue];
					// if (browseHash.hasOwnProperty(viewKey),
					// browse_schema.v[viewName]
					toDo.push({ 
						"priority": priority, 
						"browse": browse_schema.v[viewName][viewKey].values[hashValue],
						"key": viewKey,
						"value": hashValue
					});
				} else {
					if (browse_schema.v[viewName][viewKey].hasOwnProperty('defaultValue')) {
						var defaultValue = browse_schema.v[viewName][viewKey].defaultValue;
						toDo.push({ 
							"priority": priority, 
							"browse": browse_schema.v[viewName][viewKey].values[defaultValue],
							"key": viewKey,
							"value": defaultValue
						});
					}
				}
			}
		}
		
		toDo.sort(function(a, b) { 
			if (a.priority > b.priority) {
				return 1;
			} else if (a.priority < b.priority) {
				return -1;
			} 
			return 0;
		});
		
		getNestedScriptsAndFunctions(viewName, toDo, 0, false);
	}
	var getNestedScriptsAndFunctions = function(viewName, toDo, i, forced) {
		if (i < toDo.length) {
			// if (&& !(typeof previousHashes[hashKey] != 'undefined' //if already loaded
					 // && previousHashes[hashKey] == hashValue
				// )
			var hashKey = 'v_' + toDo[i]['key'];
			
			// console.log(hashKey + ': ' + browse_getHash(hashKey) + '==' + browse_previousHashes[hashKey]);
			if (!forced && typeof browse_previousHashes != 'undefined' && browse_getHash('v') == browse_previousHashes.v && browse_getHash(hashKey) == browse_previousHashes[hashKey]) {
			// console.log(browse_previousHashes);
			// console.log(hashKey + ': ' + browse_getHash(hashKey) + '==' + browse_previousHashes[hashKey]);
			// console.log(toDo[i]['key']);
			// console.log(toDo[i]['value']);
				getNestedScriptsAndFunctions(viewName, toDo, i + 1, false);
			} else {
				getCss(toDo[i]["browse"].css);
				getScripts(toDo[i]["browse"].scripts, function() {
					if (typeof toDo[i]["browse"].func == 'function') {
						toDo[i]["browse"].func(function() {
							// console.log(viewName);
							// console.log(toDo);
							getNestedScriptsAndFunctions(viewName, toDo, i + 1, true);
						});
					}
					if (typeof toDo[i]["browse"].scripts != 'undefined') {
						delete browse_schema.v[viewName][toDo[i]["key"]].values[toDo[i]["value"]].scripts;
					}
				});
			}
		}		
	}
	
	var getScripts = function(s, f) {
		var scriptsArray = [];
		for (scriptKey in s) {
			if (main_publicScripts.hasOwnProperty(s[scriptKey])) {
				scriptsArray[scriptKey] = main_publicScripts[s[scriptKey]];
			}
		}
		if (scriptsArray.length > 0) {
			var iLimit = scriptsArray.length - 1;
			var nestedCallbacks = [];
			nestedCallbacks[iLimit + 1] = function(i) {
				if (typeof f == 'function') {
					f();
				}
			};
			for (var i = iLimit; i >= 0; i--) {
				nestedCallbacks[i] = function(i) {
					browse_getScriptOnce(
						scriptsArray[iLimit - i], 
						nestedCallbacks[i + 1](i + 1)
					);
				};
			}
			// console.log(nestedCallbacks);
			browse_getScriptOnce(scriptsArray[0], nestedCallbacks[0](0));
		} else {
			if (typeof f == 'function') {
				f();
			}
		}
	}
	var getCss = function(css) {
		var cssArray = [];
		for (cssKey in css) {
			if (main_publicScripts.hasOwnProperty(css[cssKey])) {
				cssArray[cssKey] = main_publicCss[css[cssKey]];
			}
		}
		// console.log(cssArray);
		for (var i = 0; i < cssArray.length; i++) {
			browse_getCssOnce(cssArray[i]);
		}
	}
	
	if (browse_schema.v.hasOwnProperty(browse_hashes.v)) {
		// alert(browse_hashes['v']); //p
		// var functions = [];
		var view = browse_schema.v[browse_hashes.v];
		if (view.hasOwnProperty('load')) {
			getCss(view.load.css);
			getScripts(view.load.scripts, function() {
				view.load.func(function() {
					browseView(browse_hashes.v);
				});
				delete view.load;
				
			});
		} else {
			getCss(view.css);
			browseView(browse_hashes.v);
		}
	}
	
	
	//PANES
	var p = browse_schema.p;
	for (var paneKey in p) {
		if (browse_schema.p.hasOwnProperty(paneKey)
			// && browse_schema.p[paneKey].hasOwnProperty('values')
		) {
			var hashKey = 'p_' + paneKey;
			// if (typeof browse_previousHashes != 'undefined') {
				// console.log(hashKey + ': ' + browse_getHash(hashKey, true) + '==' + browse_previousHashes[hashKey]);
			// }
			if (typeof browse_previousHashes == 'undefined'
				|| browse_getHash(hashKey) != browse_previousHashes[hashKey]) {
				var hashValue = browse_getHash(hashKey, true);
				if (hashValue
					&& browse_schema.p[paneKey].values.hasOwnProperty(hashValue)
				) {
					// var browseHash = browse_schema.v[viewName][viewKey].values[hashValue];
					// if (browseHash.hasOwnProperty(viewKey),
					// console.log(browseHash);
					// browse_schema.p
					if (typeof browse_schema.p[paneKey].values[hashValue] == 'function') {
						browse_schema.p[paneKey].values[hashValue]();
					}
				} else {
					if (browse_schema.p[paneKey].hasOwnProperty('defaultValue')) {
						var defaultValue = browse_schema.p[paneKey].defaultValue;
						if (typeof browse_schema.p[paneKey].values[defaultValue] == 'function') {
							browse_schema.p[paneKey].values[defaultValue]();
						}
					}
				}
			}
					// alert('1');
			
			//Options
			if (browse_schema.p[paneKey].hasOwnProperty('options')) {
				for (var o in browse_schema.p[paneKey].options) {
					var option = browse_schema.p[paneKey].options[o];
					if (option.hasOwnProperty('values')) {
						var hashOption = 'p_' + paneKey + '_' + o;
						if (typeof browse_previousHashes == 'undefined'
							|| browse_getHash(hashOption) != browse_previousHashes[hashOption]) {
							var hashValue = browse_getHash(hashOption, true);
							// console.log(browse_schema.p[paneKey].options[o].values);
							if (hashValue !== false
								&& browse_schema.p[paneKey].options[o].values.hasOwnProperty(hashValue)
							) {
								if (typeof option.values[hashValue] == 'function') {
									option.values[hashValue]();
								}
							} else {
								if (option.hasOwnProperty('defaultValue')) {
									var defaultValue = option.defaultValue;
									if (typeof option.values[defaultValue] == 'function') {
										option.values[defaultValue]();
									}
								}
							}
						}
					}
				}
			}	
		}
	}
	browse_previousHashes = previousHashes;
}

// function main_initializeUrlHash()
// {
	// $(window).bind('hashchange', function(e) { 
		// main_initializeUrlHash();
	// });
	
	// var urlHash = location.hash.substring(1);
	// if (urlHash != '') {
		// var hashes = urlHash.split('+');
		// for (var i = 0; i < hashes.length; i++) {
			// if (typeof hashes[i] == 'string') {
				// var hash = hashes[i].split('.');
				// browse_hashes[hash[0]] = hash[1];
			// }
		// }
	// }
// }
//trigger browse_handleHashChange
function browse_putHashesOnUrl() 
{
	var urlHash = '';
	for (var hashKey in browse_hashes) {
		urlHash += '+' + hashKey + '.' + browse_hashes[hashKey];
	}
	location.hash = (urlHash.length > 0 ? urlHash.substring(1) : '');
}
function browse_getHash(hashKey, falseIfUndefined)
{
	var urlHash = location.hash.substring(1).split('+');
	var hashValue;
	if (typeof falseIfUndefined != 'undefined'
		&& falseIfUndefined == true
	) {
		hashValue = false;
	}
	for (var i = 0; i < urlHash.length; i++) {
		if (typeof urlHash[i] == 'string') {
			var hash = urlHash[i].split('.');
			if (hash[0] == hashKey) {
				hashValue = hash[1];
				break;
			}
		}
	}
	return hashValue;
}
function browse_setHash(hashKey, hashValue)
{
	// browse_previousHashes = $.extend(true, {}, browse_hashes);
	browse_hashes[hashKey] = hashValue;
	browse_putHashesOnUrl();
}
function browse_removeHash(hashKey)
{
	// browse_previousHashes = $.extend(true, {}, browse_hashes);
	delete browse_hashes[hashKey];
	browse_putHashesOnUrl();
}