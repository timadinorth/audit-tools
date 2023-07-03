#!/usr/bin/env node

const parser = require('@solidity-parser/parser');
const fs = require('fs');

function attack_surface(files, modifiers_filter) {
	for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
		var file = _step.value;
		var content = fs.readFileSync(file).toString('utf-8');
		var ast = parser.parse(content);
		var level = 0;
		var omit = false;
		parser.visit(ast, {
			ContractDefinition: function ContractDefinition(node) {
				var name = node.name;
				var bases = node.baseContracts.map(function (spec) {
					return spec.baseName.namePath;
				}).join(', ');
				var specs = '';
				if (node.kind === 'library') {
					specs += noColorOutput ? '[Lib]' : '[Lib]'.yellow;
				}
				if (node.kind != 'interface') {
					console.log(' + ' + specs + ' ' + name + ' ' + bases);
					level += 1;
					omit = false;
				} else {
					omit = true;
				}
			},
			'ContractDefinition:exit': function ContractDefinitionExit(node) {
				if (level > 0) {
					console.log('');
					level = 0
				}
			},
			FunctionDefinition: function FunctionDefinition(node) {
				var name = void 0;
				var omit_function = false;
				if (node.isConstructor) {
					name = '<Constructor>';
				} else if (node.isFallback) {
					name = '<Fallback>';
				} else if (node.isReceiveEther) {
					name = '<Receive Ether>';
				} else {
					name = node.name;
				}
				var spec = '';
				if (node.visibility === 'public' || node.visibility === 'default') {
					spec += '[Pub]'
				} else if (node.visibility === 'external') {
					spec += '[Ext]'
				}
				if ((!omit) && (!node.isConstructor) && (!node.stateMutability) && (node.visibility != 'private') && (node.visibility != 'internal')) {
					var payable = '';
					if (node.stateMutability === 'payable') {
						payable = noColorOutput ? ' ($)' : ' ($)'.yellow;
					}
					var modifiers = '';
					var _iteratorNormalCompletion2 = true;
					for (var _iterator2 = node.modifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var m = _step2.value;
						if (modifiers_filter.includes(m.name)) {
							omit_function = true
							break
						}
						if (!!modifiers) modifiers += ',';
						modifiers += m.name;						
					}
					if (!omit_function) {
						console.log('    - ' + spec + ' ' + name + payable);
						if (!!modifiers) {
							console.log('       - modifiers: ' + modifiers);
						}
					}
				}
			},
		});
	}
}

require('yargs')
	.usage('$0 <cmd> [args]')
	.command('attack <files..>', 'show attack surface', (yargs) => {
		yargs
			.positional('files', {
				describe: 'files to analyze',
				type: 'string'
			})
			.option('m', {
				alias: 'modifiers',
				type: 'array',
				default: [],
				desc: 'List of modifiers to filter out functions by'
			});
	}, (argv) => {
		attack_surface(argv.files, argv.modifiers)
	})
	.help()
	.alias('h', 'help')
	.version()
	.alias('v', 'version')
	.argv;
