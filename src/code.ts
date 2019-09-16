// Init empty data
let data;
let fills = 0;

// Options for UI
const options = {
	width: 375,
	height: 300
};

// Start plugin and show the UI
figma.showUI(__html__, options);

figma.ui.onmessage = async msg => {
	const { type, content } = msg;

	if (type === 'get-url') {
		getURL();
	}

	if (type === 'set-url') {
		setURL(msg.content).then(getURL);
	}

	// Set data to content of received-data message
	if (type === 'received-data') {
		data = msg.content;
	}

	// Cancel button is pressed
	if (type === 'cancel') {
		figma.closePlugin();
		return;
	}

	// Replace text button is pressed
	if (type === 'replace-text') {
		// Create const and assign it the selection
		const nodes = figma.currentPage.selection;
		const dataSource = data[content];

		// Check if anything is selected and if it's a text layer
		nodes.forEach(function(node) {
			if (!node) {
				figma.ui.postMessage('no-selection');
			} else if (node.type != 'TEXT') {
				figma.ui.postMessage('non-text');

				return;
			}

			if (msg.sorting === 'random') {
				// Generate random number
				const random = genNumber(dataSource.length);

				// Replace with random value picked from array
				replaceText(node, dataSource[random]);
			} else if (msg.sorting === 'original') {
				// Replace with value based on amount of times filled
				replaceText(node, dataSource[fills]);

				if (fills === dataSource.length - 1) {
					// Start at beginning of array again if end is reached
					fills = 0;
				} else {
					// Add +1 to the amount of times a text node has been filled
					fills++;
				}
			}
		});
	}
};

function genNumber(max) {
	// Generate random number between start of array and last item of array
	return Math.floor(Math.random() * max);
}

// Set URL to ClientStorage
async function setURL(url) {
	await figma.clientStorage.setAsync('url', url);
}

// Get the URL from ClientStorage
async function getURL() {
	await figma.clientStorage.getAsync('url').then(str => {
		if (str != undefined) {
			figma.ui.postMessage(str);
			return;
		}

		figma.ui.postMessage('no-url');
	});
}

async function replaceText(node, content) {
	// Get the font of the selected node and load it async
	await figma.loadFontAsync(node.fontName);

	// Set the node it's characters to the message we passed to this function
	node.characters = String(content);
}
