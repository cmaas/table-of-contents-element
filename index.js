/**
 * @typedef {Object} HeadlineItem
 * @property {number} level Headline level
 * @property {string} id Id in document (anchor target)
 * @property {string} text Text of headline
 */

/**
 * @typedef {Object} TocItem
 * @property {number} level Item level
 * @property {string} text Text of link
 * @property {string} anchor Target of link
 * @property {Array<TocItem>} children Sub-items for this list item
 * @property {TocItem} parent Parent this item belongs to
 */

/**
 * Uses querySelectorAll to find headline elements.
 * @example
 * findHeadlineElements('h1, h2, h3')
 * @param {string} query Query string for querySelectorAll
 * @param {Document} doc Document
 * @returns {Array<HeadlineItem>}
 */
function findHeadlineElements(query, doc = document) {
    return Array.from(doc.querySelectorAll(query)).map((el) => ({
        level: parseInt(el.tagName.toLowerCase().replace('h', ''), 10),
        text: el.textContent,
        id: el.id
    }));
}

/**
 * Helper to get minimum headline level so that the TOC is nested correctly
 * @param {Array<HeadlineItem>} headlineItems Search these
 * @returns {number} Minimum level
 */
function getMinLevel(headlineItems) {
    return Math.min(...headlineItems.map(item => item.level));
}

/**
 * Helper that creates a TOCItem
 * @param {number} level
 * @param {string} text
 * @param {string} anchor
 * @param {TocItem} rootNode
 * @returns {TocItem}
 */
function addListItem(level, text, anchor, rootNode) {
    const listItem = { level, text, anchor, children: [], parent: rootNode };
    rootNode.children.push(listItem);
    return listItem;
}

/**
 * Turns a list of flat headline items into a nested tree object representing the TOC
 * @param {Array<HeadlineItem>} headlineItems
 * @returns {TocItem} Tree of TOC items
 */
function flatHeadlineItemsToNestedTree(headlineItems) {
    // create a root node with no text that holds the entire TOC. this won't be rendered, but only its children
    const toc = { level: getMinLevel(headlineItems) - 1, anchor: null, text: null, children: [], parent: null };
    // pointer that tracks the last root item of the current list
    let currentRootNode = toc;
    // pointer that tracks the last item (to turn it into a new root node if necessary)
    let prevListItem = currentRootNode;

    headlineItems.forEach(headlineItem => {
        if (headlineItem.level > prevListItem.level) {
            console.log('level up', headlineItem.text, currentRootNode.text, headlineItem.level - prevListItem.level);
            Array.from({ length: headlineItem.level - prevListItem.level }).forEach(() => {
                currentRootNode = prevListItem;
                prevListItem = addListItem(headlineItem.level, null, null, currentRootNode);
            });
            prevListItem.text = headlineItem.text;
            prevListItem.anchor = headlineItem.id;
            // if level is bigger, take the previous node, add a child list, set current list to this new child list
        }
        else if (headlineItem.level === prevListItem.level) {
            console.log('same level', headlineItem.text, currentRootNode.text);
            prevListItem = addListItem(headlineItem.level, headlineItem.text, headlineItem.id, currentRootNode);
            // if level is same, add to the current list
        }
        else if (headlineItem.level < prevListItem.level) {
            console.log('level down', headlineItem.text, headlineItem.level, prevListItem.level, currentRootNode.text);
            // if level is smaller, set current list to currentlist.parent
            for (let i = 0; i < prevListItem.level - headlineItem.level; i++) {
                currentRootNode = currentRootNode.parent;
            }
            prevListItem = addListItem(headlineItem.level, headlineItem.text, headlineItem.id, currentRootNode);
        }
    });

    return toc;
}

/**
 * Recursively turns a nested tree of tocItems to HTML.
 * @param {TocItem} tocItem
 * @returns {string}
 */
function tocItemToHtml(tocItem, listType) {
    if (listType !== 'ol' && listType !== 'ul') {
        listType = 'ul';
    }
    return '<' + listType + '>' + tocItem.children.map(childItem => {
        let li = '<li>';
        li += childItem.anchor
            ? `<a href="#${childItem.anchor}">${childItem.text}</a>`
            : childItem.text ? childItem.text : '';
        return li + (childItem.children.length > 0 ? tocItemToHtml(childItem, listType) : '') + '</li>';
    }).join('') + '</' + listType + '>';
}

function generateTocHtml(query, listType, doc = document) {
    if (!query) {
        query = 'h1, h2, h3, h4';
    }
    const headlineItems = findHeadlineElements(query, doc);
    if (headlineItems?.length <= 0) {
        return '';
    }
    const toc = flatHeadlineItemsToNestedTree(headlineItems);
    const html = tocItemToHtml(toc, listType);
    return html;
}

function findRenderTarget(element) {
    if (element.hasAttribute('data-toc-render-target')) {
        return element;
    }
    for (let child of element.children) {
        const result = findRenderTarget(child);
        if (result) {
            return result;
        }
    }
    return null;
}

class TableOfContents extends HTMLElement {

    #initialInnerHTML;

    connectedCallback() {
        // store for re-creating the TOC just in case render() is called manually from outside
        this.#initialInnerHTML = this.innerHTML;
        this.render();
    }

    render() {
        this.innerHTML = this.#initialInnerHTML;
        // store generated HTML in a template temporarily
        const template = document.createElement('template');
        template.innerHTML = generateTocHtml(this.getAttribute('selector'), this.getAttribute('listtype'));

        // renderTarget mode: if this element has children, check if there is one with a special data attribute
        // serving as anchor for where to place the list
        const renderTarget = findRenderTarget(this);
        if (renderTarget) {
            renderTarget.appendChild(template.content.cloneNode(true));
            return;
        }

        // default mode: append TOC at the end of its children (or empty body)
        this.appendChild(template.content.cloneNode(true));
    }
}

// define custom element only if it wasn't defined before
if (! customElements.get('table-of-contents')) {
    customElements.define('table-of-contents', TableOfContents);
}
