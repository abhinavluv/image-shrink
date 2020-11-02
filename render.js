const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const img = document.getElementById('img');
const save = document.getElementById('save');

document.getElementById('output-path').innerText = path.join(
    os.homedir(),
    'Image Shrink'
);

// On Submit
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const imgPath = img.files[0].path;
    // console.log('Image Path render.js: ', imgPath);
    const quality = slider.value;

    ipcRenderer.send('image:minimize', {
        imgPath,
        quality,
    });
});

// On Done
ipcRenderer.on('image:done', () => {
    let toastHTML = `<span>Image Resized to ${slider.value}% Quality</span>`;
    M.toast({
        html: toastHTML,
    });
});

// Select path and Save there
