const yaml = require( 'js-yaml');
const fs = require('fs');
const getValue = require('get-value')

const readAndConvertYamlElement = (path) =>{
    const yamlContent = fs.readFileSync(path, 'utf8');
    const content = yaml.load(yamlContent);
    return content;
}

const handleSingleChildren = ({children, app, section, state})=>{
    if(typeof children === "string"){
        if(fs.existsSync(children)){
            const content = readAndConvertYamlElement(children);
            concatElement(content, app, section)
        }else{
            app[section] += getValue(state, children) ?? children
        }
    }else{
        concatElement(children, app, section)
    }
}

const concatElement = (value, app, section)=>{
    const {element,attributes, children, state} = value;
    app[section] += `<${element} `

    if(attributes){
        Object.keys(attributes).forEach(attr=>{
            let value = attributes[attr]
            if(typeof value === "string"){
                app[section] += `${attr}="${getValue(state,value) ?? value}" `
            }else{
                value = Object.keys(value).map((key)=>`${key}: ${getValue(state,value[key]) ?? value[key]}`).join('; ')
                app[section] += `${attr}="${value}" `
            }
        })
    }

    app[section] += `>`

    const endElement = `</${element}>`
    if(!children){
        app[section] += endElement
        return
    }

    if(Array.isArray(children)){
        children.forEach((child)=>handleSingleChildren({children:child, app, state, section}))
    }else{
        handleSingleChildren({children, app, state, section})
    }

    app[section] += endElement
}

const yamlToStringfyHtml = (bodyPath = 'src/index.yaml', headerPath = 'src/header.yaml', footerPath = 'src/footer.yaml') =>{
    const app = {
        bodyElement:'',
        headerElement:'',
        footerElement: ''
    }

    if(fs.existsSync(bodyPath)){
        const body = readAndConvertYamlElement(bodyPath)
        concatElement(body, app, 'bodyElement')
    }else{
        throw new Error(`the root of the project ${bodyPath} doesnt exist`)
    }

    if(fs.existsSync(headerPath)){
        const header = readAndConvertYamlElement(headerPath)
        concatElement(header, app, 'headerElement')
    }

    if(fs.existsSync(footerPath)){
        const footer = readAndConvertYamlElement(footerPath)
        concatElement(footer, app, 'footerElement')
    }

    const html = `<!DOCTYPE html>
    <html>
    <head>
        ${app.headerElement ?? '<title>My yamler Project</title>'}
    </head>
    <body>
        ${app.bodyElement}
    </body>
    ${app.footerElement ? `<footer>${app.footerElement}</footer>`:''}
    </html>`

    const distPath = './dist'
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
    }

    fs.writeFile('dist/index.html',html, (err) => {
        if (err) {
            console.error('Error writing the file:', err);
        } else {
            console.log('Build successfully into dist/index.html.');
        }
    })
}

yamlToStringfyHtml(process.argv.slice(2)[0], process.argv.slice(2)[1], process.argv.slice(2)[2])
