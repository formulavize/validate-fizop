import { validateFizop } from 'fizopValidator'

describe('schema validation', () => {

  test('empty', () => {
    const emptyFizop = {}
    expect(validateFizop(emptyFizop)).toBe(true)
  });

  test('empty op', () => {
    const oneEmptyOp = {'test': {}}
    expect(validateFizop(oneEmptyOp)).toBe(true)
  });

  test('op not an object', () => {
    const stringMap = {'test': 'invalid'}
    expect(validateFizop(stringMap)).toBe(false)
  });

  test('empty label', () => {
    const emptyLabel = {'test': {'label': {}}}
    expect(validateFizop(emptyLabel)).toBe(true)
  });

  test('single label', () => {
    const oneLabel = {'test': {'label': {'en': 'English'}}}
    expect(validateFizop(oneLabel)).toBe(true)
  });

  test('single bilingual label', () => {
    const bilingualLabel = {'test': {'label': {'en': 'English', 'fr': 'français'}}}
    expect(validateFizop(bilingualLabel)).toBe(true)
  });

  test('label not localized', () => {
    const invalidLabel = {'test': {'label': 'invalid'}}
    expect(validateFizop(invalidLabel)).toBe(false)
  });

  test('empty image', () => {
    const emptyImage = {'test': {'image': {}}}
    expect(validateFizop(emptyImage)).toBe(true)
  });

  test('unpkg image', () => {
    const unpkgImg = {'test': {'image': {'unpkgPath': './test.png'}}}
    expect(validateFizop(unpkgImg)).toBe(true)
  });

  test('url image', () => {
    const urlImg = {'test': {'image': {'url': 'https://en.wikipedia.org/static/images/project-logos/enwiki.png'}}}
    expect(validateFizop(urlImg)).toBe(true)
  });

  test('datauri image', () => {
    const uriImage = {'test': {'image': {'dataUri': ''}}}
    expect(validateFizop(uriImage)).toBe(true)
  });

  test('image with multiple sources', () => {
    const multiSrcImg = {'test': {'image': {'unpkgPath': './test.png', 'dataUri': ''}}}
    expect(validateFizop(multiSrcImg)).toBe(true)
  });

  test('image not an object', () => {
    const invalidImg = {'test': {'image': 'invalid'}}
    expect(validateFizop(invalidImg)).toBe(false)
  });

  test('image extra key', () => {
    const imageExtra = {'test': {'image': {'dataUri': '', 'extra': ''}}}
    expect(validateFizop(imageExtra)).toBe(true)
  });

  test('label image and extra', () => {
    const labelImgExtra = {
      'test': {
        'label': {'en': 'English'},
        'image': {'dataUri': ''},
        'extra': ''
      }
    }
    expect(validateFizop(labelImgExtra)).toBe(true)
  });

  test('multiple ops', () => {
    const multipleOps = {
      'test': {'label': {'en': 'English'}},
      'test2': {'image': {'dataUri': ''}}
    }
    expect(validateFizop(multipleOps)).toBe(true)
  });

});