export async function loadTemplate(templatePath) {
    let html = await fetch(
        templatePath
    ).then(r => r.text())

    let innerHTML = _.unescape(html);
    let template = _.template(innerHTML);
    return template
}