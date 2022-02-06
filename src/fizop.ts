export interface Fizop {
  [key: string]: Op
}
export interface Op {
  label?: LocalizedLabel
  image?: ImageInfo
}

export interface LocalizedLabel {
  [lang: string]: string
}

export interface ImageInfo {
  unpkgPath?: string,
  url?: string,
  dataUri?: string
}