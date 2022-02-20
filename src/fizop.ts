export interface Fizop {
  [key: string]: Op
}
export interface Op {
  label?: LocalizedLabel | string
  image?: ImageInfo
}

export interface LocalizedLabel {
  [lang: string]: string
}

export enum ImageType {
  URL = "URL",
  UnpkgPath = "UnpkgPath",
  DataUri = "DataUri",
}

export interface ImageInfo {
  imgData: string,
  imgType: ImageType
}