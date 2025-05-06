// Generate TOC from headings in #content
function generateTOC() {
    const content = document.getElementById('content');
    const tocList = document.getElementById('toc-list');
    if (!content || !tocList) return;

    const headings = content.querySelectorAll('h1, h2, h3');
    tocList.innerHTML = '';

    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }

        const li = document.createElement('li');
        li.classList.add(`toc-${heading.tagName.toLowerCase()}`);

        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;

        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', generateTOC);


const toggleButton = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

// toggles sidebar visibility on small screens
toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// automatically hides the sidebar after a link click on smaller screens
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 1000) {
            sidebar.classList.remove('show');
        }
    });
});

// sync scrolling of TOC and content
const tocElement = document.getElementById('toc');
const contentElement = document.getElementById('content');
let isSyncingScroll = false;

function syncScroll(source, target) {
    if (isSyncingScroll) return;
    isSyncingScroll = true;

    const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);

    setTimeout(() => { isSyncingScroll = false; }, 20);
}

if (tocElement && contentElement) {
    tocElement.addEventListener('scroll', () => syncScroll(tocElement, contentElement));
    contentElement.addEventListener('scroll', () => syncScroll(contentElement, tocElement));
}
