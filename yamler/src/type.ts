export type YamlFileType = {
    element:string;
    attributes:Record<string, string | Record<string,string>>;
    children:string;
    state:Record<string,any>
}

export type BuildConfigType = {
    entry: string;
    output?: string;
}
export type YamlerConfigType = {
    build: BuildConfigType
}