import yaml from 'js-yaml';
import fs from 'fs';
import { YamlFileType } from './type';
import config from '../../yamler.config'
import getValue from 'get-value'

const yamlToStringfyHtml = (path?: string, newElement = '') =>{
    const {build:{entry,output}} = config
    const yamlContent = fs.readFileSync(path ?? entry, 'utf8');
    const content = yaml.load(yamlContent) as YamlFileType;
    const {element,attributes, children,state} = content

    newElement += `<${element} `

    Object.keys(attributes).forEach(attr=>{
        let value = attributes[attr]
        if(typeof value === "string"){
            newElement += `${attr}="${getValue(state,value) ?? value}" `
        }else{
            value = Object.keys(value).map((key)=>{
                const keyValue = value[key as keyof typeof value]
                return `${key}: ${getValue(state, keyValue)??keyValue}`;
            }).join('; ')
            newElement += `${attr}="${value}" `
        }
    })

    newElement += '>'

    if(children){
        yamlToStringfyHtml(children,newElement)
    }else{
        newElement += `<${element}>`
    }

    const html = `<!DOCTYPE html>
    <html>
    <head>
        <title>My Vanilla JavaScript Project</title>
    </head>
    <body>
        ${newElement}
    </body>
    </html>`

    const distPath = output ?? './dist'
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
        console.log('Directory created successfully.');
    } else {
        console.log('Directory already exists.');
    }

    fs.writeFile('dist/index.html',html, (err:any) => {
        if (err) {
            console.error('Error writing the file:', err);
        } else {
            console.log('File has been written successfully.');
        }
    })
}
