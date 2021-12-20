import { App, Editor, MarkdownView, Plugin } from 'obsidian';
import { stringify } from 'yaml';

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

function parsebody (body) {
	var itt = []
	let string
	const regexp = /(^|\s|\[|\()#([a-zA-Z_-\d-]+)/g
	var tags = body.matchAll(regexp)
	for (const match of tags) {
		string = match[0].toLocaleLowerCase().trim().substring(1)
		if (string.charAt(0) === "#") { string = string.substring(1) }
		itt.push(string)
	}
	return itt
}
export default class FmTags extends Plugin {
	async onload() {
		this.addCommand({
			id: 'fmtags_edit',
			name: 'Move tags to Frontmatter',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				const file = app.workspace.getActiveFile();
				let text = editor.getDoc().getValue();
				var frontMatter = JSON.parse(JSON.stringify(app.metadataCache.getFileCache(file)?.frontmatter));

				let end = frontMatter.position.end.line + 1;
				let content = text.split("\n").slice(end).join("\n");
				delete frontMatter["position"]

				const tags_in_body = parsebody(content)
				console.log(tags_in_body)
				
				if (frontMatter["Tags"]) {
					var tags_in_matter = frontMatter["Tags"].split(",")
					tags_in_matter = tags_in_matter.map(tagg => tagg.toLocaleLowerCase().trim())
				} else {
					var tags_in_matter = []
				}
				
				var all_tags=arrayUnique(tags_in_matter.concat(tags_in_body));
				if (all_tags.length >= 1) {
					frontMatter["Tags"] = all_tags.join(", ")
				} else {
					delete frontMatter["Tags"]
				}
				const final_content = `---\n${stringify(frontMatter)}---\n${content}`;
				editor.setValue(final_content)
			}
		});

	}
	onunload() {
	}
}