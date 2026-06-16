// Notion to VS Code Link Opener - Content Script

(function() {
    console.log('[Notion-VSCode] Extension activated.');

    // Regex to match vscode://file/... and vscode-insiders://file/... with single or multiple slashes
    const VSCODE_REGEX = /(vscode|vscode-insiders):\/\/file\/+\S+/gi;

    /**
     * Recursively scans DOM nodes to find text nodes containing VS Code URIs.
     * When found, adds the styling class and stores the URI on the parent element.
     */
    function scanNode(node) {
        if (!node) return;

        // Skip script, style, and iframe elements
        const ignoreTags = ['SCRIPT', 'STYLE', 'IFRAME'];
        if (node.parentElement && ignoreTags.includes(node.parentElement.tagName)) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            // Use matchAll to find all matches in the text node
            const matches = [...text.matchAll(VSCODE_REGEX)];
            if (matches.length > 0) {
                const parent = node.parentElement;
                if (parent) {
                    // Avoid scanning if already processed
                    if (parent.classList.contains('notion-vscode-link')) {
                        return;
                    }

                    // Extract the first match URL and strip trailing punctuation (e.g. dots, parentheses)
                    let rawUrl = matches[0][0];
                    let cleanUrl = rawUrl.replace(/[\.,\)\}\]\*]+$/, '');

                    // Add our styled class and store the clean URL in a data attribute
                    parent.classList.add('notion-vscode-link');
                    parent.dataset.vscodeUrl = cleanUrl;
                    parent.title = `Click to open in VS Code: ${cleanUrl}`;
                }
            }
        } else {
            // Recursively scan children
            for (let i = 0; i < node.childNodes.length; i++) {
                scanNode(node.childNodes[i]);
            }
        }
    }

    // Run the initial scan on the body
    if (document.body) {
        scanNode(document.body);
    }

    // Set up a MutationObserver to process dynamically loaded or edited content
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    scanNode(mutation.addedNodes[i]);
                }
            } else if (mutation.type === 'characterData') {
                scanNode(mutation.target);
            }
        }
    });

    // Start observing DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Capture click events globally to intercept VS Code link clicks before Notion handles them
    document.body.addEventListener('click', (event) => {
        const linkEl = event.target.closest('.notion-vscode-link');
        if (linkEl && linkEl.dataset.vscodeUrl) {
            // Prevent default browser/Notion actions and stop propagation
            event.preventDefault();
            event.stopPropagation();

            const url = linkEl.dataset.vscodeUrl;
            console.log(`[Notion-VSCode] Opening: ${url}`);

            // Direct location assignment opens the registered local OS protocol handler
            window.location.href = url;
        }
    }, true); // Run in the capturing phase to intercept events first
})();
