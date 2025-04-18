/* global marked */
let tocData = [];

async function loadMarkdownFiles() {
    const response = await fetch('index.txt');
    const text = await response.text();
    return text.split('\n').map(line => line.trim()).filter(line => line);
}

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

async function loadMarkdown(file, scrollToFirst = true) {
    const response = await fetch(file);
    const text = await response.text();
    document.getElementById('content').innerHTML = marked.parse(text);
    const links = document.querySelectorAll('#sidebar a');
    links.forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(links).find(link => link.getAttribute('onclick')?.includes(file));
    if (activeLink) {
        activeLink.classList.add('active');
    }
    generateTOC(file);

    if (scrollToFirst) {
        const firstTOCItem = document.querySelector('#toc-list a');
        if (firstTOCItem) {
            const firstHeading = document.getElementById(firstTOCItem.getAttribute('href').substring(1));
            if (firstHeading) {
                firstHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
}

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
        await loadMarkdown('docs/Einleitung.md');
    } catch (error) {
        console.error('Error indexing markdown files:', error);
    }
};

const searchInput = document.getElementById('searchInput');

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

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});
