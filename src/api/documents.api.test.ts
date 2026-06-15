import {
  MAX_FILE_SIZE,
  createDemoDocument,
  getLibraryDocuments,
  validateDocumentFile,
} from './documents.api'

describe('document demo service', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('validates supported type and maximum size', () => {
    expect(validateDocumentFile(new File(['content'], 'notes.pdf'))).toBeNull()
    expect(validateDocumentFile(new File(['content'], 'notes.exe'))).toContain('PDF')
    expect(
      validateDocumentFile(
        new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'large.pdf'),
      ),
    ).toContain('20 MB')
  })

  it('persists uploaded document metadata', () => {
    const document = createDemoDocument({
      title: 'New lecture',
      description: 'Week six notes',
      subject: 'Computer Science',
      category: 'Systems',
      tags: ['lecture'],
      visibility: 'PRIVATE',
      file: new File(['content'], 'lecture.pdf'),
    })

    expect(getLibraryDocuments()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: document.id })]),
    )
  })
})
