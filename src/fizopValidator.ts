import _ from 'lodash'
import Ajv, {JSONSchemaType} from 'ajv'
import {Fizop, Op, LocalizedLabel, ImageType } from 'fizop'
import fs from 'fs'
import validDataUrl from 'valid-data-url'

// LocalizedLabel and ImageInfo should be separately referenced schemas
// but since 'nullable' doesn't extend const https://ajv.js.org/json-schema.html#nullable
// Op is written as one large schema with nullable properties

const LocalizedLabelSchema: JSONSchemaType<LocalizedLabel> = {
  type: "object",
  patternProperties: {
    ".*": { // ISO 639-1 recommended
      type: "string"
    },
  },
  required: []
}

const opSchema: JSONSchemaType<Op> = {
  type: "object",
  properties: {
    label: { // LocalizedLabel schema
      nullable: true,
      type: ["object", "string"],
      required: [],
      oneOf: [
        LocalizedLabelSchema,
        { type: "string" }
      ]
    },
    image: { // ImageInfo schema
      type: "object",
      nullable: true,
      properties: {
        imgData: {type: "string"},
        imgType: {type: "string"},
      },
      required: ["imgData", "imgType"]
    }
  },
  required: []
}

const fizopSchema: JSONSchemaType<Fizop> = {
  type: "object",
  patternProperties: {
    ".*": opSchema
  },
  required: []
}
const ajv = new Ajv({ allowUnionTypes: true })
const validateFizopSchema = ajv.compile(fizopSchema)

interface FizopError {
  opName: string,
  message: string
}

function getLabelLangSet(operator: Op): Set<string> {
  const label = operator.label ?? {}
  const labelObj = (_.isObject(label)) ? label : {}
  return new Set<string>(Object.keys(labelObj))
}

export function validateLocaleConsistency(fizop: Fizop): Array<FizopError> {
  // check that all labels have the same set of locales
  const fizopKeys = Object.keys(fizop)
  if (fizopKeys.length === 0) {
    return []
  }

  let errorList: Array<FizopError> = []
  const firstLocaleSet = getLabelLangSet(fizop[fizopKeys[0]])
  const firstLocalesArr = Array.from(firstLocaleSet)
  for (const [operatorName, op] of Object.entries(fizop)) {
    const thisLocaleSet = getLabelLangSet(op)
    const thisLocaleArr = Array.from(thisLocaleSet)
    const missingLangs = firstLocalesArr.filter(locale => !thisLocaleSet.has(locale));
    missingLangs.forEach(locale => { 
      errorList.push({
        opName: operatorName,
        message: 'Missing locale ' + locale
      })
    })
    const extraLangs = thisLocaleArr.filter(locale => !firstLocaleSet.has(locale));
    extraLangs.forEach(locale => { 
      errorList.push({
        opName: operatorName,
        message: 'Extra locale ' + locale
      })
    })
  }
  return errorList
}

export function validateLocaleFormats(fizop: Fizop): Array<FizopError> {
  let errorList: Array<FizopError> = []
  let seenLocales = new Set<string>()

  for (const [operatorName, op] of Object.entries(fizop)) {
    const thisLocaleSet = getLabelLangSet(op)
    thisLocaleSet.forEach(locale => {
      if (!seenLocales.has(locale)) {
        try {
          Intl.getCanonicalLocales(locale);
        } catch {
          errorList.push({opName: operatorName, message: 'Invalid locale ' + locale})
        }
        seenLocales.add(locale)
      }
    })
  }
  return errorList
}

export function isValidDataUriFormat(input: string): Boolean {
  return validDataUrl(input)
}

export function isValidPathFormat(path: string): Boolean {
  try {
    return fs.existsSync(path)
  } catch {
    return false
  }
}

export function isValidUrlFormat(url: string): Boolean {
  try { 
    return Boolean(new URL(url))
  } catch {
    return false
  }
}

export function validateImages(fizop: Fizop): Array<FizopError> {
  let errorList: Array<FizopError> = []
  for (const [operatorName, op] of Object.entries(fizop)) {
    const imgObj = op.image
    if (imgObj) {
      let isValidFormat : Function = () => false
      switch(imgObj.imgType) {
        case ImageType.DataUri:
          isValidFormat = isValidDataUriFormat
          break
        case ImageType.UnpkgPath:
          isValidFormat = isValidPathFormat
          break
        case ImageType.URL:
          isValidFormat = isValidUrlFormat
          break
        default:
          errorList.push({opName: operatorName, message: 'Invalid imgType ' + imgObj.imgType})
          break
      }
      if (!isValidFormat(imgObj.imgData)) {
        errorList.push({
          opName: operatorName,
          message: 'Invalid imgeData ' + imgObj.imgData + ' for imgType ' + imgObj.imgType
        })
      }
    }
  }
  return errorList;
}

export function validateFizop(fizop: any, isStrict: Boolean = true): any {
  const isSchemaValid = validateFizopSchema(fizop)
  if (!isSchemaValid) {
    return validateFizopSchema.errors
  }
  let errorList = [] as any[]
  if (isStrict) {
    errorList.push(...validateLocaleConsistency(fizop))
    errorList.push(...validateLocaleFormats(fizop))
    errorList.push(...validateImages(fizop))
  }
  return errorList
}

export function isValidFizop(fizop: any, isStrict: Boolean = true): Boolean {
  return _.isEmpty(validateFizop(fizop, isStrict))
}