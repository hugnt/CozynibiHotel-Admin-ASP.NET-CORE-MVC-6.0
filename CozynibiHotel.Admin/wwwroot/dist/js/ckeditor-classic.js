// ckeditor.js
import ClassicEditor from 'https://cdn.ckeditor.com/ckeditor5/38.1.0/classic/ckeditor.js';

let editor;
ClassicEditor
	.create(document.querySelector('#editor'))
	.then(newEditor => {
		editor = newEditor;
	})
	.catch(error => {
		console.error(error);
	});

export default editor;