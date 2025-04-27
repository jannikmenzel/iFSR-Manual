/* global marked */
let tocData = [];

// fetches the list of markdown files from index.txt
async function loadMarkdownFiles() {
    const response = await fetch('index.txt');
    const text = await response.text();
    return text.split('\n').map(line => line.trim()).filter(line => line);
}

// parses headings from all markdown files to build the TOC
async function indexMarkdownFiles() {
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = '';

    const markdownFiles = await loadMarkdownFiles();

    for (const file of markdownFiles) {
        const response = await fetch(file);
        const text = await response.text();
        const htmlContent = marked.parse(text);
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headings.forEach((heading, index) => {
            const level = parseInt(heading.nodeName[1]);
            const id = `section-${file}-${index}`;
            tocData.push({
                file: file,
                id: id,
                level: level,
                text: heading.textContent
            });
        });
    }
}

// loads a markdown file, renders it to the page, restores scroll position, and updates TOC
async function loadMarkdown(file, scrollToFirst = true) {
    const response = await fetch(file);
    let text = await response.text();

    text = text.replace(/\[.*?]\(\/assets\//g, '[$&](assets/');

    document.getElementById('content').innerHTML = marked.parse(text);

    const savedScroll = localStorage.getItem(`scroll-${file}`);

    const links = document.querySelectorAll('#sidebar a');
    links.forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(links).find(link => link.getAttribute('onclick')?.includes(file));
    if (activeLink) {
        activeLink.classList.add('active');
    }

    generateTOC(file);

    if (scrollToFirst) {
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll));
        } else {
            const firstTOCItem = document.querySelector('#toc-list a');
            if (firstTOCItem) {
                const firstHeading = document.getElementById(firstTOCItem.getAttribute('href').substring(1));
                if (firstHeading) {
                    firstHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }
    localStorage.setItem('lastOpenedFile', file);

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80% 0px',
        threshold: 0
    };

    let activeId = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeId = entry.target.id;
                document.querySelectorAll('#toc a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    const headings = document.querySelectorAll('#content h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => observer.observe(heading));
}

// generates the TOC based on heading elements in the loaded markdown content
function generateTOC(file) {
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = '';
    const headings = document.querySelectorAll('#content h1, h2, h3, h4, h5, h6');

    headings.forEach((heading, index) => {
        if (heading.textContent.trim().toLowerCase() === 'inhaltsverzeichnis') {
            return;
        }
        const level = parseInt(heading.nodeName[1]);
        const id = `section-${file}-${index}`;
        heading.id = id;
        const anchor = document.createElement('span');
        anchor.id = id;
        anchor.style.position = 'relative';
        anchor.style.top = '-50px';
        heading.before(anchor);
        const tocItem = document.createElement('li');
        const tocLink = document.createElement('a');
        tocLink.href = `#${id}`;
        tocLink.textContent = heading.textContent;
        tocItem.style.marginLeft = `${(level - 1) * 20}px`;
        tocItem.appendChild(tocLink);
        tocList.appendChild(tocItem);
    });
}

window.onload = async function () {
    try {
        await indexMarkdownFiles();
        const lastFile = localStorage.getItem('lastOpenedFile') || 'docs/Einleitung.md';
        await loadMarkdown(lastFile);
    } catch (error) {
        console.error('Error indexing markdown files:', error);
    }
};

const searchInput = document.getElementById('searchInput');

// implements simple search over headings and scrolls to the matching section
searchInput.addEventListener('input', async function () {
    const query = this.value.toLowerCase();
    let found = false;

    for (const item of tocData) {
        const headingText = item.text.toLowerCase();

        if (headingText.includes(query)) {
            await loadMarkdown(item.file, false);
            found = true;
            const heading = document.getElementById(item.id);
            if (heading) {
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        }
    }
});

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