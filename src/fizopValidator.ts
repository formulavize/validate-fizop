import Ajv, {JSONSchemaType} from "ajv"
import {Fizop, Op } from 'fizop'

// LocalizedLabel and ImageInfo should be separately referenced schemas
// but since 'nullable' doesn't extend const https://ajv.js.org/json-schema.html#nullable
// Op is written as one large schema with nullable properties
const opSchema: JSONSchemaType<Op> = {
  type: "object",
  properties: {
    label: { // LocalizedLabel schema
      type: "object",
      nullable: true,
      patternProperties: {
        ".*": { // ISO 639-1 recommended
          type: "string"
        },
      },
      required: []
    },
    image: { // ImageInfo schema
      type: "object",
      nullable: true,
      properties: {
        unpkgPath: {type: "string", nullable: true},
        url: {type: "string", nullable: true},
        dataUri: {type: "string", nullable: true}
      },
      required: []
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
const ajv = new Ajv()
export const validateFizop = ajv.compile(fizopSchema)
