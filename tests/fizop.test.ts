import { 
  validateFizop, 
  validateLocaleConsistency,
  validateLocaleFormats,
  validateImages,
  isValidDataUriFormat,
  isValidPathFormat,
  isValidUrlFormat
} from 'fizopValidator'
import { ImageType } from 'fizop'

describe('op validation', () => {

  test('empty fizop is valid', () => {
    const emptyFizop = {}
    expect(validateFizop(emptyFizop)).toEqual([])
  });

  test('empty op is valid', () => {
    const oneEmptyOp = {'test': {}}
    expect(validateFizop(oneEmptyOp)).toEqual([])
  });

  test('non-object op is invalid', () => {
    const stringMap = {'test': 'invalid'}
    expect(validateFizop(stringMap)).toHaveLength(1)
  });

  test('op with extraneous labels only', () => {
    const labelImgExtra = {
      'test': {'extra': '', 'info': 'test'}
    }
    expect(validateFizop(labelImgExtra)).toEqual([])
  });

  test('op with label, image, and extra property is valid', () => {
    const labelImgExtra = {
      'test': {
        'label': {'en': 'English'},
        'image': {
          'imgType': 'URL', 
          'imgData': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png'
        },
        'extra': ''
      }
    }
    expect(validateFizop(labelImgExtra)).toEqual([])
  });

  test('multiple ops are valid', () => {
    const multipleOps = {
      'test': {'label': {'en': 'English'}},
      'test2': {'label': {'en': 'English'}},
    }
    expect(validateFizop(multipleOps)).toEqual([])
  });

});

describe('label validation', () => {
  test('empty label is valid', () => {
    const emptyLabel = {'test': {'label': {}}}
    expect(validateFizop(emptyLabel)).toEqual([])
  });

  test('string label is valid', () => {
    const stringLabel = {'test': {'label': '🍪'}}
    expect(validateFizop(stringLabel)).toEqual([])
  });

  test('number label is invalid', () => {
    const numLabel = {'test': {'label': 0}}
    expect(validateFizop(numLabel)).toHaveLength(1)
  });

  test('monolingual label is valid', () => {
    const monolingualLabel = {'test': {'label': {'en': 'English'}}}
    expect(validateFizop(monolingualLabel)).toEqual([])
  });

  test('bilingual label is valid', () => {
    const bilingualLabel = {'test': {'label': {'en': 'English', 'fr': 'français'}}}
    expect(validateFizop(bilingualLabel)).toEqual([])
  });

  test('consistent label locales are valid', () => {
    const consistentLocaleLabel = {
      'flour': {'label': {'en': 'flour', 'fr': 'farine'}},
      'water': {'label': {'en': 'water', 'fr': 'eau'}}
    }
    expect(validateLocaleConsistency(consistentLocaleLabel)).toEqual([])
  });

  test('inconsistent label locales are invalid', () => {
    const inconsistentLocaleLabel = {
      'flour': {'label': {'en': 'flour', 'fr': 'farine'}},
      'water': {'label': {'en': 'water'}}
    }
    expect(validateLocaleConsistency(inconsistentLocaleLabel)).toHaveLength(1)
  });

  test('label locale with region is valid', () => {
    const regionLabel = {'eggplant': {'label': {'en-US': 'Eggplant', 'en-GB': 'Aubergine'}}}
    expect(validateLocaleFormats(regionLabel)).toEqual([])
  });

  test('invalid locales are invalid', () => {
    const invalidLocaleLabel = {'test': {'label': {'_': '?'}}}
    expect(validateLocaleFormats(invalidLocaleLabel)).toHaveLength(1)
  });

});

describe('image validation', () => {
  test('empty image is invalid', () => {
    const emptyImage = {'test': {'image': {}}}
    expect(validateFizop(emptyImage)).toHaveLength(1)
  });

  test('image with extra properties is valid', () => {
    const extraPropImg = {
      'test': {
        'image': {
          'imgType': 'URL',
          'imgData': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png',
          'copyright': ''
        }
      }
    }
    expect(validateFizop(extraPropImg)).toEqual([])
  });

  test('string image is invalid', () => {
    const invalidImg = {'test': {'image': 'invalid'}}
    expect(validateFizop(invalidImg)).toHaveLength(1)
  });

  test('image missing imgType is invalid', () => {
    const missingImgType = {
      'test': {
        'image': {
          'imgData': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png'
        }
      }
    }
    expect(validateFizop(missingImgType)).toHaveLength(1)
  });

  test('image missing imgData is invalid', () => {
    const missingImgData = {'test': {'image': {'imgType': 'URL'}}}
    expect(validateFizop(missingImgData)).toHaveLength(1)
  });

  test('bad imgType is invalid', () => {
    const badImgType = {
      'test': {
        'image': {
          'imgType': 'path',
          'imgData': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png'
        }
      }
    }
    expect(validateFizop(badImgType)).toHaveLength(2)
  });

  test('imgType DataURI is valid', () => {
    const urlImgType = {
      'test': {
        'image': {
          'imgType': ImageType.DataUri,
          'imgData': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
        }
      }
    }
    expect(validateImages(urlImgType)).toEqual([])
  });

  test('imgType UnpkgPath is valid', () => {
    const urlImgType = {
      'test': {
        'image': {
          'imgType': ImageType.UnpkgPath,
          'imgData': './tests/emptyTestFile'
        }
      }
    }
    expect(validateImages(urlImgType)).toEqual([])
  });

  test('imgType URL is valid', () => {
    const urlImgType = {
      'test': {
        'image': {
          'imgType': ImageType.URL,
          'imgData': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png'
        }
      }
    }
    expect(validateImages(urlImgType)).toEqual([])
  });
  
  test('invalid DataURI rejected', () => {
    const badDataUri = 'invalidDataUri'
    expect(isValidDataUriFormat(badDataUri)).toBe(false)
  });

  test('invalid UnpkgPath rejected', () => {
    const badUnpkgPath = 'doesNotExist'
    expect(isValidPathFormat(badUnpkgPath)).toBe(false)
  });

  test('invalid URL rejected', () => {
    const badURL = 'notaurl.com'
    expect(isValidUrlFormat(badURL)).toBe(false)
  });

});