import { readFile } from 'fs/promises'
import { Fizop } from 'fizop'
import { validateFizop } from 'fizopValidator'

function makeFizop(candidateObj: object): Fizop {
  const validationErrors = validateFizop(candidateObj)
  if (validationErrors !== []) {
    throw(validationErrors)
  }
  const newFizop = <Fizop>candidateObj
  return newFizop
}

export async function retrieveFizopFromPath(filePath: string): Promise<Fizop> {
  return readFile(filePath)
    .then(content => JSON.parse(content.toString()))
    .then(obj => makeFizop(obj))
}

export async function retrieveFizopFromURL(url: string): Promise<Fizop> {
  return fetch(new Request(url))
    .then(resp => resp.json())
    .then(obj => makeFizop(obj))
}

export async function retrieveFizopFromNpm(npmPkgName: string): Promise<Fizop> {
  return retrieveFizopFromURL("https://unpkg.com/" + npmPkgName + "/fizop.json")
}